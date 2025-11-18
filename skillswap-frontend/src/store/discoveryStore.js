import { create } from 'zustand';

const useDiscoveryStore = create((set) => ({
    nearbyUsers: [],
    matchedUsers: [],
    filters: {
        radius: 5, // km
        tags: [],
        availability: null,
        search: '',
    },
    isLoading: false,
    error: null,

    setNearbyUsers: (users) => set({ nearbyUsers: users }),

    setMatchedUsers: (users) => set({ matchedUsers: users }),

    setFilters: (filters) => set((state) => ({
        filters: { ...state.filters, ...filters },
    })),

    clearFilters: () => set({
        filters: {
            radius: 5,
            tags: [],
            availability: null,
            search: '',
        },
    }),

    setLoading: (isLoading) => set({ isLoading }),

    setError: (error) => set({ error }),
}));

export default useDiscoveryStore;
