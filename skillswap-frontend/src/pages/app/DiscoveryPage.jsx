import React, { useState, useEffect } from 'react';
import { Search, RefreshCw } from 'lucide-react';
import { useDiscovery } from '../../hooks/useDiscovery';
import UserCard from '../../components/discovery/UserCard';
import FilterBar from '../../components/discovery/FilterBar';
import ProfileModal from '../../components/discovery/ProfileModal';
import Loading from '../../components/common/Loading';
import Button from '../../components/common/Button';
import { startChat } from '../../services/discoveryService';
import { useNavigate } from 'react-router-dom';

const DiscoveryPage = () => {
    const navigate = useNavigate();
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

    useEffect(() => {
        if (view === 'nearby') {
            fetchNearbyUsers();
        } else {
            fetchMatches();
        }
    }, [view, filters.radius, filters.availability]);

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (view === 'nearby') {
                fetchNearbyUsers();
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [filters.search]);

    const handleFilterChange = (newFilters) => {
        setFilters(newFilters);
    };

    const handleViewChange = (newView) => {
        setView(newView);
    };

    const handleConnect = async (userId) => {
        try {
            const conv = await startChat(userId);
            // Could show a toast notification here
            console.log('Connected with user:', userId);
        } catch (error) {
            console.error('Failed to connect:', error);
        }
    };

    const handleViewProfile = (userId) => {
        setSelectedUserId(userId);
        setIsModalOpen(true);
    };

    const handleRefresh = () => {
        if (view === 'nearby') {
            fetchNearbyUsers();
        } else {
            fetchMatches();
        }
    };

    const displayUsers = view === 'nearby' ? nearbyUsers : matchedUsers;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-gray-900">
                    {view === 'nearby' ? 'Discover Users Near You' : 'Your Best Matches'}
                </h1>
                <Button
                    variant="ghost"
                    onClick={handleRefresh}
                    disabled={isLoading}
                    className="flex items-center gap-2"
                >
                    <RefreshCw className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
                    Refresh
                </Button>
            </div>

            {/* Filter Bar */}
            <FilterBar
                filters={filters}
                onFilterChange={handleFilterChange}
                view={view}
                onViewChange={handleViewChange}
            />

            {/* Error State */}
            {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center justify-between">
                        <p className="text-red-600">{error}</p>
                        <Button variant="danger" size="sm" onClick={handleRefresh}>
                            Retry
                        </Button>
                    </div>
                </div>
            )}

            {/* Loading State */}
            {isLoading && displayUsers.length === 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div
                            key={i}
                            className="bg-white rounded-xl shadow-md p-6 animate-pulse"
                        >
                            <div className="flex justify-center mb-4">
                                <div className="h-24 w-24 rounded-full bg-gray-200" />
                            </div>
                            <div className="space-y-3">
                                <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto" />
                                <div className="h-3 bg-gray-200 rounded w-1/2 mx-auto" />
                                <div className="flex gap-2 justify-center">
                                    <div className="h-6 w-16 bg-gray-200 rounded-full" />
                                    <div className="h-6 w-16 bg-gray-200 rounded-full" />
                                </div>
                                <div className="flex gap-2 pt-4">
                                    <div className="h-9 bg-gray-200 rounded flex-1" />
                                    <div className="h-9 bg-gray-200 rounded flex-1" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* User Grid */}
            {!isLoading && displayUsers.length > 0 && (
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
