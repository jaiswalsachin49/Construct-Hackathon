import api from './api';

// Get all conversations
export const getConversations = async () => {
    const response = await api.get('/api/chat/conversations');
    return response.data;
};

// Get messages for conversation
export const getMessages = async (conversationId, limit = 50, before = null) => {
    const params = { limit };
    if (before) params.before = before;

    const response = await api.get(`/api/chat/${conversationId}/messages`, { params });
    return response.data;
};


// Start new conversation
export const startConversation = async (userId) => {
    const response = await api.post('/api/chat/start', { userId });
    return response.data;
};


// Delete conversation
export const deleteConversation = async (conversationId) => {
    await api.delete(`/api/chat/${conversationId}`);
};

// Search conversations
export const searchConversations = async (query) => {
    const response = await api.get('/api/chat/search', {
        params: { query },
    });
    return response.data;
};