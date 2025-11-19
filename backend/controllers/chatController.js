const Conversation = require('../models/Conversation');
const Message = require('../models/Message');

exports.getConversations = async (req, res) => {
    try {
        const currentUserId = req.user.userId.toString();

        const conversations = await Conversation.find({
            participants: currentUserId,
        })
            .populate('participants', 'name profilePhoto')
            .sort({ lastMessageTime: -1 })
            .lean();

        // Shape data for frontend
        const shaped = await Promise.all(
            conversations.map(async (conv) => {
                const otherUser =
                    (conv.participants || []).find(
                        (p) => p._id.toString() !== currentUserId
                    ) || null;

                const lastMsgDoc = await Message.findOne({
                    conversationId: conv._id,
                })
                    .sort({ createdAt: -1 })
                    .lean();

                const lastMessage = lastMsgDoc
                    ? {
                        content: lastMsgDoc.content,
                        senderId: lastMsgDoc.senderId.toString(),
                        timestamp: lastMsgDoc.createdAt,
                    }
                    : null;

                const unreadCount =
                    (conv.unreadCounts &&
                        conv.unreadCounts.get &&
                        conv.unreadCounts.get(currentUserId)) ||
                    0;

                return {
                    _id: conv._id.toString(),
                    otherUser,
                    lastMessage,
                    unreadCount,
                };
            })
        );

        res.json({ success: true, conversations: shaped });
    } catch (error) {
        console.error('getConversations error:', error);
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

        const docs = await Message.find({ conversationId })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('senderId', 'name profilePhoto')
            .lean();

        const messages = docs
            .reverse()
            .map((m) => ({
                _id: m._id.toString(),
                content: m.content,
                senderId: m.senderId?._id.toString(),
                senderName: m.senderId?.name,
                senderPhoto: m.senderId?.profilePhoto,
                timestamp: m.createdAt,
                read: !!m.read,
                delivered: true,
            }));

        res.json({ success: true, messages });
    } catch (error) {
        console.error('getMessages error:', error);
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