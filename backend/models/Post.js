const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, default: '' },
    media: [{
        url: String,
        type: { type: String }
    }],
    tags: [String],
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    comments: [{
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        content: String,
        createdAt: { type: Date, default: Date.now }
    }],
    shares: { type: Number, default: 0 },
    visibility: { type: String, enum: ['public', 'allies'], default: 'public' },
    communityId: { type: mongoose.Schema.Types.ObjectId, ref: 'Community' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Custom validation: require at least content or media
postSchema.pre('validate', function (next) {
    if (!this.content && (!this.media || this.media.length === 0)) {
        this.invalidate('content', 'Either content or media is required');
    }
    next();
});

postSchema.index({ userId: 1, createdAt: -1 });
postSchema.index({ communityId: 1, createdAt: -1 });
postSchema.index({ tags: 1 });
postSchema.index({ visibility: 1, createdAt: -1 });

module.exports = mongoose.model('Post', postSchema);