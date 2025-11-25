import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home } from 'lucide-react';
import Button from '../components/common/Button';

const NotFound = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#0A0F1F] flex items-center justify-center px-4">
            <div className="text-center">
                <h1 className="text-9xl font-bold text-[#3B82F6]">404</h1>
                <h2 className="text-3xl font-semibold text-white mt-4 mb-2">
                    Page Not Found
                </h2>
                <p className="text-[#8A90A2] mb-8">
                    The page you're looking for doesn't exist or has been moved.
                </p>
                <Button
                    variant="primary"
                    onClick={() => navigate('/app/discover')}
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-[#60A5FA] to-[#3B82F6] text-black border-none hover:opacity-90"
                >
                    <Home className="h-5 w-5" />
                    Go Home
                </Button>
            </div>
        </div>
    );
};

export default NotFound;
