import React from 'react';
import PropTypes from 'prop-types';
import { formatDistanceToNow } from 'date-fns';

const WavePreview = ({ wave, onClick, isViewed }) => {
    const getInitials = (name) => {
        if (!name) return 'U';
        return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
    };

    const getTimeRemaining = (createdAt) => {
        const created = new Date(createdAt);
        const now = new Date();
        const diff = now - created;
        const hours = Math.floor(diff / (1000 * 60 * 60));

        if (hours < 1) {
            return 'Just now';
        } else if (hours < 24) {
            return `${hours}h ago`;
        } else {
            return 'Expired';
        }
    };

    const getThumbnail = () => {
        if (wave.type === 'photo' && wave.mediaUrl) {
            return wave.mediaUrl;
        } else if (wave.type === 'video' && wave.thumbnailUrl) {
            return wave.thumbnailUrl;
        } else if (wave.type === 'text') {
            return null; // Will show text content
        }
        return wave.user?.profilePhoto;
    };

    const thumbnail = getThumbnail();

    return (
        <div
            onClick={onClick}
            className="flex flex-col items-center cursor-pointer group"
        >
            <div className="relative">
                {/* Ring */}
                <div className={`absolute inset-0 rounded-full ${isViewed ? 'bg-gray-300' : 'bg-gradient-to-tr from-blue-500 via-purple-500 to-pink-500'
                    } p-0.5`}>
                    <div className="h-full w-full bg-white rounded-full" />
                </div>

                {/* Avatar/Content */}
                <div className="relative h-20 w-20 rounded-full overflow-hidden bg-gray-100 border-4 border-white">
                    {thumbnail ? (
                        <img
                            src={thumbnail}
                            alt={wave.user?.name}
                            className={`h-full w-full object-cover ${isViewed ? 'filter grayscale opacity-60' : ''
                                }`}
                        />
                    ) : wave.type === 'text' ? (
                        <div
                            className={`h-full w-full flex items-center justify-center text-white text-xs font-bold ${isViewed ? 'filter grayscale opacity-60' : ''
                                }`}
                            style={{ backgroundColor: wave.backgroundColor || '#3B82F6' }}
                        >
                            Aa
                        </div>
                    ) : (
                        <div className="h-full w-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                            <span className="text-white font-semibold text-lg">
                                {getInitials(wave.user?.name)}
                            </span>
                        </div>
                    )}

                    {/* Plus icon for unviewed */}
                    {!isViewed && (
                        <div className="absolute bottom-0 right-0 h-5 w-5 bg-blue-600 rounded-full border-2 border-white flex items-center justify-center">
                            <span className="text-white text-xs font-bold">+</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Name */}
            <p className="text-xs font-medium text-gray-900 mt-2 text-center truncate w-20">
                {wave.user?.name || 'Unknown'}
            </p>

            {/* Time */}
            <p className="text-xs text-gray-500 text-center">
                {getTimeRemaining(wave.createdAt)}
            </p>
        </div>
    );
};

WavePreview.propTypes = {
    wave: PropTypes.shape({
        _id: PropTypes.string.isRequired,
        user: PropTypes.shape({
            _id: PropTypes.string,
            name: PropTypes.string,
            profilePhoto: PropTypes.string,
        }).isRequired,
        mediaUrl: PropTypes.string,
        thumbnailUrl: PropTypes.string,
        type: PropTypes.string.isRequired,
        backgroundColor: PropTypes.string,
        createdAt: PropTypes.string.isRequired,
    }).isRequired,
    onClick: PropTypes.func.isRequired,
    isViewed: PropTypes.bool,
};

export default WavePreview;
