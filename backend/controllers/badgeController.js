const Badge = require('../models/Badge');
const User = require('../models/User');
const Session = require('../models/Session');
const Community = require('../models/Community');

// Check and award badges
exports.checkBadges = async (userId) => {
    try {
        const user = await User.findById(userId);
        if (!user) return [];

        const badges = [];

        // Check First Session badge
        const sessions = await Session.countDocuments({
            $or: [
                { teacherId: userId, status: 'completed' },
                { learnerId: userId, status: 'completed' }
            ]
        });

        if (sessions === 1) {
            const badge = await Badge.findOne({ trigger: 'first_session' });
            if (badge && !user.badges.includes(badge._id)) {
                user.badges.push(badge._id);
                badges.push(badge);
            }
        }

        // Check Trusted badge (4.5+ rating with 5+ reviews)
        if (user.stats.averageRating >= 4.5 && user.stats.reviewCount >= 5) {
            const badge = await Badge.findOne({ trigger: 'trusted' });
            if (badge && !user.badges.includes(badge._id)) {
                user.badges.push(badge._id);
                badges.push(badge);
            }
        }

        // Check Helper badge (10+ hours taught)
        if (user.stats.hoursCompleted >= 10) {
            const badge = await Badge.findOne({ trigger: 'helper' });
            if (badge && !user.badges.includes(badge._id)) {
                user.badges.push(badge._id);
                badges.push(badge);
            }
        }

        // Check Learner badge (learn from 5+ people)
        const differentTeachers = await Session.distinct('teacherId', {
            learnerId: userId,
            status: 'completed'
        });

        if (differentTeachers.length >= 5) {
            const badge = await Badge.findOne({ trigger: 'learner' });
            if (badge && !user.badges.includes(badge._id)) {
                user.badges.push(badge._id);
                badges.push(badge);
            }
        }

        // Check Community Builder badge (created 3+ communities)
        const communitiesCreated = await Community.countDocuments({ creatorId: userId });
        if (communitiesCreated >= 3) {
            const badge = await Badge.findOne({ trigger: 'community_builder' });
            if (badge && !user.badges.includes(badge._id)) {
                user.badges.push(badge._id);
                badges.push(badge);
            }
        }

        // Check Speedster badge (responded within 5 minutes in 20+ chats)
        // This would require tracking response times - placeholder for now

        if (badges.length > 0) {
            await user.save();
            console.log(`Awarded ${badges.length} new badges to user ${userId}`);
        }

        return badges;
    } catch (error) {
        console.error('Badge check error:', error);
        return [];
    }
};

// Get user badges
exports.getUserBadges = async (req, res) => {
    try {
        const user = await User.findById(req.params.userId)
            .populate('badges');

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ success: true, badges: user.badges });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get all available badges
exports.getAllBadges = async (req, res) => {
    try {
        const badges = await Badge.find({});
        res.json({ success: true, badges });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Initialize default badges (run once)
exports.initializeBadges = async () => {
    try {
        const existingBadges = await Badge.countDocuments();
        if (existingBadges > 0) {
            console.log('Badges already initialized');
            return;
        }

        const defaultBadges = [
            {
                name: 'First Steps',
                description: 'Completed your first session',
                icon: '🎯',
                trigger: 'first_session'
            },
            {
                name: 'Trusted Teacher',
                description: 'Achieved 4.5+ rating with 5+ reviews',
                icon: '⭐',
                trigger: 'trusted'
            },
            {
                name: 'Super Helper',
                description: 'Taught for 10+ hours',
                icon: '🏆',
                trigger: 'helper'
            },
            {
                name: 'Eager Learner',
                description: 'Learned from 5+ different teachers',
                icon: '📚',
                trigger: 'learner'
            },
            {
                name: 'Community Builder',
                description: 'Created 3+ communities',
                icon: '🏘️',
                trigger: 'community_builder'
            },
            {
                name: 'Speedster',
                description: 'Quick responder in 20+ conversations',
                icon: '⚡',
                trigger: 'speedster'
            }
        ];

        await Badge.insertMany(defaultBadges);
        console.log('Default badges initialized successfully');
    } catch (error) {
        console.error('Badge initialization error:', error);
    }
};

module.exports = exports;