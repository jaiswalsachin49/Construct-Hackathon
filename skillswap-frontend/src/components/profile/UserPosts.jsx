import React, { useState, useEffect } from 'react';
import { getUserPosts } from '../../services/postService'; 
import PostCard from '../../components/Posts/PostCard';
import Loading from '../common/Loading';
import { FileText } from 'lucide-react';

const UserPosts = ({ userId }) => {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadPosts = async () => {
      try {
        const data = await getUserPosts(userId);
        console.log('User posts data:', data);
        setPosts(data.posts || []);
      } catch (error) {
        console.error('Error loading user posts', error);
      } finally {
        setIsLoading(false);
      }
    };
    if (userId) loadPosts();
  }, [userId]);

  if (isLoading) return <div className="py-8"><Loading text="Loading posts..." /></div>;
  
  if (posts.length === 0) return (
    <div className="flex flex-col items-center justify-center py-12 text-center bg-white rounded-lg border border-dashed border-gray-300">
        <div className="p-4 bg-gray-50 rounded-full mb-3">
            <FileText className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900">No posts yet</h3>
        <p className="text-sm text-gray-500 max-w-xs mx-auto">
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