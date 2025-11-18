import api from './api';

// Get my communities
export const getMyCommunities = async () => {
  const response = await api.get('/api/communities/my');
  return response.data;
};

// Get nearby communities
export const getNearbyCommunities = async (lat, lng, radius) => {
  const response = await api.get('/api/communities/nearby', {
    params: { lat, lng, radius }
  });
  return response.data;
};

// Get community by ID
export const getCommunity = async (communityId) => {
  const response = await api.get(`/api/communities/${communityId}`);
  return response.data;
};

// Create community
export const createCommunity = async (data) => {
  const response = await api.post('/api/communities', data);
  return response.data;
};

// Join community
export const joinCommunity = async (communityId) => {
  const response = await api.post(`/api/communities/${communityId}/join`);
  return response.data;
};

// Leave community
export const leaveCommunity = async (communityId) => {
  await api.post(`/api/communities/${communityId}/leave`);
};

// Get community members
export const getCommunityMembers = async (communityId) => {
  const response = await api.get(`/api/communities/${communityId}/members`);
  return response.data;
};

// Get community posts
export const getCommunityPosts = async (communityId) => {
  const response = await api.get(`/api/communities/${communityId}/posts`);
  return response.data;
};

// Create community post
export const createCommunityPost = async (communityId, postData) => {
  const response = await api.post(`/api/communities/${communityId}/posts`, postData);
  return response.data;
};

// Search communities
export const searchCommunities = async (query) => {
  const response = await api.get('/api/communities/search', {
    params: { q: query }
  });
  return response.data;
};
