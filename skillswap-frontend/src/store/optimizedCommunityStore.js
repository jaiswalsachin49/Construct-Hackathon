import { create } from 'zustand';
import { persist, createJSONStorage, devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

const useCommunityStore = create(
  devtools(
    persist(
      immer((set, get) => ({
        // State
        myCommunities: [],
        nearbyCommunities: [],
        currentCommunity: null,
        communityPosts: {},
        communityMessages: {},
        isLoading: false,
        error: null,

        // Actions with Immer for immutable updates
        setMyCommunities: (communities) =>
          set((state) => {
            state.myCommunities = communities;
          }),

        setNearbyCommunities: (communities) =>
          set((state) => {
            state.nearbyCommunities = communities;
          }),

        setCurrentCommunity: (community) =>
          set((state) => {
            state.currentCommunity = community;
          }),

        addCommunity: (community) =>
          set((state) => {
            state.myCommunities.unshift(community);
          }),

        removeCommunity: (communityId) =>
          set((state) => {
            state.myCommunities = state.myCommunities.filter(
              (c) => c._id !== communityId
            );
          }),

        setCommunityPosts: (communityId, posts) =>
          set((state) => {
            state.communityPosts[communityId] = posts;
          }),

        addCommunityPost: (communityId, post) =>
          set((state) => {
            if (!state.communityPosts[communityId]) {
              state.communityPosts[communityId] = [];
            }
            state.communityPosts[communityId].unshift(post);
          }),

        setCommunityMessages: (communityId, messages) =>
          set((state) => {
            state.communityMessages[communityId] = messages;
          }),

        addCommunityMessage: (communityId, message) =>
          set((state) => {
            if (!state.communityMessages[communityId]) {
              state.communityMessages[communityId] = [];
            }
            state.communityMessages[communityId].push(message);
          }),

        setLoading: (value) =>
          set((state) => {
            state.isLoading = value;
          }),

        setError: (error) =>
          set((state) => {
            state.error = error;
          }),

        // Reset state (for logout)
        reset: () =>
          set((state) => {
            state.myCommunities = [];
            state.nearbyCommunities = [];
            state.currentCommunity = null;
            state.communityPosts = {};
            state.communityMessages = {};
            state.isLoading = false;
            state.error = null;
          })
      })),
      {
        name: 'skillswap-community',
        storage: createJSONStorage(() => localStorage),
        // Only persist essential data
        partialize: (state) => ({
          myCommunities: state.myCommunities,
          currentCommunity: state.currentCommunity
        })
      }
    ),
    { name: 'CommunityStore' }
  )
);

export default useCommunityStore;

// Custom selectors
export const useCurrentCommunity = () =>
  useCommunityStore((state) => state.currentCommunity);
export const useMyCommunities = () =>
  useCommunityStore((state) => state.myCommunities);
export const useNearbyCommunities = () =>
  useCommunityStore((state) => state.nearbyCommunities);
export const useCommunityLoading = () =>
  useCommunityStore((state) => state.isLoading);
