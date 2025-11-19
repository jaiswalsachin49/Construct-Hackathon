import { useEffect } from 'react';
import useChatStore from '../store/chatStore';
import useAuthStore from '../store/authStore';
import socketService from '../services/socketService';
import { getConversations, getMessages } from '../services/chatService';

export const useChat = () => {
    const store = useChatStore();
    const { user } = useAuthStore();

    useEffect(() => {
        if (!user) return;

        socketService.connect();
        fetchConversations();

        // ===== SOCKET MESSAGE LISTENER =====
        socketService.onMessage((message) => {
            const convId = message.conversationId;
            if (!convId) return;

            // replace temp + old version
            store.updateMessage(convId, message);

            // if still missing add cleanly
            const exist = store.messages[convId] || [];
            if (!exist.some((m) => m._id === message._id)) {
                store.addMessage(convId, message);
            }
        });

    }, [user]);

    const fetchConversations = async () => {
        try {
            const data = await getConversations();
            store.setConversations(data.conversations || data);
        } catch (err) {
            console.error('Failed to fetch conversations:', err);
        }
    };

    const fetchMessages = async (conversationId) => {
        try {
            const data = await getMessages(conversationId);
            store.setMessages(conversationId, data.messages || data);
        } catch (err) {
            console.error('Failed to fetch messages:', err);
        }
    };

    // ===== SEND MESSAGE =====
    const sendMessage = (content) => {
        const convId = store.currentConversation;
        if (!convId || !content.trim()) return;

        const tempId = "temp-" + Date.now();

        const tempMessage = {
            _id: tempId,
            conversationId: convId,
            senderId: user._id,
            content: content.trim(),
            timestamp: new Date().toISOString(),

            pending: true,
            delivered: false,
            read: false,
        };

        store.addMessage(convId, tempMessage);

        socketService.sendMessage(convId, content.trim());
    };

    const setCurrentConversation = (id) => {
        if (store.currentConversation)
            socketService.leaveConversation(store.currentConversation);

        if (!id) {
            store.setCurrentConversation(null);
            return;
        }

        store.setCurrentConversation(id);
        socketService.joinConversation(id);
        socketService.markAsRead(id);

        if (!store.messages[id]) {
            fetchMessages(id);
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
