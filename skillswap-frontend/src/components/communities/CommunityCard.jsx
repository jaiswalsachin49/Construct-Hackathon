import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Users, FileText } from 'lucide-react';

const CommunityCard = ({ community, onJoin }) => {
  const navigate = useNavigate();

  const handleJoin = async (e) => {
    e.stopPropagation();
    if (onJoin) {
      await onJoin(community._id);
    }
  };

  const handleView = (e) => {
    e.stopPropagation();
    const isDemoPage = window.location.pathname.includes('demo');
    navigate(isDemoPage ? `/app/communities-demo/${community._id}` : `/app/communities/${community._id}`);
  };

  const handleCardClick = () => {
    const isDemoPage = window.location.pathname.includes('demo');
    navigate(isDemoPage ? `/app/communities-demo/${community._id}` : `/app/communities/${community._id}`);
  };

  return (
    <div
      data-testid={`community-card-${community._id}`}
      onClick={handleCardClick}
      className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-all overflow-hidden cursor-pointer border border-gray-100"
    >
      {/* Cover Image */}
      <div className="h-32 bg-gradient-to-br from-blue-400 to-purple-500 relative">
        {community.coverImage ? (
          <img
            src={community.coverImage}
            alt={community.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-white text-4xl font-bold">
            {community.name?.charAt(0)?.toUpperCase()}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-bold text-lg text-gray-900 mb-2">
          {community.name}
        </h3>

        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {community.description}
        </p>

        {/* Tags */}
        {community.tags && community.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {community.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="text-xs px-2 py-1 bg-blue-50 text-blue-600 rounded-full"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Stats */}
        <div className="space-y-2 mb-4">
          {community.distance !== undefined && (
            <div className="flex items-center text-sm text-gray-600">
              <MapPin className="w-4 h-4 mr-2" />
              <span>{community.distance.toFixed(2)} km away</span>
            </div>
          )}
          <div className="flex items-center text-sm text-gray-600">
            <Users className="w-4 h-4 mr-2" />
            <span>{community.memberCount || 0} members</span>
          </div>
          {community.postCount !== undefined && (
            <div className="flex items-center text-sm text-gray-600">
              <FileText className="w-4 h-4 mr-2" />
              <span>{community.postCount} posts this week</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          {!community.isMember && (
            <button
              data-testid={`join-button-${community._id}`}
              onClick={handleJoin}
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Join
            </button>
          )}
          <button
            data-testid={`view-button-${community._id}`}
            onClick={handleView}
            className="flex-1 border border-gray-300 hover:border-gray-400 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors"
          >
            View
          </button>
        </div>
      </div>
    </div>
  );
};

export default CommunityCard;
