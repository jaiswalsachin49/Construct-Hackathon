import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send } from 'lucide-react';
import socketService from '../../services/socketService';
import useCommunityStore from '../../store/communityStore';
import useAuthStore from '../../store/authStore';
import { getCommunityMessages } from '../../services/communityService';

const CommunityChat = ({ communityId, community }) => {
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef(null);

  const { user } = useAuthStore();
  const { communityMessages, addCommunityMessage } = useCommunityStore();
  const messages = communityMessages[communityId] || [];

  // Check if user is a member
  const isMember = community?.members?.some(m => m.userId?._id === user?._id || m.userId === user?._id);

  useEffect(() => {
    // Only connect if user is a member
    if (isMember) {
      // Fetch historical messages
      const fetchMessages = async () => {
        try {
          const data = await getCommunityMessages(communityId);
          if (data.success) {
            useCommunityStore.getState().setCommunityMessages(communityId, data.messages);
          }
        } catch (error) {
          console.error('Failed to fetch community messages:', error);
        }
      };

      fetchMessages();

      socketService.connect();
      socketService.joinCommunityRoom(communityId);
      setIsConnected(true);

      // Listen for new messages
      socketService.on('receive:community:message', (newMessage) => {
        if (newMessage.communityId === communityId) {
          addCommunityMessage(communityId, newMessage);
        }
      });

      return () => {
        socketService.leaveCommunityRoom(communityId);
        socketService.off('receive:community:message');
      };
    }
  }, [communityId, isMember]);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (message.trim() && isConnected && isMember) {
      socketService.sendCommunityMessage(communityId, message);
      setMessage('');
    }
  };

  return (
    <div className="flex flex-col h-[600px] bg-[#0A0F1F] rounded-lg border border-white/10 backdrop-blur-sm">
      {/* Chat Header */}
      <div className="px-4 py-3 border-b border-white/10">
        <h3 className="font-semibold text-white">Community Buzz</h3>
        <p className="text-xs text-[#60A5FA]">
          {!isMember ? 'Join to chat' : isConnected ? 'Connected' : 'Connecting...'}
        </p>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {!isMember ? (
          <div className="flex items-center justify-center h-full text-center">
            <div className="space-y-2">
              <p className="text-[#8A90A2]">Join this community to participate in chat</p>
              <p className="text-sm text-[#3B82F6]">Click "Join Community" to get started</p>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-[#8A90A2]">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg, index) => (
            <div key={index} className="space-y-1">
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-semibold cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => navigate(`/app/profile/${msg.senderId?._id || msg.senderId || msg.user?._id}`)}
                >
                  {msg.senderId?.name?.charAt(0)?.toUpperCase() || msg.user?.name?.charAt(0)?.toUpperCase() || msg.senderName?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div className="flex-1">
                  <div className="flex items-baseline gap-2">
                    <span
                      className="font-medium text-sm text-white hover:text-[#3B82F6] cursor-pointer transition-colors"
                      onClick={() => navigate(`/app/profile/${msg.senderId?._id || msg.senderId || msg.user?._id}`)}
                    >
                      {msg.senderId?.name || msg.user?.name || msg.senderName || 'Unknown User'}
                    </span>
                    <span className="text-xs text-[#8A90A2]">
                      {new Date(msg.createdAt || msg.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-sm text-[#E6E9EF] mt-1">{msg.content}</p>
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={handleSend} className="p-4 border-t border-white/10">
        <div className="flex gap-2">
          <input
            data-testid="chat-input"
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={isMember ? "Type message..." : "Join community to chat"}
            className="flex-1 px-4 py-2 bg-[#101726] border border-white/10 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!isConnected || !isMember}
          />
          <button
            data-testid="send-button"
            type="submit"
            disabled={!message.trim() || !isConnected || !isMember}
            className="px-4 py-2 bg-gradient-to-r from-[#60A5FA] to-[#3B82F6] hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-black rounded-lg transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default CommunityChat;
