import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Eye, Zap } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import Button from '../../components/common/Button';
import WavePreview from '../../components/waves/WavePreview';
import CreateWaveModal from '../../components/waves/CreateWaveModal';
import WaveViewerModal from '../../components/waves/WaveViewerModal'; // Ensure this is imported
import Loading from '../../components/common/Loading';
import { useWaves } from '../../hooks/useWaves';
import useAuthStore from '../../store/authStore';

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

    const { user } = useAuthStore();

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    
    // Viewer State
    const [isViewerOpen, setIsViewerOpen] = useState(false);
    const [viewerWaves, setViewerWaves] = useState([]);
    const [viewerInitialIndex, setViewerInitialIndex] = useState(0);

    useEffect(() => {
        fetchMyWaves();
        fetchAlliesWaves();

        const interval = setInterval(() => {
            fetchAlliesWaves();
        }, 5 * 60 * 1000);

        return () => clearInterval(interval);
    }, []);

    // --- FIX: CLICK HANDLER ---
    const handleViewWave = (wave, sourceList) => {
        // 1. Set the list of waves to view (so user can swipe next/prev)
        setViewerWaves(sourceList);
        
        // 2. Find the index of the clicked wave
        const index = sourceList.findIndex(w => w._id === wave._id);
        setViewerInitialIndex(index !== -1 ? index : 0);
        
        // 3. Open Modal
        setIsViewerOpen(true);
    };

    // Filter active waves
    const activeMyWaves = myWaves.filter(w => new Date(w.expiresAt) > new Date());
    const activeAlliesWaves = alliesWaves.filter(w => new Date(w.expiresAt) > new Date());

    if (isLoading && myWaves.length === 0 && alliesWaves.length === 0) {
        return <div className="p-8 flex justify-center"><Loading text="Loading waves..." /></div>;
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-20">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <Zap className="text-yellow-500 fill-current" /> Waves
                </h1>
                <Button variant="primary" onClick={() => setIsCreateModalOpen(true)}>
                    <Plus className="w-5 h-5 mr-2" />
                    New Wave
                </Button>
            </div>

            {/* My Story Section */}
            <div>
                <h2 className="text-lg font-semibold text-gray-700 mb-4">Your Story</h2>
                {activeMyWaves.length === 0 ? (
                    <div 
                        onClick={() => setIsCreateModalOpen(true)}
                        className="w-32 h-48 bg-gray-100 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                        <div className="bg-blue-100 p-3 rounded-full mb-2">
                            <Plus className="w-6 h-6 text-blue-600" />
                        </div>
                        <span className="text-sm font-medium text-gray-600">Add to Story</span>
                    </div>
                ) : (
                    <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                        {activeMyWaves.map((wave) => (
                            <div key={wave._id} className="relative group">
                                <WavePreview
                                    wave={wave}
                                    isViewed={true} // My waves are always "viewed" by me
                                    onClick={() => handleViewWave(wave, activeMyWaves)}
                                />
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if(window.confirm('Delete this wave?')) deleteWave(wave._id);
                                    }}
                                    className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                        {/* Add More Button */}
                        <div 
                            onClick={() => setIsCreateModalOpen(true)}
                            className="w-32 h-48 flex-shrink-0 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-center cursor-pointer hover:bg-gray-100"
                        >
                             <Plus className="w-8 h-8 text-gray-400" />
                        </div>
                    </div>
                )}
            </div>

            {/* Allies Waves */}
            <div>
                <h2 className="text-lg font-semibold text-gray-700 mb-4">Updates from Allies</h2>
                {activeAlliesWaves.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
                        <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Zap className="w-8 h-8 text-gray-300" />
                        </div>
                        <p className="text-gray-500">No recent updates from your allies.</p>
                    </div>
                ) : (
                    <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                        {activeAlliesWaves.map((wave) => (
                            <WavePreview
                                key={wave._id}
                                wave={wave}
                                isViewed={isWaveViewed(wave._id)}
                                onClick={() => handleViewWave(wave, activeAlliesWaves)}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* MODALS */}
            <CreateWaveModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
            />

            {/* --- FIX: RENDER VIEWER CORRECTLY --- */}
            {isViewerOpen && viewerWaves.length > 0 && (
                <WaveViewerModal
                    waves={viewerWaves}
                    initialIndex={viewerInitialIndex}
                    isOpen={isViewerOpen}
                    onClose={() => {
                        setIsViewerOpen(false);
                        setViewerWaves([]);
                    }}
                />
            )}
        </div>
    );
};

export default WavesPage;