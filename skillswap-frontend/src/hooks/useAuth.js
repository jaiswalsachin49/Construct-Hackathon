import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import React from 'react';
import useAuthStore from '../store/authStore';
import { loginUser, registerUser, getCurrentUser } from '../services/authService';
import socketService from '../services/socketService';

export const useAuth = () => {
    const { user, isAuthenticated, token, isLoading, error, setUser, setToken, setLoading, setError, logout: logoutStore } = useAuthStore();
    const navigate = useNavigate();
    const location = useLocation();
    // Clear global auth error when the route changes so error banners don't persist across pages
    useEffect(() => {
        if (error) {
            setError(null);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location.pathname]);


    const login = async (email, password) => {
        try {
            setLoading(true);
            setError(null);

            const data = await loginUser(email, password);

            setToken(data.token);
            setUser(data.user);

            // INIT SOCKET
            socketService.connect();
            // Ensure server-side setup (join personal room) if socket already connected
            socketService.setupUser();

            navigate('/app/discover');
            return { success: true };
        } catch (error) {
            // Prefer backend `error` field (backend uses { error: '...' })
            const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Invalid email or password';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    const register = async (userData) => {
        try {
            setLoading(true);
            setError(null);

            const data = await registerUser(userData);

            setToken(data.token);
            setUser(data.user);

            // INIT SOCKET
            socketService.connect();
            // Ensure server-side setup (join personal room) if socket already connected
            socketService.setupUser();

            navigate('/app/discover');
            return { success: true };
        } catch (error) {
            // Backend returns { error: '...' } on validation / conflict
            // console.log('Registration error:', error.response.data.error);
            const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Registration failed. Please try again.';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        socketService.disconnect();
        logoutStore();
        navigate('/auth/login');
    };

    const refreshUser = async () => {
        try {
            // 1. Get fresh data from backend
            const response = await getCurrentUser();
            
            // 2. FIX: Extract the 'user' object from the response wrapper
            // Backend returns { success: true, user: {...} }
            const freshUserData = response.user || response;
            
            // 3. Update store with the user object ONLY
            setUser(freshUserData);
            
            return freshUserData;
        } catch (error) {
            console.error('Failed to refresh user:', error);
            return null;
        }
    };

    return {
        user,
        isAuthenticated,
        token,
        isLoading,
        error,
        login,
        register,
        logout,
        refreshUser,
    };
};
