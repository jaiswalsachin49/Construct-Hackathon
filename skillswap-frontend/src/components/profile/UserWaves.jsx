import React, { useState, useEffect } from 'react';
import { Trash2, Eye } from 'lucide-react';
import { toast } from 'react-hot-toast';
import WaveViewerModal from '../waves/WaveViewerModal';
import ConfirmationModal from '../common/ConfirmationModal';
import {
    getMyWaves,
    getUserWaves,
    viewWave as apiViewWave,
    deleteWave as apiDeleteWave,
} from '../../services/waveService';
import useAuthStore from '../../store/authStore';
import axios from 'axios';

const UserWaves = ({ userId, isOwnProfile }) => {
    const [waves, setWaves] = useState([]);
    const [viewerWaves, setViewerWaves] = useState([]);
    const [viewerInitialIndex, setViewerInitialIndex] = useState(0);
    const [isViewerOpen, setIsViewerOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [waveToDelete, setWaveToDelete] = useState(null);

    useEffect(() => {
        const load = async () => {
            setIsLoading(true);
            try {
                const res = isOwnProfile ? await getMyWaves() : await getUserWaves(userId);
                // response shape may vary: be defensive
                const extract = (d) => {
                    if (!d) return [];
                    if (Array.isArray(d)) return d;
                    if (Array.isArray(d.waves)) return d.waves;
                    if (Array.isArray(d.data)) return d.data;
                    return [];
                };
                const list = extract(res);
                // normalize expiresAt to Date
                const normalized = list.map((w) => ({ ...w, expiresAt: w.expiresAt ? new Date(w.expiresAt) : null }));
                setWaves(normalized);
            } catch (err) {
                console.error('Failed to load waves', err);
            } finally {
                setIsLoading(false);
            }
        };

        if (isOwnProfile || userId) load();
    }, [userId, isOwnProfile]);

    const handleDelete = async (waveId) => {
        try {
            await apiDeleteWave(waveId);
            setWaves((prev) => prev.filter((w) => w._id !== waveId));
            toast.success('Wave deleted');
            setWaveToDelete(null);
        } catch (err) {
            console.error('Failed to delete wave', err);
            toast.error('Could not delete wave.');
        }
    };

    const handleView = (waveId) => {
        const index = waves.findIndex(w => w._id === waveId);
        if (index !== -1) {
            setInitialIndex(index);
            setIsViewerOpen(true);
        }
    };

    const getTimeRemaining = (expiresAt) => {
        if (!expiresAt) return '';
        const hours = Math.floor((expiresAt - Date.now()) / (1000 * 60 * 60));
        return `${hours}h remaining`;
    };

    if (isLoading) {
        return (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="aspect-[9/16] bg-white/10 rounded-lg animate-pulse"></div>
                ))}
            </div>
        );
    }

    if (waves.length === 0) {
        return (
            <div className="text-center py-12 text-[#8A90A2]">
                <p className="text-lg mb-2">No active waves</p>
                <p className="text-sm">Waves expire after 24 hours</p>
            </div>
        );
    }

    return (
        <div>
            <h3 className="text-lg font-semibold text-white mb-4">
                Active Waves ({waves.length})
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {waves.map((wave) => (
                    <div
                        key={wave._id}
                        data-testid={`wave-${wave._id}`}
                        className="relative group cursor-pointer"
                        onClick={() => handleView(wave._id)}
                    >
                        <div className="aspect-[9/16] bg-gradient-to-br from-purple-400 to-pink-500 rounded-lg overflow-hidden">
                            {wave.type === 'photo' && wave.mediaUrl ? (
                                <img
                                    src={wave.mediaUrl}
                                    alt="Wave"
                                    className="w-full h-full object-cover"
                                />
                            ) : wave.type === 'video' && wave.thumbnailUrl ? (
                                <img
                                    src={wave.thumbnailUrl}
                                    alt="Wave"
                                    className="w-full h-full object-cover"
                                />
                            ) : wave.type === 'video' && wave.mediaUrl ? (
                                <video
                                    src={wave.mediaUrl}
                                    className="w-full h-full object-cover"
                                    muted
                                />
                            ) : (
                                <div className="flex items-center justify-center h-full text-white text-4xl font-bold bg-gradient-to-br from-blue-500 to-purple-600">
                                    {wave.type === 'text' ? wave.content?.slice(0, 50) : 'W'}
                                </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-3">
                                {wave.content && <p className="text-white text-sm font-medium mb-1">{wave.content}</p>}
                                <div className="flex items-center justify-between text-xs text-white/80">
                                    <span>{getTimeRemaining(wave.expiresAt)}</span>
                                    <span>{wave.views || 0} views</span>
                                </div>
                            </div>
                        </div>
                        {isOwnProfile && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setWaveToDelete(wave);
                                }}
                                className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                            >
                                ×
                            </button>
                        )}
                    </div>
                ))}
            </div>

            {isViewerOpen && (
                <WaveViewerModal
                    waves={waves}
                    initialIndex={initialIndex}
                    isOpen={isViewerOpen}
                    onClose={() => setIsViewerOpen(false)}
                />
            )}

            {/* Confirmation Modal */}
            <ConfirmationModal
                isOpen={waveToDelete !== null}
                onClose={() => setWaveToDelete(null)}
                onConfirm={() => handleDelete(waveToDelete._id)}
                title="Delete Wave"
                message="Are you sure you want to delete this wave? It will be removed after 24 hours anyway."
                confirmText="Delete"
                isDestructive={true}
            />
        </div>
    );
};

export default UserWaves;
