import React, { useState, useEffect, useRef } from 'react';
import { Image, Video, FileText } from 'lucide-react';
import { usePosts } from '../../hooks/usePosts';
import useAuthStore from '../../store/authStore';
import PostCard from '../../components/Posts/PostCard';
import CreatePostModal from '../../components/Posts/CreatePostModal';
import Loading from '../../components/common/Loading';

const FeedPage = () => {
    const { user } = useAuthStore();
    const { feedPosts, isLoading, error, fetchFeed, removePostFromFeed } = usePosts();

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const observerRef = useRef(null);
    const loadMoreRef = useRef(null);

    useEffect(() => {
        const loadInitial = async () => {
            try {
                const data = await fetchFeed(1);
                if (data) setHasMore(data.hasMore);
            } catch (err) {
                console.error(err);
            }
        };
        loadInitial();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        // Intersection Observer for infinite scroll
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && !isLoading && hasMore) {
                    const nextPage = page + 1;
                    setPage(nextPage);
                    fetchFeed(nextPage).then(data => {
                        if (data) setHasMore(data.hasMore);
                    }).catch(err => {
                        console.error(err);
                    });
                }
            },
            { threshold: 0.5 }
        );

        if (loadMoreRef.current) {
            observer.observe(loadMoreRef.current);
        }

        observerRef.current = observer;

        return () => {
            if (observerRef.current) {
                observerRef.current.disconnect();
            }
        };
    }, [page, isLoading, hasMore]);

    const getInitials = (name) => {
        if (!name) return 'U';
        return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
    };

    return (
        <div className="max-w-2xl mx-auto space-y-4">
            {/* Create Post Prompt Bar */}
            <div
                onClick={() => setIsCreateModalOpen(true)}
                className="bg-white/5 rounded-lg shadow-md p-4 cursor-pointer hover:shadow-lg transition-shadow border border-white/10 backdrop-blur-xl"
            >
                <div className="flex items-center gap-3 mb-3">
                    {user?.profilePhoto ? (
                        <img
                            src={user.profilePhoto}
                            alt={user.name}
                            className="h-10 w-10 rounded-full object-cover"
                        />
                    ) : (
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-pink-500 to-pink-600 flex items-center justify-center">
                            <span className="text-white font-semibold text-sm">
                                {getInitials(user?.name)}
                            </span>
                        </div>
                    )}
                    <input
                        type="text"
                        placeholder="What's on your mind?"
                        readOnly
                        className="flex-1 px-4 py-2 bg-[#101726] rounded-full cursor-pointer text-white placeholder-[#8A90A2]"
                    />
                </div>

                <div className="flex items-center justify-around pt-3 border-t border-white/10">
                    <button className="flex items-center gap-2 px-4 py-2 hover:bg-white/10 rounded-lg transition-colors">
                        <Image className="h-5 w-5 text-[#00C4FF]" />
                        <span className="text-sm font-medium text-[#E6E9EF]">Photo</span>
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 hover:bg-white/10 rounded-lg transition-colors">
                        <Video className="h-5 w-5 text-[#7A3EF9]" />
                        <span className="text-sm font-medium text-[#E6E9EF]">Video</span>
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 hover:bg-white/10 rounded-lg transition-colors">
                        <FileText className="h-5 w-5 text-[#00F5A0]" />
                        <span className="text-sm font-medium text-[#E6E9EF]">Post</span>
                    </button>
                </div>
            </div>

            {/* Error State */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-600">{error}</p>
                </div>
            )}

            {/* Loading Skeleton (first load) */}
            {isLoading && feedPosts.length === 0 && (
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="bg-black/5 rounded-lg shadow-md p-4 animate-pulse">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="h-10 w-10 rounded-full bg-white/10" />
                                <div className="flex-1">
                                    <div className="h-4 bg-white/10 rounded w-1/4 mb-2" />
                                    <div className="h-3 bg-white/10 rounded w-1/6" />
                                </div>
                            </div>
                            <div className="space-y-2 mb-4">
                                <div className="h-4 bg-white/10 rounded w-full" />
                                <div className="h-4 bg-white/10 rounded w-5/6" />
                                <div className="h-4 bg-white/10 rounded w-4/6" />
                            </div>
                            <div className="h-48 bg-white/10 rounded" />
                        </div>
                    ))}
                </div>
            )}

            {/* Posts Feed */}
            {feedPosts.length > 0 && (
                <>
                    {feedPosts.map((post) => (
                        <PostCard
                            key={post._id}
                            post={post}
                            onDelete={(postId) => removePostFromFeed(postId)}
                        />
                    ))}

                    {/* Load More Trigger */}
                    {hasMore && (
                        <div ref={loadMoreRef} className="py-8 flex justify-center">
                            {isLoading && <Loading text="Loading more posts..." />}
                        </div>
                    )}

                    {!hasMore && feedPosts.length > 0 && (
                        <div className="py-8 text-center">
                            <p className="text-[#8A90A2] mb-4">You've reached the end of the feed</p>
                            <button
                                onClick={() => {
                                    setPage(1);
                                    setHasMore(true);
                                    fetchFeed(1).then(data => {
                                        if (data) setHasMore(data.hasMore);
                                    });
                                }}
                                className="px-6 py-2 bg-gradient-to-r from-[#00F5A0] to-[#00C4FF] text-black font-medium rounded-lg hover:opacity-90 transition-opacity"
                            >
                                Refresh Feed
                            </button>
                        </div>
                    )}
                </>
            )}

            {/* Empty State */}
            {!isLoading && feedPosts.length === 0 && !error && (
                <div className="bg-white/5 rounded-lg shadow-md p-12 text-center border border-white/10 backdrop-blur-xl">
                    <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-[#00C4FF]/10 mb-4">
                        <FileText className="h-8 w-8 text-[#00C4FF]" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">
                        No posts yet
                    </h3>
                    <p className="text-[#8A90A2] mb-6">
                        Be the first to share something with your allies!
                    </p>
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="px-6 py-3 bg-gradient-to-r from-[#00F5A0] to-[#00C4FF] text-black font-medium rounded-lg hover:opacity-90 transition-opacity"
                    >
                        Create Post
                    </button>
                </div>
            )}

            {/* Create Post Modal */}
            <CreatePostModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
            />
        </div>
    );
};

export default FeedPage;
