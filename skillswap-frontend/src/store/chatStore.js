import { create } from 'zustand';

const useChatStore = create((set, get) => ({
    conversations: [],
    currentConversation: null,
    messages: {}, // { conversationId: [messages] }
    unreadCounts: {}, // { conversationId: count }
    onlineUsers: [], // array of user IDs
    isConnected: false,
    isTyping: {}, // { conversationId: { userId: true/false } }

    setConversations: (conversations) => set({ conversations }),

    addConversation: (conversation) => set((state) => ({
        conversations: [conversation, ...state.conversations],
    })),

    setCurrentConversation: (id) => set({ currentConversation: id }),

    addMessage: (conversationId, message) => set((state) => {
        const existingMessages = state.messages[conversationId] || [];
        return {
            messages: {
                ...state.messages,
                [conversationId]: [...existingMessages, message],
            },
        };
    }),

    setMessages: (conversationId, messages) => set((state) => ({
        messages: {
            ...state.messages,
            [conversationId]: messages,
        },
    })),

    markAsRead: (conversationId) => set((state) => ({
        unreadCounts: {
            ...state.unreadCounts,
            [conversationId]: 0,
        },
    })),

    setUnreadCount: (conversationId, count) => set((state) => ({
        unreadCounts: {
            ...state.unreadCounts,
            [conversationId]: count,
        },
    })),

    setOnlineUsers: (userIds) => set({ onlineUsers: userIds }),

    setTyping: (conversationId, userId, isTyping) => set((state) => ({
        isTyping: {
            ...state.isTyping,
            [conversationId]: {
                ...(state.isTyping[conversationId] || {}),
                [userId]: isTyping,
            },
        },
    })),

    setConnected: (value) => set({ isConnected: value }),
}));

export default useChatStore;
