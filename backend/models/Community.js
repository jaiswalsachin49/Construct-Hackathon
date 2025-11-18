const mongoose = require('mongoose');

const communitySchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: String,
    coverImage: String,
    category: String,
    tags: [String],
    location: {
        lat: Number,
        lng: Number,
        areaLabel: String
    },
    creatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    members: [{
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        role: { type: String, enum: ['admin', 'moderator', 'member'], default: 'member' },
        joinedAt: { type: Date, default: Date.now }
    }],
    isPublic: { type: Boolean, default: true },
    postCount: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
});

communitySchema.index({ 'location': '2dsphere' });
communitySchema.index({ category: 1 });
communitySchema.index({ tags: 1 });
communitySchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('Community', communitySchema);