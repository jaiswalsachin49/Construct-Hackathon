import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const LikesListModal = ({ isOpen, onClose, targetId, type = 'post' }) => {
    const [likes, setLikes] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        if (isOpen && targetId) {
            const fetchLikes = async () => {
                setLoading(true);
                try {
                    const endpoint = type === 'post'
                        ? `/api/posts/${targetId}/likes`
                        : `/api/waves/${targetId}/likes`;

                    const response = await api.get(endpoint);
                    setLikes(response.data.likes || []);
                } catch (error) {
                    console.error('Failed to fetch likes:', error);
                } finally {
                    setLoading(false);
                }
            };
            fetchLikes();
        }
    }, [isOpen, targetId, type]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-[#101726] border border-white/10 w-full max-w-md rounded-2xl shadow-2xl flex flex-col max-h-[80vh]">
                <div className="flex items-center justify-between p-4 border-b border-white/10">
                    <h2 className="text-lg font-bold text-white">Likes</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                    {loading ? (
                        <div className="flex justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00C4FF]"></div>
                        </div>
                    ) : likes.length === 0 ? (
                        <div className="text-center py-8 text-gray-400">
                            No likes yet
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {likes.map((user) => (
                                <div
                                    key={user._id}
                                    className="flex items-center gap-3 cursor-pointer hover:bg-white/5 p-2 rounded-lg transition-colors"
                                    onClick={() => {
                                        onClose();
                                        navigate(`/app/profile/${user._id}`);
                                    }}
                                >
                                    {user.profilePhoto ? (
                                        <img
                                            src={user.profilePhoto}
                                            alt={user.name}
                                            className="w-10 h-10 rounded-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                                            {user.name?.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                    <div>
                                        <p className="text-white font-medium">{user.name}</p>
                                        {user.bio && (
                                            <p className="text-xs text-gray-400 line-clamp-1">{user.bio}</p>
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

export default LikesListModal;
