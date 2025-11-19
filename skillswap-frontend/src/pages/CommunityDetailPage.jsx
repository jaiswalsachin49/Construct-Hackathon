import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Share2, Settings, Users, MapPin } from 'lucide-react';
import { useCommunities } from '../hooks/useCommunities';
import CommunityPosts from '../components/communities/CommunityPosts';
import CommunityChat from '../components/communities/CommunityChat';
import MembersList from '../components/communities/MembersList';

const CommunityDetailPage = () => {
  const { communityId } = useParams();
  const navigate = useNavigate();
  const { currentCommunity, fetchCommunity, joinCommunity, leaveCommunity, isLoading } = useCommunities();
  
  const [activeTab, setActiveTab] = useState('posts');
  const [isMember, setIsMember] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const loadCommunity = async () => {
      try {
        await fetchCommunity(communityId);
      } catch (error) {
        console.error('Error loading community:', error);
      }
    };
    loadCommunity();
  }, [communityId]);

  useEffect(() => {
    if (currentCommunity) {
      // Check if user is member/admin (mock for now)
      setIsMember(currentCommunity.isMember || false);
      setIsAdmin(currentCommunity.isAdmin || false);
    }
  }, [currentCommunity]);

  const handleJoin = async () => {
    try {
      await joinCommunity(communityId);
      setIsMember(true);
    } catch (error) {
      console.error('Error joining community:', error);
    }
  };

  const handleLeave = async () => {
    if (window.confirm('Are you sure you want to leave this community?')) {
      try {
        await leaveCommunity(communityId);
        setIsMember(false);
      } catch (error) {
        console.error('Error leaving community:', error);
      }
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: currentCommunity?.name,
        text: currentCommunity?.description,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  if (isLoading || !currentCommunity) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading community...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back Button */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-3">
          <button
            data-testid="back-button"
            onClick={() => navigate('/app/communities')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Communities
          </button>
        </div>
      </div>

      {/* Community Header */}
      <div className="bg-white border-b border-gray-200">
        {/* Cover Image */}
        <div className="h-48 bg-gradient-to-br from-blue-400 to-purple-500 relative">
          {currentCommunity.coverImage ? (
            <img
              src={currentCommunity.coverImage}
              alt={currentCommunity.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-white text-6xl font-bold">
              {currentCommunity.name?.charAt(0)?.toUpperCase()}
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="max-w-6xl mx-auto px-6 py-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {currentCommunity.name}
          </h1>
          <p className="text-gray-600 mb-4 max-w-3xl">
            {currentCommunity.description}
          </p>

          {/* Stats */}
          <div className="flex items-center gap-6 mb-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>{currentCommunity.memberCount || 0} members</span>
            </div>
            {currentCommunity.location && (
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>{currentCommunity.location.areaLabel}</span>
              </div>
            )}
          </div>

          {/* Tags */}
          {currentCommunity.tags && currentCommunity.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {currentCommunity.tags.map((tag, index) => (
                <span
                  key={index}
                  className="text-sm px-3 py-1 bg-blue-50 text-blue-600 rounded-full"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3">
            {isMember ? (
              <button
                data-testid="leave-button"
                onClick={handleLeave}
                className="px-6 py-2 border border-red-300 text-red-600 hover:bg-red-50 rounded-lg font-medium transition-colors"
              >
                Leave
              </button>
            ) : (
              <button
                data-testid="join-button"
                onClick={handleJoin}
                className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
              >
                Join Community
              </button>
            )}
            <button
              data-testid="share-button"
              onClick={handleShare}
              className="px-6 py-2 border border-gray-300 hover:bg-gray-50 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <Share2 className="w-4 h-4" />
              Share
            </button>
            {isAdmin && (
              <button
                data-testid="settings-button"
                onClick={() => navigate(`/app/communities/${communityId}/settings`)}
                className="px-6 py-2 border border-gray-300 hover:bg-gray-50 rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <Settings className="w-4 h-4" />
                Settings
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex gap-8">
            <button
              data-testid="posts-tab"
              onClick={() => setActiveTab('posts')}
              className={`py-4 border-b-2 font-medium transition-colors ${
                activeTab === 'posts'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Posts
            </button>
            <button
              data-testid="buzz-tab"
              onClick={() => setActiveTab('buzz')}
              className={`py-4 border-b-2 font-medium transition-colors ${
                activeTab === 'buzz'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Buzz (Chat)
            </button>
            <button
              data-testid="members-tab"
              onClick={() => setActiveTab('members')}
              className={`py-4 border-b-2 font-medium transition-colors ${
                activeTab === 'members'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Members
            </button>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {activeTab === 'posts' && <CommunityPosts communityId={communityId} />}
        {activeTab === 'buzz' && <CommunityChat communityId={communityId} />}
        {activeTab === 'members' && <MembersList communityId={communityId} />}
      </div>
    </div>
  );
};

export default CommunityDetailPage;
