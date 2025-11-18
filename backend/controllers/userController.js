const User = require('../models/User');

// Get nearby users with geospatial query
exports.getNearbyUsers = async (req, res) => {
    try {
        const { radius = 5, search = '', availability = null } = req.query;
        const user = await User.findById(req.user.userId);

        if (!user.location || !user.location.lat || !user.location.lng) {
            return res.status(400).json({ error: 'User location not set' });
        }

        let query = {
            _id: { $ne: user._id },
            'location.lat': { $exists: true },
            'location.lng': { $exists: true }
        };

        // Filter by availability
        if (availability) {
            query.availability = availability;
        }

        // Filter by search text
        if (search) {
            query.$text = { $search: search };
        }

        const nearbyUsers = await User.find(query)
            .select('name profilePhoto location teachTags learnTags availability stats')
            .limit(100);

        // Calculate distance for each user and filter by radius
        const usersWithDistance = nearbyUsers
            .map(u => {
                const distance = getDistance(user.location, u.location);
                return { ...u.toObject(), distance };
            })
            .filter(u => u.distance <= radius)
            .sort((a, b) => a.distance - b.distance)
            .slice(0, 20);

        res.json({ success: true, users: usersWithDistance });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get best matches using AI algorithm
exports.getBestMatches = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        const nearbyUsers = await User.find({
            _id: { $ne: user._id },
            blocked: { $nin: [user._id] }
        }).select('name profilePhoto location teachTags learnTags stats availability');

        // Score each user
        const scoredMatches = nearbyUsers.map(otherUser => {
            let score = 0;

            // Skill alignment (40%)
            const skillMatch = calculateSkillMatch(user, otherUser);
            score += skillMatch * 0.4;

            // Availability overlap (20%)
            const availabilityScore = user.availability === otherUser.availability ? 100 : 50;
            score += availabilityScore * 0.2;

            // Rating (15%)
            score += (otherUser.stats.averageRating / 5) * 100 * 0.15;

            // Distance (15%)
            if (user.location && otherUser.location && user.location.lat && otherUser.location.lat) {
                const distance = getDistance(user.location, otherUser.location);
                const distanceScore = Math.max(0, 100 - (distance * 5));
                score += distanceScore * 0.15;
            }

            // Response time (10%) - placeholder
            score += 50 * 0.1;

            return {
                user: otherUser,
                matchScore: Math.round(score)
            };
        });

        // Sort by score
        const topMatches = scoredMatches
            .sort((a, b) => b.matchScore - a.matchScore)
            .slice(0, 20);

        res.json({ success: true, matches: topMatches });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Search users by skill
exports.searchUsers = async (req, res) => {
    try {
        const { query, search } = req.query;
        const user = await User.findById(req.user.userId);

        const users = await User.find({
            $text: { $search: query }
        })
            .select('name profilePhoto location teachTags learnTags stats')
            .limit(20);

        res.json({ success: true, users });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get user by ID
exports.getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.userId)
            .select('-password')
            .populate('allies', 'name profilePhoto');

        if (!user) return res.status(404).json({ error: 'User not found' });

        res.json({ success: true, user });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update profile
exports.updateProfile = async (req, res) => {
    try {
        const { name, bio, location, teachTags, learnTags, availability } = req.body;

        const user = await User.findByIdAndUpdate(
            req.user.userId,
            { name, bio, location, teachTags, learnTags, availability, updatedAt: Date.now() },
            { new: true }
        ).select('-password');

        res.json({ success: true, user });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Add ally
exports.addAlly = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        const allyId = req.params.userId;

        if (!user.allies.includes(allyId)) {
            user.allies.push(allyId);
            await user.save();
        }

        res.json({ success: true, message: 'Ally added' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Remove ally
exports.removeAlly = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        user.allies = user.allies.filter(id => id.toString() !== req.params.userId);
        await user.save();

        res.json({ success: true, message: 'Ally removed' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get allies
exports.getAllies = async (req, res) => {
    try {
        const user = await User.findById(req.params.userId)
            .populate('allies', 'name profilePhoto location stats');

        res.json({ success: true, allies: user.allies });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Block user
exports.blockUser = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        const blockedId = req.params.userId;

        if (!user.blocked.includes(blockedId)) {
            user.blocked.push(blockedId);
            await user.save();
        }

        res.json({ success: true, message: 'User blocked' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Unblock user
exports.unblockUser = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        user.blocked = user.blocked.filter(id => id.toString() !== req.params.userId);
        await user.save();

        res.json({ success: true, message: 'User unblocked' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Helper functions
function calculateSkillMatch(user1, user2) {
    const user1Teach = user1.teachTags.map(t => t.tag.toLowerCase());
    const user2Learn = user2.learnTags.map(t => t.toLowerCase());

    const matchCount = user1Teach.filter(t => user2Learn.includes(t)).length;
    return (matchCount / Math.max(user1Teach.length, user2Learn.length)) * 100;
}

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