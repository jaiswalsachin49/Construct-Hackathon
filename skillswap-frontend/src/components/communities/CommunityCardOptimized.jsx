import React, { memo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Users, FileText } from 'lucide-react';

const CommunityCardOptimized = memo(({ community, onJoin }) => {
  const navigate = useNavigate();

  const handleJoin = useCallback(async (e) => {
    e.stopPropagation();
    if (onJoin) {
      await onJoin(community._id);
    }
  }, [community._id, onJoin]);

  const handleView = useCallback((e) => {
    e.stopPropagation();
    const isDemoPage = window.location.pathname.includes('demo');
    navigate(isDemoPage ? `/app/communities-demo/${community._id}` : `/app/communities/${community._id}`);
  }, [community._id, navigate]);

  const handleCardClick = useCallback(() => {
    const isDemoPage = window.location.pathname.includes('demo');
    navigate(isDemoPage ? `/app/communities-demo/${community._id}` : `/app/communities/${community._id}`);
  }, [community._id, navigate]);

  return (
    <div
      data-testid={`community-card-${community._id}`}
      onClick={handleCardClick}
      className="bg-[#101726] rounded-lg shadow-sm hover:shadow-lg transition-all overflow-hidden cursor-pointer border border-white/10 hover:border-[#00C4FF]/30"
    >
      {/* Cover Image */}
      <div className="h-32 bg-gradient-to-br from-[#7A3EF9] to-[#00C4FF] relative">
        {community.coverImage ? (
          <img
            src={community.coverImage}
            alt={community.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-white text-4xl font-bold">
            {community.name?.charAt(0)?.toUpperCase()}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-bold text-lg text-white mb-2">
          {community.name}
        </h3>

        <p className="text-sm text-[#8A90A2] mb-3 line-clamp-2">
          {community.description}
        </p>

        {/* Tags */}
        {community.tags && community.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {community.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="text-xs px-2 py-1 bg-[#00C4FF]/10 text-[#00C4FF] border border-[#00C4FF]/20 rounded-full"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Stats */}
        <div className="space-y-2 mb-4">
          {community.distance !== undefined && (
            <div className="flex items-center text-sm text-[#8A90A2]">
              <MapPin className="w-4 h-4 mr-2 text-[#00C4FF]" />
              <span>{community.distance} km away</span>
            </div>
          )}
          <div className="flex items-center text-sm text-[#8A90A2]">
            <Users className="w-4 h-4 mr-2 text-[#7A3EF9]" />
            <span>{community.memberCount || 0} members</span>
          </div>
          {community.postCount !== undefined && (
            <div className="flex items-center text-sm text-[#8A90A2]">
              <FileText className="w-4 h-4 mr-2 text-[#00F5A0]" />
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
              className="flex-1 bg-gradient-to-r from-[#00F5A0] to-[#00C4FF] hover:opacity-90 text-black px-4 py-2 rounded-lg font-medium transition-all"
            >
              Join
            </button>
          )}
          <button
            data-testid={`view-button-${community._id}`}
            onClick={handleView}
            className="flex-1 border border-white/10 hover:bg-white/5 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            View
          </button>
        </div>
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison to prevent unnecessary rerenders
  return (
    prevProps.community._id === nextProps.community._id &&
    prevProps.community.memberCount === nextProps.community.memberCount &&
    prevProps.community.isMember === nextProps.community.isMember &&
    prevProps.community.postCount === nextProps.community.postCount
  );
});

CommunityCardOptimized.displayName = 'CommunityCardOptimized';

export default CommunityCardOptimized;
