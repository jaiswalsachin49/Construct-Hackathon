import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { X, MapPin, Calendar, Star, CheckCircle, Phone, Mail, Award, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '../common/Button';
import Loading from '../common/Loading';
import { getUserById, sendConnectionRequest, startChat } from '../../services/discoveryService';
import useAuthStore from '../../store/authStore'; // Import auth store to check ownership

const ProfileModal = ({ userId, isOpen, onClose }) => {
    const navigate = useNavigate();
    const { user: currentUser } = useAuthStore(); // Get logged in user

    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isAddingAlly, setIsAddingAlly] = useState(false);
    const [isAlly, setIsAlly] = useState(false);

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
            // Check if already an ally (robust check)
            const alreadyAlly = currentUser?.allies?.some(a => a === userId || a._id === userId);
            setIsAlly(alreadyAlly || false);
        } catch (err) {
            console.error('Failed to fetch user profile:', err);
            setError('Failed to load profile');
        } finally {
            setIsLoading(false);
        }
    };

    const handleConnect = async () => {
        try {
            setIsAddingAlly(true);
            await sendConnectionRequest(userId);
            setIsAlly(true); // Reuse isAlly to show "Connected" or "Request Sent" state for now
            // Ideally we should distinguish between connected and pending, but for UI feedback this works
        } catch (err) {
            console.error('Failed to send connection request:', err);
        } finally {
            setIsAddingAlly(false);
        }
    };

    const handleStartChat = async () => {
        try {
            const response = await startChat(userId);

            // Debug log to see what backend sends
            console.log("Start chat response:", response);

            const conversationId = response.conversation?._id || response._id;

            if (conversationId) {
                onClose();
                navigate(`/app/chat/${conversationId}`);
            } else {
                // If we get here, backend succeeded but didn't send ID
                console.error("Backend returned success but no ID:", response);
            }
        } catch (err) {
            console.error('Failed to start chat:', err);
        }
    };

    // Helper to safely render tags (Fixes your Error)
    const renderTag = (tag) => {
        if (!tag) return null;
        // If it's an object (backend data), return .name. If string (mock), return it directly.
        return typeof tag === 'object' ? tag.name : tag;
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto flex flex-col animate-in zoom-in-95 duration-200 relative">

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 bg-white/80 rounded-full hover:bg-gray-100 z-10 transition-colors"
                >
                    <X className="w-5 h-5 text-gray-500" />
                </button>

                {isLoading ? (
                    <div className="p-12 flex justify-center">
                        <Loading size="lg" text="Loading profile..." />
                    </div>
                ) : error || !user ? (
                    <div className="p-12 text-center">
                        <p className="text-red-500 mb-4">{error || 'User not found'}</p>
                        <Button onClick={onClose} variant="secondary">Close</Button>
                    </div>
                ) : (
                    <>
                        {/* Header / Cover */}
                        <div className="h-32 bg-gradient-to-r from-blue-500 to-purple-600 w-full flex-shrink-0" />

                        {/* Profile Info */}
                        <div className="px-6 pb-6 -mt-12 flex-1">
                            <div className="flex justify-between items-end mb-4">
                                <div className="w-24 h-24 bg-white rounded-full p-1 shadow-lg">
                                    <img
                                        src={user.profilePhoto || `https://ui-avatars.com/api/?name=${user.name}&background=random`}
                                        alt={user.name}
                                        className="w-full h-full rounded-full object-cover"
                                    />
                                </div>
                                <div className="flex items-center gap-1 mb-2">
                                    <Star className="w-5 h-5 text-yellow-400 fill-current" />
                                    <span className="font-bold text-gray-900">{user.stats?.averageRating || 'New'}</span>
                                    <span className="text-sm text-gray-500">({user.stats?.reviewCount || 0})</span>
                                </div>
                            </div>

                            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                {user.name}
                                {user.isVerified && <CheckCircle className="w-5 h-5 text-blue-500" />}
                            </h2>

                            <div className="flex items-center gap-4 text-sm text-gray-600 mt-1 mb-4">
                                {user.location?.areaLabel && (
                                    <div className="flex items-center gap-1">
                                        <MapPin className="w-4 h-4" />
                                        {user.location.areaLabel}
                                    </div>
                                )}
                                <div className="flex items-center gap-1">
                                    <Calendar className="w-4 h-4" />
                                    Joined {new Date(user.createdAt).getFullYear()}
                                </div>
                            </div>

                            {user.bio && (
                                <p className="text-gray-700 mb-6 leading-relaxed">
                                    {user.bio}
                                </p>
                            )}

                            {/* Skills Section */}
                            <div className="space-y-4 mb-8">
                                <div>
                                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                                        Teaching
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {user.teachTags?.map((tag, i) => (
                                            <span key={i} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium border border-blue-100">
                                                {renderTag(tag)}
                                            </span>
                                        ))}
                                        {(!user.teachTags || user.teachTags.length === 0) && (
                                            <span className="text-sm text-gray-400 italic">No skills listed</span>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                                        Learning
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {user.learnTags?.map((tag, i) => (
                                            <span key={i} className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm font-medium border border-green-100">
                                                {renderTag(tag)}
                                            </span>
                                        ))}
                                        {(!user.learnTags || user.learnTags.length === 0) && (
                                            <span className="text-sm text-gray-400 italic">No interests listed</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            {currentUser?._id !== user._id && (
                                <div className="flex gap-3">
                                    <Button
                                        variant={isAlly ? "secondary" : "primary"}
                                        className="flex-1"
                                        onClick={handleConnect}
                                        disabled={isAlly || isAddingAlly}
                                        isLoading={isAddingAlly}
                                    >
                                        {isAlly ? 'Request Sent' : 'Connect'}
                                    </Button>
                                    <Button
                                        variant="secondary"
                                        className="flex-1 gap-2"
                                        onClick={handleStartChat}
                                    >
                                        <MessageCircle className="w-4 h-4" />
                                        Message
                                    </Button>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

ProfileModal.propTypes = {
    userId: PropTypes.string,
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
};

export default ProfileModal;