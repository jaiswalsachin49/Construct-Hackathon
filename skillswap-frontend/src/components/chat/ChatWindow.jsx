import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { Send, Paperclip, ArrowLeft, MoreVertical, Phone, Video } from 'lucide-react';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';
import Button from '../common/Button';
import socketService from '../../services/socketService';
import { format, isToday, isYesterday } from 'date-fns';

const ChatWindow = ({ conversation, messages, onSendMessage, isTyping, currentUserId, onBack }) => {
    const [messageInput, setMessageInput] = useState('');
    const messagesEndRef = useRef(null);
    const textareaRef = useRef(null);

    // --- FIX: Safe Scroll Logic ---
    const scrollToBottom = () => {
        // Use requestAnimationFrame to wait for DOM render
        requestAnimationFrame(() => {
            if (messagesEndRef.current) {
                try {
                    messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
                } catch (error) {
                    // Fallback if smooth scroll fails (e.g. detached node)
                    console.warn("Scroll failed, using fallback", error);
                    if (messagesEndRef.current) {
                        messagesEndRef.current.scrollIntoView();
                    }
                }
            }
        });
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
        // Debounce logic is handled in socketService or backend usually
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

    // ... (Keep your existing header helpers) ...

    return (
        <div className="flex flex-col h-full bg-gray-50">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200 shadow-sm z-10">
                <div className="flex items-center gap-3">
                    {onBack && (
                        <button onClick={onBack} className="lg:hidden p-2 hover:bg-gray-100 rounded-full text-gray-600">
                            <ArrowLeft className="h-5 w-5" />
                        </button>
                    )}
                    
                    <div className="relative">
                        <img 
                            src={conversation?.otherUser?.profilePhoto || `https://ui-avatars.com/api/?name=${conversation?.otherUser?.name}`} 
                            className="w-10 h-10 rounded-full object-cover border border-gray-200"
                            alt=""
                        />
                        {/* Online indicator could go here */}
                    </div>
                    
                    <div>
                        <h3 className="font-bold text-gray-900 leading-none">
                            {conversation?.otherUser?.name || 'Unknown User'}
                        </h3>
                        <p className="text-xs text-green-600 font-medium mt-1">
                            {/* Placeholder for online status */}
                            Online
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-1">
                    <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
                        <Phone className="h-5 w-5" />
                    </button>
                    <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
                        <Video className="h-5 w-5" />
                    </button>
                    <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
                        <MoreVertical className="h-5 w-5" />
                    </button>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                {messages.map((msg, index) => {
                    // Date Separators
                    const showDate = index === 0 || !isSameDay(new Date(messages[index - 1].timestamp), new Date(msg.timestamp));
                    
                    return (
                        <React.Fragment key={msg._id || index}>
                            {showDate && (
                                <div className="flex justify-center my-4">
                                    <span className="bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full font-medium">
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
                
                {/* Invisible anchor for scrolling */}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-gray-200">
                <div className="flex items-end gap-2 bg-gray-50 p-2 rounded-2xl border border-gray-200 focus-within:border-blue-400 focus-within:ring-1 focus-within:ring-blue-400 transition-all">
                    <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-full transition-colors">
                        <Paperclip className="h-5 w-5" />
                    </button>
                    
                    <textarea
                        ref={textareaRef}
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        onKeyDown={handleKeyPress}
                        onInput={handleTyping}
                        placeholder="Type a message..."
                        className="flex-1 bg-transparent border-none focus:ring-0 resize-none max-h-32 py-2.5 text-gray-900 placeholder-gray-500"
                        rows={1}
                        style={{ minHeight: '44px' }}
                    />
                    
                    <Button 
                        variant="primary" 
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
    isTyping: PropTypes.bool,
    currentUserId: PropTypes.string,
    onBack: PropTypes.func
};

export default ChatWindow;