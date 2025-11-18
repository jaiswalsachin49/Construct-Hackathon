import useCommunityStore from '@/store/communityStore';
import {
  getMyCommunities,
  getNearbyCommunities,
  getCommunity,
  createCommunity,
  joinCommunity as joinCommunityService,
  leaveCommunity as leaveCommunityService,
  getCommunityMembers,
  getCommunityPosts,
  searchCommunities
} from '@/services/communityService';

export const useCommunities = () => {
  const store = useCommunityStore();

  const fetchMyCommunities = async () => {
    try {
      store.setLoading(true);
      store.setError(null);
      const data = await getMyCommunities();
      store.setMyCommunities(data.communities || []);
      return data.communities;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch communities';
      store.setError(errorMessage);
      console.error('Error fetching my communities:', error);
      throw error;
    } finally {
      store.setLoading(false);
    }
  };

  const fetchNearbyCommunities = async (lat, lng, radius = 10) => {
    try {
      store.setLoading(true);
      store.setError(null);
      const data = await getNearbyCommunities(lat, lng, radius);
      store.setNearbyCommunities(data.communities || []);
      return data.communities;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch nearby communities';
      store.setError(errorMessage);
      console.error('Error fetching nearby communities:', error);
      throw error;
    } finally {
      store.setLoading(false);
    }
  };

  const fetchCommunity = async (communityId) => {
    try {
      store.setLoading(true);
      store.setError(null);
      const data = await getCommunity(communityId);
      store.setCurrentCommunity(data.community);
      return data.community;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch community';
      store.setError(errorMessage);
      console.error('Error fetching community:', error);
      throw error;
    } finally {
      store.setLoading(false);
    }
  };

  const createNewCommunity = async (communityData) => {
    try {
      store.setLoading(true);
      store.setError(null);
      const data = await createCommunity(communityData);
      store.addCommunity(data.community);
      return data.community;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create community';
      store.setError(errorMessage);
      console.error('Error creating community:', error);
      throw error;
    } finally {
      store.setLoading(false);
    }
  };

  const joinCommunity = async (communityId) => {
    try {
      store.setLoading(true);
      store.setError(null);
      const data = await joinCommunityService(communityId);
      store.addCommunity(data.community);
      return data.community;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to join community';
      store.setError(errorMessage);
      console.error('Error joining community:', error);
      throw error;
    } finally {
      store.setLoading(false);
    }
  };

  const leaveCommunity = async (communityId) => {
    try {
      store.setLoading(true);
      store.setError(null);
      await leaveCommunityService(communityId);
      store.removeCommunity(communityId);
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to leave community';
      store.setError(errorMessage);
      console.error('Error leaving community:', error);
      throw error;
    } finally {
      store.setLoading(false);
    }
  };

  const fetchCommunityMembers = async (communityId) => {
    try {
      store.setError(null);
      const data = await getCommunityMembers(communityId);
      return data.members || [];
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch members';
      store.setError(errorMessage);
      console.error('Error fetching community members:', error);
      throw error;
    }
  };

  const fetchCommunityPosts = async (communityId) => {
    try {
      store.setError(null);
      const data = await getCommunityPosts(communityId);
      store.setCommunityPosts(communityId, data.posts || []);
      return data.posts;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch community posts';
      store.setError(errorMessage);
      console.error('Error fetching community posts:', error);
      throw error;
    }
  };

  const searchCommunitiesFunc = async (query) => {
    try {
      store.setLoading(true);
      store.setError(null);
      const data = await searchCommunities(query);
      return data.communities || [];
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to search communities';
      store.setError(errorMessage);
      console.error('Error searching communities:', error);
      throw error;
    } finally {
      store.setLoading(false);
    }
  };

  return {
    // State
    myCommunities: store.myCommunities,
    nearbyCommunities: store.nearbyCommunities,
    currentCommunity: store.currentCommunity,
    communityPosts: store.communityPosts,
    communityMessages: store.communityMessages,
    isLoading: store.isLoading,
    error: store.error,
    
    // Actions
    fetchMyCommunities,
    fetchNearbyCommunities,
    fetchCommunity,
    createNewCommunity,
    joinCommunity,
    leaveCommunity,
    fetchCommunityMembers,
    fetchCommunityPosts,
    searchCommunities: searchCommunitiesFunc,
    
    // Store actions
    addCommunityPost: store.addCommunityPost,
    addCommunityMessage: store.addCommunityMessage,
    setCurrentCommunity: store.setCurrentCommunity,
    reset: store.reset
  };
};
