import { create } from 'zustand';

const useChatStore = create((set, get) => ({
    conversations: [],
    currentConversation: null,
    messages: {},     // { conversationId: [messages] }
    unreadCounts: {}, // { conversationId: count }
    onlineUsers: [],
    isConnected: false,
    isTyping: {},     // { conversationId: { userId: boolean } }

    setConversations: (conversations) => set({ conversations }),

    addConversation: (conversation) =>
        set((state) => ({
            conversations: [conversation, ...state.conversations],
        })),

    setCurrentConversation: (id) => set({ currentConversation: id }),

    // 1. ADD/UPDATE MESSAGES
    updateMessage: (conversationId, realMessage) =>
        set((state) => {
            const msgs = state.messages[conversationId] || [];

            // Replace temp message with real one
            const replaced = msgs.map((msg) =>
                msg._id === realMessage._id || msg._id === realMessage.tempId || (msg.pending && msg.content === realMessage.content)
                    ? realMessage
                    : msg
            );

            // Deduplicate just in case
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
            // Prevent duplicates
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

    // 2. NOTIFICATIONS (RED BADGE)
    // This fixes "store.markAsRead is not a function"
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

    // 3. READ RECEIPTS (BLUE TICKS)
    // This updates the messages to show they are read
    markMessagesAsRead: (conversationId) =>
        set((state) => {
            const msgs = state.messages[conversationId] || [];
            return {
                messages: {
                    ...state.messages,
                    [conversationId]: msgs.map(m => ({ ...m, read: true }))
                }
            };
        }),

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