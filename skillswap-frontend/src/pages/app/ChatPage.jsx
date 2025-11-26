import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, Trash2, Zap } from 'lucide-react';
import { useChat } from '../../hooks/useChat';
import { useWaves } from '../../hooks/useWaves';
import useAuthStore from '../../store/authStore';
import ConversationList from '../../components/chat/ConversationList';
import ChatWindow from '../../components/chat/ChatWindow';
import WavePreview from '../../components/waves/WavePreview';
import CreateWaveModal from '../../components/waves/CreateWaveModal';
import WaveViewerModal from '../../components/waves/WaveViewerModal';
import ConfirmationModal from '../../components/common/ConfirmationModal';

const ChatPage = () => {
    const { conversationId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

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

    const {
        myWaves,
        alliesWaves,
        fetchMyWaves,
        fetchAlliesWaves,
        deleteWave,
        isWaveViewed,
    } = useWaves();

    const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const containerRef = useRef(null);

    // Waves state
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isViewerOpen, setIsViewerOpen] = useState(false);
    const [viewerWaves, setViewerWaves] = useState([]);
    const [viewerInitialIndex, setViewerInitialIndex] = useState(0);

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

    // Load waves
    useEffect(() => {
        fetchMyWaves();
        fetchAlliesWaves();

        const interval = setInterval(() => {
            fetchAlliesWaves();
        }, 5 * 60 * 1000);

        return () => clearInterval(interval);
    }, []);

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

    const handleViewWave = (wave, sourceList) => {
        const waveUserId = wave.userId?._id || wave.userId || wave.user?._id;
        const userWaves = sourceList.filter(w => {
            const currentWaveUserId = w.userId?._id || w.userId || w.user?._id;
            return currentWaveUserId === waveUserId;
        });

        setViewerWaves(userWaves);
        const index = userWaves.findIndex(w => w._id === wave._id);
        setViewerInitialIndex(index !== -1 ? index : 0);
        setIsViewerOpen(true);
    };

    const selectedConversation = conversations.find(
        (conv) => conv._id === currentConversation
    );

    // Filter active waves
    const activeMyWaves = myWaves.filter(w => new Date(w.expiresAt) > new Date());
    const activeAlliesWaves = alliesWaves.filter(w => new Date(w.expiresAt) > new Date());

    // Waves UI Component
    const WavesSection = () => (
        <div className="border-b border-white/10 bg-white/5 p-4">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <Zap className="w-4 h-4 text-[#3B82F6]" />
                    Waves
                </h3>
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="text-[#3B82F6] hover:text-[#60A5FA] transition-colors"
                >
                    <Plus className="w-5 h-5" />
                </button>
            </div>

            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide py-2">
                {/* My Waves or Add Button */}
                {activeMyWaves.length === 0 ? (
                    <div
                        onClick={() => setIsCreateModalOpen(true)}
                        className="flex-shrink-0 flex flex-col items-center cursor-pointer"
                    >
                        <div className="w-16 h-16 rounded-full border-2 border-dashed border-white/20 flex items-center justify-center bg-white/5 hover:bg-white/10 transition-colors">
                            <Plus className="w-6 h-6 text-[#8A90A2]" />
                        </div>
                        <p className="text-xs text-[#8A90A2] mt-1">Your Wave</p>
                    </div>
                ) : (
                    activeMyWaves.map((wave) => (
                        <div key={wave._id} className="relative group flex-shrink-0">
                            <WavePreview
                                wave={wave}
                                isViewed={true}
                                onClick={() => handleViewWave(wave, activeMyWaves)}
                            />
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsDeleteModalOpen(true);
                                }}
                                className="absolute top-0 right-0 p-1 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                            >
                                <Trash2 className="w-3 h-3" />
                            </button>
                        </div>
                    ))
                )}

                {/* Allies Waves */}
                {activeAlliesWaves.map((wave) => (
                    <WavePreview
                        key={wave._id}
                        wave={wave}
                        isViewed={isWaveViewed(wave._id)}
                        onClick={() => handleViewWave(wave, activeAlliesWaves)}
                    />
                ))}
            </div>
        </div>
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
                <div className="h-[calc(100vh-8rem)] bg-white/5 rounded-lg border border-white/10 overflow-hidden">
                    <WavesSection />
                    <ConversationList
                        conversations={conversations}
                        currentConversationId={currentConversation}
                        onSelectConversation={handleSelectConversation}
                        onlineUsers={onlineUsers}
                        currentUserId={user?._id}
                    />

                    {/* Modals */}
                    <CreateWaveModal
                        isOpen={isCreateModalOpen}
                        onClose={() => setIsCreateModalOpen(false)}
                    />
                    {isViewerOpen && viewerWaves.length > 0 && (
                        <WaveViewerModal
                            waves={viewerWaves}
                            initialIndex={viewerInitialIndex}
                            isOpen={isViewerOpen}
                            onClose={() => {
                                setIsViewerOpen(false);
                                setViewerWaves([]);
                            }}
                        />
                    )}
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
                        rgba(59, 130, 246, 0.08),
                        transparent 40%
                    ),
                    rgba(255, 255, 255, 0.05)
                `
            }}
        >
            {/* Conversations List */}
            <div className="w-80 border-r border-white/10 flex flex-col">
                <WavesSection />
                <div className="flex-1 overflow-hidden">
                    <ConversationList
                        conversations={conversations}
                        currentConversationId={currentConversation}
                        onSelectConversation={handleSelectConversation}
                        onlineUsers={onlineUsers}
                        currentUserId={user?._id}
                    />
                </div>
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

            {/* Modals */}
            <CreateWaveModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
            />
            {isViewerOpen && viewerWaves.length > 0 && (
                <WaveViewerModal
                    waves={viewerWaves}
                    initialIndex={viewerInitialIndex}
                    isOpen={isViewerOpen}
                    onClose={() => {
                        setIsViewerOpen(false);
                        setViewerWaves([]);
                    }}
                />
            )}
            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={() => deleteWave(wave._id)}
                title="Delete Wave"
                message="Are you sure you want to delete this wave?"
            />
        </div>
    );
};

export default ChatPage;
