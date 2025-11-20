import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    MessageCircle, MapPin, Calendar, Edit3, Shield, 
    UserX, Flag, Camera, MoreVertical 
} from 'lucide-react';
import AlliesList from '../components/profile/AlliesList';
import UserPosts from '../components/profile/UserPosts';
import UserWaves from '../components/profile/UserWaves';
import EditProfileModal from '../components/profile/EditProfileModal';
import ReportModal from '../components/safety/ReportModal';
import BlockConfirmModal from '../components/safety/BlockConfirmModal';
import Loading from '../components/common/Loading';
import useAuthStore from '../store/authStore';
import { getUserById } from '../services/discoveryService';

const ProfilePage = () => {
    const { userId } = useParams();
    const navigate = useNavigate();
    const { user: authUser } = useAuthStore();

    // Determine if this is the current user's profile
    const isOwnProfile = !userId || (authUser && userId === authUser._id);

    const [displayUser, setDisplayUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('allies');
    
    // Modal States
    const [showEditModal, setShowEditModal] = useState(false);
    const [showReportModal, setShowReportModal] = useState(false);
    const [showBlockModal, setShowBlockModal] = useState(false);

    useEffect(() => {
        const loadProfile = async () => {
            setIsLoading(true);
            try {
                // Determine which user ID to load. Guard against undefined values.
                const targetId = isOwnProfile ? authUser?._id : userId;
                if (!targetId) {
                    console.warn('ProfilePage: no targetId available to load profile', { isOwnProfile, userId, authUser });
                    setIsLoading(false);
                    return;
                }

                const data = await getUserById(targetId);
                setDisplayUser(data);
            } catch (error) {
                console.error("Failed to load profile", error);
            } finally {
                setIsLoading(false);
            }
        };

        // Only attempt to load when we have the required identifiers
        if ((isOwnProfile && authUser) || (!isOwnProfile && userId)) {
            loadProfile();
        }
    }, [userId, authUser, isOwnProfile]);

    if (isLoading) return <div className="min-h-screen pt-20 flex justify-center"><Loading size="lg" text="Loading Profile..." /></div>;

    if (!displayUser) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
            <div className="bg-gray-100 p-6 rounded-full mb-4">
                <UserX className="h-12 w-12 text-gray-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">User Not Found</h2>
            <p className="text-gray-500 mt-2 mb-6">The user you are looking for doesn't exist or has been removed.</p>
            <button onClick={() => navigate('/app/discover')} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Back to Discovery
            </button>
        </div>
    );

    // --- HELPERS FOR UI ---
    const getInitials = (name) => name ? name.charAt(0).toUpperCase() : 'U';
    const joinedDate = new Date(displayUser.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    return (
        <div className="max-w-5xl mx-auto px-4 pb-20">
            {/* --- HEADER CARD --- */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-6 mt-6">
                
                {/* Cover Photo with Fallback Gradient */}
                <div className={`h-48 w-full relative ${!displayUser.coverPhoto ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600' : ''}`}>
                    {displayUser.coverPhoto && (
                        <img 
                            src={displayUser.coverPhoto} 
                            alt="Cover" 
                            className="w-full h-full object-cover"
                        />
                    )}
                    {isOwnProfile && (
                        <button 
                            onClick={() => setShowEditModal(true)}
                            className="absolute bottom-4 right-4 bg-black/30 hover:bg-black/50 text-white p-2 rounded-lg backdrop-blur-sm transition-all"
                        >
                            <Camera size={18} />
                        </button>
                    )}
                </div>

                <div className="px-6 pb-6 relative">
                    {/* Profile Photo Container */}
                    <div className="flex justify-between items-end -mt-16 mb-4">
                        <div className="relative">
                            <div className="w-32 h-32 rounded-full border-4 border-white bg-white shadow-md overflow-hidden flex items-center justify-center bg-gray-100">
                                {displayUser.profilePhoto ? (
                                    <img src={displayUser.profilePhoto} alt={displayUser.name} className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-4xl font-bold text-gray-400">{getInitials(displayUser.name)}</span>
                                )}
                            </div>
                        </div>

                        {/* Action Buttons (Desktop) */}
                        <div className="hidden md:flex gap-3 mb-2">
                            {isOwnProfile ? (
                                <button 
                                    onClick={() => setShowEditModal(true)}
                                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
                                >
                                    <Edit3 size={18} /> Edit Profile
                                </button>
                            ) : (
                                <>
                                    <button 
                                        onClick={() => navigate(`/app/chat/${displayUser._id}`)}
                                        className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm transition-all"
                                    >
                                        <MessageCircle size={18} /> Message
                                    </button>
                                    <div className="relative group">
                                        <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-600">
                                            <MoreVertical size={20} />
                                        </button>
                                        {/* Dropdown Menu */}
                                        <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                                            <button onClick={() => setShowReportModal(true)} className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                                                <Flag size={16} /> Report User
                                            </button>
                                            <button onClick={() => setShowBlockModal(true)} className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
                                                <Shield size={16} /> Block User
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* User Info */}
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            {displayUser.name}
                            {displayUser.isVerified && <span className="text-blue-500" title="Verified">✓</span>}
                        </h1>
                        
                        {/* Meta Info */}
                        <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                                <MapPin size={16} className="text-gray-400" />
                                {displayUser.location?.areaLabel || 'Location Unknown'}
                            </div>
                            <div className="flex items-center gap-1">
                                <Calendar size={16} className="text-gray-400" />
                                Joined {joinedDate}
                            </div>
                        </div>

                        {/* Bio */}
                        <p className="mt-4 text-gray-700 leading-relaxed max-w-2xl">
                            {displayUser.bio || <span className="text-gray-400 italic">No bio yet...</span>}
                        </p>

                        {/* Skills Tags */}
                        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Teaching</h3>
                                <div className="flex flex-wrap gap-2">
                                    {displayUser.teachTags?.length > 0 ? (
                                        displayUser.teachTags.map((tag, i) => (
                                            <span key={i} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium border border-blue-100">
                                                {tag.name || tag}
                                            </span>
                                        ))
                                    ) : (
                                        <span className="text-sm text-gray-400">No skills listed</span>
                                    )}
                                </div>
                            </div>
                            <div>
                                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Learning</h3>
                                <div className="flex flex-wrap gap-2">
                                    {displayUser.learnTags?.length > 0 ? (
                                        displayUser.learnTags.map((tag, i) => (
                                            <span key={i} className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm font-medium border border-green-100">
                                                {tag.name || tag}
                                            </span>
                                        ))
                                    ) : (
                                        <span className="text-sm text-gray-400">No interests listed</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Mobile Action Buttons */}
                    <div className="md:hidden mt-6 flex gap-3">
                        {isOwnProfile ? (
                            <button onClick={() => setShowEditModal(true)} className="flex-1 py-2 bg-gray-100 text-gray-800 rounded-lg font-medium">Edit Profile</button>
                        ) : (
                            <button onClick={() => navigate(`/app/chat/${displayUser._id}`)} className="flex-1 py-2 bg-blue-600 text-white rounded-lg font-medium">Message</button>
                        )}
                    </div>
                </div>
            </div>

            {/* --- TABS --- */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden min-h-[400px]">
                <div className="flex border-b border-gray-200">
                    {['allies', 'posts', 'waves'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`flex-1 py-4 text-sm font-medium text-center transition-colors relative ${
                                activeTab === tab ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                            {activeTab === tab && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
                            )}
                        </button>
                    ))}
                </div>

                <div className="p-6 bg-gray-50/50 h-full">
                    {activeTab === 'allies' && (
                        <AlliesList userId={displayUser._id} isOwnProfile={isOwnProfile} />
                    )}
                    {activeTab === 'posts' && (
                        <UserPosts userId={displayUser._id} />
                    )}
                    {activeTab === 'waves' && (
                        <UserWaves userId={displayUser._id} isOwnProfile={isOwnProfile} />
                    )}
                </div>
            </div>

            {/* --- MODALS --- */}
            {isOwnProfile && (
                <EditProfileModal 
                    isOpen={showEditModal} 
                    onClose={() => setShowEditModal(false)} 
                    currentUser={displayUser} 
                />
            )}
            
            {!isOwnProfile && (
                <>
                    <ReportModal 
                        isOpen={showReportModal}
                        onClose={() => setShowReportModal(false)}
                        targetType="user"
                        targetId={displayUser._id}
                        targetName={displayUser.name}
                    />
                    <BlockConfirmModal
                        isOpen={showBlockModal}
                        onClose={() => setShowBlockModal(false)}
                        userId={displayUser._id}
                        userName={displayUser.name}
                    />
                </>
            )}
        </div>
    );
};

export default ProfilePage;