import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getMyCommunities,
  getNearbyCommunities,
  getCommunity,
  createCommunity,
  joinCommunity,
  leaveCommunity,
  getCommunityMembers,
  getCommunityPosts
} from '@/services/communityService';
import useCommunityStore from '@/store/communityStore';

// Get my communities
export const useMyCommunities = () => {
  return useQuery({
    queryKey: ['myCommunities'],
    queryFn: getMyCommunities,
    staleTime: 1000 * 60 * 5, // 5 minutes
    onSuccess: (data) => {
      useCommunityStore.getState().setMyCommunities(data.communities || []);
    }
  });
};

// Get nearby communities
export const useNearbyCommunities = (lat, lng, radius) => {
  return useQuery({
    queryKey: ['nearbyCommunities', lat, lng, radius],
    queryFn: () => getNearbyCommunities(lat, lng, radius),
    enabled: !!lat && !!lng,
    staleTime: 1000 * 60 * 10, // 10 minutes
    onSuccess: (data) => {
      useCommunityStore.getState().setNearbyCommunities(data.communities || []);
    }
  });
};

// Get community by ID
export const useCommunity = (communityId) => {
  return useQuery({
    queryKey: ['community', communityId],
    queryFn: () => getCommunity(communityId),
    enabled: !!communityId,
    staleTime: 1000 * 60 * 5,
    onSuccess: (data) => {
      useCommunityStore.getState().setCurrentCommunity(data.community);
    }
  });
};

// Get community members
export const useCommunityMembers = (communityId) => {
  return useQuery({
    queryKey: ['communityMembers', communityId],
    queryFn: () => getCommunityMembers(communityId),
    enabled: !!communityId,
    staleTime: 1000 * 60 * 5
  });
};

// Get community posts
export const useCommunityPosts = (communityId) => {
  return useQuery({
    queryKey: ['communityPosts', communityId],
    queryFn: () => getCommunityPosts(communityId),
    enabled: !!communityId,
    onSuccess: (data) => {
      useCommunityStore.getState().setCommunityPosts(communityId, data.posts || []);
    }
  });
};

// Create community mutation
export const useCreateCommunity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCommunity,
    onSuccess: (data) => {
      // Invalidate communities list
      queryClient.invalidateQueries(['myCommunities']);
      // Add to store
      useCommunityStore.getState().addCommunity(data.community);
    }
  });
};

// Join community mutation
export const useJoinCommunity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: joinCommunity,
    onSuccess: (data) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries(['myCommunities']);
      queryClient.invalidateQueries(['community', data.community._id]);
      // Add to store
      useCommunityStore.getState().addCommunity(data.community);
    }
  });
};

// Leave community mutation
export const useLeaveCommunity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: leaveCommunity,
    onSuccess: (_, communityId) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries(['myCommunities']);
      queryClient.invalidateQueries(['community', communityId]);
      // Remove from store
      useCommunityStore.getState().removeCommunity(communityId);
    }
  });
};
