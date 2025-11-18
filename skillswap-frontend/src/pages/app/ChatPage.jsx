import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useChat } from '../../hooks/useChat';
import useAuthStore from '../../store/authStore';
import ConversationList from '../../components/chat/ConversationList';
import ChatWindow from '../../components/chat/ChatWindow';

const ChatPage = () => {
    const { conversationId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuthStore();

    const {
        conversations,
        currentConversation,
        messages,
        onlineUsers,
        isTyping,
        sendMessage,
        setCurrentConversation,
    } = useChat();

    const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 1024);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        // Set conversation from URL param
        if (conversationId && conversationId !== currentConversation) {
            setCurrentConversation(conversationId);
        }
    }, [conversationId]);

    const handleSelectConversation = (convId) => {
        setCurrentConversation(convId);

        // Update URL
        if (isMobile) {
            navigate(`/app/chat/${convId}`);
        }
    };

    const handleBack = () => {
        if (isMobile) {
            navigate('/app/chat');
            setCurrentConversation(null);
        }
    };

    const selectedConversation = conversations.find(
        (conv) => conv._id === currentConversation
    );

    // Mobile: show either list or chat
    if (isMobile) {
        if (currentConversation) {
            return (
                <div className="h-[calc(100vh-8rem)]">
                    <ChatWindow
                        conversation={selectedConversation}
                        messages={messages}
                        onSendMessage={sendMessage}
                        isTyping={isTyping}
                        currentUserId={user?._id}
                        onBack={handleBack}
                    />
                </div>
            );
        } else {
            return (
                <div className="h-[calc(100vh-8rem)]">
                    <ConversationList
                        conversations={conversations}
                        currentConversationId={currentConversation}
                        onSelectConversation={handleSelectConversation}
                        onlineUsers={onlineUsers}
                        currentUserId={user?._id}
                    />
                </div>
            );
        }
    }

    // Desktop: show both panels
    return (
        <div className="h-[calc(100vh-8rem)] flex bg-white rounded-lg shadow-md overflow-hidden">
            {/* Conversations List */}
            <div className="w-80 border-r border-gray-200">
                <ConversationList
                    conversations={conversations}
                    currentConversationId={currentConversation}
                    onSelectConversation={handleSelectConversation}
                    onlineUsers={onlineUsers}
                    currentUserId={user?._id}
                />
            </div>

            {/* Chat Window */}
            <div className="flex-1">
                <ChatWindow
                    conversation={selectedConversation}
                    messages={messages}
                    onSendMessage={sendMessage}
                    isTyping={isTyping}
                    currentUserId={user?._id}
                />
            </div>
        </div>
    );
};

export default ChatPage;
