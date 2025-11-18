import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { MapPin, Star } from 'lucide-react';
import Button from '../common/Button';

const UserCard = ({ user, onConnect, onViewProfile }) => {
    const [isConnecting, setIsConnecting] = useState(false);
    const [isConnected, setIsConnected] = useState(false);

    const handleConnect = async () => {
        setIsConnecting(true);
        try {
            await onConnect(user._id);
            setIsConnected(true);
        } catch (error) {
            console.error('Failed to connect:', error);
        } finally {
            setIsConnecting(false);
        }
    };

    const getInitials = (name) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const formatDistance = (distance) => {
        if (distance < 1) {
            return `${Math.round(distance * 1000)}m away`;
        }
        return `${distance.toFixed(1)} km away`;
    };

    const getMatchColor = (score) => {
        if (score >= 80) return 'text-green-600 bg-green-50';
        if (score >= 60) return 'text-yellow-600 bg-yellow-50';
        return 'text-gray-600 bg-gray-50';
    };

    return (
        <div
            className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer overflow-hidden"
            onClick={() => onViewProfile(user._id)}
        >
            <div className="p-6">
                {/* Profile Photo */}
                <div className="flex justify-center mb-4">
                    {user.profilePhoto ? (
                        <img
                            src={user.profilePhoto}
                            alt={user.name}
                            className="h-24 w-24 rounded-full object-cover border-2 border-white shadow-lg"
                        />
                    ) : (
                        <div className="h-24 w-24 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center border-2 border-white shadow-lg">
                            <span className="text-3xl font-bold text-white">
                                {getInitials(user.name)}
                            </span>
                        </div>
                    )}
                </div>

                {/* User Info */}
                <div className="text-center mb-4">
                    <h3 className="text-xl font-bold text-gray-900 mb-1">{user.name}</h3>
                    <div className="flex items-center justify-center gap-1 text-sm text-gray-600 mb-1">
                        <MapPin className="h-4 w-4" />
                        <span>{user.distance ? formatDistance(user.distance) : 'Nearby'}</span>
                    </div>
                    {user.areaLabel && (
                        <p className="text-sm text-gray-500">{user.areaLabel}</p>
                    )}
                </div>

                {/* Match Score */}
                {user.matchScore !== undefined && (
                    <div className="mb-4 flex justify-center">
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getMatchColor(user.matchScore)}`}>
                            {user.matchScore}% Match
                        </span>
                    </div>
                )}

                {/* Skills - Can Teach */}
                {user.teachTags && user.teachTags.length > 0 && (
                    <div className="mb-3">
                        <p className="text-xs font-semibold text-gray-700 mb-2">Can Teach:</p>
                        <div className="flex flex-wrap gap-1.5">
                            {user.teachTags.slice(0, 3).map((tag, index) => (
                                <span
                                    key={index}
                                    className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium"
                                >
                                    {tag}
                                </span>
                            ))}
                            {user.teachTags.length > 3 && (
                                <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                                    +{user.teachTags.length - 3} more
                                </span>
                            )}
                        </div>
                    </div>
                )}

                {/* Skills - Wants to Learn */}
                {user.learnTags && user.learnTags.length > 0 && (
                    <div className="mb-4">
                        <p className="text-xs font-semibold text-gray-700 mb-2">Wants to Learn:</p>
                        <div className="flex flex-wrap gap-1.5">
                            {user.learnTags.slice(0, 3).map((tag, index) => (
                                <span
                                    key={index}
                                    className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium"
                                >
                                    {tag}
                                </span>
                            ))}
                            {user.learnTags.length > 3 && (
                                <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                                    +{user.learnTags.length - 3} more
                                </span>
                            )}
                        </div>
                    </div>
                )}

                {/* Rating */}
                {user.rating && (
                    <div className="flex items-center justify-center gap-2 mb-4 text-sm">
                        <div className="flex items-center gap-1 text-yellow-500">
                            <Star className="h-4 w-4 fill-current" />
                            <span className="font-semibold text-gray-900">{user.rating.average || 0}</span>
                        </div>
                        <span className="text-gray-500">({user.rating.count || 0} reviews)</span>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                    <Button
                        variant={isConnected ? 'secondary' : 'primary'}
                        size="sm"
                        className="flex-1"
                        onClick={handleConnect}
                        isLoading={isConnecting}
                        disabled={isConnected || isConnecting}
                    >
                        {isConnected ? 'Connected ✓' : 'Connect'}
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="flex-1"
                        onClick={() => onViewProfile(user._id)}
                    >
                        View
                    </Button>
                </div>
            </div>
        </div>
    );
};

UserCard.propTypes = {
    user: PropTypes.shape({
        _id: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        profilePhoto: PropTypes.string,
        distance: PropTypes.number,
        areaLabel: PropTypes.string,
        teachTags: PropTypes.arrayOf(PropTypes.string),
        learnTags: PropTypes.arrayOf(PropTypes.string),
        rating: PropTypes.shape({
            average: PropTypes.number,
            count: PropTypes.number,
        }),
        matchScore: PropTypes.number,
    }).isRequired,
    onConnect: PropTypes.func.isRequired,
    onViewProfile: PropTypes.func.isRequired,
};

export default UserCard;
