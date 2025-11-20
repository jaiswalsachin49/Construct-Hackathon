import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { loginUser, registerUser, getCurrentUser } from '../services/authService';
import socketService from '../services/socketService';

export const useAuth = () => {
    const { user, isAuthenticated, token, isLoading, error, setUser, setToken, setLoading, setError, logout: logoutStore } = useAuthStore();
    const navigate = useNavigate();

    const login = async (email, password) => {
        try {
            setLoading(true);
            setError(null);

            const data = await loginUser(email, password);

            setToken(data.token);
            setUser(data.user);

            // INIT SOCKET
            socketService.connect();

            navigate('/app/discover');
            return { success: true };
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Invalid email or password';
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

            navigate('/app/discover');
            return { success: true };
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Registration failed. Please try again.';
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
