import React, { useState } from 'react';
import { Send } from 'lucide-react';

const ActivityChat = () => {
  const [messages, setMessages] = useState([
    { id: 1, user: 'Alisa', text: 'Hey everyone! Excited for the run.', time: '10:00 AM', isMe: false },
    { id: 2, user: 'You', text: 'Me too! Where exactly are we meeting?', time: '10:02 AM', isMe: true },
    { id: 3, user: 'Alisa', text: 'Right at the main gate, near the fountain.', time: '10:03 AM', isMe: false },
  ]);
  const [input, setInput] = useState('');

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    setMessages([...messages, {
      id: Date.now(),
      user: 'You',
      text: input,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMe: true
    }]);
    setInput('');
  };

  return (
    <div className="flex flex-col h-[400px] bg-[#0A0F1F] border-t border-white/10">
      <div className="p-3 bg-[#101726] border-b border-white/10">
        <h3 className="text-sm font-bold text-white">Meetup Lounge</h3>
        <p className="text-xs text-gray-400">Coordinate with the group</p>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col ${msg.isMe ? 'items-end' : 'items-start'}`}>
            <div className={`max-w-[80%] p-3 rounded-xl text-sm ${
              msg.isMe 
                ? 'bg-[#00C4FF] text-white rounded-tr-none' 
                : 'bg-white/10 border border-white/10 text-gray-200 rounded-tl-none'
            }`}>
              {msg.text}
            </div>
            <span className="text-[10px] text-gray-500 mt-1">{msg.time}</span>
          </div>
        ))}
      </div>

      <form onSubmit={handleSend} className="p-3 bg-[#101726] border-t border-white/10 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#00C4FF]"
        />
        <button 
          type="submit"
          className="p-2 bg-[#00C4FF] text-white rounded-lg hover:bg-[#00b0e6] transition-colors"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
};

export default ActivityChat;
