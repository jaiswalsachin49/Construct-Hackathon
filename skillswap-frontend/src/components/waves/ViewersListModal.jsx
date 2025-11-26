import React, { useState, useEffect } from 'react';
import { X, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { getWaveViewers } from '../../services/waveService';

const ViewersListModal = ({ isOpen, onClose, waveId }) => {
    const navigate = useNavigate();
    const [viewers, setViewers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isOpen && waveId) {
            fetchViewers();
        }
    }, [isOpen, waveId]);

    const fetchViewers = async () => {
        try {
            setLoading(true);
            const data = await getWaveViewers(waveId);
            setViewers(data.viewers || []);
        } catch (error) {
            console.error('Failed to fetch viewers:', error);
            setViewers([]);
        } finally {
            setLoading(false);
        }
    };

    const handleUserClick = (userId) => {
        onClose();
        navigate(`/app/profile/${userId}`);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-[#101726] border border-white/10 rounded-2xl shadow-2xl w-full max-w-md max-h-[80vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-white/10">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                        <Eye className="w-5 h-5 text-[#3B82F6]" />
                        Viewers
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-[#8A90A2] hover:text-white transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Viewers List */}
                <div className="flex-1 overflow-y-auto p-4">
                    {loading ? (
                        <div className="flex justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3B82F6]"></div>
                        </div>
                    ) : viewers.length === 0 ? (
                        <div className="text-center py-8 text-[#8A90A2]">
                            <Eye className="w-12 h-12 mx-auto mb-2 opacity-50" />
                            <p>No viewers yet</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {viewers.map((viewer) => (
                                <div
                                    key={viewer._id}
                                    onClick={() => handleUserClick(viewer._id)}
                                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 cursor-pointer transition-colors"
                                >
                                    <img
                                        src={viewer.profilePhoto || `https://ui-avatars.com/api/?name=${viewer.name}`}
                                        alt={viewer.name}
                                        className="w-10 h-10 rounded-full object-cover border border-white/10"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-white font-medium truncate">{viewer.name}</p>
                                        {viewer.bio && (
                                            <p className="text-xs text-[#8A90A2] truncate">{viewer.bio}</p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

ViewersListModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    waveId: PropTypes.string
};

export default ViewersListModal;
