const Conversation = require('../models/Conversation');
const Message = require('../models/Message');

exports.getConversations = async (req, res) => {
    try {
        const conversations = await Conversation.find({
            participants: req.user.userId
        })
            .populate('participants', 'name profilePhoto')
            .sort({ lastMessageTime: -1 });

        res.json({ success: true, conversations });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.startConversation = async (req, res) => {
    try {
        const { userId } = req.body;
        const currentUserId = req.user.userId;

        // Check if conversation already exists
        let conversation = await Conversation.findOne({
            participants: { $all: [currentUserId, userId] }
        });

        if (!conversation) {
            conversation = new Conversation({
                participants: [currentUserId, userId],
                unreadCounts: new Map([
                    [currentUserId, 0],
                    [userId, 0]
                ])
            });
            await conversation.save();
        }

        res.json({ success: true, conversationId: conversation._id });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getMessages = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const { page = 1 } = req.query;
        const limit = 20;
        const skip = (page - 1) * limit;

        const messages = await Message.find({ conversationId })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('senderId', 'name profilePhoto');

        res.json({ success: true, messages: messages.reverse() });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteConversation = async (req, res) => {
    try {
        await Conversation.findByIdAndDelete(req.params.conversationId);
        await Message.deleteMany({ conversationId: req.params.conversationId });

        res.json({ success: true, message: 'Conversation deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = exports;