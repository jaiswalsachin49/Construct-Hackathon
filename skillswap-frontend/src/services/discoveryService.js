import api from './api';

// Get nearby users
export const getNearbyUsers = async (lat, lng, radius) => {
    const response = await api.get('/api/users/nearby', {
        params: { lat, lng, radius },
    });
    return response.data;
};

// Get best matches
export const getBestMatches = async (userId) => {
    const response = await api.get('/api/users/matches', {
        params: { userId },
    });
    return response.data;
};

// Search users by skill
export const searchUsers = async (query, lat, lng) => {
    const response = await api.get('/api/users/search', {
        params: { query, lat, lng },
    });
    return response.data;
};

// Get user by ID
export const getUserById = async (userId) => {
    const response = await api.get(`/api/users/${userId}`);
    return response.data;
};

// Add user as ally
export const addAlly = async (userId) => {
    const response = await api.post(`/api/users/allies/${userId}`);
    return response.data;
};

// Start chat with user
export const startChat = async (userId) => {
    const response = await api.post('/api/chat/start', { userId });
    return response.data;
};
