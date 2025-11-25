import api from '../services/api';

// Register user
export const registerUser = async (data) => {
    const response = await api.post('/api/auth/register', data);
    return response.data;
};

// Login user
export const loginUser = async (email, password) => {
    const response = await api.post('/api/auth/login', { email, password });
    return response.data;
};

// Get current user
export const getCurrentUser = async () => {
    const response = await api.get('/api/auth/me');
    return response.data;
};

// Update profile
export const updateProfile = async (data) => {
    // If caller passed FormData (for files), set multipart header.
    const config = {};
    if (typeof FormData !== 'undefined' && data instanceof FormData) {
        config.headers = { 'Content-Type': 'multipart/form-data' };
    }
    const response = await api.put('/api/users/profile', data, config);
    return response.data;
};

// Check if email exists
// export const checkEmailExists = async (email) => {
//     const response = await api.post('/api/auth/check-email', { email });
//     return response.data;
// };
// Change password
export const changePassword = async (currentPassword, newPassword) => {
    const response = await api.post('/api/auth/change-password', { currentPassword, newPassword });
    return response.data;
};
