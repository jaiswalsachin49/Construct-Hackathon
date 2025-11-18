import { useEffect } from 'react';
import useChatStore from '../store/chatStore';
import useAuthStore from '../store/authStore';
import socketService from '../services/socketService';
import { getConversations, getMessages } from '../services/chatService';

export const useChat = () => {
    const store = useChatStore();
    const { user } = useAuthStore();

    useEffect(() => {
        // Connect socket on mount
        if (user) {
            socketService.connect();
            fetchConversations();
        }

        // Cleanup on unmount
        return () => {
            // Don't disconnect on unmount as socket should persist
            // socketService.disconnect();
        };
    }, [user]);

    const fetchConversations = async () => {
        try {
            const data = await getConversations();
            store.setConversations(data.conversations || data);
        } catch (error) {
            console.error('Failed to fetch conversations:', error);
        }
    };

    const fetchMessages = async (conversationId) => {
        try {
            const data = await getMessages(conversationId);
            store.setMessages(conversationId, data.messages || data);
        } catch (error) {
            console.error('Failed to fetch messages:', error);
        }
    };

    const sendMessage = (content) => {
        if (!store.currentConversation || !content.trim()) return;

        // Optimistic update
        const tempMessage = {
            _id: 'temp-' + Date.now(),
            content: content.trim(),
            senderId: user._id,
            timestamp: new Date().toISOString(),
            pending: true,
        };

        store.addMessage(store.currentConversation, tempMessage);
        socketService.sendMessage(store.currentConversation, content.trim());
    };

    const setCurrentConversation = (conversationId) => {
        // Leave previous conversation
        if (store.currentConversation) {
            socketService.leaveConversation(store.currentConversation);
        }

        // Join new conversation
        if (conversationId) {
            store.setCurrentConversation(conversationId);
            socketService.joinConversation(conversationId);
            socketService.markAsRead(conversationId);

            // Fetch messages if not loaded
            if (!store.messages[conversationId]) {
                fetchMessages(conversationId);
            }
        } else {
            store.setCurrentConversation(null);
        }
    };

    return {
        conversations: store.conversations,
        currentConversation: store.currentConversation,
        messages: store.messages[store.currentConversation] || [],
        unreadCounts: store.unreadCounts,
        onlineUsers: store.onlineUsers,
        isConnected: store.isConnected,
        isTyping: store.isTyping[store.currentConversation] || {},
        sendMessage,
        setCurrentConversation,
        fetchConversations,
        fetchMessages,
    };
};
