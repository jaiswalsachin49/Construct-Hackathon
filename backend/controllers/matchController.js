const User = require('../models/User');

// Normalize tag object or string
const normalizeTag = (tag) => {
    if (!tag) return "";
    if (typeof tag === "string") return tag.toLowerCase();
    if (typeof tag === "object") return (tag.name || "").toLowerCase();
    return "";
};

exports.getAIMatches = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);

        if (!user) return res.status(404).json({ error: 'User not found' });

        const allUsers = await User.find({
            _id: {
                $ne: user._id,
                $nin: [...user.allies, ...user.sentRequests, ...user.friendRequests, ...user.blocked]
            },
            blocked: { $nin: [user._id] }, // Also exclude users who blocked ME
            'location.lat': { $exists: true },
            'location.lng': { $exists: true }
        }).limit(100);

        const scoredMatches = await Promise.all(
            allUsers.map(async (otherUser) => {
                if (!user.location || !otherUser.location) return null;

                const distance = getDistance(user.location, otherUser.location);
                if (distance > 10) return null;

                let score = 0;

                // 1. Skill match
                const skillAlignment = calculateSkillMatch(user, otherUser);
                score += skillAlignment * 0.4;

                // 2. Availability
                score += (user.availability === otherUser.availability ? 100 : 50) * 0.2;

                // 3. Rating
                score += ((otherUser.stats?.averageRating || 0) / 5) * 100 * 0.15;

                // 4. Distance
                score += Math.max(0, 100 - distance * 5) * 0.15;

                // 5. Engagement
                score += 50 * 0.1;

                return {
                    user: {
                        _id: otherUser._id,
                        name: otherUser.name,
                        profilePhoto: otherUser.profilePhoto,
                        bio: otherUser.bio,
                        location: otherUser.location,
                        teachTags: otherUser.teachTags,
                        learnTags: otherUser.learnTags,
                        availability: otherUser.availability,
                        stats: otherUser.stats
                    },
                    matchScore: Math.min(100, Math.round(score)),
                    matchReason: generateMatchReason(user, otherUser),
                    distance: Math.round(distance * 10) / 10
                };
            })
        );

        const topMatches = scoredMatches
            .filter(x => x !== null)
            .sort((a, b) => b.matchScore - a.matchScore)
            .slice(0, 20);

        res.json({ success: true, matches: topMatches });

    } catch (error) {
        console.error("MATCH ERROR:", error);
        res.status(500).json({ error: error.message });
    }
};

function calculateSkillMatch(user1, user2) {
    const user1Teach = user1.teachTags?.map(normalizeTag) || [];
    const user1Learn = user1.learnTags?.map(normalizeTag) || [];

    const user2Teach = user2.teachTags?.map(normalizeTag) || [];
    const user2Learn = user2.learnTags?.map(normalizeTag) || [];

    const direct = user1Teach.filter(t => user2Learn.includes(t)).length;
    const reverse = user2Teach.filter(t => user1Learn.includes(t)).length;

    const total = direct + reverse;
    const maxExpected = Math.max(
        user1Teach.length + user1Learn.length,
        user2Teach.length + user2Learn.length,
        1
    );

    return (total / maxExpected) * 100;
}

function generateMatchReason(user1, user2) {
    const reasons = [];

    const user1Teach = user1.teachTags?.map(t => t.name) || [];
    const user1Learn = user1.learnTags?.map(t => t.name) || [];

    const user2Teach = user2.teachTags?.map(t => t.name) || [];
    const user2Learn = user2.learnTags?.map(t => t.name) || [];

    const teachMatch = user1Teach.find(t => user2Learn.includes(t));
    const learnMatch = user2Teach.find(t => user1Learn.includes(t));

    if (teachMatch) reasons.push(`You teach ${teachMatch}, they want to learn it`);
    if (learnMatch) reasons.push(`They teach ${learnMatch}, you want to learn it`);

    if (user1.availability === user2.availability)
        reasons.push(`Both prefer ${user1.availability} sessions`);

    if (user2.stats?.averageRating >= 4.5)
        reasons.push(`Highly rated (${user2.stats.averageRating}⭐)`);

    return reasons.join(' • ') || 'Great potential match!';
}

function getDistance(loc1, loc2) {
    const R = 6371;
    const dLat = (loc2.lat - loc1.lat) * Math.PI / 180;
    const dLng = (loc2.lng - loc1.lng) * Math.PI / 180;

    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(loc1.lat * Math.PI / 180) *
        Math.cos(loc2.lat * Math.PI / 180) *
        Math.sin(dLng / 2) ** 2;

    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

module.exports = exports;
