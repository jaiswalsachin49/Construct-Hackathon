import api from './api';

// Extract array safely from backend
const extractArray = (res) => {
    if (!res) return [];
    if (Array.isArray(res)) return res;
    return [];
};

// Get nearby users
export const getNearbyUsers = async (lat, lng, radius) => {
    const response = await api.get('/api/users/nearby', {
        params: { lat, lng, radius },
    });
    // console.log("Nearby users response:", response.data);
    return extractArray(response.data.users);
};

// Get best matches
export const getBestMatches = async () => {
    const response = await api.get('/api/matches/ai');
    return response.data.matches || [];
};


// Search users by skill
export const searchUsers = async (query, lat, lng) => {
    const response = await api.get('/api/users/nearby', {
        params: { query, lat, lng },
    });
    return extractArray(response.data.users);
};

// Get user by ID (returns object, not array)
export const getUserById = async (userId) => {
    const response = await api.get(`/api/users/${userId}`);
    return response.data.user || response.data;
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
