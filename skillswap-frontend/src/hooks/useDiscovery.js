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
                // searchUsers RETURNS AN ARRAY
                users = await searchUsers(
                    store.filters.search,
                    user.location.lat,
                    user.location.lng,
                    store.filters.radius
                );
            } else {
                // getNearbyUsers RETURNS AN ARRAY
                users = await getNearbyUsers(
                    user.location.lat,
                    user.location.lng,
                    store.filters.radius
                );
            }

            // Always keep array safe
            let filteredUsers = Array.isArray(users) ? users : [];

            // Filter by availability
            if (store.filters.availability) {
                filteredUsers = filteredUsers.filter(
                    (u) => u.availability === store.filters.availability
                );
            }

            // Filter by tags
            if (store.filters.tags.length > 0) {
                filteredUsers = filteredUsers.filter((u) =>
                    store.filters.tags.some(
                        (tag) =>
                            u.teachTags?.some((t) => t.name === tag) ||
                            u.learnTags?.some((t) => t.name === tag)
                    )
                );
            }

            store.setNearbyUsers(filteredUsers);
        } catch (error) {
            console.error("Failed to fetch nearby users:", error);
            store.setError(error?.response?.data?.message || "Failed to load users");
        } finally {
            store.setLoading(false);
        }
    };

    const fetchMatches = async () => {
    try {
        store.setLoading(true);
        store.setError(null);

        const users = await getBestMatches(); // returns array
        const clean = users.map(m => ({
            ...m.user,
            matchScore: m.matchScore,
            distance: m.distance
        }));

        store.setMatchedUsers(clean);
    } catch (error) {
        store.setError("Failed to load matches");
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
