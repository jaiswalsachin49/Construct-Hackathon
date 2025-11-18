import { create } from 'zustand';

const useCommunityStore = create((set) => ({
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
  
  setLoading: (value) => set({ isLoading: value }),
  
  setError: (error) => set({ error }),
  
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
}));

export default useCommunityStore;
