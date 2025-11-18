// Centralized store exports
export { default as useCommunityStore } from './communityStore';

// Custom selectors for better performance
export const useCurrentCommunity = () => useCommunityStore((state) => state.currentCommunity);
export const useMyCommunities = () => useCommunityStore((state) => state.myCommunities);
export const useNearbyCommunities = () => useCommunityStore((state) => state.nearbyCommunities);
export const useCommunityLoading = () => useCommunityStore((state) => state.isLoading);
