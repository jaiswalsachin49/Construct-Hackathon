import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, X } from 'lucide-react';

const AlliesList = ({ userId, isOwnProfile }) => {
  const navigate = useNavigate();
  const [allies, setAllies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Mock data - replace with actual API call
    setTimeout(() => {
      setAllies([
        {
          _id: '1',
          name: 'Jane Smith',
          profilePhoto: null,
          primarySkill: '🎸 Guitar Teacher',
          location: 'Indiranagar'
        },
        {
          _id: '2',
          name: 'Mike Brown',
          profilePhoto: null,
          primarySkill: '💻 Coding Mentor',
          location: 'Koramangala'
        },
        {
          _id: '3',
          name: 'Sarah Johnson',
          profilePhoto: null,
          primarySkill: '🧘 Yoga Instructor',
          location: 'HSR Layout'
        }
      ]);
      setIsLoading(false);
    }, 500);
  }, [userId]);

  const handleMessage = (allyId) => {
    navigate(`/app/chat/${allyId}`);
  };

  const handleRemove = (allyId) => {
    if (window.confirm('Remove this ally?')) {
      setAllies(allies.filter(a => a._id !== allyId));
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-lg shadow-sm p-4 animate-pulse">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (allies.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p className="text-lg mb-2">No allies yet</p>
        <p className="text-sm">Connect with others to build your network</p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Allies ({allies.length})
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {allies.map((ally) => (
          <div
            key={ally._id}
            data-testid={`ally-card-${ally._id}`}
            className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-4"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                {ally.name.charAt(0)}
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">{ally.name}</h4>
                <p className="text-sm text-gray-500">{ally.location}</p>
              </div>
            </div>
            <p className="text-sm text-gray-700 mb-3">{ally.primarySkill}</p>
            <div className="flex gap-2">
              <button
                onClick={() => navigate(`/app/profile/${ally._id}`)}
                className="flex-1 px-3 py-2 border border-gray-300 hover:bg-gray-50 rounded-lg text-sm font-medium transition-colors"
              >
                View
              </button>
              {isOwnProfile ? (
                <button
                  onClick={() => handleRemove(ally._id)}
                  className="px-3 py-2 border border-red-300 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={() => handleMessage(ally._id)}
                  className="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AlliesList;
