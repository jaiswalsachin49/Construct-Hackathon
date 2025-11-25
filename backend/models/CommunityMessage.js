const mongoose = require('mongoose');

const communityMessageSchema = new mongoose.Schema({
    communityId: { type: mongoose.Schema.Types.ObjectId, ref: 'Community', required: true },
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

// Index for efficient retrieval by community and time
communityMessageSchema.index({ communityId: 1, createdAt: -1 });

module.exports = mongoose.model('CommunityMessage', communityMessageSchema);
