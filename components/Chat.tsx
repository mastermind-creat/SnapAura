
import React, { useState, useEffect, useRef } from 'react';
import { Send, Sparkles, ImageIcon, RotateCcw, User, Heart, Zap, Briefcase, Camera, TrendingUp, Smile, Activity, Radio, Users, Copy, Link2, CheckCircle, AlertCircle } from './Icons';
import { sendChatMessage } from '../services/geminiService';
import { useNeural } from './NeuralContext';
import { showToast } from './Toast';

// Access PeerJS from global scope (CDN)
declare const Peer: any;

// --- PERSONA DEFINITIONS ---
const PERSONAS = [
    {
        id: 'system',
        name: 'Neural System',
        role: 'Context Assistant',
        avatar: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=100&h=100&fit=crop',
        prompt: undefined,
        color: 'text-blue-400',
        intro: "System Online. Context Active."
    },
    {
        id: 'bestie',
        name: 'Bestie',
        role: 'Chat Companion',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
        prompt: "You are the user's best friend. You are super casual, use emojis, slang (like 'lol', 'fr', 'bet'), and are very supportive. Keep texts short like a real text message. NEVER sound like a robot. Talk about vibes, tea, and life.",
        color: 'text-pink-400',
        intro: "Yo! What's the tea today? ☕️"
    },
    {
        id: 'growth',
        name: 'Growth Guru',
        role: 'Social Strategist',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop',
        prompt: "You are a top-tier Social Media Strategist. You speak in hooks, viral value, and engagement tactics. Be punchy, confident, and focus on ROI/Growth. Use rocket emojis.",
        color: 'text-yellow-400',
        intro: "Ready to go viral? Let's strategize. 🚀"
    },
    {
        id: 'vibe',
        name: 'Vibe Advisor',
        role: 'Relationship & Mood',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop',
        prompt: "You are a vibe curator and relationship advisor. You are chill, empathetic, and spiritual. Focus on energy, aesthetic, and emotional intelligence. Keep it deep but chill.",
        color: 'text-purple-400',
        intro: "How's your energy flowing today? ✨"
    },
    {
        id: 'photo',
        name: 'Photo Mentor',
        role: 'Photography Expert',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
        prompt: "You are a professional photographer. Analyze lighting, composition, and gear. Give technical but accessible advice. Be encouraging but precise about aesthetics.",
        color: 'text-red-400',
        intro: "Got a shot to analyze or need some composition tips? 📸"
    },
    {
        id: 'footy',
        name: 'Footy Analyst',
        role: 'Sports Expert',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
        prompt: "You are a football (soccer) tactical analyst. You speak in terms of xG, formations, high-press, and form. You are objective but passionate about the beautiful game.",
        color: 'text-green-400',
        intro: "Kickoff time. Who are we scouting? ⚽️"
    }
];

const Chat: React.FC<any> = () => {
  const { state } = useNeural(); // Access Global State
  const [mode, setMode] = useState<'AI' | 'P2P'>('AI');
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  
  // --- AI STATE ---
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [activePersona, setActivePersona] = useState(PERSONAS[0]);

  // --- P2P STATE ---
  const [peer, setPeer] = useState<any>(null);
  const [myId, setMyId] = useState('');
  const [conn, setConn] = useState<any>(null);
  const [remoteId, setRemoteId] = useState('');
  const [p2pMessages, setP2pMessages] = useState<any[]>([]);
  const [p2pStatus, setP2pStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  const [username, setUsername] = useState('');
  const [isSetup, setIsSetup] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // 1. Load Persistence on Mount
  useEffect(() => {
      const storedHistory = localStorage.getItem('SNAPAURA_CHAT_HISTORY');
      const storedAvatar = localStorage.getItem('SNAPAURA_AVATAR');
      const storedName = localStorage.getItem('SNAPAURA_USERNAME');
      
      if (storedAvatar) setUserAvatar(storedAvatar);
      if (storedName) {
          setUsername(storedName);
          setIsSetup(true);
      }
      
      if (storedHistory) {
          try { setMessages(JSON.parse(storedHistory)); } catch(e) {}
      } else {
          setMessages([{ role: 'model', text: activePersona.intro, personaId: activePersona.id }]);
      }
  }, []);

  // 2. AI History Persistence
  useEffect(() => {
      if (messages.length > 0) {
          localStorage.setItem('SNAPAURA_CHAT_HISTORY', JSON.stringify(messages));
      }
  }, [messages]);

  // 3. P2P Initialization
  useEffect(() => {
      if (mode === 'P2P' && !peer && isSetup) {
          const newPeer = new Peer();
          newPeer.on('open', (id: string) => setMyId(id));
          
          newPeer.on('connection', (c: any) => {
              handleConnection(c);
              showToast("Friend connected!", "success");
          });

          newPeer.on('error', (err: any) => {
              console.error(err);
              showToast("Connection Error", "error");
              setP2pStatus('disconnected');
          });

          setPeer(newPeer);
      }
      // Note: We don't auto-destroy peer on mode switch to keep connection alive if user toggles quickly
  }, [mode, isSetup]);

  // 4. Intent Handling (AI Context)
  useEffect(() => {
      const handleIntent = (e: Event) => {
          const detail = (e as CustomEvent).detail;
          if (detail.text) {
              setMode('AI'); // Switch to AI
              setActivePersona(PERSONAS[0]); // System
              const newMsgs = [...messages, { role: 'user', text: detail.text }];
              setMessages(newMsgs);
              processAiResponse(newMsgs, detail.text, PERSONAS[0]);
          }
      };
      window.addEventListener('neural-chat-intent', handleIntent);
      
      if (state.activeAnalysis && messages.length === 0) {
          const analysisSnippet = state.activeAnalysis?.analysis?.substring(0, 50) || "your image";
          setMessages([{
              role: 'model', 
              text: `I see you're working on an image. It looks like: "${analysisSnippet}...". How can I help?`,
              personaId: 'system'
          }]);
      }
      return () => window.removeEventListener('neural-chat-intent', handleIntent);
  }, [state.activeAnalysis]);

  useEffect(() => {
      if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, p2pMessages, mode]);

  // --- AI LOGIC ---
  const processAiResponse = async (history: any[], lastMsg: string, persona: typeof activePersona, img?: string) => {
      setLoading(true);
      try {
          const res = await sendChatMessage(
              history.map(m => ({ role: m.role, parts: [{ text: m.text }] })), 
              lastMsg, 
              persona.prompt, 
              img, 
              state 
          );
          setMessages(prev => [...prev, { role: 'model', text: res, personaId: persona.id }]);
      } catch (e) {
          setMessages(prev => [...prev, { role: 'model', text: "Connection error.", personaId: persona.id }]);
      } finally {
          setLoading(false);
      }
  };

  // --- P2P LOGIC ---
  const handleConnection = (c: any) => {
      setConn(c);
      setP2pStatus('connected');
      c.on('data', (data: any) => {
          setP2pMessages(prev => [...prev, { ...data, isMe: false }]);
          if (document.hidden) showToast(`New message from ${data.sender}`, "info");
      });
      c.on('close', () => {
          setP2pStatus('disconnected');
          setConn(null);
          showToast("Connection lost", "error");
      });
  };

  const connectToPeer = () => {
      if (!peer || !remoteId) return;
      setP2pStatus('connecting');
      const c = peer.connect(remoteId);
      c.on('open', () => handleConnection(c));
      c.on('error', () => {
          setP2pStatus('disconnected');
          showToast("Could not connect", "error");
      });
  };

  const sendP2P = (text: string, img?: string) => {
      if (conn && p2pStatus === 'connected') {
          const payload = { text, image: img, sender: username, timestamp: Date.now() };
          conn.send(payload);
          setP2pMessages(prev => [...prev, { ...payload, isMe: true }]);
      }
  };

  // --- SHARED HANDLERS ---
  const handleSend = () => {
      if (!input.trim()) return;
      
      if (mode === 'AI') {
          const newMsgs = [...messages, { role: 'user', text: input }];
          setMessages(newMsgs);
          processAiResponse(newMsgs, input, activePersona);
      } else {
          sendP2P(input);
      }
      setInput('');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onload = () => {
              const res = reader.result as string;
              if (mode === 'AI') {
                  const newMsgs = [...messages, { role: 'user', text: "Analyze this image", image: res }];
                  setMessages(newMsgs);
                  processAiResponse(newMsgs, "Analyze this image", activePersona, res);
              } else {
                  sendP2P("Sent an image", res);
              }
          };
          reader.readAsDataURL(file);
      }
  };

  const handleClear = () => {
      if (mode === 'AI') {
          setMessages([{ role: 'model', text: activePersona.intro, personaId: activePersona.id }]);
          localStorage.removeItem('SNAPAURA_CHAT_HISTORY');
          showToast("Chat Reset", "info");
      } else {
          setP2pMessages([]);
          showToast("Chat Cleared", "info");
      }
  };

  const saveUsername = () => {
      if(username.trim()) {
          localStorage.setItem('SNAPAURA_USERNAME', username);
          setIsSetup(true);
      }
  };

  return (
    <div className="h-full flex flex-col bg-[#292d3e] relative overflow-hidden pb-24">
        {/* Animated Background */}
        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://media.giphy.com/media/U3qYN8S0j3bpK/giphy.gif')] bg-cover mix-blend-screen"></div>

        {/* Header & Mode Switch */}
        <div className="bg-[#292d3e]/90 backdrop-blur-md border-b border-white/5 z-20">
            <div className="flex justify-between items-center p-4">
                <div className="flex bg-[#1e212d] rounded-xl p-1 shadow-neu-pressed">
                    <button 
                        onClick={() => setMode('AI')} 
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${mode === 'AI' ? 'bg-[#292d3e] shadow-neu text-blue-400' : 'text-gray-500'}`}
                    >
                        <Sparkles size={14}/> AI Chat
                    </button>
                    <button 
                        onClick={() => setMode('P2P')} 
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${mode === 'P2P' ? 'bg-[#292d3e] shadow-neu text-green-400' : 'text-gray-500'}`}
                    >
                        <Users size={14}/> Secure P2P
                    </button>
                </div>
                <button onClick={handleClear} className="p-2 text-gray-500 hover:text-white transition-colors">
                    <RotateCcw size={18}/>
                </button>
            </div>

            {/* AI Persona Selector */}
            {mode === 'AI' && (
                <div className="flex gap-2 overflow-x-auto hide-scrollbar px-4 pb-3">
                    {PERSONAS.map(p => (
                        <button 
                            key={p.id}
                            onClick={() => { setActivePersona(p); setMessages(prev => [...prev, {role:'model', text: p.intro, personaId: p.id}]); }}
                            className={`flex items-center gap-2 pr-3 pl-1 py-1 rounded-full text-[10px] font-bold transition-all whitespace-nowrap border ${
                                activePersona.id === p.id 
                                ? 'bg-[#292d3e] shadow-neu-pressed border-white/10 text-white' 
                                : 'bg-transparent border-transparent text-gray-500 hover:text-gray-300'
                            }`}
                        >
                            <div className="w-6 h-6 rounded-full overflow-hidden">
                                <img src={p.avatar} className="w-full h-full object-cover" alt={p.name} />
                            </div>
                            {p.name}
                        </button>
                    ))}
                </div>
            )}

            {/* P2P Status Bar */}
            {mode === 'P2P' && isSetup && (
                <div className="px-4 pb-3 flex justify-between items-center text-xs">
                    <div className="flex items-center gap-2 text-gray-400">
                        <Radio size={14} className={p2pStatus === 'connected' ? "text-green-400 animate-pulse" : "text-gray-500"} />
                        {p2pStatus === 'connected' ? 'Encrypted Connection Active' : 'Waiting for connection...'}
                    </div>
                    {myId && (
                        <button onClick={() => {navigator.clipboard.writeText(myId); showToast("ID Copied", "success")}} className="flex items-center gap-1 text-blue-400 font-bold bg-[#292d3e] px-2 py-1 rounded-lg shadow-neu active:shadow-neu-pressed">
                            <Copy size={12}/> My ID
                        </button>
                    )}
                </div>
            )}
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 relative z-10" ref={scrollRef}>
            
            {/* P2P Setup Screen */}
            {mode === 'P2P' && !isSetup && (
                <div className="flex flex-col items-center justify-center h-full space-y-6 p-6">
                    <div className="w-20 h-20 bg-[#292d3e] shadow-neu rounded-full flex items-center justify-center text-green-400 mb-4">
                        <Users size={40} />
                    </div>
                    <h2 className="text-xl font-bold text-gray-200">Secure P2P Chat</h2>
                    <p className="text-center text-sm text-gray-500">End-to-end encrypted. No servers. Just you and your friends.</p>
                    <input 
                        value={username} 
                        onChange={e => setUsername(e.target.value)}
                        placeholder="Enter your display name" 
                        className="w-full bg-[#292d3e] shadow-neu-pressed p-4 rounded-xl text-center text-white outline-none"
                    />
                    <button onClick={saveUsername} disabled={!username.trim()} className="w-full py-4 bg-[#292d3e] shadow-neu text-green-400 font-bold rounded-xl active:shadow-neu-pressed">
                        Start Chatting
                    </button>
                </div>
            )}

            {/* P2P Connection Screen */}
            {mode === 'P2P' && isSetup && p2pStatus === 'disconnected' && (
                <div className="bg-[#292d3e] shadow-neu p-6 rounded-2xl space-y-6 mx-4 mt-10">
                    <div className="text-center space-y-2">
                        <h3 className="font-bold text-gray-200">Connect with Friend</h3>
                        <p className="text-xs text-gray-500">Share your ID or enter theirs below.</p>
                    </div>
                    
                    <div className="flex items-center justify-between bg-[#1e212d] p-3 rounded-xl">
                        <span className="text-xs text-gray-500 font-mono">{myId || "Generating ID..."}</span>
                        <button onClick={() => {navigator.clipboard.writeText(myId); showToast("ID Copied", "success")}} className="text-blue-400"><Copy size={16}/></button>
                    </div>

                    <div className="space-y-4">
                        <input 
                            value={remoteId}
                            onChange={e => setRemoteId(e.target.value)}
                            placeholder="Paste Friend's ID here..."
                            className="w-full bg-[#292d3e] shadow-neu-pressed p-4 rounded-xl text-sm text-white outline-none"
                        />
                        <button onClick={connectToPeer} className="w-full py-3 bg-[#292d3e] shadow-neu text-blue-400 font-bold rounded-xl active:shadow-neu-pressed flex justify-center items-center gap-2">
                            <Link2 size={18}/> Connect
                        </button>
                    </div>
                </div>
            )}

            {/* Message List */}
            {(mode === 'AI' ? messages : (p2pStatus === 'connected' ? p2pMessages : [])).map((m, i) => {
                const isUser = mode === 'AI' ? m.role === 'user' : m.isMe;
                const persona = mode === 'AI' ? (PERSONAS.find(p => p.id === m.personaId) || activePersona) : { avatar: null, color: 'text-green-400' };
                
                return (
                    <div key={i} className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
                        {!isUser && (
                            <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 mt-2 shadow-neu border border-white/5 bg-[#292d3e] flex items-center justify-center">
                                {mode === 'AI' ? (
                                    <img src={persona.avatar} className="w-full h-full object-cover" alt="AI" />
                                ) : (
                                    <span className="text-[10px] font-bold text-green-400">{m.sender?.[0]}</span>
                                )}
                            </div>
                        )}
                        
                        <div className={`max-w-[85%] space-y-1`}>
                            {/* Sender Name in P2P */}
                            {!isUser && mode === 'P2P' && <p className="text-[9px] text-gray-500 ml-2">{m.sender}</p>}
                            
                            {m.image && (
                                <img src={m.image} className="w-48 rounded-xl border border-white/10" alt="Upload" />
                            )}
                            {m.text && (
                                <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-neu ${
                                    isUser 
                                    ? 'bg-[#292d3e] text-blue-400 rounded-tr-none border border-blue-500/10' 
                                    : 'bg-[#292d3e] text-gray-300 rounded-tl-none border border-white/5'
                                }`}>
                                    <div dangerouslySetInnerHTML={{ __html: m.text.replace(/\n/g, '<br/>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                                </div>
                            )}
                        </div>

                        {isUser && (
                            <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 mt-2 shadow-neu border border-white/5 bg-[#1e212d] flex items-center justify-center">
                                {userAvatar ? <img src={userAvatar} className="w-full h-full object-cover"/> : <User size={14} className="text-gray-500"/>}
                            </div>
                        )}
                    </div>
                );
            })}
            
            {loading && mode === 'AI' && (
                <div className="flex gap-3 items-center ml-2">
                    <div className="w-8 h-8 rounded-full overflow-hidden shadow-neu border border-white/5">
                        <img src={activePersona.avatar} className="w-full h-full object-cover opacity-50" />
                    </div>
                    <div className="flex gap-1">
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-100"></div>
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-200"></div>
                    </div>
                </div>
            )}
        </div>

        {/* Input Area */}
        <div className="p-4 bg-[#292d3e]/90 backdrop-blur-lg border-t border-white/5 relative z-20">
            <div className="relative flex gap-2 bg-[#292d3e] rounded-xl p-1 shadow-neu-pressed">
                <button onClick={() => fileRef.current?.click()} className="p-3 text-gray-400 hover:text-white transition-colors">
                    <ImageIcon size={20} />
                </button>
                <input 
                    value={input} 
                    onChange={e => setInput(e.target.value)} 
                    onKeyDown={e => e.key === 'Enter' && handleSend()}
                    placeholder={mode === 'AI' ? `Message ${activePersona.name}...` : "Type a secure message..."}
                    className="flex-1 bg-transparent px-2 py-3 text-gray-200 outline-none text-sm placeholder-gray-600"
                    disabled={mode === 'P2P' && p2pStatus !== 'connected'}
                />
                <button onClick={handleSend} disabled={!input.trim() || (mode === 'P2P' && p2pStatus !== 'connected')} className="bg-[#292d3e] shadow-neu p-2.5 rounded-lg text-blue-400 active:shadow-neu-pressed disabled:opacity-50">
                    <Send size={18} />
                </button>
            </div>
            <input type="file" ref={fileRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
        </div>
    </div>
  );
};

export default Chat;
