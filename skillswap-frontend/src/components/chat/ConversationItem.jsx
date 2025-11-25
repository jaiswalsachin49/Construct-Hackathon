import React from 'react';
import PropTypes from 'prop-types';
import { formatDistanceToNow } from 'date-fns';

import { useNavigate } from 'react-router-dom';

const ConversationItem = ({ conversation, isActive, onClick, onlineUsers, currentUserId }) => {
    const navigate = useNavigate();

    const getInitials = (name) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const formatTimestamp = (timestamp) => {
        if (!timestamp) return '';

        try {
            const date = new Date(timestamp);
            const now = new Date();
            const diffInHours = (now - date) / (1000 * 60 * 60);

            if (diffInHours < 1) {
                return formatDistanceToNow(date, { addSuffix: false }) + ' ago';
            } else if (diffInHours < 24) {
                return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
            } else if (diffInHours < 48) {
                return 'Yesterday';
            } else {
                return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            }
        } catch (e) {
            return '';
        }
    };

    const truncateText = (text, maxLength = 50) => {
        if (!text) return '';
        return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
    };

    const otherUser = conversation.otherUser;
    const lastMessage = conversation.lastMessage;
    const unreadCount = conversation.unreadCount || 0;
    const isOnline = onlineUsers.includes(otherUser?._id);
    const isSentByMe = lastMessage?.senderId === currentUserId;

    return (
        <div
            onClick={onClick}
            className={`
        flex items-center gap-3 p-4 cursor-pointer transition-colors border-b border-white/5
        ${isActive ? 'bg-white/10 border-l-4 border-[#3B82F6]' : 'hover:bg-white/5 border-l-4 border-transparent'}
        ${unreadCount > 0 ? 'bg-white/5' : ''}
      `}
        >
            {/* Avatar */}
            <div
                className="relative flex-shrink-0 z-10"
                onClick={(e) => {
                    e.stopPropagation();
                }}
            >
                <div
                    onClick={(e) => {
                        e.stopPropagation();
                        if (otherUser?._id) {
                            navigate(`/app/profile/${otherUser._id}`);
                        }
                    }}
                    className="cursor-pointer hover:opacity-80 transition-opacity"
                >
                    {otherUser?.profilePhoto ? (
                        <img
                            src={otherUser.profilePhoto}
                            alt={otherUser.name}
                            className="h-12 w-12 rounded-full object-cover"
                        />
                    ) : (
                        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-pink-500 to-pink-600 flex items-center justify-center">
                            <span className="text-white font-semibold">
                                {getInitials(otherUser?.name || 'U')}
                            </span>
                        </div>
                    )}
                </div>
                {/* Online Indicator */}
                {isOnline && (
                    <div className="absolute bottom-0 right-0 h-3 w-3 bg-[#60A5FA] border-2 border-[#101726] rounded-full pointer-events-none" />
                )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                    <h3 className={`font-semibold truncate ${unreadCount > 0 ? 'text-white font-bold' : 'text-[#E6E9EF]'
                        }`}>
                        {otherUser?.name || 'Unknown User'}
                    </h3>
                    <span className="text-xs text-[#8A90A2] ml-2 flex-shrink-0">
                        {formatTimestamp(lastMessage?.timestamp)}
                    </span>
                </div>
                <div className="flex items-center justify-between">
                    <p className={`text-sm truncate ${unreadCount > 0 ? 'text-white font-medium' : 'text-[#8A90A2]'
                        }`}>
                        {isSentByMe && 'You: '}
                        {truncateText(lastMessage?.content || 'No messages yet')}
                    </p>
                    {/* Unread Badge */}
                    {unreadCount > 0 && (
                        <span className="ml-2 flex-shrink-0 inline-flex items-center justify-center h-5 min-w-[20px] px-1.5 bg-[#3B82F6] text-black text-xs font-bold rounded-full">
                            {unreadCount}
                        </span>
                    )}
                </div>
            </div>
        </div >
    );
};

ConversationItem.propTypes = {
    conversation: PropTypes.shape({
        _id: PropTypes.string.isRequired,
        otherUser: PropTypes.shape({
            _id: PropTypes.string,
            name: PropTypes.string,
            profilePhoto: PropTypes.string,
        }),
        lastMessage: PropTypes.shape({
            content: PropTypes.string,
            senderId: PropTypes.string,
            timestamp: PropTypes.string,
        }),
        unreadCount: PropTypes.number,
    }).isRequired,
    isActive: PropTypes.bool,
    onClick: PropTypes.func.isRequired,
    onlineUsers: PropTypes.array,
    currentUserId: PropTypes.string,
};

export default ConversationItem;