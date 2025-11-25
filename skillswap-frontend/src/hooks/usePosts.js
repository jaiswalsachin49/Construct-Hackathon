import { useEffect, useCallback } from 'react';
import usePostStore from '../store/postStore';
import useCommunityStore from '../store/communityStore';
import * as postService from '../services/postService';

export const usePosts = () => {
    const store = usePostStore();

    const fetchFeed = useCallback(async (page = 1) => {
        try {
            store.setLoading(true);
            store.setError(null);

            const data = await postService.getFeedPosts(page);

            // Normalize posts so frontend uses `post.user` and `comment.user`
            const raw = data.posts || data;
            const normalizePost = (p) => {
                const post = { ...p };
                // Support different backend shapes: `user`, `userId` or `author`
                post.user = post.user || post.userId || post.author || null;

                // Normalize comments: map userId -> user
                if (Array.isArray(post.comments)) {
                    post.comments = post.comments.map(c => ({
                        ...c,
                        user: c.user || c.userId || null
                    }));
                }

                return post;
            };

            const normalized = Array.isArray(raw) ? raw.map(normalizePost) : [];

            if (page === 1) {
                store.setFeedPosts(normalized);
            } else {
                // Append for pagination
                store.setFeedPosts([...store.feedPosts, ...normalized]);
            }
            return data; // Return data so component can check hasMore
        } catch (error) {
            console.error('Failed to fetch feed:', error);
            store.setError(error.response?.data?.message || 'Failed to load posts');
            throw error; // Re-throw so component knows it failed
        } finally {
            store.setLoading(false);
        }
    }, [store]);

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
            const rawPost = data.post || data;
            const post = {
                ...rawPost,
                user: rawPost.user || rawPost.userId || rawPost.author || null,
                comments: (rawPost.comments || []).map(c => ({ ...c, user: c.user || c.userId || null }))
            };
            store.addPost(post);
            try {
                // Also add to userPosts cache for the author so profile reflects immediately
                const authorId = post.user?._id || post.user;
                if (authorId) {
                    const existing = store.userPosts?.[authorId] || [];
                    store.setUserPosts(authorId, [post, ...existing]);
                }
            } catch (e) {
                // Non-fatal
                console.warn('Failed to update userPosts cache after createPost', e);
            }

            // Update community post count if applicable
            if (communityId) {
                useCommunityStore.getState().incrementCommunityPostCount(communityId);
            }

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
            // remove from any userPosts lists
            try {
                const userPosts = store.userPosts || {};
                const updated = {};
                Object.keys(userPosts).forEach((uid) => {
                    updated[uid] = userPosts[uid].filter((p) => p._id !== postId);
                });
                // apply updated map
                Object.keys(updated).forEach((uid) => store.setUserPosts(uid, updated[uid]));
            } catch (e) {
                console.warn('Failed to update userPosts cache after deletePost', e);
            }
            return true;
        } catch (error) {
            console.error('Failed to delete post:', error);
            return false;
        }
    };

    const updatePost = async (postId, data) => {
        try {
            const res = await postService.updatePost(postId, data);
            const rawPost = res.post || res;
            // Update store (shallow merge)
            store.updatePost(postId, rawPost);
            // also update any userPosts entries
            try {
                const userPosts = store.userPosts || {};
                Object.keys(userPosts).forEach((uid) => {
                    const list = userPosts[uid] || [];
                    const idx = list.findIndex((p) => p._id === postId);
                    if (idx !== -1) {
                        const newList = [...list];
                        newList[idx] = { ...newList[idx], ...rawPost };
                        store.setUserPosts(uid, newList);
                    }
                });
            } catch (e) {
                console.warn('Failed to update userPosts cache after updatePost', e);
            }
            return rawPost;
        } catch (error) {
            console.error('Failed to update post:', error);
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

    const deleteComment = async (postId, commentId) => {
        try {
            await postService.deleteComment(postId, commentId);
            store.deleteComment(postId, commentId);
        } catch (error) {
            console.error('Failed to delete comment:', error);
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
        updatePost,
        toggleLike,
        addComment,
        deleteComment,
        removePostFromFeed: store.deletePost, // Alias for feed page
    };
};
