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

        const handleNewMessage = (message) => {
            const convId = message.conversationId;
            if (!convId) return;

            console.log("📩 New Message:", message);

            // Try to merge with any optimistic/pending message first
            // This will replace a temp message if content/tempId matches
            store.updateMessage(convId, message);

            // If updateMessage didn't add the message (no matching temp), ensure it's appended
            const existing = useChatStore.getState().messages[convId] || [];
            if (!existing.some(m => m._id === message._id)) {
                store.addMessage(convId, message);
            }

            // 2. Sync if active
            const currentId = useChatStore.getState().currentConversation;
            if (currentId === convId) {
                socketService.markAsRead(convId);
                store.markAsRead(convId);
            }
        };

        const handleReadReceipt = ({ conversationId }) => {
            if (conversationId) store.markMessagesAsRead(conversationId);
        };

        const removeMsgListener = socketService.onMessage(handleNewMessage);
        
        if (socketService.socket) {
            socketService.socket.on('messages:read', handleReadReceipt);
        }

        return () => {
            removeMsgListener();
            if (socketService.socket) {
                socketService.socket.off('messages:read', handleReadReceipt);
            }
        };
    // REMOVED fetchMessages from dependencies to keep listener stable
    }, [user]);

    // ===== ACTIONS =====

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
    };
};