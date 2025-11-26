import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Share2, Settings, Users, MapPin, Trash2 } from 'lucide-react';
import { useCommunities } from '../hooks/useCommunities';
import CommunityPosts from '../components/communities/CommunityPosts';
import CommunityChat from '../components/communities/CommunityChat';
import MembersList from '../components/communities/MembersList';
import ConfirmationModal from '../components/common/ConfirmationModal';
import { useAuth } from '../hooks/useAuth';
import { deleteCommunity } from '../services/communityService';
import { useToast } from '../hooks/use-toast';

const CommunityDetailPage = () => {
  const { communityId } = useParams();

  const navigate = useNavigate();
  const { currentCommunity, fetchCommunity, joinCommunity, leaveCommunity, isLoading } = useCommunities();
  const currentUserId = useAuth().user._id;
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState('posts');
  const [isMember, setIsMember] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [loadError, setLoadError] = React.useState(null);

  useEffect(() => {
    const loadCommunity = async () => {
      // If route is /app/communities/create, don't treat 'create' as an id — redirect to create page
      if (communityId === 'create') {
        navigate('/app/communities/create');
        return;
      }
      // Validate communityId locally to avoid unnecessary 400 calls
      if (!communityId || !/^[0-9a-fA-F]{24}$/.test(communityId)) {
        const msg = 'Invalid community id';
        console.error('Error loading community:', msg, communityId);
        setLoadError(msg);
        return;
      }

      try {
        await fetchCommunity(communityId);
        setLoadError(null);
      } catch (error) {
        console.error('Error loading community:', error);
        setLoadError(error.response?.data?.error || error.message || 'Failed to load community');
      }
    };
    loadCommunity();
  }, [communityId]);

  useEffect(() => {
    if (currentCommunity) {
      // Check if user is member/admin
      let state = false;
      let adminState = false;

      for (let i = 0; i < currentCommunity.members.length; i++) {
        if (currentCommunity.members[i].userId._id === currentUserId) {
          state = true;
          // Check if this member has admin role
          if (currentCommunity.members[i].role === 'admin') {
            adminState = true;
          }
          break;
        }
      }
      setIsMember(state);
      setIsAdmin(adminState);
    }
  }, [currentCommunity, currentUserId]);

  const handleJoin = async () => {
    try {
      await joinCommunity(communityId);
      setIsMember(true);
    } catch (error) {
      console.error('Error joining community:', error);
    }
  };

  const handleLeave = async () => {
    try {
      const response = await leaveCommunity(communityId);

      if (response.action === 'deleted') {
        toast({
          title: "Community Deleted",
          description: "The community has been deleted as you were the last member.",
          variant: "default",
        });
        navigate('/app/communities');
        return;
      }

      setIsMember(false);
      toast({
        title: "Left Community",
        description: "You have successfully left the community.",
        variant: "default",
      });
      setShowLeaveModal(false);
    } catch (error) {
      console.error('Error leaving community:', error);
      toast({
        title: "Error",
        description: "Failed to leave community.",
        variant: "destructive",
      });
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
      toast({
        title: "Link Copied",
        description: "Community link copied to clipboard!",
        variant: "default",
      });
    }
  };

  const handleDelete = async () => {
    // Check if user is admin
    if (!isAdmin) {
      toast({
        title: "Permission Denied",
        description: "Only community admins can delete the community.",
        variant: "destructive",
      });
      return;
    }

    // Check member count
    if (currentCommunity.members.length > 1) {
      toast({
        title: "Cannot Delete Community",
        description: `This community has ${currentCommunity.members.length} members. Please remove all other members before deleting.`,
        variant: "destructive",
      });
      return;
      return;
    }

    try {
      await deleteCommunity(communityId);
      toast({
        title: "Community Deleted",
        description: "The community has been successfully deleted.",
        variant: "success",
      });
      navigate('/app/communities');
    } catch (error) {
      console.error('Error deleting community:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || error.response?.data?.error || "Failed to delete community.",
        variant: "destructive",
      });
    }
  };

  if (isLoading || (!currentCommunity && !loadError)) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3B82F6] mx-auto mb-4"></div>
          <p className="text-[#8A90A2]">Loading community...</p>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 font-semibold mb-2">{loadError}</p>
          <button
            onClick={() => navigate('/app/communities')}
            className="px-4 py-2 bg-[#3B82F6] text-black font-semibold rounded-lg"
          >
            Back to Communities
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent rounded-2xl">
      {/* Back Button */}
      <div className="bg-white/5 border-b border-white/10 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 py-3">
          <button
            data-testid="back-button"
            onClick={() => navigate('/app/communities')}
            className="flex items-center gap-2 text-[#8A90A2] hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Communities
          </button>
        </div>
      </div>

      {/* Community Header */}
      <div className="bg-white/5 border-b border-white/10 backdrop-blur-xl">
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
          <h1 className="text-3xl font-bold text-white mb-2">
            {currentCommunity.name}
          </h1>
          <p className="text-[#E6E9EF] mb-4 max-w-3xl">
            {currentCommunity.description}
          </p>

          {/* Stats */}
          <div className="flex items-center gap-6 mb-4 text-sm text-[#8A90A2]">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>{currentCommunity.members.length || 0} members</span>
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
                  className="text-sm px-3 py-1 bg-[#3B82F6]/10 text-[#3B82F6] border border-[#3B82F6]/20 rounded-full"
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
                onClick={() => setShowLeaveModal(true)}
                className="px-6 py-2 border border-red-500/40 text-red-400 hover:bg-red-500/10 rounded-lg font-medium transition-colors"
              >
                Leave
              </button>
            ) : (
              <button
                data-testid="join-button"
                onClick={handleJoin}
                className="px-6 py-2 bg-gradient-to-r from-[#60A5FA] to-[#3B82F6] text-black rounded-lg font-semibold transition-colors hover:shadow-[0_0_15px_rgba(0,244,255,0.4)]"
              >
                Join Community
              </button>
            )}
            <button
              onClick={handleShare}
              className="p-2 border border-white/20 text-[#8A90A2] hover:bg-white/10 hover:text-white rounded-lg transition-colors"
              title="Share"
            >
              <Share2 className="w-5 h-5" />
            </button>

            {/* Delete Button (Admin Only) */}
            {isAdmin && (
              <button
                onClick={() => setShowDeleteModal(true)}
                className="p-2 border border-red-500/40 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                title="Delete Community"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}
            {isAdmin && (
              <button
                data-testid="settings-button"
                className="p-2 border border-white/20 text-[#8A90A2] hover:bg-white/10 hover:text-white rounded-lg transition-colors"
                onClick={() => navigate(`/app/communities/${communityId}/settings`)}
              >
                <Settings className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white/5 border-b border-white/10 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex gap-8">
            <button
              data-testid="posts-tab"
              onClick={() => setActiveTab('posts')}
              className={`py-4 border-b-2 font-medium transition-colors ${activeTab === 'posts'
                ? 'border-[#3B82F6] text-[#3B82F6]'
                : 'border-transparent text-[#8A90A2] hover:text-white'
                }`}
            >
              Posts
            </button>
            <button
              data-testid="buzz-tab"
              onClick={() => setActiveTab('buzz')}
              className={`py-4 border-b-2 font-medium transition-colors ${activeTab === 'buzz'
                ? 'border-[#3B82F6] text-[#3B82F6]'
                : 'border-transparent text-[#8A90A2] hover:text-white'
                }`}
            >
              Buzz (Chat)
            </button>
            <button
              data-testid="members-tab"
              onClick={() => setActiveTab('members')}
              className={`py-4 border-b-2 font-medium transition-colors ${activeTab === 'members'
                ? 'border-[#3B82F6] text-[#3B82F6]'
                : 'border-transparent text-[#8A90A2] hover:text-white'
                }`}
            >
              Members
            </button>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {activeTab === 'posts' && <CommunityPosts communityId={communityId} community={currentCommunity} />}
        {activeTab === 'buzz' && <CommunityChat communityId={communityId} community={currentCommunity} />}
        {activeTab === 'members' && <MembersList communityId={communityId} />}
      </div>

      {/* Confirmation Modals */}
      <ConfirmationModal
        isOpen={showLeaveModal}
        onClose={() => setShowLeaveModal(false)}
        onConfirm={handleLeave}
        title="Leave Community"
        message={`Are you sure you want to leave "${currentCommunity?.name}"? You can always rejoin later.`}
        confirmText="Leave"
        isDestructive={false}
      />
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Delete Community"
        message={`Are you sure you want to permanently delete "${currentCommunity?.name}"? This action cannot be undone and all posts and members will be removed.`}
        confirmText="Delete"
        isDestructive={true}
      />
    </div>
  );
};

export default CommunityDetailPage;
