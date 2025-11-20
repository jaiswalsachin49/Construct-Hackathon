const jwt = require('jsonwebtoken');

module.exports = (io) => {
    const Conversation = require('../models/Conversation');
    const Message = require('../models/Message');
    const User = require('../models/User');

    // 1. AUTH MIDDLEWARE: Identify who is connecting
    io.use((socket, next) => {
        const token = socket.handshake.auth.token;
        if (token) {
            jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
                if (err) return next(new Error('Authentication error'));
                socket.decoded = decoded; // Store user info in socket
                next();
            });
        } else {
            next(new Error('Authentication error'));
        }
    });

    io.on('connection', (socket) => {
        const userId = socket.decoded?.userId;
        console.log(`User connected: ${userId}`);

        // 2. JOIN PERSONAL ROOM (For global notifications)
        if (userId) {
            socket.join(userId); 
            socket.broadcast.emit('users:online', Array.from(io.sockets.adapter.rooms.keys()));
        }

        // ========== PRIVATE CHAT ==========

        socket.on('setup', (userData) => {
            if (userData && userData._id) {
                socket.join(userData._id);
                console.log(`User joined personal room: ${userData._id}`);
                socket.emit('connected');
            }
        });
        socket.on('conversation:join', (conversationId) => {
            socket.join(`conversation:${conversationId}`);
        });

        socket.on('conversation:leave', (conversationId) => {
            socket.leave(`conversation:${conversationId}`);
        });

        socket.on('send:message', async (data) => {
            try {
                const { conversationId, content, senderId } = data;

                // Save Message
                const message = new Message({
                    conversationId,
                    senderId,
                    content,
                });
                await message.save();

                // 3. UPDATE CONVERSATION (Last message + Unread Counts)
                const conversation = await Conversation.findById(conversationId);
                if (conversation) {
                    conversation.lastMessage = content;
                    conversation.lastMessageTime = new Date();

                    // Increment unread count for ALL other participants
                    conversation.participants.forEach(p => {
                        if (p.toString() !== senderId) {
                            const current = conversation.unreadCounts.get(p.toString()) || 0;
                            conversation.unreadCounts.set(p.toString(), current + 1);
                        }
                    });
                    await conversation.save();
                    
                    // Prepare payload
                    const messagePayload = {
                        _id: message._id,
                        conversationId,
                        senderId,
                        content,
                        timestamp: message.createdAt,
                        read: false
                    };

                    // 4. EMIT TO CONVERSATION (For open chat windows)
                    io.to(`conversation:${conversationId}`).emit('receive:message', messagePayload);

                    // 5. EMIT TO RECIPIENTS (For Notifications everywhere)
                    conversation.participants.forEach(p => {
                        if (p.toString() !== senderId) {
                            io.to(p.toString()).emit('receive:message', messagePayload);
                        }
                    });
                }
            } catch (error) {
                console.error('Send message error:', error);
            }
        });

        socket.on('mark:read', async (conversationId) => {
            if (!userId) return;
            try {
                // 1. Reset unread count for this user
                const conversation = await Conversation.findById(conversationId);
                if (conversation) {
                    conversation.unreadCounts.set(userId, 0);
                    await conversation.save();
                }

                // 2. Mark messages as READ in MongoDB
                // (Update all messages in this chat that are NOT sent by me)
                await Message.updateMany(
                    { conversationId, senderId: { $ne: userId }, read: false },
                    { $set: { read: true, readAt: new Date() } }
                );

                // 3. EMIT EVENT: Tell the room "Messages were read"
                // The sender's frontend will catch this and turn ticks blue
                io.to(`conversation:${conversationId}`).emit('messages:read', {
                    conversationId,
                    readBy: userId
                });

            } catch (error) {
                console.error('Mark read error:', error);
            }
        });

        socket.on('typing', (data) => {
            const { conversationId, senderId, isTyping } = data;
            socket.to(`conversation:${conversationId}`).emit('user:typing', {
                conversationId,
                senderId,
                isTyping
            });
        });

        // ========== COMMUNITY CHAT ==========
        
        socket.on('community:join', (communityId) => {
            socket.join(`community:${communityId}`);
        });

        socket.on('community:leave', (communityId) => {
            socket.leave(`community:${communityId}`);
        });

        socket.on('send:community:message', async (data) => {
            try {
                const { communityId, content, senderId, senderName, senderPhoto } = data;
                io.to(`community:${communityId}`).emit('receive:community:message', {
                    content,
                    senderId,
                    senderName,
                    senderPhoto,
                    communityId, // Add this so frontend can filter
                    timestamp: new Date()
                });
            } catch (error) {
                console.error('Community message error:', error);
            }
        });

        socket.on('disconnect', () => {
            console.log('User disconnected:', userId);
        });
    });
};