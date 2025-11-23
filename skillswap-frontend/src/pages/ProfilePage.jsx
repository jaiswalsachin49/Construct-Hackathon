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
import { startConversation } from '../services/chatService';

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
            <div className="bg-white/10 p-6 rounded-full mb-4">
                <UserX className="h-12 w-12 text-[#8A90A2]" />
            </div>
            <h2 className="text-xl font-bold text-white">User Not Found</h2>
            <p className="text-[#8A90A2] mt-2 mb-6">The user you are looking for doesn't exist or has been removed.</p>
            <button onClick={() => navigate('/app/discover')} className="px-6 py-2 bg-[#00C4FF] text-black font-semibold rounded-lg hover:bg-[#00C4FF]/90">
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
            <div className="bg-white/5 rounded-2xl shadow-sm border border-white/10 overflow-hidden mb-6 mt-6 backdrop-blur-xl">

                {/* Cover Photo with Fallback Gradient */}
                <div className={`h-48 w-full relative ${!displayUser.coverPhoto ? 'bg-gradient-to-r from-[#7A3EF9] via-[#00C4FF] to-[#00F5A0]' : ''}`}>
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
                            <div className="w-32 h-32 rounded-full border-4 border-[#101726] bg-[#101726] shadow-md overflow-hidden flex items-center justify-center">
                                {displayUser.profilePhoto ? (
                                    <img src={displayUser.profilePhoto} alt={displayUser.name} className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-4xl font-bold text-[#8A90A2]">{getInitials(displayUser.name)}</span>
                                )}
                            </div>
                        </div>

                        {/* Action Buttons (Desktop) */}
                        <div className="hidden md:flex gap-3 mb-2">
                            {isOwnProfile ? (
                                <button
                                    onClick={() => setShowEditModal(true)}
                                    className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-medium rounded-lg transition-colors"
                                >
                                    <Edit3 size={18} /> Edit Profile
                                </button>
                            ) : (
                                <>
                                    <button
                                        onClick={async () => {
                                            try {
                                                // Ensure a conversation exists (server returns existing or new conv)
                                                const res = await startConversation(displayUser._id);
                                                const conv = res.conversation || res;
                                                const convId = conv?._id || conv?.id || conv;
                                                if (convId) navigate(`/app/chat/${convId}`);
                                                else navigate(`/app/chat`);
                                            } catch (err) {
                                                console.error('Failed to start conversation', err);
                                                // fallback to opening the chat list
                                                navigate('/app/chat');
                                            }
                                        }}
                                        className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-[#00F5A0] to-[#00C4FF] hover:shadow-[0_0_15px_rgba(0,244,255,0.4)] text-black font-semibold rounded-lg shadow-sm transition-all"
                                    >
                                        <MessageCircle size={18} /> Message
                                    </button>
                                    <div className="relative group">
                                        <button className="p-2 border border-white/10 rounded-lg hover:bg-white/10 text-[#E6E9EF]">
                                            <MoreVertical size={20} />
                                        </button>
                                        {/* Dropdown Menu */}
                                        <div className="absolute right-0 mt-2 w-48 bg-[#101726] border border-white/10 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                                            <button onClick={() => setShowReportModal(true)} className="w-full text-left px-4 py-3 text-sm text-[#E6E9EF] hover:bg-white/10 flex items-center gap-2">
                                                <Flag size={16} /> Report User
                                            </button>
                                            <button onClick={() => setShowBlockModal(true)} className="w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-2">
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
                        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                            {displayUser.name}
                            {displayUser.isVerified && <span className="text-[#00C4FF]" title="Verified">✓</span>}
                        </h1>

                        {/* Meta Info */}
                        <div className="flex flex-wrap gap-4 mt-2 text-sm text-[#8A90A2]">
                            <div className="flex items-center gap-1">
                                <MapPin size={16} className="text-[#8A90A2]" />
                                {displayUser.location?.areaLabel || 'Location Unknown'}
                            </div>
                            <div className="flex items-center gap-1">
                                <Calendar size={16} className="text-[#8A90A2]" />
                                Joined {joinedDate}
                            </div>
                        </div>

                        {/* Bio */}
                        <p className="mt-4 text-[#E6E9EF] leading-relaxed max-w-2xl">
                            {displayUser.bio || <span className="text-[#8A90A2] italic">No bio yet...</span>}
                        </p>

                        {/* Skills Tags */}
                        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h3 className="text-xs font-semibold text-[#8A90A2] uppercase tracking-wider mb-3">Teaching</h3>
                                <div className="flex flex-wrap gap-2">
                                    {displayUser.teachTags?.length > 0 ? (
                                        displayUser.teachTags.map((tag, i) => (
                                            <span key={i} className="px-3 py-1 bg-[#00C4FF]/10 text-[#00C4FF] rounded-full text-sm font-medium border border-[#00C4FF]/20">
                                                {tag.name || tag}
                                            </span>
                                        ))
                                    ) : (
                                        <span className="text-sm text-[#8A90A2]">No skills listed</span>
                                    )}
                                </div>
                            </div>
                            <div>
                                <h3 className="text-xs font-semibold text-[#8A90A2] uppercase tracking-wider mb-3">Learning</h3>
                                <div className="flex flex-wrap gap-2">
                                    {displayUser.learnTags?.length > 0 ? (
                                        displayUser.learnTags.map((tag, i) => (
                                            <span key={i} className="px-3 py-1 bg-[#00F5A0]/10 text-[#00F5A0] rounded-full text-sm font-medium border border-[#00F5A0]/20">
                                                {tag.name || tag}
                                            </span>
                                        ))
                                    ) : (
                                        <span className="text-sm text-[#8A90A2]">No interests listed</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Mobile Action Buttons */}
                    <div className="md:hidden mt-6 flex gap-3">
                        {isOwnProfile ? (
                            <button onClick={() => setShowEditModal(true)} className="flex-1 py-2 bg-white/10 text-white rounded-lg font-medium">Edit Profile</button>
                        ) : (
                            <button onClick={async () => {
                                try {
                                    const res = await startConversation(displayUser._id);
                                    const conv = res.conversation || res;
                                    const convId = conv?._id || conv?.id || conv;
                                    if (convId) navigate(`/app/chat/${convId}`);
                                    else navigate(`/app/chat`);
                                } catch (err) {
                                    console.error('Failed to start conversation', err);
                                    navigate('/app/chat');
                                }
                            }} className="flex-1 py-2 bg-[#00C4FF] text-black rounded-lg font-medium">Message</button>
                        )}
                    </div>
                </div>
            </div>

            {/* --- TABS --- */}
            <div className="bg-white/5 rounded-xl shadow-sm border border-white/10 overflow-hidden min-h-[400px] backdrop-blur-xl">
                <div className="flex border-b border-white/10">
                    {['allies', 'posts', 'waves'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`flex-1 py-4 text-sm font-medium text-center transition-colors relative ${activeTab === tab ? 'text-[#00C4FF]' : 'text-[#8A90A2] hover:text-white'
                                }`}
                        >
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                            {activeTab === tab && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00C4FF]" />
                            )}
                        </button>
                    ))}
                </div>

                <div className="p-6 bg-transparent h-full">
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