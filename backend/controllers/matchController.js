const User = require('../models/User');

exports.getAIMatches = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Find nearby users (without geospatial index, using manual calculation)
        const allUsers = await User.find({
            _id: { $ne: user._id },
            blocked: { $nin: [user._id] },
            'location.lat': { $exists: true },
            'location.lng': { $exists: true }
        }).limit(100);

        // Filter by distance and score each user
        const scoredMatches = await Promise.all(
            allUsers.map(async (otherUser) => {
                // Calculate distance
                if (!user.location || !user.location.lat || !otherUser.location || !otherUser.location.lat) {
                    return null;
                }

                const distance = getDistance(user.location, otherUser.location);
                if (distance > 10) return null; // Skip users more than 10km away

                let score = 0;

                // 1. Skill alignment (40%)
                const skillAlignment = calculateSkillMatch(user, otherUser);
                score += skillAlignment * 0.4;

                // 2. Availability overlap (20%)
                const availabilityScore = user.availability === otherUser.availability ? 100 : 50;
                score += availabilityScore * 0.2;

                // 3. User ratings (15%)
                score += (otherUser.stats.averageRating / 5) * 100 * 0.15;

                // 4. Distance (15%)
                const distanceScore = Math.max(0, 100 - (distance * 5));
                score += distanceScore * 0.15;

                // 5. Response time / engagement (10%)
                score += 50 * 0.1;

                // 6. AI-powered semantic skill matching (optional enhancement)
                try {
                    if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_api_key') {
                        const semanticScore = await getSemanticSkillMatch(user.teachTags, otherUser.learnTags);
                        score = (score * 0.9) + (semanticScore * 0.1);
                    }
                } catch (error) {
                    console.log('AI matching error:', error.message);
                }

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
                    distance: Math.round(distance * 10) / 10 // Round to 1 decimal
                };
            })
        );

        // Filter out null results and sort by match score
        const topMatches = scoredMatches
            .filter(match => match !== null)
            .sort((a, b) => b.matchScore - a.matchScore)
            .slice(0, 20);

        res.json({ success: true, matches: topMatches, total: topMatches.length });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Helper function - semantic skill matching via AI (optional)
async function getSemanticSkillMatch(teachSkills, learnSkills) {
    try {
        // This requires OpenAI API key configuration
        // Using emergent integrations or OpenAI SDK
        const axios = require('axios');

        const response = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
                model: 'gpt-3.5-turbo',
                messages: [{
                    role: 'user',
                    content: `On a scale of 0-100, how well do these skills match for skill exchange?
          
Teacher wants to teach: ${teachSkills.map(t => t.tag).join(', ')}
Learner wants to learn: ${learnSkills.join(', ')}

Consider: skill relevance, complementarity, market demand.
Reply with just a number.`
                }],
                max_tokens: 10,
                temperature: 0.3
            },
            {
                headers: {
                    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        const score = parseInt(response.data.choices[0].message.content.trim());
        return Math.min(100, Math.max(0, score));
    } catch (error) {
        console.error('AI matching error:', error.message);
        return 50; // default score
    }
}

function calculateSkillMatch(user1, user2) {
    const user1Teach = user1.teachTags?.map(t => t.tag.toLowerCase()) || [];
    const user2Learn = user2.learnTags?.map(t => t.toLowerCase()) || [];

    const directMatches = user1Teach.filter(t => user2Learn.includes(t)).length;

    // Reverse match (user2 teaches what user1 wants)
    const user2Teach = user2.teachTags?.map(t => t.tag.toLowerCase()) || [];
    const user1Learn = user1.learnTags?.map(t => t.toLowerCase()) || [];
    const reverseMatches = user2Teach.filter(t => user1Learn.includes(t)).length;

    const totalMatches = directMatches + reverseMatches;
    const maxPossible = Math.max(
        user1Teach.length + user1Learn.length,
        user2Teach.length + user2Learn.length,
        1 // Prevent division by zero
    );

    return (totalMatches / maxPossible) * 100;
}

function getDistance(loc1, loc2) {
    const R = 6371; // Earth radius in km
    const dLat = (loc2.lat - loc1.lat) * Math.PI / 180;
    const dLng = (loc2.lng - loc1.lng) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(loc1.lat * Math.PI / 180) * Math.cos(loc2.lat * Math.PI / 180) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function generateMatchReason(user1, user2) {
    const reasons = [];

    const user1Teach = user1.teachTags?.map(t => t.tag) || [];
    const user2Learn = user2.learnTags || [];
    const commonTeach = user1Teach.filter(t => user2Learn.includes(t));

    if (commonTeach.length > 0) {
        reasons.push(`You teach ${commonTeach[0]}, they want to learn it`);
    }

    const user2Teach = user2.teachTags?.map(t => t.tag) || [];
    const user1Learn = user1.learnTags || [];
    const commonLearn = user2Teach.filter(t => user1Learn.includes(t));

    if (commonLearn.length > 0) {
        reasons.push(`They teach ${commonLearn[0]}, you want to learn it`);
    }

    if (user1.availability && user2.availability && user1.availability === user2.availability) {
        reasons.push(`Both prefer ${user1.availability} sessions`);
    }

    if (user2.stats && user2.stats.averageRating >= 4.5) {
        reasons.push(`Highly rated (${user2.stats.averageRating}⭐)`);
    }

    return reasons.join(' • ') || 'Great potential match!';
}

module.exports = exports;