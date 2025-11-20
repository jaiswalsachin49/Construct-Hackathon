const Conversation = require('../models/Conversation');
const Message = require('../models/Message');

exports.getConversations = async (req, res) => {
    try {
        const currentUserId = req.user.userId.toString();

        // 1. Fetch conversations and populate participants
        const conversations = await Conversation.find({
            participants: currentUserId,
        })
        .populate('participants', 'name profilePhoto')
        .sort({ lastMessageTime: -1 })
        .lean();

        // 2. Shape data WITHOUT extra DB queries
        const shaped = conversations.map((conv) => {
            const otherUser = (conv.participants || []).find(
                (p) => p._id.toString() !== currentUserId
            ) || null;

            // Use the data already in the Conversation model
            const lastMessage = conv.lastMessage ? {
                content: conv.lastMessage,
                timestamp: conv.lastMessageTime,
                // Note: You might miss senderId here with this optimization, 
                // but it's a worthy trade-off for the list view.
            } : null;

            const unreadCount = (conv.unreadCounts && conv.unreadCounts[currentUserId]) || 0;

            return {
                _id: conv._id,
                otherUser,
                lastMessage,
                unreadCount,
            };
        });

        res.json({ success: true, conversations: shaped });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.startConversation = async (req, res) => {
    try {
        const { userId } = req.body; // The ID of the person we want to chat with
        const currentUserId = req.user.userId;

        if (!userId) {
            return res.status(400).json({ error: 'User ID is required' });
        }

        // 1. Check if conversation already exists
        let conversation = await Conversation.findOne({
            participants: { $all: [currentUserId, userId] }
        });

        // 2. If found, return it
        if (conversation) {
            return res.json({ 
                success: true, 
                conversation: { 
                    _id: conversation._id,
                    // Add any other needed fields
                }
            });
        }

        // 3. If not found, CREATE it
        conversation = new Conversation({
            participants: [currentUserId, userId],
            unreadCounts: new Map(), // Initialize empty map
            lastMessage: "New conversation started",
            lastMessageTime: new Date()
        });

        await conversation.save();

        res.status(201).json({ 
            success: true, 
            conversation: { 
                _id: conversation._id 
            } 
        });

    } catch (error) {
        console.error("Start conversation error:", error);
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