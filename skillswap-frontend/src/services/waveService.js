import api from './api';

// Create wave
export const createWave = async (formData, onProgress) => {
    const response = await api.post('/api/waves', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
            if (onProgress) {
                const percentCompleted = Math.round(
                    (progressEvent.loaded * 100) / progressEvent.total
                );
                onProgress(percentCompleted);
            }
        },
    });
    return response.data;
};

// Get my waves
export const getMyWaves = async () => {
    const response = await api.get('/api/waves/me');
    return response.data;
};

// Get allies' waves
export const getAlliesWaves = async () => {
    const response = await api.get('/api/waves/allies');
    return response.data;
};

// Get waves for a specific user
export const getUserWaves = async (userId) => {
    const response = await api.get(`/api/waves/user/${userId}`);
    return response.data;
};

// Mark wave as viewed
export const viewWave = async (waveId) => {
    await api.post(`/api/waves/${waveId}/view`);
};

// Delete wave
export const deleteWave = async (waveId) => {
    await api.delete(`/api/waves/${waveId}`);
};

// React to wave (like)
export const reactToWave = async (waveId) => {
    const response = await api.post(`/api/waves/${waveId}/react`);
    return response.data;
};

// Get wave viewers
export const getWaveViewers = async (waveId) => {
    const response = await api.get(`/api/waves/${waveId}/viewers`);
    return response.data;
};
