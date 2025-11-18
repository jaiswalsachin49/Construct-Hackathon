import { io } from 'socket.io-client';
import useChatStore from '../store/chatStore';
import useAuthStore from '../store/authStore';

class SocketService {
    socket = null;

    connect() {
        const token = useAuthStore.getState().token;
        const SOCKET_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

        if (this.socket?.connected) {
            console.log('Socket already connected');
            return;
        }

        this.socket = io(SOCKET_URL, {
            auth: { token },
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: 5,
        });

        this.socket.on('connect', () => {
            console.log('Socket connected:', this.socket.id);
            useChatStore.getState().setConnected(true);
        });

        this.socket.on('disconnect', () => {
            console.log('Socket disconnected');
            useChatStore.getState().setConnected(false);
        });

        this.socket.on('error', (error) => {
            console.error('Socket error:', error);
        });

        // Listen for messages
        this.socket.on('receive:message', (message) => {
            console.log('Received message:', message);
            useChatStore.getState().addMessage(message.conversationId, message);

            // Update unread count if not in current conversation
            const currentConv = useChatStore.getState().currentConversation;
            if (currentConv !== message.conversationId) {
                const currentCount = useChatStore.getState().unreadCounts[message.conversationId] || 0;
                useChatStore.getState().setUnreadCount(message.conversationId, currentCount + 1);
            }
        });

        // Listen for typing events
        this.socket.on('user:typing', ({ conversationId, userId, isTyping }) => {
            console.log('User typing:', { conversationId, userId, isTyping });
            useChatStore.getState().setTyping(conversationId, userId, isTyping);
        });

        // Listen for online users
        this.socket.on('users:online', (userIds) => {
            console.log('Online users:', userIds);
            useChatStore.getState().setOnlineUsers(userIds);
        });

        // Message delivered
        this.socket.on('message:delivered', ({ messageId, conversationId }) => {
            console.log('Message delivered:', messageId);
        });

        // Message read
        this.socket.on('message:read', ({ conversationId }) => {
            console.log('Messages read in conversation:', conversationId);
        });
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
            useChatStore.getState().setConnected(false);
        }
    }

    // Join conversation room
    joinConversation(conversationId) {
        if (this.socket?.connected) {
            this.socket.emit('conversation:join', conversationId);
            console.log('Joined conversation:', conversationId);
        }
    }

    // Leave conversation room
    leaveConversation(conversationId) {
        if (this.socket?.connected) {
            this.socket.emit('conversation:leave', conversationId);
            console.log('Left conversation:', conversationId);
        }
    }

    // Send message
    sendMessage(conversationId, content) {
        if (this.socket?.connected) {
            this.socket.emit('send:message', {
                conversationId,
                content,
                timestamp: new Date().toISOString(),
            });
            console.log('Message sent:', { conversationId, content });
        }
    }

    // Send typing indicator
    sendTyping(conversationId, isTyping) {
        if (this.socket?.connected) {
            this.socket.emit('typing', { conversationId, isTyping });
        }
    }

    // Mark as read
    markAsRead(conversationId) {
        if (this.socket?.connected) {
            this.socket.emit('mark:read', conversationId);
            useChatStore.getState().markAsRead(conversationId);
        }
    }

    isConnected() {
        return this.socket?.connected || false;
    }
}

export default new SocketService();
