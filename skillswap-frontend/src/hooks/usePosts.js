import { useEffect } from 'react';
import usePostStore from '../store/postStore';
import * as postService from '../services/postService';

export const usePosts = () => {
    const store = usePostStore();

    const fetchFeed = async (page = 1) => {
        try {
            store.setLoading(true);
            store.setError(null);

            const data = await postService.getFeedPosts(page);

            if (page === 1) {
                store.setFeedPosts(data.posts || data);
            } else {
                // Append for pagination
                store.setFeedPosts([...store.feedPosts, ...(data.posts || data)]);
            }
        } catch (error) {
            console.error('Failed to fetch feed:', error);
            store.setError(error.response?.data?.message || 'Failed to load posts');
        } finally {
            store.setLoading(false);
        }
    };

    const createPost = async (content, mediaFiles, visibility, tags, communityId) => {
        try {
            const formData = new FormData();
            formData.append('content', content);
            formData.append('visibility', visibility);

            if (communityId) {
                formData.append('communityId', communityId);
            }

            if (tags && tags.length > 0) {
                tags.forEach((tag) => formData.append('tags', tag));
            }

            if (mediaFiles && mediaFiles.length > 0) {
                mediaFiles.forEach((file) => formData.append('media', file));
            }

            const data = await postService.createPost(formData);
            store.addPost(data.post || data);
            return data;
        } catch (error) {
            console.error('Failed to create post:', error);
            throw error;
        }
    };

    const deletePost = async (postId) => {
        try {
            await postService.deletePost(postId);
            store.deletePost(postId);
        } catch (error) {
            console.error('Failed to delete post:', error);
            throw error;
        }
    };

    const toggleLike = async (postId, userId) => {
        try {
            // Optimistic update
            store.toggleLike(postId, userId);
            await postService.toggleLike(postId);
        } catch (error) {
            // Revert on error
            store.toggleLike(postId, userId);
            console.error('Failed to toggle like:', error);
        }
    };

    const addComment = async (postId, content) => {
        try {
            const data = await postService.addComment(postId, content);
            store.addComment(postId, data.comment || data);
            return data;
        } catch (error) {
            console.error('Failed to add comment:', error);
            throw error;
        }
    };

    return {
        feedPosts: store.feedPosts,
        isLoading: store.isLoading,
        error: store.error,
        fetchFeed,
        createPost,
        deletePost,
        toggleLike,
        addComment,
    };
};
