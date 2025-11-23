import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCommunities } from '../../hooks/useCommunities';
import { Plus } from 'lucide-react';
import CreatePostModal from '../Posts/CreatePostModal';
import PostCard from '../Posts/PostCard';

const CommunityPosts = ({ communityId }) => {
  const navigate = useNavigate();
  const { fetchCommunityPosts, communityPosts } = useCommunities();
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

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
          <div key={i} className="bg-[#0A0F1F] rounded-lg shadow-sm p-6 animate-pulse border border-white/10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-white/10 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-white/10 rounded w-1/4"></div>
                <div className="h-3 bg-white/10 rounded w-1/6"></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-white/10 rounded"></div>
              <div className="h-4 bg-white/10 rounded w-5/6"></div>
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
        onClick={() => setIsCreateModalOpen(true)}
        className="w-full bg-[#0A0F1F] border-2 border-dashed border-white/20 hover:border-[#00C4FF] rounded-lg p-6 text-[#8A90A2] hover:text-[#00C4FF] transition-colors flex items-center justify-center gap-2"
      >
        <Plus className="w-5 h-5" />
        <span className="font-medium">Create Post</span>
      </button>

      <CreatePostModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        communityId={communityId}
      />

      {/* Posts List */}
      {posts.length > 0 ? (
        posts.map((post) => (
          <PostCard
            key={post._id}
            post={{
              ...post,
              user: post.userId
            }}
          />
        ))
      ) : (
        <div className="bg-[#0A0F1F] rounded-lg shadow-sm p-12 text-center border border-white/10">
          <p className="text-[#8A90A2]">No posts yet. Be the first to post!</p>
        </div>
      )}
    </div>
  );
};

export default CommunityPosts;
