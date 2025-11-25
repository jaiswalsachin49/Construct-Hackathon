import React, { useState, useEffect, useRef } from 'react';
import { Send } from 'lucide-react';
import useActivityStore from '../../store/activityStore';
import useAuthStore from '../../store/authStore';
import axios from 'axios';

const ActivityChat = () => {
  const { selectedActivity } = useActivityStore();
  const { user, getAuthHeader } = useAuthStore();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);
  const API_URL = import.meta.env.VITE_BACKEND_URL + '/api/activities';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (selectedActivity) {
        fetchMessages();
        // Poll for new messages every 3 seconds (simple real-time)
        const interval = setInterval(fetchMessages, 3000);
        return () => clearInterval(interval);
    }
  }, [selectedActivity]);

  const fetchMessages = async () => {
    try {
        const res = await axios.get(`${API_URL}/${selectedActivity._id}/messages`, {
            headers: getAuthHeader()
        });
        setMessages(res.data);
    } catch (err) {
        console.error("Error fetching messages:", err);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isSending) return;
    
    setIsSending(true);
    try {
        const res = await axios.post(`${API_URL}/${selectedActivity._id}/messages`, 
            { content: input },
            { headers: getAuthHeader() }
        );
        setMessages([...messages, res.data]);
        setInput('');
    } catch (err) {
        console.error("Error sending message:", err);
    } finally {
        setIsSending(false);
    }
  };

  return (
    <div className="flex flex-col h-[400px] bg-[#0A0F1F] border-t border-white/10">
      <div className="p-3 bg-[#101726] border-b border-white/10">
        <h3 className="text-sm font-bold text-white">Meetup Lounge</h3>
        <p className="text-xs text-gray-400">Coordinate with the group</p>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg) => {
          const isMe = msg.senderId._id === user?._id;
          return (
            <div key={msg._id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                <div className="flex items-end gap-2 max-w-[80%]">
                    {!isMe && (
                        <img src={msg.senderId.profilePhoto || "https://github.com/shadcn.png"} className="w-6 h-6 rounded-full object-cover mb-1" />
                    )}
                    <div className={`p-3 rounded-xl text-sm ${
                        isMe 
                            ? 'bg-[#3B82F6] text-white rounded-tr-none' 
                            : 'bg-white/10 border border-white/10 text-gray-200 rounded-tl-none'
                        }`}>
                        {!isMe && <p className="text-[10px] text-[#3B82F6] font-bold mb-1">{msg.senderId.name}</p>}
                        {msg.content}
                    </div>
                </div>
                <span className="text-[10px] text-gray-500 mt-1 mr-1">
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} className="p-3 bg-[#101726] border-t border-white/10 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          disabled={isSending}
          className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#3B82F6] disabled:opacity-50"
        />
        <button 
          type="submit"
          disabled={isSending || !input.trim()}
          className="p-2 bg-[#3B82F6] text-white rounded-lg hover:bg-[#00b0e6] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send className={`h-4 w-4 ${isSending ? 'animate-pulse' : ''}`} />
        </button>
      </form>
    </div>
  );
};

export default ActivityChat;
