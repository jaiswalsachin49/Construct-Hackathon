const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    lastMessage: String,
    lastMessageTime: Date,
    unreadCounts: { type: Map, of: Number }, // { userId: count }
    createdAt: { type: Date, default: Date.now }
});

conversationSchema.index({ participants: 1 });
conversationSchema.index({ lastMessageTime: -1 });

module.exports = mongoose.model('Conversation', conversationSchema);