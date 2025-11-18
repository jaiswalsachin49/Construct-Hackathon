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
    const duration = currentWave?.type === 'video' ? null : 5000; // 5 seconds for photo/text

    useEffect(() => {
        if (isOpen && currentWave) {
            // Mark as viewed
            viewWave(currentWave._id).catch(console.error);
            markWaveViewed(currentWave._id);
            setProgress(0);
            setIsLiked(false);
        }
    }, [currentIndex, isOpen, currentWave]);

    useEffect(() => {
        if (!isOpen || isPaused || !duration) return;

        const startTime = Date.now();
        const interval = 50; // Update every 50ms

        timerRef.current = setInterval(() => {
            const elapsed = Date.now() - startTime;
            const newProgress = (elapsed / duration) * 100;

            if (newProgress >= 100) {
                nextWave();
            } else {
                setProgress(newProgress);
            }
        }, interval);

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, [currentIndex, isPaused, isOpen, duration]);

    useEffect(() => {
        if (!isOpen) return;

        const handleKeyPress = (e) => {
            if (e.key === 'Escape') onClose();
            else if (e.key === 'ArrowLeft') previousWave();
            else if (e.key === 'ArrowRight') nextWave();
            else if (e.key === ' ') {
                e.preventDefault();
                setIsPaused(!isPaused);
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [isOpen, isPaused, currentIndex]);

    const nextWave = () => {
        if (currentIndex < waves.length - 1) {
            setCurrentIndex(currentIndex + 1);
        } else {
            onClose();
        }
    };

    const previousWave = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
        }
    };

    const handleLike = async () => {
        if (!isLiked) {
            setIsLiked(true);
            try {
                await reactToWave(currentWave._id);
            } catch (error) {
                console.error('Failed to like wave:', error);
                setIsLiked(false);
            }
        }
    };

    const handleReply = async () => {
        try {
            const conv = await startChat(currentWave.user._id);
            navigate(`/app/chat/${conv.conversationId || conv._id}`);
            onClose();
        } catch (error) {
            console.error('Failed to start chat:', error);
        }
    };

    const getInitials = (name) => {
        if (!name) return 'U';
        return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
    };

    if (!isOpen || !currentWave) return null;

    return (
        <div className="fixed inset-0 z-50 bg-black">
            {/* Progress Bars */}
            <div className="absolute top-0 left-0 right-0 z-20 flex gap-1 p-2">
                {waves.map((_, index) => (
                    <div key={index} className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-white transition-all duration-100"
                            style={{
                                width: index < currentIndex ? '100%' : index === currentIndex ? `${progress}%` : '0%'
                            }}
                        />
                    </div>
                ))}
            </div>

            {/* Close Button */}
            <button
                onClick={onClose}
                className="absolute top-4 right-4 z-20 p-2 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
            >
                <X className="h-6 w-6 text-white" />
            </button>

            {/* Content Area - Clickable for navigation */}
            <div className="relative h-full flex">
                {/* Left side - Previous */}
                <div
                    onClick={previousWave}
                    className="w-1/3 h-full cursor-pointer"
                />

                {/* Center - Content */}
                <div className="flex-1 h-full flex flex-col justify-between">
                    <div className="flex-1 flex items-center justify-center p-4">
                        {currentWave.type === 'photo' && (
                            <img
                                src={currentWave.mediaUrl}
                                alt="Wave"
                                className="max-h-full max-w-full object-contain"
                            />
                        )}

                        {currentWave.type === 'video' && (
                            <video
                                ref={videoRef}
                                src={currentWave.mediaUrl}
                                autoPlay
                                muted={isMuted}
                                onEnded={nextWave}
                                className="max-h-full max-w-full"
                            />
                        )}

                        {currentWave.type === 'text' && (
                            <div
                                className="w-full max-w-lg aspect-[9/16] rounded-lg flex items-center justify-center p-8"
                                style={{ backgroundColor: currentWave.backgroundColor || '#3B82F6' }}
                            >
                                <p className="text-white text-3xl md:text-4xl font-bold text-center break-words">
                                    {currentWave.textContent}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Bottom Info */}
                    <div className="p-6 space-y-4 bg-gradient-to-t from-black/80 to-transparent">
                        {/* User Info */}
                        <div className="flex items-center gap-3">
                            {currentWave.user.profilePhoto ? (
                                <img
                                    src={currentWave.user.profilePhoto}
                                    alt={currentWave.user.name}
                                    className="h-10 w-10 rounded-full object-cover"
                                />
                            ) : (
                                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                                    <span className="text-white font-semibold text-sm">
                                        {getInitials(currentWave.user.name)}
                                    </span>
                                </div>
                            )}
                            <div>
                                <p className="text-white font-semibold">{currentWave.user.name}</p>
                                <p className="text-white/70 text-sm">
                                    {formatDistanceToNow(new Date(currentWave.createdAt), { addSuffix: true })}
                                </p>
                            </div>
                        </div>

                        {/* Caption */}
                        {currentWave.caption && (
                            <p className="text-white">{currentWave.caption}</p>
                        )}

                        {/* Actions */}
                        <div className="flex items-center gap-4">
                            <button
                                onClick={handleLike}
                                className="flex items-center gap-2 text-white hover:scale-110 transition-transform"
                            >
                                <Heart className={`h-6 w-6 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                            </button>

                            <button
                                onClick={handleReply}
                                className="flex items-center gap-2 text-white hover:scale-110 transition-transform"
                            >
                                <MessageCircle className="h-6 w-6" />
                            </button>

                            <button className="flex items-center gap-2 text-white hover:scale-110 transition-transform">
                                <Share2 className="h-6 w-6" />
                            </button>

                            {currentWave.type === 'video' && (
                                <button
                                    onClick={() => {
                                        setIsMuted(!isMuted);
                                        if (videoRef.current) {
                                            videoRef.current.muted = !isMuted;
                                        }
                                    }}
                                    className="ml-auto text-white hover:scale-110 transition-transform"
                                >
                                    {isMuted ? <VolumeX className="h-6 w-6" /> : <Volume2 className="h-6 w-6" />}
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right side - Next */}
                <div
                    onClick={nextWave}
                    className="w-1/3 h-full cursor-pointer"
                />
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
