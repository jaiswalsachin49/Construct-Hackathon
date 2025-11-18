import { create } from 'zustand';

const usePostStore = create((set, get) => ({
    feedPosts: [],
    userPosts: {}, // { userId: [posts] }
    communityPosts: {}, // { communityId: [posts] }
    isLoading: false,
    error: null,

    setFeedPosts: (posts) => set({ feedPosts: posts }),

    addPost: (post) => set((state) => ({
        feedPosts: [post, ...state.feedPosts],
    })),

    updatePost: (postId, data) => set((state) => ({
        feedPosts: state.feedPosts.map((p) =>
            p._id === postId ? { ...p, ...data } : p
        ),
    })),

    deletePost: (postId) => set((state) => ({
        feedPosts: state.feedPosts.filter((p) => p._id !== postId),
    })),

    toggleLike: (postId, userId) => set((state) => ({
        feedPosts: state.feedPosts.map((p) => {
            if (p._id === postId) {
                const likes = p.likes || [];
                const isLiked = likes.includes(userId);
                return {
                    ...p,
                    likes: isLiked
                        ? likes.filter((id) => id !== userId)
                        : [...likes, userId],
                };
            }
            return p;
        }),
    })),

    addComment: (postId, comment) => set((state) => ({
        feedPosts: state.feedPosts.map((p) => {
            if (p._id === postId) {
                return {
                    ...p,
                    comments: [...(p.comments || []), comment],
                };
            }
            return p;
        }),
    })),

    setUserPosts: (userId, posts) => set((state) => ({
        userPosts: {
            ...state.userPosts,
            [userId]: posts,
        },
    })),

    setCommunityPosts: (communityId, posts) => set((state) => ({
        communityPosts: {
            ...state.communityPosts,
            [communityId]: posts,
        },
    })),

    setLoading: (isLoading) => set({ isLoading }),

    setError: (error) => set({ error }),
}));

export default usePostStore;
