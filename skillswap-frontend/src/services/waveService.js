import api from './api';

// Create wave
export const createWave = async (formData) => {
    const response = await api.post('/api/waves', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
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
