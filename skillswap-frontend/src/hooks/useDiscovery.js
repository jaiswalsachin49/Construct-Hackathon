// frontend/src/hooks/useDiscovery.js

import { useEffect } from 'react';
import useDiscoveryStore from '../store/discoveryStore';
import useAuthStore from '../store/authStore';
import { getNearbyUsers, getBestMatches, searchUsers } from '../services/discoveryService';

export const useDiscovery = () => {
    const store = useDiscoveryStore();
    const { user } = useAuthStore();

    const fetchNearbyUsers = async () => {
        // 1. Check for location existence
        if (!user?.location?.lat || !user?.location?.lng) {
            store.setError("Please update your location in your Profile to find people nearby.");
            store.setLoading(false);
            return;
        }

        try {
            store.setLoading(true);
            store.setError(null);

            let users;

            // 2. Search Logic
            if (store.filters.search) {
                users = await searchUsers(
                    store.filters.search,
                    user.location.lat,
                    user.location.lng,
                    store.filters.radius
                );
            } else {
                users = await getNearbyUsers(
                    user.location.lat,
                    user.location.lng,
                    store.filters.radius
                );
            }

            // 3. Safety Check: Ensure users is an array
            let filteredUsers = Array.isArray(users) ? users : [];

            // 4. Frontend Filtering (Optional extra layer)
            if (store.filters.availability) {
                filteredUsers = filteredUsers.filter(
                    (u) => u.availability === store.filters.availability
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
        if (!user?.location) {
             store.setError("Please update your location to see matches.");
             return;
        }
        
        try {
            store.setLoading(true);
            store.setError(null);

            const matches = await getBestMatches();
            
            // Map backend structure if needed
            const cleanMatches = matches.map(m => ({
                ...m.user,
                matchScore: m.matchScore,
                matchReason: m.matchReason, // Pass reason to UI
                distance: m.distance
            }));

            store.setMatchedUsers(cleanMatches);
        } catch (error) {
            console.error("Failed to fetch matches:", error);
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