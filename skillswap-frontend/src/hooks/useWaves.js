import { useEffect } from 'react';
import useWaveStore from '../store/waveStore';
import * as waveService from '../services/waveService';

export const useWaves = () => {
    const store = useWaveStore();

    const fetchMyWaves = async () => {
        try {
            store.setLoading(true);
            store.setError(null);
            const data = await waveService.getMyWaves();
            store.setMyWaves(data.waves || data);
        } catch (error) {
            console.error('Failed to fetch my waves:', error);
            store.setError(error.response?.data?.message || 'Failed to load waves');
        } finally {
            store.setLoading(false);
        }
    };

    const fetchAlliesWaves = async () => {
        try {
            store.setLoading(true);
            store.setError(null);
            const data = await waveService.getAlliesWaves();
            store.setAlliesWaves(data.waves || data);
        } catch (error) {
            console.error('Failed to fetch allies waves:', error);
            store.setError(error.response?.data?.message || 'Failed to load waves');
        } finally {
            store.setLoading(false);
        }
    };

    const createWave = async (file, type, caption, textContent, backgroundColor) => {
        try {
            const formData = new FormData();

            if (file) {
                formData.append('file', file);
                formData.append('type', type); // 'photo' or 'video'
            } else if (textContent) {
                formData.append('text', textContent);
                formData.append('backgroundColor', backgroundColor || '#3B82F6');
                formData.append('type', 'text');
            }

            if (caption) {
                formData.append('caption', caption);
            }

            const data = await waveService.createWave(formData);
            store.addMyWave(data.wave || data);
            return data;
        } catch (error) {
            console.error('Failed to create wave:', error);
            throw error;
        }
    };

    const deleteWave = async (waveId) => {
        try {
            await waveService.deleteWave(waveId);
            store.deleteMyWave(waveId);
        } catch (error) {
            console.error('Failed to delete wave:', error);
            throw error;
        }
    };

    return {
        myWaves: store.myWaves,
        alliesWaves: store.alliesWaves,
        viewedWaves: store.viewedWaves,
        isLoading: store.isLoading,
        error: store.error,
        fetchMyWaves,
        fetchAlliesWaves,
        createWave,
        deleteWave,
        isWaveViewed: store.isWaveViewed,
        markWaveViewed: store.markWaveViewed,
    };
};
