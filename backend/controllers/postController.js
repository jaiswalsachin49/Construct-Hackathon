const Post = require('../models/Post');
const User = require('../models/User');
const cloudinary = require('../config/cloudinary');
const fs = require('fs');

exports.getFeed = async (req, res) => {
    try {
        const { page = 1 } = req.query;
        const limit = 20;
        const skip = (page - 1) * limit;

        const user = await User.findById(req.user.userId);
        const allyIds = [...user.allies, user._id];

        const posts = await Post.find({
            $or: [
                { userId: { $in: allyIds } },
                { visibility: 'public' }
            ]
        })
            .populate('userId', 'name profilePhoto')
            .populate('comments.userId', 'name profilePhoto')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const totalPosts = await Post.countDocuments({
            $or: [
                { userId: { $in: allyIds } },
                { visibility: 'public' }
            ]
        });

        res.json({
            success: true,
            posts,
            hasMore: skip + limit < totalPosts
        });
    } catch (error) {
        // Log full error for debugging
        console.error('Get feed error:', error);
        const payload = { error: error.message };
        if (process.env.NODE_ENV !== 'production') payload.stack = error.stack;
        res.status(500).json(payload);
    }
};

exports.createPost = async (req, res) => {
    try {
        const { content, tags, visibility, communityId } = req.body;
        const userId = req.user.userId;

        // Upload media to Cloudinary
        const media = [];
        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                const uploaded = await cloudinary.uploader.upload(file.path, {
                    resource_type: file.mimetype.startsWith('video') ? 'video' : 'image',
                    folder: 'skillswap/posts'
                });
                media.push({
                    url: uploaded.secure_url,
                    type: file.mimetype.startsWith('video') ? 'video' : 'photo'
                });

                // Delete local file after upload
                try {
                    if (file?.path) fs.unlinkSync(file.path);
                } catch (e) {
                    console.error('Failed to delete local file:', e.message);
                }

            }
        }

        // Helper to parse media sent in req.body (string or array). Prefer uploaded files when present.
        const parseMediaField = (field) => {
            if (!field) return [];
            if (Array.isArray(field)) return field.map(f => {
                // If items are simple strings (urls), normalize to object
                if (typeof f === 'string') return { url: f, type: 'photo' };
                return f;
            });
            if (typeof field === 'string') {
                // Try JSON.parse first
                try {
                    const parsed = JSON.parse(field);
                    if (Array.isArray(parsed)) return parsed.map(f => (typeof f === 'string' ? { url: f, type: 'photo' } : f));
                } catch (e) {
                    // Attempt a tolerant fallback: replace single quotes with double quotes
                    try {
                        const fixed = field.replace(/'/g, '"');
                        const parsed = JSON.parse(fixed);
                        if (Array.isArray(parsed)) return parsed.map(f => (typeof f === 'string' ? { url: f, type: 'photo' } : f));
                    } catch (e2) {
                        // Last resort: extract any URLs from the string
                            const urls = Array.from(field.matchAll(/https?:\/\/[^\s'\)"]+/g)).map(m => ({ url: m[0], type: 'photo' }));
                        if (urls.length) return urls;
                    }
                }
            }
            return [];
        };

        // Resolve final media array: prefer uploaded files, fall back to any media sent in body
        const finalMedia = (media && media.length > 0) ? media : parseMediaField(req.body.media);

        const post = new Post({
            userId,
            content,
            media: finalMedia,
            tags: tags ? (Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim())) : [],
            visibility: visibility || 'public',
            communityId: communityId || null
        });

        await post.save();
        await post.populate('userId', 'name profilePhoto');

        res.status(201).json({ success: true, post });
    } catch (error) {
        // Log and return stack in dev to help debugging client-side 500s
        console.error('Create post error:', error);
        const payload = { error: error.message };
        if (process.env.NODE_ENV !== 'production') payload.stack = error.stack;
        res.status(500).json(payload);
    }
};

exports.updatePost = async (req, res) => {
    try {
        const { content, tags, visibility } = req.body;
        const post = await Post.findById(req.params.postId);

        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        if (post.userId.toString() !== req.user.userId) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        post.content = content || post.content;
        post.tags = tags ? (Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim())) : post.tags;
        post.visibility = visibility || post.visibility;
        post.updatedAt = Date.now();
        await post.save();

        res.json({ success: true, post });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deletePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.postId);

        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        if (post.userId.toString() !== req.user.userId) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        // Delete media from Cloudinary (if configured)
        if (process.env.CLOUDINARY_NAME && process.env.CLOUDINARY_KEY) {
            for (const media of post.media) {
                try {
                    const publicId = media.url.split('/').slice(-2).join('/').split('.')[0];
                    await cloudinary.uploader.destroy(publicId);
                } catch (err) {
                    console.error('Failed to delete media from Cloudinary:', err);
                }
            }
        }

        await Post.findByIdAndDelete(req.params.postId);

        res.json({ success: true, message: 'Post deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.toggleLike = async (req, res) => {
    try {
        const post = await Post.findById(req.params.postId);

        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        const userId = req.user.userId;

        if (post.likes.includes(userId)) {
            post.likes = post.likes.filter(id => id.toString() !== userId);
        } else {
            post.likes.push(userId);
        }

        await post.save();

        res.json({ success: true, likes: post.likes.length, liked: post.likes.includes(userId) });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.addComment = async (req, res) => {
    try {
        const { content } = req.body;

        if (!content || content.trim().length === 0) {
            return res.status(400).json({ error: 'Comment content required' });
        }

        const post = await Post.findById(req.params.postId);

        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        const comment = {
            userId: req.user.userId,
            content: content.trim()
        };

        post.comments.push(comment);
        await post.save();
        await post.populate('comments.userId', 'name profilePhoto');

        res.json({ success: true, comments: post.comments });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteComment = async (req, res) => {
    try {
        const post = await Post.findById(req.params.postId);

        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        const comment = post.comments.id(req.params.commentId);

        if (!comment) {
            return res.status(404).json({ error: 'Comment not found' });
        }

        if (comment.userId.toString() !== req.user.userId) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        post.comments.pull(req.params.commentId);
        await post.save();

        res.json({ success: true, message: 'Comment deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.sharePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.postId);

        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        post.shares += 1;
        await post.save();

        res.json({ success: true, shares: post.shares });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


exports.getCommunityPosts = async (req, res) => {
    try {
        const { communityId } = req.params;
        const posts = await Post.find({ communityId })
            .populate('userId', 'name profilePhoto')
            .sort({ createdAt: -1 });

        res.json({ success: true, posts });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.createCommunityPost = async (req, res) => {
    try {
        const { content, tags } = req.body;
        const { communityId } = req.params;
        const userId = req.user.userId;

        const post = new Post({
            userId,
            content,
            tags: tags || [],
            visibility: 'public',
            communityId,
        });

        await post.save();
        await post.populate('userId', 'name profilePhoto');

        res.status(201).json({ success: true, post });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


module.exports = exports;