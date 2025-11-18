import { useEffect } from 'react';
import useDiscoveryStore from '../store/discoveryStore';
import useAuthStore from '../store/authStore';
import { getNearbyUsers, getBestMatches, searchUsers } from '../services/discoveryService';

export const useDiscovery = () => {
    const store = useDiscoveryStore();
    const { user } = useAuthStore();

    const fetchNearbyUsers = async () => {
        if (!user?.location) return;

        try {
            store.setLoading(true);
            store.setError(null);

            let users;
            if (store.filters.search) {
                users = await searchUsers(
                    store.filters.search,
                    user.location.lat,
                    user.location.lng
                );
            } else {
                users = await getNearbyUsers(
                    user.location.lat,
                    user.location.lng,
                    store.filters.radius
                );
            }

            // Apply local filters
            let filteredUsers = users;

            if (store.filters.availability) {
                filteredUsers = filteredUsers.filter(
                    (u) => u.availability === store.filters.availability
                );
            }

            if (store.filters.tags.length > 0) {
                filteredUsers = filteredUsers.filter((u) =>
                    store.filters.tags.some(
                        (tag) =>
                            u.teachTags?.includes(tag) || u.learnTags?.includes(tag)
                    )
                );
            }

            store.setNearbyUsers(filteredUsers);
        } catch (error) {
            console.error('Failed to fetch nearby users:', error);
            store.setError(error.response?.data?.message || 'Failed to load users');
        } finally {
            store.setLoading(false);
        }
    };

    const fetchMatches = async () => {
        if (!user?._id) return;

        try {
            store.setLoading(true);
            store.setError(null);

            const users = await getBestMatches(user._id);
            store.setMatchedUsers(users);
        } catch (error) {
            console.error('Failed to fetch matches:', error);
            store.setError(error.response?.data?.message || 'Failed to load matches');
        } finally {
            store.setLoading(false);
        }
    };

    return {
        nearbyUsers: store.nearbyUsers,
        matchedUsers: store.matchedUsers,
        filters: store.filters,
        isLoading: store.isLoading,
        error: store.error,
        fetchNearbyUsers,
        fetchMatches,
        setFilters: store.setFilters,
        clearFilters: store.clearFilters,
    };
};
