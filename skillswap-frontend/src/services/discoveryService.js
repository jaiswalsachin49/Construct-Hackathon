import api from './api';

// Extract array safely from backend
const extractArray = (res) => {
    if (!res) return [];
    if (Array.isArray(res)) return res;
    return [];
};

// Send Request
export const sendConnectionRequest = async (userId) => {
    const response = await api.post(`/api/users/request/${userId}`);
    return response.data;
};

// Accept Request
export const acceptConnectionRequest = async (userId) => {
    const response = await api.post(`/api/users/request/${userId}/accept`);
    return response.data;
};

// Reject Request
export const rejectConnectionRequest = async (userId) => {
    const response = await api.post(`/api/users/request/${userId}/reject`);
    return response.data;
};

// Get Pending Requests
export const getPendingRequests = async () => {
    const response = await api.get('/api/users/requests/pending');
    return response.data.requests || [];
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
export const searchUsers = async (search, lat, lng, radius) => {
    const response = await api.get('/api/users/nearby', {
        params: { search, lat, lng, radius },
    });
    return extractArray(response.data.users);
};

// Get user by ID (returns object, not array)
export const getUserById = async (userId) => {
    const response = await api.get(`/api/users/${userId}`);
    return response.data.user || response.data;
};



// Start chat with user
export const startChat = async (userId) => {
    const response = await api.post('/api/chat/start', { userId });
    return response.data;
};
// Get blocked users
export const getBlockedUsers = async () => {
    const response = await api.get('/api/users/blocked/list');
    return response.data.blockedUsers || [];
};

// Unblock user
export const unblockUser = async (userId) => {
    const response = await api.post(`/api/users/unblock/${userId}`);
    return response.data;
};
