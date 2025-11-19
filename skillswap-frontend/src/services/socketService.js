import { io } from 'socket.io-client';
import useChatStore from '../store/chatStore';
import useAuthStore from '../store/authStore';

class SocketService {
    socket = null;
    messageCallback = null; // NEW
    typingCallback = null;  // optional future

    connect() {
        const token = useAuthStore.getState().token;

        if (this.socket?.connected) return;

        const SOCKET_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080';

        this.socket = io(SOCKET_URL, {
            auth: { token },
            transports: ['websocket', 'polling'],
        });

        this.socket.on('connect', () => {
            console.log('Socket connected:', this.socket.id);
            useChatStore.getState().setConnected(true);
        });

        this.socket.on('disconnect', () => {
            useChatStore.getState().setConnected(false);
        });

        // ===== SERVER MESSAGE RECEIVED =====
        this.socket.on('receive:message', (message) => {
            if (this.messageCallback) {
                this.messageCallback(message); // pass to useChat
            }
        });

        // typing indicator
        this.socket.on('user:typing', (data) => {
            if (this.typingCallback) this.typingCallback(data);
        });

        // online users
        this.socket.on('users:online', (ids) => {
            useChatStore.getState().setOnlineUsers(ids);
        });
    }

    disconnect() {
        if (!this.socket) return;
        this.socket.disconnect();
        this.socket = null;
    }

    // ===== LISTENER REGISTER =====
    onMessage(callback) {
        this.messageCallback = callback;
    }

    onTyping(callback) {
        this.typingCallback = callback;
    }

    joinConversation(id) {
        if (!this.socket?.connected) return;
        this.socket.emit('conversation:join', id);
    }

    leaveConversation(id) {
        if (!this.socket?.connected) return;
        this.socket.emit('conversation:leave', id);
    }

    sendMessage(conversationId, content) {
        if (!this.socket?.connected) return;

        const userId = useAuthStore.getState().user?._id;

        this.socket.emit('send:message', {
            conversationId,
            content,
            senderId: userId,
        });
    }

    sendTyping(conversationId, isTyping) {
        if (!this.socket?.connected) return;

        const userId = useAuthStore.getState().user?._id;
        this.socket.emit('typing', { conversationId, senderId: userId, isTyping });
    }

    markAsRead(conversationId) {
        if (!this.socket?.connected) return;

        this.socket.emit('mark:read', conversationId);
        useChatStore.getState().markAsRead(conversationId);
    }
}

export default new SocketService();
