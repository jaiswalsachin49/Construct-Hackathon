import React, { useState, useEffect, useRef } from 'react';
import { Send } from 'lucide-react';
import socketService from '../../services/socketService';
import useCommunityStore from '../../store/communityStore';

const CommunityChat = ({ communityId }) => {
  const [message, setMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef(null);
  
  const { communityMessages, addCommunityMessage } = useCommunityStore();
  const messages = communityMessages[communityId] || [];

  useEffect(() => {
    // Connect socket and join community room
    socketService.connect();
    socketService.joinCommunityRoom(communityId);
    setIsConnected(true);

    // Listen for new messages
    socketService.on('community:message', (newMessage) => {
      if (newMessage.communityId === communityId) {
        addCommunityMessage(communityId, newMessage);
      }
    });

    return () => {
      socketService.leaveCommunityRoom(communityId);
      socketService.off('community:message');
    };
  }, [communityId]);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (message.trim() && isConnected) {
      socketService.sendCommunityMessage(communityId, message);
      setMessage('');
    }
  };

  return (
    <div className="flex flex-col h-[600px] bg-white rounded-lg border border-gray-200">
      {/* Chat Header */}
      <div className="px-4 py-3 border-b border-gray-200">
        <h3 className="font-semibold text-gray-900">Community Buzz</h3>
        <p className="text-xs text-gray-500">
          {isConnected ? 'Connected' : 'Connecting...'}
        </p>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg, index) => (
            <div key={index} className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                  {msg.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div className="flex-1">
                  <div className="flex items-baseline gap-2">
                    <span className="font-medium text-sm text-gray-900">
                      {msg.user?.name || 'Unknown User'}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 mt-1">{msg.content}</p>
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={handleSend} className="p-4 border-t border-gray-200">
        <div className="flex gap-2">
          <input
            data-testid="chat-input"
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type message..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={!isConnected}
          />
          <button
            data-testid="send-button"
            type="submit"
            disabled={!message.trim() || !isConnected}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default CommunityChat;
