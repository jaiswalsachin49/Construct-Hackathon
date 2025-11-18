import React, { useState, useEffect, useRef } from 'react';
import { Image, Video, FileText } from 'lucide-react';
import { usePosts } from '../../hooks/usePosts';
import useAuthStore from '../../store/authStore';
import PostCard from '../../components/Posts/PostCard';
import CreatePostModal from '../../components/Posts/CreatePostModal';
import Loading from '../../components/common/Loading';

const FeedPage = () => {
    const { user } = useAuthStore();
    const { feedPosts, isLoading, error, fetchFeed } = usePosts();

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const observerRef = useRef(null);
    const loadMoreRef = useRef(null);

    useEffect(() => {
        fetchFeed(1);
    }, []);

    useEffect(() => {
        // Intersection Observer for infinite scroll
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && !isLoading && hasMore) {
                    const nextPage = page + 1;
                    setPage(nextPage);
                    fetchFeed(nextPage);
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
                className="bg-white rounded-lg shadow-md p-4 cursor-pointer hover:shadow-lg transition-shadow"
            >
                <div className="flex items-center gap-3 mb-3">
                    {user?.profilePhoto ? (
                        <img
                            src={user.profilePhoto}
                            alt={user.name}
                            className="h-10 w-10 rounded-full object-cover"
                        />
                    ) : (
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                            <span className="text-white font-semibold text-sm">
                                {getInitials(user?.name)}
                            </span>
                        </div>
                    )}
                    <input
                        type="text"
                        placeholder="What's on your mind?"
                        readOnly
                        className="flex-1 px-4 py-2 bg-gray-100 rounded-full cursor-pointer"
                    />
                </div>

                <div className="flex items-center justify-around pt-3 border-t border-gray-200">
                    <button className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <Image className="h-5 w-5 text-blue-600" />
                        <span className="text-sm font-medium text-gray-700">Photo</span>
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <Video className="h-5 w-5 text-purple-600" />
                        <span className="text-sm font-medium text-gray-700">Video</span>
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <FileText className="h-5 w-5 text-green-600" />
                        <span className="text-sm font-medium text-gray-700">Post</span>
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
                        <div key={i} className="bg-white rounded-lg shadow-md p-4 animate-pulse">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="h-10 w-10 rounded-full bg-gray-200" />
                                <div className="flex-1">
                                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-2" />
                                    <div className="h-3 bg-gray-200 rounded w-1/6" />
                                </div>
                            </div>
                            <div className="space-y-2 mb-4">
                                <div className="h-4 bg-gray-200 rounded w-full" />
                                <div className="h-4 bg-gray-200 rounded w-5/6" />
                                <div className="h-4 bg-gray-200 rounded w-4/6" />
                            </div>
                            <div className="h-48 bg-gray-200 rounded" />
                        </div>
                    ))}
                </div>
            )}

            {/* Posts Feed */}
            {feedPosts.length > 0 && (
                <>
                    {feedPosts.map((post) => (
                        <PostCard key={post._id} post={post} />
                    ))}

                    {/* Load More Trigger */}
                    {hasMore && (
                        <div ref={loadMoreRef} className="py-8 flex justify-center">
                            {isLoading && <Loading text="Loading more posts..." />}
                        </div>
                    )}

                    {!hasMore && feedPosts.length > 0 && (
                        <div className="py-8 text-center text-gray-500">
                            <p>You've reached the end of the feed</p>
                        </div>
                    )}
                </>
            )}

            {/* Empty State */}
            {!isLoading && feedPosts.length === 0 && !error && (
                <div className="bg-white rounded-lg shadow-md p-12 text-center">
                    <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 mb-4">
                        <FileText className="h-8 w-8 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        No posts yet
                    </h3>
                    <p className="text-gray-600 mb-6">
                        Be the first to share something with your allies!
                    </p>
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
