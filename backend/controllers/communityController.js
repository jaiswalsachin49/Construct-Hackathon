const Community = require('../models/Community');
const User = require('../models/User');
const cloudinary = require('../config/cloudinary');
const fs = require('fs');
const mongoose = require('mongoose');

exports.getNearbyCommunities = async (req, res) => {
    try {
        const { radius = 10 } = req.query;
        const user = await User.findById(req.user.userId);

        if (!user.location || !user.location.lat || !user.location.lng) {
            return res.status(400).json({ error: 'User location not set' });
        }

        // Find communities with location within radius
        const communities = await Community.find({
            'location.lat': { $exists: true },
            'location.lng': { $exists: true }
        })
            .populate('creatorId', 'name profilePhoto')
            .limit(100);

        // Calculate distance and filter
        const nearbyCommunities = communities
            .map(community => {
                if (!community.location || !community.location.lat) return null;

                const distance = getDistance(user.location, community.location);
                if (distance <= radius) {
                    return {
                        ...community.toObject(),
                        distance
                    };
                }
                return null;
            })
            .filter(c => c !== null)
            .sort((a, b) => a.distance - b.distance)
            .slice(0, 20);

        // Add isMember flag
        const communitiesWithMemberStatus = nearbyCommunities.map(c => {
            const isMember = c.members.some(m => m.userId.toString() === req.user.userId);
            return {
                ...c,
                postCount: Math.max(0, c.postCount || 0),
                isMember
            };
        });

        res.json({ success: true, communities: communitiesWithMemberStatus });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getMyCommunities = async (req, res) => {
    try {
        const communities = await Community.find({
            'members.userId': req.user.userId
        })
            .populate('creatorId', 'name profilePhoto')
            .sort({ createdAt: -1 });

        const communitiesWithSanitizedCount = communities.map(c => {
            const obj = c.toObject();
            return {
                ...obj,
                postCount: Math.max(0, obj.postCount || 0)
            };
        });

        res.json({ success: true, communities: communitiesWithSanitizedCount });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.createCommunity = async (req, res) => {
    try {
        const { name, description, category, tags, location, isPublic } = req.body;
        const userId = req.user.userId;

        let coverImage = null;
        if (req.file) {
            const uploaded = await cloudinary.uploader.upload(req.file.path, {
                folder: 'skillswap/communities'
            });
            coverImage = uploaded.secure_url;

            // Delete local file after upload
            try {
                if (req.file?.path) fs.unlinkSync(req.file.path);
            } catch (e) {
                console.error('Failed to delete local file:', e.message);
            }

        }

        const parsedLocation = typeof location === 'string' ? JSON.parse(location) : location;

        const community = new Community({
            name,
            description,
            coverImage,
            category,
            tags: tags ? (Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim())) : [],
            location: parsedLocation,
            creatorId: userId,
            isPublic: isPublic === true || isPublic === 'true',
            members: [{
                userId,
                role: 'admin'
            }]
        });

        await community.save();
        await community.populate('creatorId', 'name profilePhoto');

        res.status(201).json({ success: true, community });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getCommunity = async (req, res) => {
    try {
        const { communityId } = req.params;
        if (!communityId || !mongoose.Types.ObjectId.isValid(communityId)) {
            return res.status(400).json({ error: 'Invalid community id' });
        }

        const community = await Community.findById(communityId)
            .populate('creatorId', 'name profilePhoto')
            .populate('members.userId', 'name profilePhoto');

        if (!community) {
            return res.status(404).json({ error: 'Community not found' });
        }

        const communityObj = community.toObject();
        communityObj.postCount = Math.max(0, communityObj.postCount || 0);

        res.json({ success: true, community: communityObj });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.joinCommunity = async (req, res) => {
    try {
        const community = await Community.findById(req.params.communityId);

        if (!community) {
            return res.status(404).json({ error: 'Community not found' });
        }

        const userId = req.user.userId;

        const alreadyMember = community.members.find(m => m.userId.toString() === userId);

        if (!alreadyMember) {
            community.members.push({
                userId,
                role: 'member'
            });
            await community.save();
        }

        res.json({ success: true, message: 'Joined community' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.leaveCommunity = async (req, res) => {
    try {
        const community = await Community.findById(req.params.communityId);

        if (!community) {
            return res.status(404).json({ error: 'Community not found' });
        }

        community.members = community.members.filter(
            m => m.userId.toString() !== req.user.userId
        );
        await community.save();

        res.json({ success: true, message: 'Left community' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getMembers = async (req, res) => {
    try {
        const { communityId } = req.params;
        if (!communityId || !mongoose.Types.ObjectId.isValid(communityId)) {
            return res.status(400).json({ error: 'Invalid community id' });
        }

        const community = await Community.findById(communityId)
            .populate('members.userId', 'name profilePhoto stats');

        if (!community) {
            return res.status(404).json({ error: 'Community not found' });
        }

        res.json({ success: true, members: community.members });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.kickMember = async (req, res) => {
    try {
        const community = await Community.findById(req.params.communityId);

        if (!community) {
            return res.status(404).json({ error: 'Community not found' });
        }

        const member = community.members.find(m => m.userId.toString() === req.user.userId);

        if (!member || member.role !== 'admin') {
            return res.status(403).json({ error: 'Only admins can kick members' });
        }

        community.members = community.members.filter(
            m => m.userId.toString() !== req.params.userId
        );
        await community.save();

        res.json({ success: true, message: 'Member kicked' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.updateMemberRole = async (req, res) => {
    try {
        const { communityId, userId } = req.params;
        const { role } = req.body;

        if (!['admin', 'moderator', 'member'].includes(role)) {
            return res.status(400).json({ error: 'Invalid role' });
        }

        const community = await Community.findById(communityId);

        if (!community) {
            return res.status(404).json({ error: 'Community not found' });
        }

        // Check if requester is admin
        const requester = community.members.find(m => m.userId.toString() === req.user.userId);
        if (!requester || requester.role !== 'admin') {
            return res.status(403).json({ error: 'Only admins can update roles' });
        }

        // Find target member
        const memberIndex = community.members.findIndex(m => m.userId.toString() === userId);
        if (memberIndex === -1) {
            return res.status(404).json({ error: 'Member not found' });
        }

        // Prevent removing the last admin
        if (role !== 'admin' && community.members[memberIndex].role === 'admin') {
            const adminCount = community.members.filter(m => m.role === 'admin').length;
            if (adminCount <= 1) {
                return res.status(400).json({ error: 'Cannot remove the last admin' });
            }
        }

        community.members[memberIndex].role = role;
        await community.save();

        res.json({ success: true, message: 'Member role updated' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.searchCommunities = async (req, res) => {
    try {
        const { q } = req.query;
        if (!q || !q.trim()) {
            return res.json({ success: true, communities: [] });
        }

        const regex = new RegExp(q.trim(), 'i');
        const communities = await Community.find({
            $or: [
                { name: regex },
                { description: regex },
                { tags: regex },
            ],
        })
            .limit(20)
            .sort({ createdAt: -1 });

        // Add isMember flag
        const communitiesWithMemberStatus = communities.map(c => {
            const communityObj = c.toObject();
            const isMember = c.members.some(m => m.userId.toString() === req.user.userId);
            return {
                ...communityObj,
                postCount: Math.max(0, communityObj.postCount || 0),
                isMember
            };
        });

        res.json({ success: true, communities: communitiesWithMemberStatus });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


// Helper function
function getDistance(loc1, loc2) {
    const R = 6371; // km
    const dLat = (loc2.lat - loc1.lat) * Math.PI / 180;
    const dLng = (loc2.lng - loc1.lng) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(loc1.lat * Math.PI / 180) * Math.cos(loc2.lat * Math.PI / 180) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

exports.getCommunityMessages = async (req, res) => {
    try {
        const { communityId } = req.params;
        const CommunityMessage = require('../models/CommunityMessage');

        // Check if user is member
        const community = await Community.findById(communityId);
        if (!community) {
            return res.status(404).json({ error: 'Community not found' });
        }

        const isMember = community.members.some(m => m.userId.toString() === req.user.userId);
        if (!isMember) {
            return res.status(403).json({ error: 'Must be a member to view messages' });
        }

        const messages = await CommunityMessage.find({ communityId })
            .sort({ createdAt: -1 })
            .limit(50)
            .populate('senderId', 'name profilePhoto');

        // Reverse to show oldest first
        res.json({ success: true, messages: messages.reverse() });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = exports;