import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { MapPin, Star, Award, Edit } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import useAuthStore from '../../store/authStore';
import UserWaves from '../../components/profile/UserWaves';
import UserPosts from '../../components/profile/UserPosts';
import api from '../../services/api';

const ProfilePage = () => {
    const { userId: paramUserId } = useParams();
    const { user: currentUser } = useAuthStore();
    const [activeTab, setActiveTab] = useState('posts');
    const [profileUser, setProfileUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Determine which user to show
    const isOwnProfile = !paramUserId || paramUserId === currentUser?._id;
    const userIdToCheck = isOwnProfile ? currentUser?._id : paramUserId;

    useEffect(() => {
        const fetchUser = async () => {
            if (isOwnProfile) {
                setProfileUser(currentUser);
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                const response = await api.get(`/api/users/${paramUserId}`);
                setProfileUser(response.data.user);
            } catch (error) {
                console.error('Failed to fetch user:', error);
            } finally {
                setLoading(false);
            }
        };

        if (userIdToCheck) {
            fetchUser();
        }
    }, [userIdToCheck, currentUser, isOwnProfile, paramUserId]); // Added paramUserId to dependencies

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3B82F6]"></div>
            </div>
        );
    }

    if (!profileUser) {
        return <div className="text-center text-white py-10">User not found</div>;
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Profile Header */}
            <Card padding="lg" shadow="normal">
                <div className="flex flex-col md:flex-row items-center gap-6">
                    <div className="h-24 w-24 rounded-full bg-pink-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {profileUser.profilePhoto ? (
                            <img
                                src={profileUser.profilePhoto}
                                alt={profileUser.name}
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <span className="text-4xl text-pink-600 font-bold">
                                {profileUser.name?.charAt(0)?.toUpperCase() || 'U'}
                            </span>
                        )}
                    </div>
                    <div className="flex-1 text-center md:text-left">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">{profileUser.name}</h1>
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-gray-600">
                            <div className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                <span>{profileUser.location?.city || profileUser.location?.areaLabel || 'Location unknown'}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Star className="h-4 w-4 fill-current text-yellow-500" />
                                <span>{profileUser.stats?.averageRating?.toFixed(1) || '0.0'}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Award className="h-4 w-4" />
                                <span>{profileUser.teachTags?.length || 0} Skills</span>
                            </div>
                        </div>
                    </div>
                    {isOwnProfile && (
                        <Button variant="primary">
                            <Edit className="h-5 w-5 mr-2" />
                            Edit Profile
                        </Button>
                    )}
                </div>
            </Card>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 bg-white rounded-lg shadow-sm px-4">
                {['posts', 'waves', 'about'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`flex-1 py-4 text-sm font-medium border-b-2 transition-colors capitalize ${activeTab === tab
                            ? 'border-pink-500 text-pink-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="min-h-[400px]">
                {activeTab === 'posts' && (
                    <UserPosts userId={profileUser._id} />
                )}

                {activeTab === 'waves' && (
                    <UserWaves userId={profileUser._id} isOwnProfile={isOwnProfile} />
                )}

                {activeTab === 'about' && (
                    <div className="space-y-6">
                        {/* Bio */}
                        <Card padding="lg" shadow="normal">
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">About Me</h2>
                            <p className="text-gray-700">
                                {profileUser.bio || "No bio yet."}
                            </p>
                        </Card>

                        {/* Skills */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Card padding="lg" shadow="normal">
                                <h2 className="text-xl font-semibold text-gray-900 mb-4">Can Teach</h2>
                                <div className="flex flex-wrap gap-2">
                                    {profileUser.teachTags?.length > 0 ? profileUser.teachTags.map((skill, i) => (
                                        <span
                                            key={i}
                                            className="px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-sm font-medium"
                                        >
                                            {skill.name}
                                        </span>
                                    )) : <span className="text-gray-500">No skills listed</span>}
                                </div>
                            </Card>

                            <Card padding="lg" shadow="normal">
                                <h2 className="text-xl font-semibold text-gray-900 mb-4">Wants to Learn</h2>
                                <div className="flex flex-wrap gap-2">
                                    {profileUser.learnTags?.length > 0 ? profileUser.learnTags.map((interest, i) => (
                                        <span
                                            key={i}
                                            className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium"
                                        >
                                            {interest.name}
                                        </span>
                                    )) : <span className="text-gray-500">No interests listed</span>}
                                </div>
                            </Card>
                        </div>

                        {/* Stats */}
                        <Card padding="lg" shadow="normal">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">Stats</h2>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="text-center">
                                    <p className="text-3xl font-bold text-pink-600">{profileUser.allies?.length || 0}</p>
                                    <p className="text-sm text-gray-600">Connections</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-3xl font-bold text-green-600">{profileUser.teachTags?.length || 0}</p>
                                    <p className="text-sm text-gray-600">Skills Taught</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-3xl font-bold text-purple-600">{profileUser.learnTags?.length || 0}</p>
                                    <p className="text-sm text-gray-600">Skills Learned</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-3xl font-bold text-orange-600">{profileUser.badges?.length || 0}</p>
                                    <p className="text-sm text-gray-600">Badges</p>
                                </div>
                            </div>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProfilePage;
