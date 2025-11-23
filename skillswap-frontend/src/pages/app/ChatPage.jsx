import React, { useState, useEffect, useRef } from 'react';
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
        deleteConversation,
        blockUser,
    } = useChat();

    const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const containerRef = useRef(null);

    const handleMouseMove = (e) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        setMousePosition({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        });
    };

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
                        onlineUsers={onlineUsers}
                        onDeleteConversation={deleteConversation}
                        onBlockUser={blockUser}
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
        <div
            ref={containerRef}
            onMouseMove={handleMouseMove}
            className="h-[calc(100vh-8rem)] flex bg-white/5 rounded-lg shadow-md overflow-hidden border border-white/10 backdrop-blur-xl relative group"
            style={{
                background: `
                    radial-gradient(
                        400px circle at ${mousePosition.x}px ${mousePosition.y}px, 
                        rgba(0, 196, 255, 0.08),
                        transparent 40%
                    ),
                    rgba(255, 255, 255, 0.05)
                `
            }}
        >
            {/* Conversations List */}
            <div className="w-80 border-r border-white/10">
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
                    onlineUsers={onlineUsers}
                    onDeleteConversation={deleteConversation}
                    onBlockUser={blockUser}
                />
            </div>
        </div>
    );
};

export default ChatPage;
