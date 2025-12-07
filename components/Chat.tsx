
import React, { useState, useEffect, useRef } from 'react';
import { Send, Sparkles, ImageIcon, RotateCcw, User, Heart, Zap, Briefcase, Camera, TrendingUp, Smile, Activity, Radio, Users, Copy, Link2, CheckCircle, AlertCircle, Plus, X, Volume2 } from './Icons';
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
  const [isPlusOpen, setIsPlusOpen] = useState(false);
  
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

  // --- TTS State ---
  const [speakingMsgId, setSpeakingMsgId] = useState<number | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  }, [input]);

  // Matrix Animation Effect
  useEffect(() => {
    const canvas = document.getElementById('matrix-bg') as HTMLCanvasElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
    let height = canvas.height = canvas.parentElement?.clientHeight || window.innerHeight;
    
    const fontSize = 14;
    const columns = Math.floor(width / fontSize);
    const drops: number[] = new Array(columns).fill(1);
    
    const draw = () => {
        // Semi-transparent fade to create trails
        ctx.fillStyle = 'rgba(41, 45, 62, 0.1)'; 
        ctx.fillRect(0, 0, width, height);
        
        ctx.fillStyle = '#00f3ff'; // Electric Blue
        ctx.font = `${fontSize}px monospace`;
        
        for (let i = 0; i < drops.length; i++) {
            // Random number 0-9
            const text = Math.floor(Math.random() * 10).toString(); 
            ctx.fillText(text, i * fontSize, drops[i] * fontSize);
            
            // Random reset to top
            if (drops[i] * fontSize > height && Math.random() > 0.975) {
                drops[i] = 0;
            }
            drops[i]++;
        }
    };

    const interval = setInterval(draw, 50);

    const handleResize = () => {
        width = canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
        height = canvas.height = canvas.parentElement?.clientHeight || window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    return () => {
        clearInterval(interval);
        window.removeEventListener('resize', handleResize);
    };
  }, []);

  // 1. Load Persistence on Mount
  useEffect(() => {
      const storedHistory = localStorage.getItem('SNAPAURA_CHAT_HISTORY');
      const storedAvatar = localStorage.getItem('SNAPAURA_AVATAR');
      
      // Load Username: Check Global Profile FIRST, then fallback to local chat storage
      let effectiveUsername = state.userProfile?.username || localStorage.getItem('SNAPAURA_USERNAME');
      
      if (storedAvatar) setUserAvatar(storedAvatar);
      
      if (effectiveUsername) {
          setUsername(effectiveUsername);
          setIsSetup(true); // Skip setup if we have a name
      }
      
      if (storedHistory) {
          try { setMessages(JSON.parse(storedHistory)); } catch(e) {}
      } else {
          setMessages([{ role: 'model', text: activePersona.intro, personaId: activePersona.id, id: Date.now() }]);
      }
  }, [state.userProfile]); // Re-run if profile loads late

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
  }, [mode, isSetup]);

  // 4. Intent Handling (AI Context)
  useEffect(() => {
      const handleIntent = (e: Event) => {
          const detail = (e as CustomEvent).detail;
          if (detail.text) {
              setMode('AI'); // Switch to AI
              setActivePersona(PERSONAS[0]); // System
              const newMsgs = [...messages, { role: 'user', text: detail.text, id: Date.now() }];
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
              personaId: 'system',
              id: Date.now()
          }]);
      }
      return () => window.removeEventListener('neural-chat-intent', handleIntent);
  }, [state.activeAnalysis]);

  useEffect(() => {
      if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, p2pMessages, mode, input]);

  // --- AI LOGIC ---
  const processAiResponse = async (history: any[], lastMsg: string, persona: typeof activePersona, img?: string) => {
      setLoading(true);
      try {
          const res = await sendChatMessage(
              history.filter(m => m.role).map(m => ({ role: m.role, parts: [{ text: m.text }] })), 
              lastMsg, 
              persona.prompt, 
              img, 
              state 
          );
          setMessages(prev => [...prev, { role: 'model', text: res, personaId: persona.id, id: Date.now() }]);
      } catch (e) {
          setMessages(prev => [...prev, { role: 'model', text: "Connection error.", personaId: persona.id, id: Date.now() }]);
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

  // --- TTS LOGIC ---
  const cleanTextForSpeech = (text: string) => {
      return text.replace(/[*_`#]/g, '').replace(/\[.*?\]/g, '');
  };

  const toggleSpeech = (text: string, id: number) => {
      if (speakingMsgId === id) {
          window.speechSynthesis.cancel();
          setSpeakingMsgId(null);
      } else {
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(cleanTextForSpeech(text));
          utterance.onend = () => setSpeakingMsgId(null);
          setSpeakingMsgId(id);
          window.speechSynthesis.speak(utterance);
      }
  };

  // --- SHARED HANDLERS ---
  const handleSend = () => {
      if (!input.trim()) return;
      
      if (mode === 'AI') {
          const newMsgs = [...messages, { role: 'user', text: input, id: Date.now() }];
          setMessages(newMsgs);
          processAiResponse(newMsgs, input, activePersona);
      } else {
          sendP2P(input);
      }
      setInput('');
      if(textareaRef.current) textareaRef.current.style.height = 'auto'; // Reset height
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          handleSend();
      }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onload = () => {
              const res = reader.result as string;
              if (mode === 'AI') {
                  const newMsgs = [...messages, { role: 'user', text: "Analyze this image", image: res, id: Date.now() }];
                  setMessages(newMsgs);
                  processAiResponse(newMsgs, "Analyze this image", activePersona, res);
              } else {
                  sendP2P("Sent an image", res);
              }
              setIsPlusOpen(false);
          };
          reader.readAsDataURL(file);
      }
  };

  const handleClear = () => {
      if (mode === 'AI') {
          setMessages([{ role: 'model', text: activePersona.intro, personaId: activePersona.id, id: Date.now() }]);
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
        {/* Matrix Background */}
        <canvas id="matrix-bg" className="absolute inset-0 z-0 opacity-10 pointer-events-none"></canvas>
        <div className="absolute inset-0 z-0 opacity-20 pointer-events-none bg-[linear-gradient(rgba(0,243,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,243,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px]"></div>

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
                <button onClick={handleClear} className="p-2 text-gray-500 hover:text-white transition-colors bg-[#292d3e] shadow-neu rounded-full active:shadow-neu-pressed">
                    <RotateCcw size={16}/>
                </button>
            </div>

            {/* AI Persona Selector */}
            {mode === 'AI' && (
                <div className="flex gap-2 overflow-x-auto hide-scrollbar px-4 pb-3">
                    {PERSONAS.map(p => (
                        <button 
                            key={p.id}
                            onClick={() => { setActivePersona(p); setMessages(prev => [...prev, {role:'model', text: p.intro, personaId: p.id, id: Date.now()}]); }}
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
        <div className="flex-1 overflow-y-auto p-4 space-y-4 relative z-10 pb-44" ref={scrollRef}>
            
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
                const isSpeaking = speakingMsgId === m.id;

                return (
                    <div key={i} className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'} animate-fade-in-up`}>
                        {!isUser && (
                            <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 mt-2 shadow-neu border border-white/5 bg-[#292d3e] flex items-center justify-center">
                                {mode === 'AI' ? (
                                    <img src={persona.avatar} className="w-full h-full object-cover" alt="AI" />
                                ) : (
                                    <span className="text-[10px] font-bold text-green-400">{m.sender?.[0]}</span>
                                )}
                            </div>
                        )}
                        
                        <div className={`max-w-[85%] space-y-1 relative group`}>
                            {/* Sender Name in P2P */}
                            {!isUser && mode === 'P2P' && <p className="text-[9px] text-gray-500 ml-2">{m.sender}</p>}
                            
                            {m.image && (
                                <img src={m.image} className="w-48 rounded-xl border border-white/10" alt="Upload" />
                            )}
                            {m.text && (
                                <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-neu relative ${
                                    isUser 
                                    ? 'bg-[#292d3e] text-blue-400 rounded-tr-none border border-blue-500/10' 
                                    : 'bg-[#292d3e] text-gray-300 rounded-tl-none border border-white/5'
                                }`}>
                                    <div dangerouslySetInnerHTML={{ __html: m.text.replace(/\n/g, '<br/>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                                    
                                    {/* Text Actions */}
                                    {!isUser && mode === 'AI' && (
                                        <button 
                                            onClick={() => toggleSpeech(m.text, m.id)}
                                            className={`absolute -right-8 bottom-0 p-2 text-gray-500 hover:text-white transition-opacity ${isSpeaking ? 'opacity-100 text-green-400' : 'opacity-0 group-hover:opacity-100'}`}
                                        >
                                            {isSpeaking ? <Activity className="animate-pulse" size={14}/> : <Volume2 size={14}/>}
                                        </button>
                                    )}
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
        <div className="p-4 fixed bottom-0 left-0 right-0 z-50 pointer-events-none pb-20">
            <div className="max-w-md mx-auto pointer-events-auto flex items-end gap-2">
                
                {/* Expandable Plus Menu */}
                <div className="relative">
                    <div className={`absolute bottom-full left-0 mb-2 flex flex-col gap-2 transition-all duration-300 ${isPlusOpen ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-90 pointer-events-none'}`}>
                        <button onClick={() => { fileRef.current?.click(); setIsPlusOpen(false); }} className="w-10 h-10 rounded-full bg-[#292d3e] shadow-neu flex items-center justify-center text-blue-400 active:shadow-neu-pressed">
                            <ImageIcon size={18} />
                        </button>
                        <button onClick={() => { /* Voice logic placeholder */ setIsPlusOpen(false); }} className="w-10 h-10 rounded-full bg-[#292d3e] shadow-neu flex items-center justify-center text-pink-400 active:shadow-neu-pressed">
                            <Smile size={18} />
                        </button>
                    </div>
                    <button 
                        onClick={() => setIsPlusOpen(!isPlusOpen)} 
                        className={`w-10 h-10 rounded-full bg-[#292d3e] shadow-neu flex items-center justify-center text-gray-400 active:shadow-neu-pressed transition-transform duration-300 ${isPlusOpen ? 'rotate-45 text-red-400' : ''}`}
                    >
                        <Plus size={20} />
                    </button>
                </div>

                {/* Text Area Container with Glowing Border */}
                <div className="flex-1 relative group rounded-2xl bg-gradient-to-r from-[#00f3ff] via-[#ff0099] to-[#39ff14] p-[1px] shadow-neon-blue">
                    <div className="bg-[#292d3e] rounded-2xl flex items-end p-1">
                        <textarea
                            ref={textareaRef}
                            value={input} 
                            onChange={e => setInput(e.target.value)} 
                            onKeyDown={handleKeyDown}
                            placeholder={mode === 'AI' ? `Message ${activePersona.name}...` : "Type a secure message..."}
                            className="w-full bg-transparent px-3 py-3 text-gray-200 outline-none text-sm placeholder-gray-600 resize-none max-h-32 min-h-[44px] hide-scrollbar leading-relaxed"
                            rows={1}
                            disabled={mode === 'P2P' && p2pStatus !== 'connected'}
                        />
                    </div>
                </div>

                <button 
                    onClick={handleSend} 
                    disabled={!input.trim() || (mode === 'P2P' && p2pStatus !== 'connected')} 
                    className="w-10 h-10 bg-[#292d3e] shadow-neu rounded-full text-blue-400 active:shadow-neu-pressed disabled:opacity-50 flex items-center justify-center transition-all hover:scale-105 active:scale-95"
                >
                    <Send size={18} className={input.trim() ? "fill-current" : ""} />
                </button>
            </div>
            <input type="file" ref={fileRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
        </div>
    </div>
  );
};

export default Chat;
