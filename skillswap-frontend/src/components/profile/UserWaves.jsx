import React, { useState, useEffect } from 'react';

const UserWaves = ({ userId, isOwnProfile }) => {
  const [waves, setWaves] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Mock data - replace with actual API call
    setTimeout(() => {
      setWaves([
        {
          _id: '1',
          content: 'Quick guitar tips!',
          thumbnail: null,
          expiresAt: new Date(Date.now() + 12 * 60 * 60 * 1000),
          views: 45
        },
        {
          _id: '2',
          content: 'Morning yoga routine',
          thumbnail: null,
          expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000),
          views: 32
        }
      ]);
      setIsLoading(false);
    }, 500);
  }, [userId]);

  const handleDelete = (waveId) => {
    if (window.confirm('Delete this wave?')) {
      setWaves(waves.filter(w => w._id !== waveId));
    }
  };

  const handleView = (waveId) => {
    // Open wave viewer
    console.log('View wave:', waveId);
  };

  const getTimeRemaining = (expiresAt) => {
    const hours = Math.floor((expiresAt - Date.now()) / (1000 * 60 * 60));
    return `${hours}h remaining`;
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="aspect-[9/16] bg-gray-200 rounded-lg animate-pulse"></div>
        ))}
      </div>
    );
  }

  if (waves.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p className="text-lg mb-2">No active waves</p>
        <p className="text-sm">Waves expire after 24 hours</p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Active Waves ({waves.length})
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {waves.map((wave) => (
          <div
            key={wave._id}
            data-testid={`wave-${wave._id}`}
            className="relative group cursor-pointer"
            onClick={() => handleView(wave._id)}
          >
            <div className="aspect-[9/16] bg-gradient-to-br from-purple-400 to-pink-500 rounded-lg overflow-hidden">
              {wave.thumbnail ? (
                <img
                  src={wave.thumbnail}
                  alt="Wave"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-white text-4xl font-bold">
                  W
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-3">
                <p className="text-white text-sm font-medium mb-1">{wave.content}</p>
                <div className="flex items-center justify-between text-xs text-white/80">
                  <span>{getTimeRemaining(wave.expiresAt)}</span>
                  <span>{wave.views} views</span>
                </div>
              </div>
            </div>
            {isOwnProfile && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(wave._id);
                }}
                className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                ×
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserWaves;
