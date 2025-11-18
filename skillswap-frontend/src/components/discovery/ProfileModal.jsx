import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { X, MapPin, Calendar, Star, CheckCircle, Phone, Mail, Award } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '../common/Button';
import Loading from '../common/Loading';
import { getUserById, addAlly, startChat } from '../../services/discoveryService';

const ProfileModal = ({ userId, isOpen, onClose }) => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isAddingAlly, setIsAddingAlly] = useState(false);
    const [isAlly, setIsAlly] = useState(false);
    const [showFullBio, setShowFullBio] = useState(false);

    useEffect(() => {
        if (isOpen && userId) {
            fetchUserProfile();
        }
    }, [isOpen, userId]);

    const fetchUserProfile = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const data = await getUserById(userId);
            setUser(data);
            setIsAlly(data.isAlly || false);
        } catch (err) {
            console.error('Failed to fetch user profile:', err);
            setError('Failed to load profile');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddAlly = async () => {
        try {
            setIsAddingAlly(true);
            await addAlly(userId);
            setIsAlly(true);
        } catch (err) {
            console.error('Failed to add ally:', err);
        } finally {
            setIsAddingAlly(false);
        }
    };

    const handleStartChat = async () => {
        try {
            const conv = await startChat(userId);
            navigate(`/app/chat/${conv.conversationId}`);
            onClose();
        } catch (err) {
            console.error('Failed to start chat:', err);
        }
    };

    const getInitials = (name) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="flex min-h-screen items-center justify-center p-4">
                <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 z-10 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors"
                    >
                        <X className="h-5 w-5 text-gray-600" />
                    </button>

                    {isLoading ? (
                        <div className="p-12">
                            <Loading size="lg" text="Loading profile..." />
                        </div>
                    ) : error ? (
                        <div className="p-12 text-center">
                            <p className="text-red-600 mb-4">{error}</p>
                            <Button variant="primary" onClick={fetchUserProfile}>
                                Retry
                            </Button>
                        </div>
                    ) : user ? (
                        <>
                            {/* Header with Cover */}
                            <div className="relative">
                                {/* Cover Photo */}
                                <div className="h-32 bg-gradient-to-r from-blue-500 to-indigo-600" />

                                {/* Profile Photo */}
                                <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2">
                                    {user.profilePhoto ? (
                                        <img
                                            src={user.profilePhoto}
                                            alt={user.name}
                                            className="h-24 w-24 rounded-full object-cover border-4 border-white shadow-lg"
                                        />
                                    ) : (
                                        <div className="h-24 w-24 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center border-4 border-white shadow-lg">
                                            <span className="text-3xl font-bold text-white">
                                                {getInitials(user.name)}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* User Info */}
                            <div className="pt-16 px-6 pb-6">
                                <div className="text-center mb-6">
                                    <div className="flex items-center justify-center gap-2 mb-2">
                                        <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
                                        {user.verified && (
                                            <CheckCircle className="h-6 w-6 text-blue-500 fill-current" />
                                        )}
                                    </div>

                                    <div className="flex items-center justify-center gap-4 text-sm text-gray-600">
                                        {user.areaLabel && (
                                            <div className="flex items-center gap-1">
                                                <MapPin className="h-4 w-4" />
                                                <span>{user.areaLabel}</span>
                                            </div>
                                        )}
                                        {user.distance && (
                                            <span>{user.distance.toFixed(1)} km away</span>
                                        )}
                                    </div>

                                    {user.memberSince && (
                                        <div className="flex items-center justify-center gap-1 text-sm text-gray-500 mt-2">
                                            <Calendar className="h-4 w-4" />
                                            <span>Member since {new Date(user.memberSince).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                                        </div>
                                    )}
                                </div>

                                {/* About Section */}
                                {user.bio && (
                                    <div className="mb-6">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">About</h3>
                                        <p className="text-gray-700">
                                            {showFullBio || user.bio.length <= 200
                                                ? user.bio
                                                : `${user.bio.slice(0, 200)}...`}
                                        </p>
                                        {user.bio.length > 200 && (
                                            <button
                                                onClick={() => setShowFullBio(!showFullBio)}
                                                className="text-blue-600 text-sm font-medium mt-2 hover:underline"
                                            >
                                                {showFullBio ? 'Show less' : 'Read more'}
                                            </button>
                                        )}
                                    </div>
                                )}

                                {/* Can Teach Section */}
                                {user.teachTags && user.teachTags.length > 0 && (
                                    <div className="mb-6">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Can Teach</h3>
                                        <div className="space-y-2">
                                            {user.teachTags.map((tag, index) => (
                                                <div
                                                    key={index}
                                                    className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg"
                                                >
                                                    <span className="text-2xl">🎓</span>
                                                    <div>
                                                        <p className="font-medium text-gray-900 capitalize">{tag}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Wants to Learn Section */}
                                {user.learnTags && user.learnTags.length > 0 && (
                                    <div className="mb-6">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Wants to Learn</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {user.learnTags.map((tag, index) => (
                                                <span
                                                    key={index}
                                                    className="px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-sm font-medium capitalize"
                                                >
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Stats Section */}
                                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Stats</h3>
                                    <div className="grid grid-cols-3 gap-4 text-center">
                                        <div>
                                            <p className="text-2xl font-bold text-blue-600">{user.stats?.sessions || 0}</p>
                                            <p className="text-sm text-gray-600">Sessions</p>
                                        </div>
                                        <div>
                                            <p className="text-2xl font-bold text-green-600">{user.stats?.hours || 0}</p>
                                            <p className="text-sm text-gray-600">Hours</p>
                                        </div>
                                        <div>
                                            <div className="flex items-center justify-center gap-1">
                                                <Star className="h-5 w-5 text-yellow-500 fill-current" />
                                                <p className="text-2xl font-bold text-yellow-600">
                                                    {user.rating?.average || 0}
                                                </p>
                                            </div>
                                            <p className="text-sm text-gray-600">
                                                ({user.rating?.count || 0} reviews)
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Badges Section */}
                                {user.badges && user.badges.length > 0 && (
                                    <div className="mb-6">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Badges</h3>
                                        <div className="flex flex-wrap gap-3">
                                            {user.badges.map((badge, index) => (
                                                <div
                                                    key={index}
                                                    className="flex items-center gap-2 px-3 py-2 bg-yellow-50 rounded-lg"
                                                >
                                                    <Award className="h-5 w-5 text-yellow-600" />
                                                    <span className="text-sm font-medium text-gray-700">{badge}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <Button
                                        variant={isAlly ? 'secondary' : 'primary'}
                                        className="flex-1"
                                        onClick={handleAddAlly}
                                        isLoading={isAddingAlly}
                                        disabled={isAlly || isAddingAlly}
                                    >
                                        {isAlly ? 'Already Allies ✓' : 'Add to Allies'}
                                    </Button>
                                    <Button
                                        variant="primary"
                                        className="flex-1"
                                        onClick={handleStartChat}
                                    >
                                        Start Chat
                                    </Button>
                                </div>

                                {/* Report/Block Links */}
                                <div className="flex justify-center gap-6 mt-4 text-sm">
                                    <button className="text-gray-500 hover:text-red-600 transition-colors">
                                        Report
                                    </button>
                                    <button className="text-gray-500 hover:text-red-600 transition-colors">
                                        Block
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : null}
                </div>
            </div>
        </div>
    );
};

ProfileModal.propTypes = {
    userId: PropTypes.string.isRequired,
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
};

export default ProfileModal;
