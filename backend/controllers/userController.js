const User = require('../models/User');

// Get nearby users with geospatial query
// controllers/userController.js
// backend/controllers/userController.js

exports.getNearbyUsers = async (req, res) => {
    try {
        let { radius = 5, search = '', availability = null, lat, lng } = req.query;
        radius = Number(radius) || 5;

        const user = await User.findById(req.user.userId);
        if (!user) return res.status(404).json({ error: "User not found" });

        // ... (Keep your existing location logic) ...
        
        // --- FIX IS HERE ---
        let query = {
            _id: { 
                $ne: user._id,          // Not me
                $nin: user.allies       // Not my allies (exclude existing connections)
            },
            "location.lat": { $exists: true },
            "location.lng": { $exists: true }
        };
        // -------------------

        // ... (Rest of your search/regex logic) ...
        
        if (search && search.trim() !== "") {
            const regex = new RegExp(search.trim(), "i");
            query.$or = [
                { name: regex },
                { bio: regex },
                { "teachTags.name": regex },
                { "learnTags.name": regex }
            ];
        }

        if (availability) {
            query.availability = availability;
        }

        // Execute Query
        let users = await User.find(query).select('-password -blocked -verificationCode');

        // ... (Keep your existing distance calculation & filtering) ...
        
        // Note: If you are using the manual distance filter (JS filter), 
        // the MongoDB query above has already removed the allies, so you are good.

        // Return results
        res.json({ success: true, users: users }); // or users: nearbyUsers if you filter later

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
exports.sendConnectionRequest = async (req, res) => {
    try {
        const targetUserId = req.params.userId;
        const currentUserId = req.user.userId;

        if (targetUserId === currentUserId) return res.status(400).json({ error: "Cannot add yourself" });

        const targetUser = await User.findById(targetUserId);
        const currentUser = await User.findById(currentUserId);

        if (!targetUser || !currentUser) return res.status(404).json({ error: "User not found" });

        // Check if already allies
        if (currentUser.allies.includes(targetUserId)) {
            return res.status(400).json({ error: "Already allies" });
        }

        // Check if request already sent
        if (currentUser.sentRequests.includes(targetUserId)) {
            return res.status(400).json({ error: "Request already sent" });
        }

        // Check if target already sent YOU a request (if so, just accept it)
        if (currentUser.friendRequests.includes(targetUserId)) {
            return exports.acceptConnectionRequest(req, res);
        }

        // Update Arrays
        currentUser.sentRequests.push(targetUserId);
        targetUser.friendRequests.push(currentUserId);

        await currentUser.save();
        await targetUser.save();

        // REAL-TIME NOTIFICATION
        const io = req.app.get('io');
        if (io) {
            // Force string conversion to match the room name
            io.to(targetUserId.toString()).emit('notification:request', {
                type: 'connection_request',
                sender: {
                    _id: currentUser._id,
                    name: currentUser.name,
                    profilePhoto: currentUser.profilePhoto
                }
            });
            console.log(`Notification emitted to room: ${targetUserId}`); // Debug Log
        }

        res.json({ success: true, message: "Request sent" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Accept a connection request
exports.acceptConnectionRequest = async (req, res) => {
    try {
        const targetUserId = req.params.userId; // The person who sent the request
        const currentUserId = req.user.userId;  // Me

        const currentUser = await User.findById(currentUserId);
        const targetUser = await User.findById(targetUserId);

        if (!currentUser.friendRequests.includes(targetUserId)) {
            return res.status(400).json({ error: "No request found from this user" });
        }

        // 1. Add to allies
        currentUser.allies.push(targetUserId);
        targetUser.allies.push(currentUserId);

        // 2. Remove from requests
        currentUser.friendRequests = currentUser.friendRequests.filter(id => id.toString() !== targetUserId);
        targetUser.sentRequests = targetUser.sentRequests.filter(id => id.toString() !== currentUserId);

        await currentUser.save();
        await targetUser.save();

        // REAL-TIME NOTIFICATION
        const io = req.app.get('io');
        if (io) {
            io.to(targetUserId).emit('notification:accepted', {
                type: 'connection_accepted',
                user: {
                    _id: currentUser._id,
                    name: currentUser.name
                }
            });
        }

        res.json({ success: true, message: "Connection accepted" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Reject a request
exports.rejectConnectionRequest = async (req, res) => {
    try {
        const targetUserId = req.params.userId;
        const currentUserId = req.user.userId;

        await User.findByIdAndUpdate(currentUserId, {
            $pull: { friendRequests: targetUserId }
        });
        await User.findByIdAndUpdate(targetUserId, {
            $pull: { sentRequests: currentUserId }
        });

        res.json({ success: true, message: "Request rejected" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get all pending requests (For Navbar)
exports.getPendingRequests = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId)
            .populate('friendRequests', 'name profilePhoto bio teachTags')
            .select('friendRequests');
        
        res.json({ success: true, requests: user.friendRequests });
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