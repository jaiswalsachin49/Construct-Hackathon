const Community = require('../models/Community');
const User = require('../models/User');
const cloudinary = require('../config/cloudinary');
const fs = require('fs');

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

        res.json({ success: true, communities: nearbyCommunities });
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

        res.json({ success: true, communities });
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
            fs.unlinkSync(req.file.path);
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
        const community = await Community.findById(req.params.communityId)
            .populate('creatorId', 'name profilePhoto')
            .populate('members.userId', 'name profilePhoto');

        if (!community) {
            return res.status(404).json({ error: 'Community not found' });
        }

        res.json({ success: true, community });
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
        const community = await Community.findById(req.params.communityId)
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

module.exports = exports;