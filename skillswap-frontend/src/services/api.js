import axios from 'axios';
import useAuthStore from '../store/authStore';

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080';

const api = axios.create({
    baseURL: API_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        // 1. Try getting token from Store
        let token = useAuthStore.getState().token;
        
        // 2. CRITICAL FIX: If store is not ready, check LocalStorage directly
        if (!token) {
            token = localStorage.getItem('token');
        }

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Only logout if it's a true auth error (401) and we aren't already on login
        if (error.response?.status === 401) {
            const currentPath = window.location.pathname;
            if (!currentPath.includes('/auth/login') && !currentPath.includes('/auth/register')) {
                console.warn('Session expired or invalid token - logging out');
                useAuthStore.getState().logout();
                window.location.href = '/auth/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;