
import React, { useState, useEffect, useRef } from 'react';
import { Send, Sparkles, ImageIcon, RotateCcw } from './Icons';
import { sendChatMessage } from '../services/geminiService';
import { useNeural } from './NeuralContext';
import { showToast } from './Toast';

const Chat: React.FC<any> = () => {
  const { state } = useNeural(); // Access Global State
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // 1. Load History on Mount
  useEffect(() => {
      const stored = localStorage.getItem('SNAPAURA_CHAT_HISTORY');
      if (stored) {
          try {
              setMessages(JSON.parse(stored));
          } catch(e) {}
      }
  }, []);

  // 2. Save History on Change
  useEffect(() => {
      if (messages.length > 0) {
          localStorage.setItem('SNAPAURA_CHAT_HISTORY', JSON.stringify(messages));
      }
  }, [messages]);

  // Auto-Inject Context on Mount
  useEffect(() => {
      const handleIntent = (e: Event) => {
          const detail = (e as CustomEvent).detail;
          if (detail.text) {
              const newMsgs = [...messages, { role: 'user', text: detail.text }];
              setMessages(newMsgs);
              processAiResponse(newMsgs, detail.text);
          }
      };
      window.addEventListener('neural-chat-intent', handleIntent);
      
      // If we enter chat and have an active image analysis, show a systemic "I see..." message (once)
      // Fix: Added optional chaining to prevent crash if analysis is undefined
      if (state.activeAnalysis && messages.length === 0) {
          const analysisSnippet = state.activeAnalysis?.analysis?.substring(0, 50) || "your image";
          setMessages([{
              role: 'model', 
              text: `I see you're working on an image. It looks like: "${analysisSnippet}...". How can I help with it?`
          }]);
      }

      return () => window.removeEventListener('neural-chat-intent', handleIntent);
  }, [state.activeAnalysis]);

  useEffect(() => {
      if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const processAiResponse = async (history: any[], lastMsg: string) => {
      setLoading(true);
      try {
          const res = await sendChatMessage(
              history.map(m => ({ role: m.role, parts: [{ text: m.text }] })), 
              lastMsg, 
              undefined, 
              undefined, 
              state // Pass GLOBAL CONTEXT
          );
          setMessages(prev => [...prev, { role: 'model', text: res }]);
      } catch (e) {
          setMessages(prev => [...prev, { role: 'model', text: "Connection error." }]);
      } finally {
          setLoading(false);
      }
  };

  const handleSend = () => {
      if (!input.trim()) return;
      const newMsgs = [...messages, { role: 'user', text: input }];
      setMessages(newMsgs);
      setInput('');
      processAiResponse(newMsgs, input);
  };

  const handleClear = () => {
      setMessages([]);
      localStorage.removeItem('SNAPAURA_CHAT_HISTORY');
      showToast("History Cleared", "info");
  };

  return (
    <div className="h-full flex flex-col bg-[#292d3e] relative overflow-hidden pb-24">
        {/* Matrix BG */}
        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://media.giphy.com/media/U3qYN8S0j3bpK/giphy.gif')] bg-cover mix-blend-screen"></div>

        {/* Header */}
        <div className="p-4 bg-[#292d3e]/90 backdrop-blur-md border-b border-white/5 flex justify-between items-center z-10">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#292d3e] shadow-neu flex items-center justify-center text-blue-400">
                    <Sparkles size={20} />
                </div>
                <div>
                    <h2 className="font-bold text-gray-200 text-sm">Neural Assistant</h2>
                    <p className="text-[10px] text-gray-500">{state.activeImage ? 'Image Context Active' : 'System Ready'}</p>
                </div>
            </div>
            <button onClick={handleClear} className="p-2 text-gray-500 hover:text-white" title="Clear History">
                <RotateCcw size={18}/>
            </button>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 relative z-10" ref={scrollRef}>
            {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed ${
                        m.role === 'user' 
                        ? 'bg-[#292d3e] text-blue-400 shadow-neu rounded-br-none border border-blue-500/10' 
                        : 'bg-[#292d3e] text-gray-300 shadow-neu rounded-bl-none'
                    }`}>
                        <div dangerouslySetInnerHTML={{ __html: m.text.replace(/\n/g, '<br/>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                    </div>
                </div>
            ))}
            {loading && <div className="text-xs text-gray-500 animate-pulse ml-4">Processing...</div>}
        </div>

        {/* Input */}
        <div className="p-4 bg-[#292d3e]/90 backdrop-blur-lg border-t border-white/5 relative z-20">
            <div className="flex gap-2">
                <input 
                    value={input} 
                    onChange={e => setInput(e.target.value)} 
                    onKeyDown={e => e.key === 'Enter' && handleSend()}
                    placeholder={state.activeImage ? "Ask about the image..." : "Type a message..."}
                    className="flex-1 bg-[#292d3e] shadow-neu-pressed rounded-xl px-4 py-3 text-gray-200 outline-none text-sm"
                />
                <button onClick={handleSend} className="bg-[#292d3e] shadow-neu p-3 rounded-xl text-blue-400 active:shadow-neu-pressed"><Send size={20} /></button>
            </div>
        </div>
    </div>
  );
};

export default Chat;
