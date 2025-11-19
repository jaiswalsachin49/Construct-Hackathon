import { create } from 'zustand';

const useChatStore = create((set, get) => ({
    conversations: [],
    currentConversation: null,
    messages: {}, 
    unreadCounts: {},
    onlineUsers: [],
    isConnected: false,
    isTyping: {},

    setConversations: (conversations) => set({ conversations }),

    addConversation: (conversation) =>
        set((state) => ({
            conversations: [conversation, ...state.conversations],
        })),

    setCurrentConversation: (id) => set({ currentConversation: id }),

    // ===== replace temp + remove duplicate _id =====
    updateMessage: (conversationId, realMessage) =>
        set((state) => {
            const msgs = state.messages[conversationId] || [];

            const replaced = msgs.map((msg) =>
                msg._id === realMessage._id || msg._id.startsWith("temp")
                    ? realMessage
                    : msg
            );

            const unique = [];
            const map = {};
            replaced.forEach((m) => {
                if (!map[m._id]) {
                    map[m._id] = true;
                    unique.push(m);
                }
            });

            return {
                messages: {
                    ...state.messages,
                    [conversationId]: unique,
                },
            };
        }),

    addMessage: (conversationId, message) =>
        set((state) => {
            const msgs = state.messages[conversationId] || [];

            // prevent duplicate _id
            if (msgs.some((m) => m._id === message._id)) return {};

            return {
                messages: {
                    ...state.messages,
                    [conversationId]: [...msgs, message],
                },
            };
        }),

    setMessages: (conversationId, messages) =>
        set((state) => ({
            messages: {
                ...state.messages,
                [conversationId]: messages,
            },
        })),

    markAsRead: (conversationId) =>
        set((state) => ({
            unreadCounts: {
                ...state.unreadCounts,
                [conversationId]: 0,
            },
        })),

    setUnreadCount: (conversationId, count) =>
        set((state) => ({
            unreadCounts: {
                ...state.unreadCounts,
                [conversationId]: count,
            },
        })),

    setOnlineUsers: (list) => set({ onlineUsers: list }),

    setTyping: (conversationId, userId, isTyping) =>
        set((state) => ({
            isTyping: {
                ...state.isTyping,
                [conversationId]: {
                    ...(state.isTyping[conversationId] || {}),
                    [userId]: isTyping,
                },
            },
        })),

    setConnected: (v) => set({ isConnected: v }),
}));

export default useChatStore;
