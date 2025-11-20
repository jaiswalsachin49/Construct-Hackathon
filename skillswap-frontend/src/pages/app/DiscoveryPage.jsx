import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Added missing navigation
import { Search, RefreshCw } from 'lucide-react';
import { useDiscovery } from '../../hooks/useDiscovery';
import { useAuth } from '../../hooks/useAuth'; // Import useAuth for refreshUser
import { useToast } from '../../hooks/use-toast'; // <--- IMPORT TOAST HOOK


import UserCard from '../../components/discovery/UserCard';
import FilterBar from '../../components/discovery/FilterBar';
import ProfileModal from '../../components/discovery/ProfileModal';
import Loading from '../../components/common/Loading';
import Button from '../../components/common/Button';
import { sendConnectionRequest } from '../../services/discoveryService';

const DiscoveryPage = () => {
    const navigate = useNavigate();
    const { refreshUser } = useAuth(); // Get refreshUser to update state after connecting
    const { toast } = useToast(); // <--- INITIALIZE TOAST

    const {
        nearbyUsers,
        matchedUsers,
        filters,
        isLoading,
        error,
        fetchNearbyUsers,
        fetchMatches,
        setFilters,
    } = useDiscovery();

    const [view, setView] = useState('nearby'); // 'nearby' or 'matches'
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // 1. Initial Load
    useEffect(() => {
        if (view === 'nearby') {
            fetchNearbyUsers();
        } else {
            fetchMatches();
        }
    }, [view, filters.radius, filters.availability]);

    // 2. Search Debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            if (view === 'nearby') {
                fetchNearbyUsers();
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [filters.search]);

    // 3. Handle Connect (Fixed Logic)
    const handleConnect = async (userId) => {
        try {
            // A. Call API
            await sendConnectionRequest(userId);

            // B. Show Success Message
            toast({
                title: "Request Sent",
                description: "Connection request sent successfully.",
                variant: "success", // Uses your Toast.jsx green variant
            });

            // C. Refresh Global User State (updates lists instantly)
            // await refreshUser();

        } catch (error) {
            console.error('Failed to connect:', error);
            toast({
                title: "Error",
                description: "Could not send connection request. Please try again.",
                variant: "destructive", // Uses your Toast.jsx red variant
            });
        }
    };

    // 4. View Profile Handler
    const handleViewProfile = (userId) => {
        setSelectedUserId(userId);
        setIsModalOpen(true);
    };

    const displayUsers = view === 'nearby' ? nearbyUsers : matchedUsers;

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Filter Bar */}
            <FilterBar
                filters={filters}
                onFilterChange={setFilters}
                view={view}
                onViewChange={setView}
            />

            {/* Main Grid */}
            <div className="max-w-7xl mx-auto p-4">
                {error && (
                    <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg flex items-center justify-between">
                        <span>{error}</span>
                        <button onClick={() => fetchNearbyUsers()} className="text-sm underline hover:text-red-800">
                            Retry
                        </button>
                    </div>
                )}

                {isLoading ? (
                    <div className="flex justify-center py-20">
                        <Loading size="lg" text={`Finding ${view === 'nearby' ? 'nearby users' : 'matches'}...`} />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {displayUsers.map((user) => (
                            <UserCard
                                key={user._id}
                                user={user}
                                onConnect={handleConnect}
                                onViewProfile={handleViewProfile}
                            />
                        ))}
                    </div>
                )}

                {/* Empty State */}
                {!isLoading && displayUsers.length === 0 && !error && (
                    <div className="text-center py-16">
                        <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-gray-100 mb-4">
                            <Search className="h-10 w-10 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            No users found
                        </h3>
                        <p className="text-gray-600 mb-6">
                            Try adjusting your filters or search in a wider radius
                        </p>
                        <Button variant="primary" onClick={() => setFilters({ radius: 10, search: '', availability: null })}>
                            Reset Filters
                        </Button>
                    </div>
                )}
            </div>

            {/* Profile Modal */}
            {selectedUserId && (
                <ProfileModal
                    userId={selectedUserId}
                    isOpen={isModalOpen}
                    onClose={() => {
                        setIsModalOpen(false);
                        setSelectedUserId(null);
                    }}
                />
            )}
        </div>
    );
};

export default DiscoveryPage;