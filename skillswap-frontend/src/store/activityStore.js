import { create } from 'zustand';
import axios from 'axios';
import useAuthStore from './authStore';

const API_URL = import.meta.env.VITE_BACKEND_URL + '/api/activities';

const getAuthHeader = () => {
    const token = useAuthStore.getState().token;
    return token ? { Authorization: `Bearer ${token}` } : {};
};

const useActivityStore = create((set, get) => ({
    activities: [],
    pastActivities: [],
    selectedActivity: null,
    userLocation: [12.9716, 77.5946], // Default to Bangalore
    filters: {
        search: '',
        category: 'All',
        distanceRange: 50 // in km
    },
    loading: false,
    error: null,

    fetchActivities: async () => {
        set({ loading: true });
        try {
            const response = await axios.get(API_URL, {
                headers: getAuthHeader()
            });
            set({ activities: response.data, loading: false });
        } catch (error) {
            console.error('Error fetching activities:', error);
            set({ error: error.message, loading: false });
        }
    },

    fetchPastActivities: async () => {
        try {
            console.log('[Store] Fetching past activities from:', `${API_URL}/past`);
            const response = await axios.get(`${API_URL}/past`, {
                headers: getAuthHeader()
            });
            console.log('[Store] Past activities response:', response.data);
            set({ pastActivities: response.data });
        } catch (error) {
            console.error('Error fetching past activities:', error);
            console.error('Error details:', error.response?.data);
        }
    },

    createActivity: async (activityData) => {
        set({ loading: true });
        try {
            const response = await axios.post(API_URL, activityData, {
                headers: getAuthHeader()
            });
            set((state) => ({
                activities: [response.data, ...state.activities],
                loading: false
            }));
            return response.data;
        } catch (error) {
            console.error('Error creating activity:', error);
            set({ error: error.message, loading: false });
            throw error;
        }
    },

    updateActivity: async (activityId, updateData) => {
        try {
            const response = await axios.put(`${API_URL}/${activityId}`, updateData, {
                headers: getAuthHeader()
            });
            set((state) => ({
                activities: state.activities.map(a =>
                    a._id === activityId ? response.data : a
                ),
                selectedActivity: state.selectedActivity?._id === activityId
                    ? response.data
                    : state.selectedActivity
            }));
            return response.data;
        } catch (error) {
            console.error('Error updating activity:', error);
            throw error;
        }
    },

    joinActivity: async (activityId) => {
        try {
            const response = await axios.post(`${API_URL}/${activityId}/join`, {}, {
                headers: getAuthHeader()
            });
            set((state) => ({
                activities: state.activities.map(a =>
                    a._id === activityId ? response.data : a
                ),
                selectedActivity: state.selectedActivity?._id === activityId
                    ? response.data
                    : state.selectedActivity
            }));
        } catch (error) {
            console.error('Error joining activity:', error);
        }
    },

    leaveActivity: async (activityId) => {
        try {
            const response = await axios.post(`${API_URL}/${activityId}/leave`, {}, {
                headers: getAuthHeader()
            });
            set((state) => ({
                activities: state.activities.map(a =>
                    a._id === activityId ? response.data : a
                ),
                selectedActivity: state.selectedActivity?._id === activityId
                    ? response.data
                    : state.selectedActivity
            }));
        } catch (error) {
            console.error('Error leaving activity:', error);
        }
    },

    deleteActivity: async (activityId) => {
        try {
            await axios.delete(`${API_URL}/${activityId}`, {
                headers: getAuthHeader()
            });
            set((state) => ({
                activities: state.activities.filter(a => a._id !== activityId),
                selectedActivity: state.selectedActivity?._id === activityId ? null : state.selectedActivity
            }));
        } catch (error) {
            console.error('Error deleting activity:', error);
            throw error;
        }
    },

    selectActivity: (activity) => set({ selectedActivity: activity }),
    setUserLocation: (location) => set({ userLocation: location }),
    setFilter: (key, value) => set((state) => ({
        filters: { ...state.filters, [key]: value }
    }))
}));

export default useActivityStore;
