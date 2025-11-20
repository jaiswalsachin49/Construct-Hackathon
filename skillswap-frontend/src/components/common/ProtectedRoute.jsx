import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import { getCurrentUser } from '../../services/authService';
import Loading from './Loading';

const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, user, setUser, logout } = useAuthStore();
    const [isVerifying, setIsVerifying] = useState(true);
    const location = useLocation();

    useEffect(() => {
        const verifySession = async () => {
            const token = localStorage.getItem('token');
            
            // 1. No token? Definitely logged out.
            if (!token) {
                logout();
                setIsVerifying(false);
                return;
            }

            // 2. Token exists. Do we have user data?
            // If we already have user data in Store, we trust it for now (Optimistic)
            if (user) {
                setIsVerifying(false);
                // We can silently update in the background if you want
                return; 
            }

            // 3. Token exists, but Store is empty (Refresh case). We MUST fetch.
            try {
                console.log("Verifying session with token...");
                const response = await getCurrentUser();
                const userData = response.user || response;

                if (userData) {
                    setUser(userData);
                } else {
                    throw new Error("No user data returned");
                }
            } catch (error) {
                console.error("Session check failed:", error);
                
                // --- CRITICAL FIX: Only logout on AUTH errors ---
                const status = error.response?.status;
                if (status === 401 || status === 403 || status === 404) {
                    console.warn("Token invalid or user deleted. Logging out.");
                    logout();
                } else {
                    // If it's a 500 (Server Error) or Network Error, 
                    // DO NOT LOGOUT. Just let them stay (or show an error page).
                    console.warn("Server error/Network issue. Keeping session active.");
                }
            } finally {
                setIsVerifying(false);
            }
        };

        verifySession();
    }, []); 

    if (isVerifying) {
        return <div className="min-h-screen flex items-center justify-center"><Loading text="Connecting..." /></div>;
    }

    if (!isAuthenticated) {
        return <Navigate to="/auth/login" state={{ from: location }} replace />;
    }

    return children;
};

export default ProtectedRoute;