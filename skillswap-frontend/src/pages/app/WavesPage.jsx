import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Eye, Zap } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import Button from '../../components/common/Button';
import WavePreview from '../../components/waves/WavePreview';
import CreateWaveModal from '../../components/waves/CreateWaveModal';
import WaveViewerModal from '../../components/waves/WaveViewerModal';
import Loading from '../../components/common/Loading';
import { useWaves } from '../../hooks/useWaves';

const WavesPage = () => {
    const {
        myWaves,
        alliesWaves,
        isLoading,
        error,
        fetchMyWaves,
        fetchAlliesWaves,
        deleteWave,
        isWaveViewed,
    } = useWaves();

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isViewerOpen, setIsViewerOpen] = useState(false);
    const [viewerWaves, setViewerWaves] = useState([]);
    const [viewerInitialIndex, setViewerInitialIndex] = useState(0);

    useEffect(() => {
        fetchMyWaves();
        fetchAlliesWaves();

        // Auto-refresh every 5 minutes
        const interval = setInterval(() => {
            fetchAlliesWaves();
        }, 5 * 60 * 1000);

        return () => clearInterval(interval);
    }, []);

    // Filter out expired waves (>24 hours)
    const filterExpiredWaves = (waves) => {
        const now = new Date();
        return waves.filter((wave) => {
            const created = new Date(wave.createdAt);
            const diff = now - created;
            const hours = diff / (1000 * 60 * 60);
            return hours < 24;
        });
    };

    const activeMyWave = filterExpiredWaves(myWaves)[0];
    const activeAlliesWaves = filterExpiredWaves(alliesWaves);

    const handleDeleteWave = async (waveId) => {
        if (window.confirm('Are you sure you want to delete this wave?')) {
            try {
                await deleteWave(waveId);
            } catch (error) {
                console.error('Failed to delete wave:', error);
            }
        }
    };

    const handleViewWave = (wave) => {
        // Find user's all waves
        const userWaves = activeAlliesWaves.filter((w) => w.user._id === wave.user._id);
        const initialIndex = userWaves.findIndex((w) => w._id === wave._id);

        setViewerWaves(userWaves);
        setViewerInitialIndex(initialIndex);
        setIsViewerOpen(true);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-gray-900">Waves</h1>
                <Button
                    variant="primary"
                    onClick={() => setIsCreateModalOpen(true)}
                    className="flex items-center gap-2"
                >
                    <Plus className="h-5 w-5" />
                    Create Wave
                </Button>
            </div>

            {/* Error State */}
            {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-600">{error}</p>
                </div>
            )}

            {/* My Wave Section */}
            {activeMyWave && (
                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-gray-900">Your Wave</h2>
                        <button
                            onClick={() => handleDeleteWave(activeMyWave._id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                            <Trash2 className="h-5 w-5" />
                        </button>
                    </div>

                    <div className="relative aspect-[9/16] max-w-xs mx-auto rounded-lg overflow-hidden">
                        {activeMyWave.type === 'photo' && (
                            <img
                                src={activeMyWave.mediaUrl}
                                alt="My wave"
                                className="w-full h-full object-cover"
                            />
                        )}

                        {activeMyWave.type === 'video' && (
                            <video
                                src={activeMyWave.mediaUrl}
                                className="w-full h-full object-cover"
                            />
                        )}

                        {activeMyWave.type === 'text' && (
                            <div
                                className="w-full h-full flex items-center justify-center p-6"
                                style={{ backgroundColor: activeMyWave.backgroundColor }}
                            >
                                <p className="text-white text-2xl font-bold text-center">
                                    {activeMyWave.textContent}
                                </p>
                            </div>
                        )}

                        {/* Overlay Info */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-4">
                            <div className="flex items-center gap-2 text-white mb-2">
                                <Eye className="h-4 w-4" />
                                <span className="text-sm">{activeMyWave.views || 0} viewers</span>
                            </div>
                            <p className="text-white text-sm">
                                Created {formatDistanceToNow(new Date(activeMyWave.createdAt), { addSuffix: true })}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Allies Waves Section */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Stories From Allies
                </h2>

                {isLoading && activeAlliesWaves.length === 0 ? (
                    <div className="py-12">
                        <Loading size="lg" text="Loading waves..." />
                    </div>
                ) : activeAlliesWaves.length === 0 ? (
                    // Empty State
                    <div className="text-center py-12">
                        <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 mb-4">
                            <Zap className="h-8 w-8 text-blue-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            No waves yet
                        </h3>
                        <p className="text-gray-600">
                            Check back soon to see waves from your allies
                        </p>
                    </div>
                ) : (
                    // Waves Grid
                    <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                        {activeAlliesWaves.map((wave) => (
                            <WavePreview
                                key={wave._id}
                                wave={wave}
                                isViewed={isWaveViewed(wave._id)}
                                onClick={() => handleViewWave(wave)}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Create Wave Modal */}
            <CreateWaveModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
            />

            {/* Wave Viewer Modal */}
            {viewerWaves.length > 0 && (
                <WaveViewerModal
                    waves={viewerWaves}
                    initialIndex={viewerInitialIndex}
                    isOpen={isViewerOpen}
                    onClose={() => {
                        setIsViewerOpen(false);
                        setViewerWaves([]);
                        setViewerInitialIndex(0);
                    }}
                />
            )}
        </div>
    );
};

export default WavesPage;
