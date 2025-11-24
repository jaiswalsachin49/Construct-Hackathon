import api from './api';

// Get feed posts (allies only)
export const getFeedPosts = async (page = 1) => {
    const response = await api.get(`/api/posts/feed?page=${page}`);
    return response.data;
};

// Get global feed (all public posts)
export const getGlobalFeed = async (page = 1) => {
    const response = await api.get(`/api/posts/global?page=${page}`);
    return response.data;
};

// Get user posts
export const getUserPosts = async (userId) => {
    const response = await api.get(`/api/posts/user/${userId}`);
    return response.data;
};

// Get community posts
export const getCommunityPosts = async (communityId) => {
    const response = await api.get(`/api/posts/community/${communityId}`);
    return response.data;
};

// Create post
export const createPost = async (formData) => {
    const response = await api.post('/api/posts', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
};

// Update post
export const updatePost = async (postId, data) => {
    const response = await api.put(`/api/posts/${postId}`, data);
    return response.data;
};

// Delete post
export const deletePost = async (postId) => {
    await api.delete(`/api/posts/${postId}`);
};

// Toggle like
export const toggleLike = async (postId) => {
    const response = await api.post(`/api/posts/${postId}/like`);
    return response.data;
};

// Add comment
export const addComment = async (postId, content) => {
    const response = await api.post(`/api/posts/${postId}/comment`, { content });
    return response.data;
};

// Delete comment
export const deleteComment = async (postId, commentId) => {
    await api.delete(`/api/posts/${postId}/comment/${commentId}`);
};

// Share post
export const sharePost = async (postId) => {
    const response = await api.post(`/api/posts/${postId}/share`);
    return response.data;
};
