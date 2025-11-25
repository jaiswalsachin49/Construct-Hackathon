import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useCommunityStore = create(
  persist(
    (set) => ({
      // State
      myCommunities: [],
      nearbyCommunities: [],
      currentCommunity: null,
      communityPosts: {}, // { communityId: [posts] }
      communityMessages: {}, // { communityId: [messages] }
      isLoading: false,
      error: null,

      // Actions
      setMyCommunities: (communities) => set({ myCommunities: communities }),

      setNearbyCommunities: (communities) => set({ nearbyCommunities: communities }),

      setCurrentCommunity: (community) => set({ currentCommunity: community }),

      addCommunity: (community) => set((state) => ({
        myCommunities: [community, ...state.myCommunities]
      })),

      removeCommunity: (communityId) => set((state) => ({
        myCommunities: state.myCommunities.filter(c => c._id !== communityId)
      })),

      setCommunityPosts: (communityId, posts) => set((state) => ({
        communityPosts: {
          ...state.communityPosts,
          [communityId]: posts
        }
      })),

      addCommunityPost: (communityId, post) => set((state) => ({
        communityPosts: {
          ...state.communityPosts,
          [communityId]: [
            post,
            ...(state.communityPosts[communityId] || [])
          ]
        }
      })),

      removeCommunityPost: (communityId, postId) => set((state) => ({
        communityPosts: {
          ...state.communityPosts,
          [communityId]: (state.communityPosts[communityId] || []).filter(p => p._id !== postId)
        }
      })),

      setCommunityMessages: (communityId, messages) => set((state) => ({
        communityMessages: {
          ...state.communityMessages,
          [communityId]: messages
        }
      })),

      addCommunityMessage: (communityId, message) => set((state) => ({
        communityMessages: {
          ...state.communityMessages,
          [communityId]: [
            ...(state.communityMessages[communityId] || []),
            message
          ]
        }
      })),

      incrementCommunityPostCount: (communityId) => set((state) => {
        const updateList = (list) => list.map(c =>
          c._id === communityId ? { ...c, postCount: (c.postCount || 0) + 1 } : c
        );

        return {
          myCommunities: updateList(state.myCommunities),
          nearbyCommunities: updateList(state.nearbyCommunities),
          currentCommunity: state.currentCommunity && state.currentCommunity._id === communityId
            ? { ...state.currentCommunity, postCount: (state.currentCommunity.postCount || 0) + 1 }
            : state.currentCommunity
        };
      }),

      setLoading: (value) => set({ isLoading: value }),

      setError: (error) => set({ error }),

      // Clear all messages
      clearMessages: () => set({ communityMessages: {} }),

      // Reset state
      reset: () => set({
        myCommunities: [],
        nearbyCommunities: [],
        currentCommunity: null,
        communityPosts: {},
        communityMessages: {},
        isLoading: false,
        error: null
      })
    }),
    {
      name: 'skillswap-community-storage',
      partialize: (state) => ({
        communityMessages: state.communityMessages,
      }),
    }
  )
);

export default useCommunityStore;
