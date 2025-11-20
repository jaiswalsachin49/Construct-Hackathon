import React from 'react';
import PropTypes from 'prop-types';
import { Check, CheckCheck } from 'lucide-react';
import { format, isToday, isYesterday } from 'date-fns';

const MessageBubble = ({ message, isSent, showAvatar = false, otherUser }) => {
    const formatTimestamp = (timestamp) => {
        if (!timestamp) return '';

        try {
            const date = new Date(timestamp);
            if (isToday(date)) {
                return format(date, 'h:mm a');
            } else if (isYesterday(date)) {
                return 'Yesterday ' + format(date, 'h:mm a');
            } else {
                return format(date, 'MMM d, h:mm a');
            }
        } catch (e) {
            return '';
        }
    };

    const getInitials = (name) => {
        if (!name) return 'U';
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const renderReadReceipt = () => {
        if (!isSent) return null;

        if (message.read) {
            return <CheckCheck className="h-4 w-4 text-pink-500" />;
        } else if (message.delivered) {
            return <CheckCheck className="h-4 w-4 text-gray-400" />;
        } else if (message.pending) {
            return <Check className="h-4 w-4 text-gray-400" />;
        } else {
            return <Check className="h-4 w-4 text-gray-400" />;
        }
    };

    return (
        <div className={`flex items-end gap-2 mb-4 ${isSent ? 'flex-row-reverse' : 'flex-row'}`}>
            {/* Avatar (only for received messages if showAvatar) */}
            {!isSent && showAvatar && (
                <div className="flex-shrink-0">
                    {otherUser?.profilePhoto ? (
                        <img
                            src={otherUser.profilePhoto}
                            alt={otherUser.name}
                            className="h-8 w-8 rounded-full object-cover"
                        />
                    ) : (
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center">
                            <span className="text-xs text-white font-semibold">
                                {getInitials(otherUser?.name)}
                            </span>
                        </div>
                    )}
                </div>
            )}

            {/* Spacer when no avatar */}
            {!isSent && !showAvatar && <div className="w-8" />}

            {/* Message Bubble */}
            <div className={`flex flex-col ${isSent ? 'items-end' : 'items-start'} max-w-[70%]`}>
                <div
                    className={`
            px-4 py-2 rounded-2xl break-words
            ${isSent
                            ? 'bg-pink-600 text-white rounded-br-sm'
                            : 'bg-gray-200 text-gray-900 rounded-bl-sm'
                        }
            ${message.pending ? 'opacity-70' : ''}
          `}
                >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>

                {/* Timestamp and Read Receipt */}
                <div className={`flex items-center gap-1 mt-1 px-1 ${isSent ? 'flex-row-reverse' : 'flex-row'}`}>
                    <span className="text-xs text-gray-500">
                        {formatTimestamp(message.timestamp)}
                    </span>
                    {isSent && renderReadReceipt()}
                </div>
            </div>
        </div>
    );
};

MessageBubble.propTypes = {
    message: PropTypes.shape({
        _id: PropTypes.string.isRequired,
        content: PropTypes.string.isRequired,
        senderId: PropTypes.string.isRequired,
        timestamp: PropTypes.string,
        read: PropTypes.bool,
        delivered: PropTypes.bool,
        pending: PropTypes.bool,
    }).isRequired,
    isSent: PropTypes.bool.isRequired,
    showAvatar: PropTypes.bool,
    otherUser: PropTypes.shape({
        name: PropTypes.string,
        profilePhoto: PropTypes.string,
    }),
};

export default MessageBubble;