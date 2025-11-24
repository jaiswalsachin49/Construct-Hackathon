import React, { useState, useEffect } from 'react';
import { getUserPosts } from '../../services/postService';
import PostCard from '../../components/Posts/PostCard';
import Loading from '../common/Loading';
import { FileText } from 'lucide-react';
import usePostStore from '../../store/postStore';

const UserPosts = ({ userId }) => {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const store = usePostStore();

  useEffect(() => {
    const loadPosts = async () => {
      setIsLoading(true);
      try {
        // If we already have cached posts in the store, use them first
        const cached = store.userPosts?.[userId];
        if (cached && Array.isArray(cached) && cached.length > 0) {
          setPosts(cached);
          setIsLoading(false);
          return;
        }

        const data = await getUserPosts(userId);
        const list = data.posts || data || [];
        // normalize minimal shapes
        const normalized = Array.isArray(list) ? list.map(p => ({ ...p, user: p.user || p.userId || p.author || null })) : [];
        setPosts(normalized);
        // cache in store so other parts of app can use it
        store.setUserPosts(userId, normalized);
      } catch (error) {
        console.error('Error loading user posts', error);
      } finally {
        setIsLoading(false);
      }
    };
    if (userId) loadPosts();
  }, [userId]);

  // subscribe to store userPosts updates so profile reflects live changes
  useEffect(() => {
    const unsubscribe = usePostStore.subscribe(
      (s) => s.userPosts,
      (userPosts) => {
        if (userPosts && userPosts[userId]) {
          setPosts(userPosts[userId]);
        }
      }
    );
    return () => unsubscribe();
  }, [userId]);

  if (isLoading) return <div className="py-8"><Loading text="Loading posts..." /></div>;

  if (posts.length === 0) return (
    <div className="flex flex-col items-center justify-center py-12 text-center bg-white/5 rounded-lg border border-dashed border-white/20">
      <div className="p-4 bg-white/10 rounded-full mb-3">
        <FileText className="h-8 w-8 text-[#8A90A2]" />
      </div>
      <h3 className="text-lg font-medium text-white">No posts yet</h3>
      <p className="text-sm text-[#8A90A2] max-w-xs mx-auto">
        This user hasn't shared anything on their feed yet.
      </p>
    </div>
  );

  return (
    <div className="space-y-4">
      {posts.map(post => (
        <PostCard key={post._id} post={post} />
      ))}
    </div>
  );
};
export default UserPosts;