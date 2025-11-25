import React, { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { MapPin, Star, Sparkles } from 'lucide-react';
import Button from '../common/Button';

const UserCard = ({ user, onConnect, onViewProfile }) => {
    const [isConnecting, setIsConnecting] = useState(false);
    const cardRef = useRef(null);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    // State to track the button status: 'none', 'pending', 'connected'
    const [status, setStatus] = useState('none');

    const handleConnect = async (e) => {
        e.stopPropagation(); // Prevent card click
        setIsConnecting(true);
        try {
            await onConnect(user._id);
            setStatus('pending'); // Change button to "Request Sent"
        } catch (error) {
            console.error('Failed to connect:', error);
        } finally {
            setIsConnecting(false);
        }
    };

    const handleMouseMove = (e) => {
        if (!cardRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();
        setMousePosition({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        });
    };

    const getInitials = (name) => {
        if (!name) return 'U';
        return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
    };

    const formatDistance = (distance) => {
        if (!distance) return 'Nearby';
        if (distance < 1) return `${Math.round(distance * 1000)}m away`;
        return `${distance.toFixed(1)} km away`;
    };

    const getMatchColor = (score) => {
        if (score >= 80) return 'text-[#60A5FA] bg-[#60A5FA]/10 border-[#60A5FA]/20';
        if (score >= 60) return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
        return 'text-[#8A90A2] bg-white/5 border-white/10';
    };

    const matchReason = user.matchReason || (user.matchScore >= 80 ? "High compatibility!" : null);

    return (
        <div
            ref={cardRef}
            onMouseMove={handleMouseMove}
            className="bg-white/5 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer overflow-hidden border border-white/10 flex flex-col h-full backdrop-blur-sm relative group"
            onClick={() => onViewProfile(user._id)}
            style={{
                '--mouse-x': `${mousePosition.x}px`,
                '--mouse-y': `${mousePosition.y}px`,
            }}
        >
            {/* Glow Effect */}
            <div
                className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-0"
                style={{
                    background: `radial-gradient(600px circle at var(--mouse-x) var(--mouse-y), rgba(0, 196, 255, 0.15), transparent 40%)`,
                }}
            />
            <div className="p-5 flex flex-col h-full">
                {/* Header */}
                <div className="flex items-start gap-4 mb-4">
                    <div className="flex-shrink-0">
                        {user.profilePhoto ? (
                            <img
                                src={user.profilePhoto}
                                alt={user.name}
                                className="h-16 w-16 rounded-full object-cover border border-white/10"
                            />
                        ) : (
                            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-[#2563EB] to-[#3B82F6] flex items-center justify-center text-white font-bold text-xl">
                                {getInitials(user.name)}
                            </div>
                        )}
                    </div>

                    <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-white truncate">{user.name}</h3>
                        <div className="flex items-center gap-1 text-sm text-[#8A90A2]">
                            <MapPin className="h-3.5 w-3.5" />
                            <span className="truncate">{user.areaLabel || formatDistance(user.distance)}</span>
                        </div>
                        {user.rating && user.rating.count > 0 && (
                            <div className="flex items-center gap-1 mt-1">
                                <Star className="h-3.5 w-3.5 text-yellow-400 fill-current" />
                                <span className="text-sm font-medium text-[#E6E9EF]">{user.rating.average}</span>
                                <span className="text-xs text-[#8A90A2]">({user.rating.count})</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Match Reason */}
                {matchReason && (
                    <div className="mb-4 px-3 py-2 bg-gradient-to-r from-[#3B82F6]/10 to-[#2563EB]/10 rounded-lg border border-[#3B82F6]/20 flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-[#3B82F6] flex-shrink-0" />
                        <p className="text-xs font-medium text-[#3B82F6] line-clamp-1">
                            {matchReason}
                        </p>
                    </div>
                )}

                {/* Score Badge */}
                {user.matchScore !== undefined && !matchReason && (
                    <div className="mb-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getMatchColor(user.matchScore)}`}>
                            {Math.round(user.matchScore)}% Match
                        </span>
                    </div>
                )}

                {/* Skills */}
                <div className="flex-1 space-y-3 mb-4">
                    {user.teachTags?.length > 0 && (
                        <div>
                            <p className="text-[10px] uppercase tracking-wider text-[#8A90A2] font-semibold mb-1.5">Teaches</p>
                            <div className="flex flex-wrap gap-1.5">
                                {user.teachTags.slice(0, 3).map((tag, i) => (
                                    <span key={i} className="px-2 py-0.5 bg-[#3B82F6]/10 text-[#3B82F6] border border-[#3B82F6]/20 rounded text-xs font-medium">
                                        {tag.name || tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-auto" onClick={(e) => e.stopPropagation()}>
                    <Button
                        variant={status === 'none' ? 'warm' : 'secondary'}
                        size="sm"
                        className="flex-1"
                        onClick={handleConnect}
                        isLoading={isConnecting}
                        disabled={status !== 'none' || isConnecting}
                    >
                        {status === 'pending' ? 'Request Sent' : status === 'connected' ? 'Connected' : 'Connect'}
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="flex-1"
                        onClick={() => onViewProfile(user._id)}
                    >
                        Profile
                    </Button>
                </div>
            </div>
        </div>
    );
};

UserCard.propTypes = {
    user: PropTypes.object.isRequired,
    onConnect: PropTypes.func.isRequired,
    onViewProfile: PropTypes.func.isRequired,
};

export default UserCard;