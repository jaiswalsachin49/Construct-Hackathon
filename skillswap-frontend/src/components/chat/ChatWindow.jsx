import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { Phone, Info, MoreVertical, Send, Paperclip, ArrowLeft, MessageCircle } from 'lucide-react';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';
import Button from '../common/Button';
import socketService from '../../services/socketService';
import { format, isToday, isYesterday, isSameDay } from 'date-fns';

const ChatWindow = ({ conversation, messages, onSendMessage, isTyping, currentUserId, onBack }) => {
    const [messageInput, setMessageInput] = useState('');
    const [isUserTyping, setIsUserTyping] = useState(false);
    const messagesEndRef = useRef(null);
    const messagesContainerRef = useRef(null);
    const typingTimeoutRef = useRef(null);
    const textareaRef = useRef(null);

    const otherUser = conversation?.otherUser;
    const isOnline = false;

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 128) + 'px';
        }
    }, [messageInput]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleTyping = () => {
        if (!isUserTyping && conversation) {
            setIsUserTyping(true);
            socketService.sendTyping(conversation._id, true);
        }

        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        typingTimeoutRef.current = setTimeout(() => {
            setIsUserTyping(false);
            if (conversation) {
                socketService.sendTyping(conversation._id, false);
            }
        }, 2000);
    };

    const handleSend = () => {
        if (!messageInput.trim()) return;

        onSendMessage(messageInput);
        setMessageInput('');
        setIsUserTyping(false);
        if (conversation) {
            socketService.sendTyping(conversation._id, false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const getInitials = (name) => {
        if (!name) return 'U';
        return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
    };

    const renderDateSeparator = (date) => {
        let label = '';
        if (isToday(date)) {
            label = 'Today';
        } else if (isYesterday(date)) {
            label = 'Yesterday';
        } else {
            label = format(date, 'MMMM d, yyyy');
        }

        return (
            <div className="flex items-center justify-center my-4">
                <div className="bg-gray-200 text-gray-600 text-xs font-medium px-3 py-1 rounded-full">
                    {label}
                </div>
            </div>
        );
    };

    const groupedMessages = messages.reduce((acc, message, index) => {
        const messageDate = new Date(message.timestamp);
        const prevMessage = messages[index - 1];
        const prevDate = prevMessage ? new Date(prevMessage.timestamp) : null;

        if (!prevDate || !isSameDay(messageDate, prevDate)) {
            acc.push({ type: 'date', date: messageDate });
        }

        const nextMessage = messages[index + 1];
        const showAvatar = !nextMessage || nextMessage.senderId !== message.senderId;

        acc.push({ type: 'message', message, showAvatar });
        return acc;
    }, []);

    if (!conversation) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 p-8">
                <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-gray-100 mb-4">
                    <MessageCircle className="h-10 w-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Select a conversation</h3>
                <p className="text-gray-600 text-center max-w-sm">
                    Choose a conversation from the list to start messaging
                </p>
            </div>
        );
    }

    const someoneTyping = Object.entries(isTyping).find(
        ([userId, typing]) => typing && userId !== currentUserId
    );

    return (
        <div className="flex-1 flex flex-col h-full bg-white">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
                <div className="flex items-center gap-3">
                    {onBack && (
                        <button onClick={onBack} className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors">
                            <ArrowLeft className="h-5 w-5 text-gray-600" />
                        </button>
                    )}

                    <div className="relative">
                        {otherUser?.profilePhoto ? (
                            <img src={otherUser.profilePhoto} alt={otherUser.name} className="h-10 w-10 rounded-full object-cover" />
                        ) : (
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                                <span className="text-white font-semibold text-sm">{getInitials(otherUser?.name)}</span>
                            </div>
                        )}
                        {isOnline && <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 border-2 border-white rounded-full" />}
                    </div>

                    <div>
                        <h3 className="font-semibold text-gray-900">{otherUser?.name || 'Unknown User'}</h3>
                        <p className="text-sm text-gray-500">{isOnline ? '• Online' : 'Offline'}</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors"><Phone className="h-5 w-5 text-gray-600" /></button>
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors"><Info className="h-5 w-5 text-gray-600" /></button>
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors"><MoreVertical className="h-5 w-5 text-gray-600" /></button>
                </div>
            </div>

            <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 bg-gray-50">
                {groupedMessages.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                        <p className="text-gray-500">No messages yet. Start the conversation!</p>
                    </div>
                ) : (
                    <>
                        {groupedMessages.map((item, index) => {
                            if (item.type === 'date') {
                                return <div key={'date-' + index}>{renderDateSeparator(item.date)}</div>;
                            } else {
                                const message = item.message;
                                const isSent = message.senderId === currentUserId;
                                return <MessageBubble key={message._id} message={message} isSent={isSent} showAvatar={item.showAvatar && !isSent} otherUser={otherUser} />;
                            }
                        })}
                        {someoneTyping && <TypingIndicator userName={otherUser?.name || 'User'} />}
                        <div ref={messagesEndRef} />
                    </>
                )}
            </div>

            <div className="p-4 border-t border-gray-200 bg-white">
                <div className="flex items-end gap-2">
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0">
                        <Paperclip className="h-5 w-5 text-gray-600" />
                    </button>
                    <textarea ref={textareaRef} value={messageInput} onChange={(e) => { setMessageInput(e.target.value); handleTyping(); }} onKeyPress={handleKeyPress} placeholder="Type a message..." rows={1} className="flex-1 resize-none px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 max-h-32" />
                    <Button variant="primary" onClick={handleSend} disabled={!messageInput.trim()} className="flex-shrink-0">
                        <Send className="h-5 w-5" />
                    </Button>
                </div>
            </div>
        </div>
    );
};

ChatWindow.propTypes = {
    conversation: PropTypes.shape({ _id: PropTypes.string.isRequired, otherUser: PropTypes.shape({ _id: PropTypes.string, name: PropTypes.string, profilePhoto: PropTypes.string }) }),
    messages: PropTypes.array.isRequired,
    onSendMessage: PropTypes.func.isRequired,
    isTyping: PropTypes.object,
    currentUserId: PropTypes.string.isRequired,
    onBack: PropTypes.func
};

export default ChatWindow;
