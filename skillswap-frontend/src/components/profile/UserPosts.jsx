import React, { useState, useEffect } from 'react';

const UserPosts = ({ userId }) => {
  const [posts, setPosts] = useState([]);
  const [filter, setFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Mock data - replace with actual API call
    setTimeout(() => {
      setPosts([
        {
          _id: '1',
          content: 'Just finished an amazing guitar session! Learning new techniques every day 🎸',
          createdAt: new Date('2025-01-15'),
          visibility: 'public',
          likes: 12,
          comments: 3
        },
        {
          _id: '2',
          content: 'Looking forward to teaching coding to beginners this weekend. Anyone interested?',
          createdAt: new Date('2025-01-14'),
          visibility: 'public',
          likes: 8,
          comments: 5
        }
      ]);
      setIsLoading(false);
    }, 500);
  }, [userId]);

  const filteredPosts = posts.filter(post => {
    if (filter === 'all') return true;
    return post.visibility === filter;
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <div key={i} className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Posts ({filteredPosts.length})
        </h3>
        <select
          data-testid="post-filter"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
        >
          <option value="all">All Posts</option>
          <option value="public">Public</option>
          <option value="allies">Allies Only</option>
        </select>
      </div>

      {filteredPosts.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p>No posts yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPosts.map((post) => (
            <div
              key={post._id}
              data-testid={`post-${post._id}`}
              className="bg-white rounded-lg shadow-sm p-6"
            >
              <p className="text-gray-800 mb-3">{post.content}</p>
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>
                  {post.createdAt.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </span>
                <div className="flex items-center gap-4">
                  <span>👍 {post.likes}</span>
                  <span>💬 {post.comments}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserPosts;
