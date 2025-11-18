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
        res.status(500).json({ error: error.message });
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
                fs.unlinkSync(file.path);
            }
        }

        const post = new Post({
            userId,
            content,
            media,
            tags: tags ? (Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim())) : [],
            visibility: visibility || 'public',
            communityId: communityId || null
        });

        await post.save();
        await post.populate('userId', 'name profilePhoto');

        res.status(201).json({ success: true, post });
    } catch (error) {
        res.status(500).json({ error: error.message });
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

module.exports = exports;