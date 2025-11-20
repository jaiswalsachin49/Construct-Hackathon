import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { X, Heart, MessageCircle, Share2, Volume2, VolumeX } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { useWaves } from '../../hooks/useWaves';
import { viewWave, reactToWave } from '../../services/waveService';
import { startChat } from '../../services/discoveryService';

const WaveViewerModal = ({ waves, initialIndex = 0, isOpen, onClose }) => {
    const navigate = useNavigate();
    const { markWaveViewed } = useWaves();
    const [currentIndex, setCurrentIndex] = useState(initialIndex);
    const [isPaused, setIsPaused] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [progress, setProgress] = useState(0);
    const [isLiked, setIsLiked] = useState(false);
    const timerRef = useRef(null);
    const videoRef = useRef(null);

    const currentWave = waves[currentIndex];

    // --- FIX: Safely get User Data ---
    const getWaveUser = (wave) => {
        if (!wave) return {};
        // Handle both "populated userId" (Backend) and "user object" (Frontend optimistic)
        return wave.userId || wave.user || {};
    };

    const waveUser = getWaveUser(currentWave);
    // --------------------------------

    const duration = currentWave?.type === 'video' ? null : 5000; 

    useEffect(() => {
        if (isOpen && currentWave) {
            viewWave(currentWave._id).catch(console.error);
            markWaveViewed(currentWave._id);
            setProgress(0);
            setIsLiked(false);
        }
    }, [currentIndex, isOpen, currentWave]);

    useEffect(() => {
        if (!isOpen || isPaused || !currentWave) return;

        if (currentWave.type === 'video') {
            if (videoRef.current) {
                videoRef.current.play().catch(() => {});
            }
            return;
        }

        const interval = 100; // Update every 100ms
        const steps = duration / interval;
        let step = 0;

        timerRef.current = setInterval(() => {
            step++;
            const newProgress = (step / steps) * 100;
            setProgress(newProgress);

            if (newProgress >= 100) {
                nextWave();
            }
        }, interval);

        return () => clearInterval(timerRef.current);
    }, [currentIndex, isOpen, isPaused, currentWave]);

    const nextWave = () => {
        if (currentIndex < waves.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setProgress(0);
        } else {
            onClose();
        }
    };

    const prevWave = () => {
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
            setProgress(0);
        }
    };

    const handleReply = async () => {
        try {
            // Use the safe waveUser helper
            const response = await startChat(waveUser._id);
            const conversationId = response.conversation?._id || response._id;
            onClose();
            navigate(`/app/chat/${conversationId}`);
        } catch (error) {
            console.error('Failed to reply:', error);
        }
    };

    if (!isOpen || !currentWave) return null;

    return (
        <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
            {/* Close Button */}
            <button 
                onClick={onClose}
                className="absolute top-4 right-4 z-50 text-white hover:text-gray-300 p-2"
            >
                <X className="h-8 w-8" />
            </button>

            <div className="relative w-full max-w-md h-full md:h-[90vh] bg-gray-900 md:rounded-xl overflow-hidden flex flex-col">
                
                {/* Progress Bar */}
                <div className="absolute top-0 left-0 right-0 flex gap-1 p-2 z-20">
                    {waves.map((_, idx) => (
                        <div key={idx} className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden">
                            <div 
                                className={`h-full bg-white transition-all duration-100 ${
                                    idx < currentIndex ? 'w-full' : 
                                    idx === currentIndex ? 'w-[var(--progress)]' : 'w-0'
                                }`}
                                style={idx === currentIndex ? { width: `${progress}%` } : {}}
                            />
                        </div>
                    ))}
                </div>

                {/* User Info Header */}
                <div className="absolute top-6 left-0 right-0 p-4 z-20 flex items-center justify-between bg-gradient-to-b from-black/60 to-transparent">
                    <div className="flex items-center gap-3">
                        <img 
                            src={waveUser.profilePhoto || `https://ui-avatars.com/api/?name=${waveUser.name}`} 
                            className="w-10 h-10 rounded-full border-2 border-white/50 object-cover"
                            alt={waveUser.name}
                        />
                        <div className="text-white">
                            <p className="font-semibold text-sm">{waveUser.name}</p>
                            <p className="text-xs text-white/80">
                                {formatDistanceToNow(new Date(currentWave.createdAt))} ago
                            </p>
                        </div>
                    </div>
                </div>

                {/* Content Area */}
                <div 
                    className="flex-1 bg-black relative flex items-center justify-center"
                    onMouseDown={() => setIsPaused(true)}
                    onMouseUp={() => setIsPaused(false)}
                    onTouchStart={() => setIsPaused(true)}
                    onTouchEnd={() => setIsPaused(false)}
                >
                    {currentWave.type === 'photo' && (
                        <img 
                            src={currentWave.mediaUrl} 
                            className="w-full h-full object-contain"
                            alt="Wave content"
                        />
                    )}
                    
                    {currentWave.type === 'video' && (
                        <video
                            ref={videoRef}
                            src={currentWave.mediaUrl}
                            className="w-full h-full object-contain"
                            autoPlay
                            playsInline
                            muted={isMuted}
                            onEnded={nextWave}
                            onTimeUpdate={(e) => {
                                const p = (e.target.currentTime / e.target.duration) * 100;
                                setProgress(p);
                            }}
                        />
                    )}
                    
                    {currentWave.type === 'text' && (
                        <div 
                            className="w-full h-full flex items-center justify-center p-8 text-center"
                            style={{ backgroundColor: currentWave.backgroundColor || '#3B82F6' }}
                        >
                            <p className="text-white text-2xl font-bold">{currentWave.textContent}</p>
                        </div>
                    )}
                    
                    {/* Caption Overlay */}
                    {currentWave.caption && (
                        <div className="absolute bottom-20 left-0 right-0 p-4 text-center">
                            <span className="bg-black/50 text-white px-3 py-1 rounded-lg text-sm backdrop-blur-sm">
                                {currentWave.caption}
                            </span>
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent z-20">
                    <div className="flex items-center gap-4">
                        {/* Reply Input (Fake button) */}
                        <button 
                            onClick={handleReply}
                            className="flex-1 bg-white/10 hover:bg-white/20 text-white/90 rounded-full px-4 py-2 text-sm text-left border border-white/20 backdrop-blur-md transition-colors"
                        >
                            Reply to {waveUser.name}...
                        </button>

                        {/* Likes */}
                        <div className="flex items-center gap-3">
                            <button 
                                onClick={() => {
                                    reactToWave(currentWave._id);
                                    setIsLiked(!isLiked);
                                }}
                                className={`p-2 rounded-full transition-transform hover:scale-110 ${isLiked ? 'text-red-500' : 'text-white'}`}
                            >
                                <Heart className={`h-7 w-7 ${isLiked ? 'fill-current' : ''}`} />
                            </button>
                            
                            {/* Mute Toggle for Video */}
                            {currentWave.type === 'video' && (
                                <button
                                    onClick={() => {
                                        setIsMuted(!isMuted);
                                        if (videoRef.current) videoRef.current.muted = !isMuted;
                                    }}
                                    className="text-white hover:scale-110 transition-transform"
                                >
                                    {isMuted ? <VolumeX className="h-7 w-7" /> : <Volume2 className="h-7 w-7" />}
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Navigation Tap Areas */}
                <div className="absolute inset-0 flex z-10 pointer-events-none">
                    <div onClick={prevWave} className="w-1/3 h-full pointer-events-auto" />
                    <div className="flex-1" /> {/* Center is for pausing */}
                    <div onClick={nextWave} className="w-1/3 h-full pointer-events-auto" />
                </div>
            </div>
        </div>
    );
};

WaveViewerModal.propTypes = {
    waves: PropTypes.arrayOf(PropTypes.object).isRequired,
    initialIndex: PropTypes.number,
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
};

export default WaveViewerModal;