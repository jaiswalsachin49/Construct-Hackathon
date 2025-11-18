import React from 'react';
import { Navigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import Loading from './Loading';

const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, user } = useAuthStore();
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
        // Simulate checking auth status
        const checkAuth = async () => {
            // Add any auth verification logic here if needed
            setIsLoading(false);
        };

        checkAuth();
    }, []);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loading size="lg" text="Loading..." />
            </div>
        );
    }

    if (!isAuthenticated || !user) {
        return <Navigate to="/auth/login" replace />;
    }

    return children;
};

export default ProtectedRoute;
