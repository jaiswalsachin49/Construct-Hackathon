import React, { useState, useEffect } from 'react';
import { useCommunities } from '@/hooks/useCommunities';
import { Plus } from 'lucide-react';

const CommunityPosts = ({ communityId }) => {
  const { fetchCommunityPosts, communityPosts } = useCommunities();
  const [isLoading, setIsLoading] = useState(true);
  
  const posts = communityPosts[communityId] || [];

  useEffect(() => {
    const loadPosts = async () => {
      try {
        setIsLoading(true);
        await fetchCommunityPosts(communityId);
      } catch (error) {
        console.error('Error loading posts:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadPosts();
  }, [communityId]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/6"></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Create Post Button */}
      <button
        data-testid="create-post-button"
        className="w-full bg-white border-2 border-dashed border-gray-300 hover:border-blue-500 rounded-lg p-6 text-gray-500 hover:text-blue-500 transition-colors flex items-center justify-center gap-2"
      >
        <Plus className="w-5 h-5" />
        <span className="font-medium">Create Post</span>
      </button>

      {/* Posts List */}
      {posts.length > 0 ? (
        posts.map((post) => (
          <div
            key={post._id}
            data-testid={`post-${post._id}`}
            className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
          >
            {/* Post Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                {post.author?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">{post.author?.name || 'Unknown User'}</h4>
                <p className="text-sm text-gray-500">
                  {new Date(post.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </p>
              </div>
            </div>

            {/* Post Content */}
            <div className="mb-4">
              <p className="text-gray-800">{post.content}</p>
              {post.media && post.media.length > 0 && (
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {post.media.map((mediaUrl, index) => (
                    <img
                      key={index}
                      src={mediaUrl}
                      alt="Post media"
                      className="rounded-lg w-full h-48 object-cover"
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Post Actions */}
            <div className="flex items-center gap-6 text-sm text-gray-600">
              <button className="hover:text-blue-500 transition-colors">
                👍 {post.likes || 0} Likes
              </button>
              <button className="hover:text-blue-500 transition-colors">
                💬 {post.comments || 0} Comments
              </button>
              <button className="hover:text-blue-500 transition-colors">
                🔗 Share
              </button>
            </div>
          </div>
        ))
      ) : (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <p className="text-gray-500">No posts yet. Be the first to post!</p>
        </div>
      )}
    </div>
  );
};

export default CommunityPosts;
