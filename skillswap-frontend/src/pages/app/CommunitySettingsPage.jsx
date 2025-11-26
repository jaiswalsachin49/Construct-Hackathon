import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Trash2, AlertTriangle } from 'lucide-react';
import { useCommunities } from '../../hooks/useCommunities';
import { useAuth } from '../../hooks/useAuth';
import ConfirmationModal from '../../components/common/ConfirmationModal';

const CommunitySettingsPage = () => {
    const { communityId } = useParams();
    const navigate = useNavigate();
    const { currentCommunity, fetchCommunity, isLoading } = useCommunities();
    const { user } = useAuth();

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        category: '',
        isPrivate: false
    });
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    useEffect(() => {
        const loadCommunity = async () => {
            if (!currentCommunity || currentCommunity._id !== communityId) {
                await fetchCommunity(communityId);
            }
        };
        loadCommunity();
    }, [communityId]);

    useEffect(() => {
        if (currentCommunity) {
            setFormData({
                name: currentCommunity.name || '',
                description: currentCommunity.description || '',
                category: currentCommunity.category || 'other',
                isPrivate: currentCommunity.isPrivate || false
            });
        }
    }, [currentCommunity]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        // TODO: Implement update community functionality
        console.log('Update community:', formData);
        alert('Settings saved!');
    };

    const handleDelete = async () => {
        // TODO: Implement delete community functionality
        console.log('Delete community:', communityId);
        navigate('/app/communities');
        setShowDeleteModal(false);
    };

    if (isLoading || !currentCommunity) {
        return (
            <div className="min-h-screen bg-transparent flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3B82F6]"></div>
            </div>
        );
    }

    // Check if user is admin
    const isAdmin = currentCommunity.members?.find(
        m => m.userId._id === user._id
    )?.role === 'admin';

    if (!isAdmin) {
        return (
            <div className="min-h-screen bg-transparent flex items-center justify-center">
                <div className="text-center">
                    <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
                    <p className="text-[#8A90A2] mb-4">You do not have permission to view this page.</p>
                    <button
                        onClick={() => navigate(`/app/communities/${communityId}`)}
                        className="px-4 py-2 bg-[#3B82F6] text-black font-semibold rounded-lg"
                    >
                        Back to Community
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-transparent">
            {/* Header */}
            <div className="bg-white/5 border-b border-white/10 backdrop-blur-xl sticky top-0 z-10">
                <div className="max-w-4xl mx-auto px-6 py-4">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate(`/app/communities/${communityId}`)}
                            className="text-[#8A90A2] hover:text-white transition-colors"
                        >
                            <ArrowLeft className="w-6 h-6" />
                        </button>
                        <h1 className="text-2xl font-bold text-white">Community Settings</h1>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-6 py-8">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-sm">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Name */}
                        <div>
                            <label className="block text-sm font-medium text-[#E6E9EF] mb-2">
                                Community Name
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-4 py-3 bg-[#101726] border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent outline-none transition-all"
                                required
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium text-[#E6E9EF] mb-2">
                                Description
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows={4}
                                className="w-full px-4 py-3 bg-[#101726] border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent outline-none transition-all resize-none"
                            />
                        </div>

                        {/* Category */}
                        <div>
                            <label className="block text-sm font-medium text-[#E6E9EF] mb-2">
                                Category
                            </label>
                            <select
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                className="w-full px-4 py-3 bg-[#101726] border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent outline-none transition-all"
                            >
                                <option value="tech">Technology</option>
                                <option value="arts">Arts & Crafts</option>
                                <option value="fitness">Fitness</option>
                                <option value="music">Music</option>
                                <option value="cooking">Cooking</option>
                                <option value="language">Languages</option>
                                <option value="other">Other</option>
                            </select>
                        </div>

                        {/* Privacy */}
                        <div className="flex items-center gap-3 p-4 bg-[#101726] rounded-xl border border-white/10">
                            <input
                                type="checkbox"
                                id="isPrivate"
                                checked={formData.isPrivate}
                                onChange={(e) => setFormData({ ...formData, isPrivate: e.target.checked })}
                                className="w-5 h-5 rounded border-gray-600 text-[#3B82F6] focus:ring-[#3B82F6] bg-gray-700"
                            />
                            <label htmlFor="isPrivate" className="text-[#E6E9EF] font-medium cursor-pointer">
                                Private Community
                            </label>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-between pt-6 border-t border-white/10">
                            <button
                                type="button"
                                onClick={() => setShowDeleteModal(true)}
                                className="flex items-center gap-2 px-6 py-2 border border-red-500/40 text-red-400 hover:bg-red-500/10 rounded-lg font-medium transition-colors"
                            >
                                <Trash2 className="w-4 h-4" />
                                Delete Community
                            </button>
                            <button
                                type="submit"
                                className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-[#60A5FA] to-[#3B82F6] text-black font-bold rounded-xl hover:shadow-[0_0_20px_rgba(0,244,255,0.3)] transition-all transform hover:scale-[1.02]"
                            >
                                <Save className="w-5 h-5" />
                                Save Changes
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Confirmation Modal */}
            <ConfirmationModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleDelete}
                title="Delete Community"
                message={`Are you sure you want to delete "${currentCommunity?.name}"? This action cannot be undone and all community data will be lost.`}
                confirmText="Delete"
                isDestructive={true}
            />
        </div>
    );
};

export default CommunitySettingsPage;
