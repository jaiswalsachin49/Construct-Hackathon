import React from 'react';
import { useNavigate } from 'react-router-dom';

const CommunityPreview = ({ community, onClick }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    // console.log("Community clicked:", community);
    if (onClick) {
      onClick();
    } else {
      const isDemoPage = window.location.pathname.includes('demo');
      navigate(isDemoPage ? `/app/communities-demo/${community._id}` : `/app/communities/${community._id}`);
    }
  };

  return (
    <div
      data-testid={`community-preview-${community._id}`}
      onClick={handleClick}
      className="flex-shrink-0 w-40 bg-[#101726] rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden border border-white/10 hover:border-[#00C4FF]/30"
    >
      <div className="h-28 bg-gradient-to-br from-[#7A3EF9] to-[#00C4FF] relative">
        {community.coverImage ? (
          <img
            src={community.coverImage}
            alt={community.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-white text-3xl font-bold">
            {community.name?.charAt(0)?.toUpperCase()}
          </div>
        )}
      </div>
      <div className="p-3">
        <h3 className="font-semibold text-sm text-white truncate mb-1">
          {community.name}
        </h3>
        <p className="text-xs text-[#8A90A2]">
          {community.members.length || 0} members
        </p>
      </div>
    </div>
  );
};

export default CommunityPreview;
