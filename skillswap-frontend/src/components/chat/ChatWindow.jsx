import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Send, Paperclip, ArrowLeft, MoreVertical, Phone, Video, RefreshCw, Trash2, Ban } from 'lucide-react';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';
import Button from '../common/Button';
import socketService from '../../services/socketService';
import { format, isToday, isYesterday } from 'date-fns';

const ChatWindow = ({ conversation, messages, onSendMessage, isTyping, currentUserId, onBack, onlineUsers = [], onDeleteConversation, onBlockUser }) => {
    const navigate = useNavigate();
    const [messageInput, setMessageInput] = useState('');
    const [showMenu, setShowMenu] = useState(false);
    const messageContainerRef = useRef(null);
    const textareaRef = useRef(null);
    const typingTimeoutRef = useRef(null);

    // ... (rest of the component)



    // --- FIX: Safe Scroll Logic ---
    const scrollToBottom = () => {
        if (messageContainerRef.current) {
            const { scrollHeight, clientHeight } = messageContainerRef.current;
            messageContainerRef.current.scrollTop = scrollHeight - clientHeight;
        }
    };

    // Scroll on new messages
    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);
    // -----------------------------

    const handleSend = () => {
        if (!messageInput.trim()) return;
        onSendMessage(messageInput);
        setMessageInput('');

        // Reset height
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
        }
    };

    const handleTyping = () => {
        socketService.sendTyping(conversation._id, true);

        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        typingTimeoutRef.current = setTimeout(() => {
            socketService.sendTyping(conversation._id, false);
        }, 2000);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    // Determine if the other user in this conversation is typing.
    const otherUserId = conversation?.otherUser?._id || conversation?.otherUser?.id;
    const otherIsTyping = Boolean(otherUserId && isTyping && (isTyping[otherUserId] === true));
    const isOnline = onlineUsers.includes(otherUserId);

    // ... (Keep your existing header helpers) ...

    if (!conversation) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-transparent">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                    <Send className="h-8 w-8 text-[#8A90A2]" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Select a user to start chatting</h3>
                <p className="text-[#8A90A2] max-w-md">
                    Choose a conversation from the list or start a new one to connect with other users.
                </p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-transparent">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-white/5 border-b border-white/10 shadow-sm z-10 backdrop-blur-xl">
                <div className="flex items-center gap-3">
                    {onBack && (
                        <button onClick={onBack} className="lg:hidden p-2 hover:bg-white/10 rounded-full text-[#8A90A2]">
                            <ArrowLeft className="h-5 w-5" />
                        </button>
                    )}

                    <div className="relative">
                        <div
                            onClick={() => {
                                if (conversation?.otherUser?._id) {
                                    navigate(`/app/profile/${conversation.otherUser._id}`);
                                }
                            }}
                            className="cursor-pointer hover:opacity-80 transition-opacity"
                        >
                            <img
                                src={conversation?.otherUser?.profilePhoto || `https://ui-avatars.com/api/?name=${conversation?.otherUser?.name}`}
                                className="w-10 h-10 rounded-full object-cover border border-white/10"
                                alt=""
                            />
                        </div>
                        {/* Online indicator could go here */}
                    </div>

                    <div>
                        <h3 className="font-bold text-white leading-none">
                            {conversation?.otherUser?.name || 'Unknown User'}
                        </h3>
                        <p className={`text-xs font-medium mt-1 ${isOnline ? 'text-[#00F5A0]' : 'text-[#8A90A2]'}`}>
                            {isOnline ? 'Online' : 'Offline'}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-1">
                    <button
                        onClick={() => alert("Audio calls coming soon!")}
                        className="p-2 text-[#8A90A2] hover:bg-white/10 rounded-full transition-colors"
                        title="Audio Call"
                    >
                        <Phone className="h-5 w-5" />
                    </button>
                    <button
                        onClick={() => alert("Video calls coming soon!")}
                        className="p-2 text-[#8A90A2] hover:bg-white/10 rounded-full transition-colors"
                        title="Video Call"
                    >
                        <Video className="h-5 w-5" />
                    </button>
                    <button
                        onClick={() => window.location.reload()}
                        className="p-2 text-[#8A90A2] hover:bg-white/10 rounded-full transition-colors"
                        title="Refresh Chat"
                    >
                        <RefreshCw className="h-5 w-5" />
                    </button>
                    <div className="relative">
                        <button
                            onClick={() => setShowMenu(!showMenu)}
                            className="p-2 text-[#8A90A2] hover:bg-white/10 rounded-full transition-colors"
                        >
                            <MoreVertical className="h-5 w-5" />
                        </button>

                        {showMenu && (
                            <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-50">
                                <button
                                    onClick={() => {
                                        if (window.confirm('Are you sure you want to delete this conversation?')) {
                                            onDeleteConversation(conversation._id);
                                        }
                                        setShowMenu(false);
                                    }}
                                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                >
                                    <Trash2 className="h-4 w-4" />
                                    Delete Conversation
                                </button>
                                <button
                                    onClick={() => {
                                        if (window.confirm('Block this user?')) {
                                            onBlockUser(conversation.otherUser._id);
                                        }
                                        setShowMenu(false);
                                    }}
                                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                >
                                    <Ban className="h-4 w-4" />
                                    Block User
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Messages Area */}
            <div
                ref={messageContainerRef}
                className="flex-1 overflow-y-auto p-4 space-y-4 bg-transparent"
            >
                {messages.map((msg, index) => {
                    // Date Separators
                    const showDate = index === 0 || !isSameDay(new Date(messages[index - 1].timestamp), new Date(msg.timestamp));

                    return (
                        <React.Fragment key={msg._id || index}>
                            {showDate && (
                                <div className="flex justify-center my-4">
                                    <span className="bg-white/10 text-[#8A90A2] text-xs px-3 py-1 rounded-full font-medium">
                                        {formatDateSeparator(msg.timestamp)}
                                    </span>
                                </div>
                            )}
                            <MessageBubble
                                message={msg}
                                isSent={msg.senderId === currentUserId}
                            />
                        </React.Fragment>
                    );
                })}

                {otherIsTyping && conversation?.otherUser?.name && (
                    <TypingIndicator userName={conversation.otherUser.name} />
                )}
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white/5 border-t border-white/10 backdrop-blur-xl">
                <div className="flex items-end gap-2 bg-[#101726] p-2 rounded-2xl border border-white/10 focus-within:border-[#00C4FF] focus-within:ring-1 focus-within:ring-[#00C4FF] transition-all">
                    <button className="p-2 text-[#8A90A2] hover:text-white hover:bg-white/10 rounded-full transition-colors">
                        <Paperclip className="h-5 w-5" />
                    </button>

                    <textarea
                        ref={textareaRef}
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        onKeyDown={handleKeyPress}
                        onInput={handleTyping}
                        placeholder="Type a message..."
                        className="flex-1 bg-transparent border-none focus:ring-0 resize-none max-h-32 py-2.5 text-white placeholder-[#8A90A2]"
                        rows={1}
                        style={{ minHeight: '44px', outline: 'none' }}
                    />

                    <Button
                        variant="warm"
                        onClick={handleSend}
                        disabled={!messageInput.trim()}
                        className={`rounded-xl transition-all ${!messageInput.trim() ? 'opacity-50' : ''}`}
                    >
                        <Send className="h-5 w-5" />
                    </Button>
                </div>
            </div>
        </div>
    );
};

// Helpers
const isSameDay = (d1, d2) => {
    return d1.getDate() === d2.getDate() && d1.getMonth() === d2.getMonth() && d1.getFullYear() === d2.getFullYear();
};

const formatDateSeparator = (dateString) => {
    const date = new Date(dateString);
    if (isToday(date)) return 'Today';
    if (isYesterday(date)) return 'Yesterday';
    return format(date, 'MMMM d, yyyy');
};

ChatWindow.propTypes = {
    conversation: PropTypes.object,
    messages: PropTypes.array.isRequired,
    onSendMessage: PropTypes.func.isRequired,
    isTyping: PropTypes.object,
    currentUserId: PropTypes.string,
    onBack: PropTypes.func,
    onlineUsers: PropTypes.array,
    onDeleteConversation: PropTypes.func,
    onBlockUser: PropTypes.func
};

export default ChatWindow;