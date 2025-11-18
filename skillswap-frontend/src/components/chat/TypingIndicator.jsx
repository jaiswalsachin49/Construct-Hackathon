import React from 'react';
import PropTypes from 'prop-types';

const TypingIndicator = ({ userName }) => {
    return (
        <div className="flex items-end gap-2 mb-4">
            <div className="w-8" /> {/* Spacer for alignment */}
            <div className="flex flex-col items-start">
                <div className="px-4 py-3 bg-gray-200 rounded-2xl rounded-bl-sm">
                    <div className="flex gap-1">
                        <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                </div>
                <span className="text-xs text-gray-500 mt-1 px-1">
                    {userName} is typing...
                </span>
            </div>
        </div>
    );
};

TypingIndicator.propTypes = {
    userName: PropTypes.string.isRequired,
};

export default TypingIndicator;
