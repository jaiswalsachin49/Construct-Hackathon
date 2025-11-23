import { useEffect, useCallback } from 'react';
import useChatStore from '../store/chatStore';
import useAuthStore from '../store/authStore';
import socketService from '../services/socketService';
import { getConversations, getMessages } from '../services/chatService';

export const useChat = () => {
    const store = useChatStore();
    const { user } = useAuthStore();

    // Memoized fetch function to avoid dependency cycles
    const fetchMessages = useCallback(async (conversationId) => {
        if (!conversationId) return;
        try {
            const data = await getMessages(conversationId);
            store.setMessages(conversationId, data.messages || data);
        } catch (err) {
            console.error('Failed to fetch messages:', err);
        }
    }, []);

    const fetchConversations = useCallback(async () => {
        try {
            const data = await getConversations();
            store.setConversations(data.conversations || data);
        } catch (err) {
            console.error('Failed to fetch conversations:', err);
        }
    }, []);

    useEffect(() => {
        if (!user) return;

        socketService.connect();
        // Only fetch conversations once on mount/user change
        fetchConversations();

        // NOTE: We rely on socketService to update the store globally.
        // We do NOT register a local listener here to avoid stale closures and double updates.

    }, [user, fetchConversations]);

    // ===== ACTIONS =====

    const deleteConversation = async (conversationId) => {
        try {
            const token = useAuthStore.getState().token;
            await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/chat/${conversationId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            // Remove from store
            const currentConvs = store.conversations;
            store.setConversations(currentConvs.filter(c => c._id !== conversationId));
            if (store.currentConversation === conversationId) {
                store.setCurrentConversation(null);
            }
        } catch (err) {
            console.error('Failed to delete conversation:', err);
        }
    };

    const blockUser = async (userId) => {
        try {
            const token = useAuthStore.getState().token;
            await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/users/block/${userId}`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` }
            });
            // Ideally, we should also remove the conversation or mark it as blocked
            // For now, just a success action
        } catch (err) {
            console.error('Failed to block user:', err);
        }
    };

    const sendMessage = (content) => {
        const convId = store.currentConversation;
        if (!convId || !content.trim()) return;
        const text = content.trim();

        // Prevent duplicate sends: if there's already a pending message
        // with the same content for this conversation, ignore this send.
        const existing = store.messages[convId] || [];
        const hasDuplicatePending = existing.some(m => m.pending && m.content === text);
        if (hasDuplicatePending) return;

        const tempId = "temp-" + Date.now();
        const tempMessage = {
            _id: tempId,
            conversationId: convId,
            senderId: user._id,
            content: text,
            timestamp: new Date().toISOString(),
            pending: true,
            delivered: false,
            read: false,
        };

        // Optimistic UI Update
        store.addMessage(convId, tempMessage);

        // Send to Server
        socketService.sendMessage(convId, text);
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

        // Mark read immediately
        socketService.markAsRead(id);
        store.markAsRead(id);

        // Always fetch fresh messages when opening a chat
        fetchMessages(id);
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
        deleteConversation,
        blockUser,
    };
};