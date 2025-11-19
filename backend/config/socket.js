module.exports = (io) => {
    const Conversation = require('../models/Conversation');
    const Message = require('../models/Message');
    const User = require('../models/User');

    io.on('connection', (socket) => {
        console.log('User connected:', socket.id);

        // ========== PRIVATE CHAT ==========

        // Join conversation room
        socket.on('conversation:join', (conversationId) => {
            socket.join(`conversation:${conversationId}`);
            console.log(`User ${socket.id} joined conversation:${conversationId}`);
        });

        // Leave conversation room
        socket.on('conversation:leave', (conversationId) => {
            socket.leave(`conversation:${conversationId}`);
            console.log(`User ${socket.id} left conversation:${conversationId}`);
        });

        // Send message
        socket.on('send:message', async (data) => {
            try {
                const { conversationId, content, senderId } = data;

                const message = new Message({
                    conversationId,
                    senderId,
                    content,
                });

                await message.save();

                await Conversation.findByIdAndUpdate(conversationId, {
                    lastMessage: content,
                    lastMessageTime: new Date(),
                });

                io.to(`conversation:${conversationId}`).emit('receive:message', {
                    _id: message._id,
                    conversationId,            // ✅ include this
                    content,
                    senderId,
                    timestamp: message.createdAt,
                });
            } catch (error) {
                console.error('Message error:', error);
            }
        });

        // Typing indicator
        socket.on('typing', (data) => {
            const { conversationId, senderId, isTyping } = data;
            io.to(`conversation:${conversationId}`).emit('user:typing', {
                conversationId,
                senderId,
                isTyping,
            });
        });

        // Mark as read
        socket.on('mark:read', async (conversationId) => {
            try {
                await Message.updateMany(
                    {
                        conversationId,
                        senderId: { $ne: socket.userId },   // ❗ only mark messages from the other user
                        read: false
                    },
                    { read: true }
                );

        io.to(`conversation:${conversationId}`).emit('messages:read');
    } catch (error) {
        console.error('Mark read error:', error);
    }
});

// ========== COMMUNITY GROUP CHAT ==========

// Join community room
socket.on('community:join', (communityId) => {
    socket.join(`community:${communityId}`);
    console.log(`User ${socket.id} joined community:${communityId}`);
});

// Leave community room
socket.on('community:leave', (communityId) => {
    socket.leave(`community:${communityId}`);
    console.log(`User ${socket.id} left community:${communityId}`);
});

// Send community message
socket.on('send:community:message', async (data) => {
    try {
        const { communityId, content, senderId, senderName, senderPhoto } = data;

        // Broadcast to all members in the community room
        io.to(`community:${communityId}`).emit('receive:community:message', {
            content,
            senderId,
            senderName,
            senderPhoto,
            timestamp: new Date()
        });
    } catch (error) {
        console.error('Community message error:', error);
    }
});

// Community typing indicator
socket.on('community:typing', (data) => {
    const { communityId, senderId, senderName, isTyping } = data;
    io.to(`community:${communityId}`).emit('community:user:typing', {
        senderId,
        senderName,
        isTyping
    });
});

socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
});
    });
};