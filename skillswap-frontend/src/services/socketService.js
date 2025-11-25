import { io } from 'socket.io-client';
import useChatStore from '../store/chatStore';
import useAuthStore from '../store/authStore';

class SocketService {
    socket = null;
    messageListeners = [];
    typingListeners = [];
    notificationListeners = []; // <--- NEW: Array for notifications

    connect() {
        const token = useAuthStore.getState().token;

        if (!token || this.socket?.connected) return;

        const SOCKET_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080';

        this.socket = io(SOCKET_URL, {
            auth: { token },
            transports: ['websocket', 'polling'],
            reconnection: true,
        });

        this.socket.on('connect', () => {
            useChatStore.getState().setConnected(true);

            // Emit setup with the latest user from the store (don't rely on earlier capture)
            const latestUser = useAuthStore.getState().user;
            if (latestUser) {
                this.socket.emit('setup', latestUser);
            }
        });

        // Server broadcasts online users list; update store when received
        this.socket.on('users:online', (rooms) => {
            try {
                // Server sends an array of room keys; personal rooms are userId strings (24-hex)
                const onlineUserIds = Array.isArray(rooms)
                    ? rooms.filter(r => typeof r === 'string' && /^[0-9a-fA-F]{24}$/.test(r))
                    : [];
                useChatStore.getState().setOnlineUsers(onlineUserIds);
            } catch (err) {
                console.warn('Failed to set online users:', err);
            }
        });

        // --- EVENT LISTENERS ---

        // 1. Chat Messages
        this.socket.on('receive:message', (message) => {
            // console.log('🔥 SOCKET RECEIVED MESSAGE:', message);
            // Always update chat store so messages arrive instantly in the UI
            try {
                const convId = message.conversationId || message.conversation || message.chatId;
                if (convId) {
                    // First try to replace any pending temp message
                    useChatStore.getState().updateMessage(convId, message);

                    // Ensure the message is present (addMessage prevents duplicates)
                    const msgs = useChatStore.getState().messages[convId] || [];
                    if (!msgs.some(m => m._id === message._id)) {
                        useChatStore.getState().addMessage(convId, message);
                    }
                }
            } catch (err) {
                console.warn('Failed to sync incoming message to store:', err);
            }

            // Update unread counts if needed and update conversation preview
            try {
                const convId = message.conversationId || message.conversation || message.chatId;
                const activeConversationId = useChatStore.getState().currentConversation;

                if (convId && activeConversationId !== convId) {
                    // increment unread count
                    const current = useChatStore.getState().unreadCounts[convId] || 0;
                    useChatStore.getState().setUnreadCount(convId, current + 1);

                    // Update conversation preview and ordering immediately
                    useChatStore.getState().bumpConversationWithMessage(convId, {
                        content: message.content,
                        senderId: message.senderId,
                        timestamp: message.timestamp || new Date().toISOString(),
                        _id: message._id,
                    });
                } else if (convId && activeConversationId === convId) {
                    // If user is active in this conversation, mark read immediately
                    useChatStore.getState().markAsRead(convId);
                    // Also bump preview with last message so the left panel updates
                    useChatStore.getState().bumpConversationWithMessage(convId, {
                        content: message.content,
                        senderId: message.senderId,
                        timestamp: message.timestamp || new Date().toISOString(),
                        _id: message._id,
                    });
                }
            } catch (err) {
                console.warn('Failed to update unread counts for incoming message:', err);
            }

            // Notify any registered listeners as well
            this.messageListeners.forEach(cb => cb(message));
        });

        // 2. Notifications (Connection Requests) <--- NEW
        this.socket.on('notification:request', (data) => {
            // console.log("🔔 Notification received:", data);
            this.notificationListeners.forEach(cb => cb(data));
        });

        // 3. Typing
        this.socket.on('user:typing', (data) => {
            try {
                const { conversationId, senderId, isTyping } = data || {};
                if (conversationId && senderId !== undefined) {
                    useChatStore.getState().setTyping(conversationId, senderId, !!isTyping);
                }
            } catch (err) {
                console.warn('Failed to update typing in store:', err);
            }

            // Notify any registered listeners too
            this.typingListeners.forEach(cb => cb(data));
        });

        // 4. Read Receipts
        this.socket.on('messages:read', (data) => {
            if (data && data.conversationId) {
                useChatStore.getState().markMessagesAsRead(data.conversationId);
            }
        });
    }

    // Public helper to force emitting setup when user becomes available
    setupUser() {
        const user = useAuthStore.getState().user;
        if (this.socket && this.socket.connected && user) {
            this.socket.emit('setup', user);
        }
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    // --- SUBSCRIPTION METHODS ---

    onMessage(callback) {
        this.messageListeners.push(callback);
        return () => {
            this.messageListeners = this.messageListeners.filter(cb => cb !== callback);
        };
    }

    // <--- NEW METHOD
    onNotification(callback) {
        this.notificationListeners.push(callback);
        return () => {
            this.notificationListeners = this.notificationListeners.filter(cb => cb !== callback);
        };
    }

    onTyping(callback) {
        this.typingListeners.push(callback);
        return () => {
            this.typingListeners = this.typingListeners.filter(cb => cb !== callback);
        };
    }

    // ... (Keep your existing joinConversation, sendMessage, markAsRead methods) ...
    joinConversation(id) { this.socket?.emit('conversation:join', id); }
    leaveConversation(id) { this.socket?.emit('conversation:leave', id); }

    sendMessage(conversationId, content) {
        const userId = useAuthStore.getState().user?._id;
        this.socket?.emit('send:message', { conversationId, content, senderId: userId });
    }

    markAsRead(conversationId) {
        if (this.socket?.connected) {
            this.socket.emit('mark:read', conversationId);
        }
    }

    sendTyping(conversationId, isTyping) {
        const userId = useAuthStore.getState().user?._id;
        this.socket?.emit('typing', { conversationId, senderId: userId, isTyping });
    }

    // --- COMMUNITY METHODS ---

    joinCommunityRoom(communityId) {
        this.socket?.emit('community:join', communityId);
    }

    leaveCommunityRoom(communityId) {
        this.socket?.emit('community:leave', communityId);
    }

    sendCommunityMessage(communityId, content) {
        const user = useAuthStore.getState().user;
        if (user) {
            this.socket?.emit('send:community:message', {
                communityId,
                content,
                senderId: user._id,
                senderName: user.name,
                senderPhoto: user.profilePhoto
            });
        }
    }

    on(event, callback) {
        this.socket?.on(event, callback);
    }

    off(event, callback) {
        this.socket?.off(event, callback);
    }
}

const socketService = new SocketService();
export default socketService;