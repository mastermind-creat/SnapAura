import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Sparkles } from './Icons';
import { sendChatMessage } from '../services/geminiService';

interface Message {
  role: 'user' | 'model';
  text: string;
}

const Chat: React.FC = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: "Hey! I'm SnapAura. Need help with a caption, a photo idea, or just want to chat?" }
  ]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg: Message = { role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      // Format history for API
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));
      
      const responseText = await sendChatMessage(history, userMsg.text);
      
      setMessages(prev => [...prev, { role: 'model', text: responseText }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', text: "Oops, I had a glitch. Try again?" }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-80px)]">
      <div className="p-4 border-b border-white/10 bg-black/20 backdrop-blur-md sticky top-0 z-10">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Sparkles className="text-secondary" size={20} /> 
          SnapAura Chat
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 hide-scrollbar" ref={scrollRef}>
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed ${
              msg.role === 'user' 
                ? 'bg-secondary text-white rounded-tr-none' 
                : 'bg-white/10 text-gray-200 rounded-tl-none'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white/10 p-3 rounded-2xl rounded-tl-none flex gap-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 pb-20">
        <div className="flex gap-2 items-center bg-white/5 rounded-full p-2 border border-white/10">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask me anything..."
            className="flex-1 bg-transparent px-4 text-white focus:outline-none placeholder-gray-500"
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="bg-secondary p-2.5 rounded-full text-white hover:bg-secondary/80 transition-colors disabled:opacity-50"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;