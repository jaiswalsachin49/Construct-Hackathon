import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Share2, MessageCircle, MapPin, Calendar, Star } from 'lucide-react';
import AlliesList from '../components/profile/AlliesList';
import UserPosts from '../components/profile/UserPosts';
import UserWaves from '../components/profile/UserWaves';
import EditProfileModal from '../components/profile/EditProfileModal';
import ReportModal from '../components/safety/ReportModal';
import BlockConfirmModal from '../components/safety/BlockConfirmModal';

const ProfilePage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  
  // Mock current user - replace with actual auth
  const currentUser = { _id: 'current-user-id' };
  const isOwnProfile = !userId || userId === currentUser._id;
  
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('allies');
  const [isAlly, setIsAlly] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);

  useEffect(() => {
    // Mock data - replace with actual API call
    setTimeout(() => {
      setUser({
        _id: userId || currentUser._id,
        name: isOwnProfile ? 'John Doe' : 'Jane Smith',
        email: 'john@example.com',
        profilePhoto: null,
        coverPhoto: null,
        bio: 'Passionate about learning and teaching. Guitar enthusiast and coding mentor. Always looking to connect with like-minded people!',
        verified: true,
        location: {
          areaLabel: 'Koramangala, Bangalore'
        },
        createdAt: new Date('2025-01-01'),
        rating: {
          average: 4.8,
          count: 25
        },
        teachTags: [
          { tag: 'Guitar', level: 'Advanced' },
          { tag: 'Coding', level: 'Intermediate' },
          { tag: 'Photography', level: 'Beginner' }
        ],
        learnTags: ['Cooking', 'Yoga', 'Spanish'],
        stats: {
          sessionsCompleted: 42,
          hoursCompleted: 126,
          alliesCount: 15
        },
        alliesCount: 15
      });
      setIsLoading(false);
    }, 500);
  }, [userId]);

  const handleAddAlly = () => {
    setIsAlly(true);
    alert('Added to allies!');
  };

  const handleStartChat = () => {
    navigate(`/app/chat/${userId}`);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${user.name}'s Profile`,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Profile link copied to clipboard!');
    }
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Cover Photo */}
      <div className="h-64 bg-gradient-to-br from-blue-400 to-purple-500 relative">
        {user.coverPhoto ? (
          <img
            src={user.coverPhoto}
            alt="Cover"
            className="w-full h-full object-cover"
          />
        ) : null}
      </div>

      {/* Profile Content */}
      <div className="max-w-5xl mx-auto px-6">
        {/* Profile Header */}
        <div className="relative -mt-20 mb-6">
          <div className="flex flex-col md:flex-row md:items-end gap-4">
            {/* Profile Photo */}
            <div className="relative">
              <div className="w-40 h-40 bg-white rounded-full border-4 border-white shadow-lg overflow-hidden">
                {user.profilePhoto ? (
                  <img
                    src={user.profilePhoto}
                    alt={user.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-5xl font-bold">
                    {user.name.charAt(0)}
                  </div>
                )}
              </div>
              {user.verified && (
                <div className="absolute bottom-2 right-2 bg-blue-500 text-white rounded-full p-2">
                  ✓
                </div>
              )}
            </div>

            {/* User Info & Actions */}
            <div className="flex-1 bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {user.name}
                  </h1>
                  <div className="flex items-center gap-2 text-gray-600 mb-3">
                    <MapPin className="w-4 h-4" />
                    <span>{user.location.areaLabel}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  {isOwnProfile ? (
                    <button
                      data-testid="edit-profile-button"
                      onClick={() => setShowEditModal(true)}
                      className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
                    >
                      Edit Profile
                    </button>
                  ) : (
                    <>
                      {isAlly ? (
                        <button
                          disabled
                          className="px-4 py-2 bg-gray-200 text-gray-500 rounded-lg font-medium cursor-not-allowed"
                        >
                          Ally ✓
                        </button>
                      ) : (
                        <button
                          data-testid="add-ally-button"
                          onClick={handleAddAlly}
                          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
                        >
                          Add to Allies
                        </button>
                      )}
                      <button
                        data-testid="message-button"
                        onClick={handleStartChat}
                        className="px-4 py-2 border border-gray-300 hover:bg-gray-50 rounded-lg font-medium transition-colors flex items-center gap-2"
                      >
                        <MessageCircle className="w-4 h-4" />
                        Message
                      </button>
                    </>
                  )}
                  <button
                    data-testid="share-button"
                    onClick={handleShare}
                    className="px-4 py-2 border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <Share2 className="w-5 h-5" />
                  </button>
                  {!isOwnProfile && (
                    <>
                      <button
                        data-testid="report-button"
                        onClick={() => setShowReportModal(true)}
                        className="px-4 py-2 border border-red-300 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        Report
                      </button>
                      <button
                        data-testid="block-button"
                        onClick={() => setShowBlockModal(true)}
                        className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                      >
                        Block
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bio & Meta */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <p className="text-gray-700 mb-4">{user.bio}</p>
          <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>
                Joined {user.createdAt.toLocaleDateString('en-US', {
                  month: 'short',
                  year: 'numeric'
                })}
              </span>
            </div>
            <button className="flex items-center gap-2 hover:text-blue-500 transition-colors">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span>{user.rating.average} ({user.rating.count} reviews)</span>
            </button>
          </div>
        </div>

        {/* Skills */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Can Teach</h3>
            <div className="flex flex-wrap gap-2">
              {user.teachTags.map((skill, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm font-medium"
                >
                  {skill.tag}
                  {skill.level && ` (${skill.level})`}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Wants to Learn</h3>
            <div className="flex flex-wrap gap-2">
              {user.learnTags.map((skill, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-sm font-medium"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">{user.stats.sessionsCompleted}</div>
              <div className="text-sm text-gray-600">Sessions</div>
            </div>
            <div className="text-center border-x border-gray-200">
              <div className="text-3xl font-bold text-gray-900">{user.stats.hoursCompleted}</div>
              <div className="text-sm text-gray-600">Hours</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">{user.stats.alliesCount}</div>
              <div className="text-sm text-gray-600">Allies</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="border-b border-gray-200">
            <div className="flex gap-8 px-6">
              <button
                data-testid="allies-tab"
                onClick={() => setActiveTab('allies')}
                className={`py-4 border-b-2 font-medium transition-colors ${
                  activeTab === 'allies'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Allies
              </button>
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
                data-testid="waves-tab"
                onClick={() => setActiveTab('waves')}
                className={`py-4 border-b-2 font-medium transition-colors ${
                  activeTab === 'waves'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Waves
              </button>
            </div>
          </div>

          <div className="p-6">
            {activeTab === 'allies' && (
              <AlliesList userId={user._id} isOwnProfile={isOwnProfile} />
            )}
            {activeTab === 'posts' && <UserPosts userId={user._id} />}
            {activeTab === 'waves' && (
              <UserWaves userId={user._id} isOwnProfile={isOwnProfile} />
            )}
          </div>
        </div>
      </div>

      {/* Add spacing at bottom */}
      <div className="h-16"></div>

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        currentUser={user}
      />

      {/* Report Modal */}
      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        targetType="user"
        targetId={user._id}
        targetName={user.name}
      />

      {/* Block Confirmation Modal */}
      <BlockConfirmModal
        isOpen={showBlockModal}
        onClose={() => setShowBlockModal(false)}
        userId={user._id}
        userName={user.name}
        userPhoto={user.profilePhoto}
      />
    </div>
  );
};

export default ProfilePage;
