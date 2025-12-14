
import React, { useState, useEffect, useRef } from 'react';
import { Send, Sparkles, ImageIcon, RotateCcw, User, Heart, Zap, Briefcase, Camera, TrendingUp, Smile, Activity, Radio, Users, Copy, Link2, CheckCircle, AlertCircle, Plus, X, Volume2, Reply, FileText, RefreshCw, Trash2, MoreVertical, Mic, Archive, Save, ChevronDown, Headphones, MicOff, XCircle } from './Icons';
import { sendChatMessage } from '../services/geminiService';
import { useNeural } from './NeuralContext';
import { showToast } from './Toast';
import { playTTS, stopTTS, TTS_VOICES } from '../services/ttsService';

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

// Hook for long press (optimized for scrolling)
function useLongPress(callback: () => void, ms = 600) {
  const [startLongPress, setStartLongPress] = useState(false);
  const [timerId, setTimerId] = useState<any>(null);
  const isScrolling = useRef(false);

  // Detect scroll to cancel long press
  useEffect(() => {
      const handleScroll = () => { isScrolling.current = true; };
      window.addEventListener('scroll', handleScroll, true);
      return () => window.removeEventListener('scroll', handleScroll, true);
  }, []);

  const start = () => {
      isScrolling.current = false;
      setStartLongPress(true);
      const id = setTimeout(() => {
          if (!isScrolling.current) callback();
      }, ms);
      setTimerId(id);
  };

  const stop = () => {
      setStartLongPress(false);
      clearTimeout(timerId);
  };

  return {
    onMouseDown: start,
    onMouseUp: stop,
    onMouseLeave: stop,
    onTouchStart: start,
    onTouchEnd: stop,
  };
}

const Chat: React.FC<any> = () => {
  const { state, dispatchIntent } = useNeural(); // Access Global State
  const [mode, setMode] = useState<'AI' | 'P2P'>('AI');
  const [isPlusOpen, setIsPlusOpen] = useState(false);
  
  // --- AI STATE ---
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [activePersona, setActivePersona] = useState(PERSONAS[0]);

  // --- VOICE & HISTORY STATE ---
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [savedSessions, setSavedSessions] = useState<any[]>([]);
  const [selectedVoiceId, setSelectedVoiceId] = useState<string>('Kimberly');
  const [showVoiceMenu, setShowVoiceMenu] = useState(false);
  
  // --- NEW IMMERSIVE VOICE MODE STATE ---
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState<'idle' | 'listening' | 'thinking' | 'speaking'>('idle');

  // --- P2P STATE ---
  const [peer, setPeer] = useState<any>(null);
  const [myId, setMyId] = useState('');
  const [conn, setConn] = useState<any>(null);
  const [remoteId, setRemoteId] = useState('');
  const [p2pMessages, setP2pMessages] = useState<any[]>([]);
  const [p2pStatus, setP2pStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  const [username, setUsername] = useState('');
  const [isSetup, setIsSetup] = useState(false);

  // --- ACTION MENU State ---
  const [speakingMsgId, setSpeakingMsgId] = useState<number | null>(null);
  const [menuOpenId, setMenuOpenId] = useState<number | null>(null);
  const [replyingTo, setReplyingTo] = useState<any>(null);

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

  // Persistence
  useEffect(() => {
      const storedHistory = localStorage.getItem('SNAPAURA_CHAT_HISTORY');
      const storedSessions = localStorage.getItem('SNAPAURA_SAVED_SESSIONS');
      let effectiveUsername = state.userProfile?.username || localStorage.getItem('SNAPAURA_USERNAME');
      
      if (effectiveUsername) { setUsername(effectiveUsername); setIsSetup(true); }
      if (storedHistory) { try { setMessages(JSON.parse(storedHistory)); } catch(e) {} } 
      else { setMessages([{ role: 'model', text: activePersona.intro, personaId: activePersona.id, id: Date.now() }]); }
      
      if (storedSessions) { try { setSavedSessions(JSON.parse(storedSessions)); } catch(e) {} }

      const pref = localStorage.getItem('SNAPAURA_TTS_VOICE_ID');
      if (pref) setSelectedVoiceId(pref);

  }, [state.userProfile]);

  useEffect(() => {
      if (messages.length > 0) localStorage.setItem('SNAPAURA_CHAT_HISTORY', JSON.stringify(messages));
  }, [messages]);

  // P2P Init
  useEffect(() => {
      if (mode === 'P2P' && !peer && isSetup) {
          const newPeer = new Peer();
          newPeer.on('open', (id: string) => setMyId(id));
          newPeer.on('connection', (c: any) => { handleConnection(c); showToast("Friend connected!", "success"); });
          newPeer.on('error', (err: any) => { console.error(err); showToast("Connection Error", "error"); setP2pStatus('disconnected'); });
          setPeer(newPeer);
      }
  }, [mode, isSetup]);

  // Intent Handling
  useEffect(() => {
      const handleIntent = (e: Event) => {
          const detail = (e as CustomEvent).detail;
          if (detail.text) {
              setMode('AI');
              setActivePersona(PERSONAS[0]);
              const newMsgs = [...messages, { role: 'user', text: detail.text, id: Date.now() }];
              setMessages(newMsgs);
              processAiResponse(newMsgs, detail.text, PERSONAS[0]);
          }
      };
      window.addEventListener('neural-chat-intent', handleIntent);
      return () => window.removeEventListener('neural-chat-intent', handleIntent);
  }, [state.activeAnalysis]);

  useEffect(() => {
      if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, p2pMessages, mode, input, replyingTo, isListening]);

  // --- VOICE LOGIC ---
  const startRecognition = (autoRestart = false) => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) { showToast("Voice not supported", "error"); return; }
    
    if (isListening) return; // Prevent doubles

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => { setIsListening(true); if(isVoiceMode) setVoiceStatus('listening'); };
    recognition.onend = () => { 
        setIsListening(false); 
        if(isVoiceMode && voiceStatus !== 'speaking' && !autoRestart) setVoiceStatus('idle');
    };
    
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      if (isVoiceMode) {
          // In voice mode, send immediately
          handleSend(transcript);
      } else {
          setInput(prev => prev + (prev ? ' ' : '') + transcript);
      }
    };

    recognition.onerror = () => { setIsListening(false); if(isVoiceMode) setVoiceStatus('idle'); };
    
    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopRecognition = () => {
      recognitionRef.current?.stop();
      setIsListening(false);
  };

  const toggleVoiceMode = () => {
      if (isVoiceMode) {
          setIsVoiceMode(false);
          setVoiceStatus('idle');
          stopRecognition();
          stopTTS();
      } else {
          setIsVoiceMode(true);
          setVoiceStatus('idle'); // Will start listening on user tap
      }
  };

  // --- CORE CHAT LOGIC ---
  const saveSession = () => {
     if(messages.length <= 1) { showToast("Nothing to save", "info"); return; }
     const title = messages.find(m => m.role === 'user')?.text.substring(0, 30) || "Conversation";
     const newSession = {
         id: Date.now(),
         title: `${title}...`,
         timestamp: Date.now(),
         messages: messages,
         personaId: activePersona.id
     };
     const updated = [newSession, ...savedSessions];
     setSavedSessions(updated);
     localStorage.setItem('SNAPAURA_SAVED_SESSIONS', JSON.stringify(updated));
     showToast("Chat Saved to History", "success");
     setMenuOpenId(null);
  };

  const loadSession = (session: any) => {
      if(confirm("Load this chat? Current unsaved chat will be lost.")) {
          setMessages(session.messages);
          const p = PERSONAS.find(pr => pr.id === session.personaId);
          if(p) setActivePersona(p);
          setShowHistory(false);
          showToast("Chat Loaded", "success");
      }
  };

  const deleteSession = (id: number, e: React.MouseEvent) => {
      e.stopPropagation();
      const updated = savedSessions.filter(s => s.id !== id);
      setSavedSessions(updated);
      localStorage.setItem('SNAPAURA_SAVED_SESSIONS', JSON.stringify(updated));
  };

  const processAiResponse = async (history: any[], lastMsg: string, persona: typeof activePersona, img?: string) => {
      setLoading(true);
      if (isVoiceMode) setVoiceStatus('thinking');
      
      try {
          const historyForApi = history.slice(0, -1).filter(m => m.role).map(m => ({ role: m.role, parts: [{ text: m.text }] }));
          const res = await sendChatMessage(historyForApi, lastMsg, persona.prompt, img, state);
          
          setMessages(prev => [...prev, { role: 'model', text: res, personaId: persona.id, id: Date.now() }]);

          // AUTO-SPEAK in Voice Mode
          if (isVoiceMode) {
              setVoiceStatus('speaking');
              await playTTS(res, selectedVoiceId);
              setVoiceStatus('idle'); // Done speaking
          }

      } catch (e: any) {
          setMessages(prev => [...prev, { role: 'model', text: e.message || "Connection error.", personaId: persona.id, id: Date.now() }]);
          if (isVoiceMode) setVoiceStatus('idle');
      } finally {
          setLoading(false);
      }
  };

  const handleConnection = (c: any) => {
      setConn(c); setP2pStatus('connected');
      c.on('data', (data: any) => { setP2pMessages(prev => [...prev, { ...data, isMe: false }]); if (document.hidden) showToast(`Msg from ${data.sender}`, "info"); });
      c.on('close', () => { setP2pStatus('disconnected'); setConn(null); showToast("Connection lost", "error"); });
  };

  const connectToPeer = () => {
      if (!peer || !remoteId) return;
      setP2pStatus('connecting');
      const c = peer.connect(remoteId);
      c.on('open', () => handleConnection(c));
      c.on('error', () => { setP2pStatus('disconnected'); showToast("Could not connect", "error"); });
  };

  const sendP2P = (text: string, img?: string) => {
      if (conn && p2pStatus === 'connected') {
          const payload = { text, image: img, sender: username, timestamp: Date.now() };
          conn.send(payload);
          setP2pMessages(prev => [...prev, { ...payload, isMe: true }]);
      }
  };

  const toggleSpeech = (text: string, id: number) => {
      if (speakingMsgId === id) { 
          stopTTS();
          setSpeakingMsgId(null); 
      } else { 
          playTTS(text, selectedVoiceId);
          setSpeakingMsgId(id);
      }
  };

  const handleSend = (overrideText?: string) => {
      const textToSend = overrideText || input;
      if (!textToSend.trim()) return;
      
      const finalPayload = replyingTo 
          ? `[Replying to "${replyingTo.text.substring(0, 50)}..."]: ${textToSend}` 
          : textToSend;

      if (mode === 'AI') {
          const newMsgs = [...messages, { role: 'user', text: finalPayload, id: Date.now() }];
          setMessages(newMsgs);
          processAiResponse(newMsgs, finalPayload, activePersona);
      } else { sendP2P(finalPayload); }
      
      setInput('');
      setReplyingTo(null);
      if(textareaRef.current) textareaRef.current.style.height = 'auto';
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
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
              } else { sendP2P("Sent an image", res); }
              setIsPlusOpen(false);
          };
          reader.readAsDataURL(file);
      }
  };

  const handleClear = () => {
      stopTTS();
      if (mode === 'AI') { setMessages([{ role: 'model', text: activePersona.intro, personaId: activePersona.id, id: Date.now() }]); localStorage.removeItem('SNAPAURA_CHAT_HISTORY'); showToast("Chat Reset", "info"); } 
      else { setP2pMessages([]); showToast("Chat Cleared", "info"); }
  };

  const saveUsername = () => { if(username.trim()) { localStorage.setItem('SNAPAURA_USERNAME', username); setIsSetup(true); } };

  // --- MENU ACTIONS ---
  const handleOpenMenu = (id: number) => {
      if (navigator.vibrate) navigator.vibrate(50);
      setMenuOpenId(id);
  };

  const handleAction = (action: string, msg: any) => {
      setMenuOpenId(null);
      if (!msg) return;

      switch(action) {
          case 'copy': navigator.clipboard.writeText(msg.text); showToast("Copied", "success"); break;
          case 'reply': setReplyingTo(msg); textareaRef.current?.focus(); break;
          case 'save': dispatchIntent({ type: 'SEND_TO_NOTES', payload: { text: msg.text, title: `Chat with ${activePersona.name}` } }); break;
          case 'regenerate':
              const lastUserIndex = messages.findLastIndex(m => m.role === 'user');
              if (lastUserIndex !== -1) {
                  const newHistory = messages.slice(0, lastUserIndex + 1);
                  setMessages(newHistory);
                  processAiResponse(newHistory, messages[lastUserIndex].text, activePersona);
              }
              break;
          case 'delete':
              if (mode === 'AI') setMessages(prev => prev.filter(m => m.id !== msg.id));
              else setP2pMessages(prev => prev.filter(m => m.id !== msg.id));
              showToast("Message deleted", "info");
              break;
          case 'speak': toggleSpeech(msg.text, msg.id); break;
      }
  };

  return (
    <div className="h-full flex flex-col bg-[#292d3e] relative overflow-hidden pb-24" onClick={() => { setMenuOpenId(null); setShowVoiceMenu(false); }}>
        
        {/* === HEADER === */}
        <div className="bg-[#292d3e]/90 backdrop-blur-md border-b border-white/5 z-20 sticky top-0">
            <div className="flex justify-between items-center p-4">
                <div className="flex bg-[#1e212d] rounded-xl p-1 shadow-neu-pressed">
                    <button onClick={() => setMode('AI')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${mode === 'AI' ? 'bg-[#292d3e] shadow-neu text-blue-400' : 'text-gray-500'}`}><Sparkles size={14}/> AI Chat</button>
                    <button onClick={() => setMode('P2P')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${mode === 'P2P' ? 'bg-[#292d3e] shadow-neu text-green-400' : 'text-gray-500'}`}><Users size={14}/> P2P</button>
                </div>
                <div className="flex gap-3 items-center">
                    {mode === 'AI' && (
                        <>
                            {/* Voice Mode Toggle - Moved here for spacing */}
                            <button onClick={toggleVoiceMode} className="p-2 text-gray-400 hover:text-white transition-colors bg-[#292d3e] shadow-neu rounded-full active:shadow-neu-pressed relative">
                                <Headphones size={18}/>
                                {isVoiceMode && <span className="absolute top-0 right-0 w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>}
                            </button>
                            
                            <div className="relative">
                                <button onClick={(e) => { e.stopPropagation(); setShowVoiceMenu(!showVoiceMenu); }} className="p-2 text-gray-500 hover:text-white transition-colors bg-[#292d3e] shadow-neu rounded-full active:shadow-neu-pressed"><Volume2 size={18}/></button>
                                {showVoiceMenu && (
                                    <div className="absolute top-full right-0 mt-2 w-48 bg-[#292d3e] shadow-xl border border-white/10 rounded-xl overflow-hidden p-2 z-50">
                                        <h4 className="text-[10px] font-bold text-gray-500 uppercase px-2 mb-2">Select Voice</h4>
                                        <div className="max-h-40 overflow-y-auto hide-scrollbar space-y-1">
                                            {TTS_VOICES.map(v => (
                                                <button key={v.id} onClick={() => { setSelectedVoiceId(v.id); localStorage.setItem('SNAPAURA_TTS_VOICE_ID', v.id); }} className={`w-full text-left text-xs p-2 rounded-lg truncate ${selectedVoiceId === v.id ? 'bg-blue-400/20 text-blue-400' : 'text-gray-400 hover:bg-white/5'}`}>
                                                    {v.name}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                    <button onClick={() => setShowHistory(true)} className="p-2 text-gray-500 hover:text-blue-400 transition-colors bg-[#292d3e] shadow-neu rounded-full active:shadow-neu-pressed"><Archive size={18}/></button>
                    <button onClick={handleClear} className="p-2 text-gray-500 hover:text-red-400 transition-colors bg-[#292d3e] shadow-neu rounded-full active:shadow-neu-pressed"><RotateCcw size={18}/></button>
                </div>
            </div>
            {mode === 'AI' && (
                <div className="flex gap-2 overflow-x-auto hide-scrollbar px-4 pb-3">
                    {PERSONAS.map(p => (
                        <button key={p.id} onClick={() => { setActivePersona(p); setMessages(prev => [...prev, {role:'model', text: p.intro, personaId: p.id, id: Date.now()}]); }} className={`flex items-center gap-2 pr-3 pl-1 py-1 rounded-full text-[10px] font-bold transition-all whitespace-nowrap border ${activePersona.id === p.id ? 'bg-[#292d3e] shadow-neu-pressed border-white/10 text-white' : 'bg-transparent border-transparent text-gray-500 hover:text-gray-300'}`}>
                            <div className="w-6 h-6 rounded-full overflow-hidden"><img src={p.avatar} className="w-full h-full object-cover" alt={p.name} /></div>{p.name}
                        </button>
                    ))}
                </div>
            )}
        </div>

        {/* === CHAT CONTENT === */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 relative z-10 pb-44" ref={scrollRef}>
            {/* P2P Setup Screen... (Same as before) */}
            {mode === 'P2P' && !isSetup && (
                <div className="flex flex-col items-center justify-center h-full space-y-6 p-6">
                    <div className="w-20 h-20 bg-[#292d3e] shadow-neu rounded-full flex items-center justify-center text-green-400 mb-4"><Users size={40} /></div>
                    <h2 className="text-xl font-bold text-gray-200">Secure P2P Chat</h2>
                    <input value={username} onChange={e => setUsername(e.target.value)} placeholder="Enter your display name" className="w-full bg-[#292d3e] shadow-neu-pressed p-4 rounded-xl text-center text-white outline-none"/>
                    <button onClick={saveUsername} disabled={!username.trim()} className="w-full py-4 bg-[#292d3e] shadow-neu text-green-400 font-bold rounded-xl active:shadow-neu-pressed">Start Chatting</button>
                </div>
            )}
            
            {/* Messages */}
            {(mode === 'AI' ? messages : (p2pStatus === 'connected' ? p2pMessages : [])).map((m, i) => {
                const isUser = mode === 'AI' ? m.role === 'user' : m.isMe;
                const persona = mode === 'AI' ? (PERSONAS.find(p => p.id === m.personaId) || activePersona) : { avatar: null, color: 'text-green-400' };
                const isSpeaking = speakingMsgId === m.id;

                return (
                    <MessageItem 
                        key={i} 
                        msg={m} 
                        isUser={isUser} 
                        persona={persona} 
                        isSpeaking={isSpeaking} 
                        onToggleSpeech={() => toggleSpeech(m.text, m.id)}
                        onOpenMenu={() => handleOpenMenu(m.id)}
                        mode={mode}
                    />
                );
            })}
            
            {loading && mode === 'AI' && (
                <div className="flex gap-3 items-center ml-2">
                    <div className="w-8 h-8 rounded-full overflow-hidden shadow-neu border border-white/5"><img src={activePersona.avatar} className="w-full h-full object-cover opacity-50" /></div>
                    <div className="flex gap-1"><div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div><div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-100"></div><div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-200"></div></div>
                </div>
            )}
        </div>

        {/* === IMMERSIVE VOICE MODE OVERLAY === */}
        {isVoiceMode && (
            <div className="fixed inset-0 z-[60] bg-[#0f0f11]/95 backdrop-blur-xl flex flex-col items-center justify-center animate-fade-in-up">
                <button onClick={toggleVoiceMode} className="absolute top-6 right-6 p-3 bg-white/10 rounded-full text-white hover:bg-red-500/20 transition-colors">
                    <X size={24} />
                </button>

                <div className="flex flex-col items-center gap-8 w-full max-w-sm px-6">
                    <h3 className="text-xl font-bold text-gray-300 uppercase tracking-widest">
                        {voiceStatus === 'listening' ? 'Listening...' : 
                         voiceStatus === 'thinking' ? 'Thinking...' : 
                         voiceStatus === 'speaking' ? 'Speaking...' : 'Tap to Talk'}
                    </h3>

                    {/* THE NEURAL ORB */}
                    <div 
                        onClick={() => { if(voiceStatus !== 'speaking') startRecognition(); }}
                        className={`relative w-48 h-48 rounded-full flex items-center justify-center transition-all cursor-pointer ${voiceStatus === 'listening' ? 'scale-110' : 'scale-100'}`}
                    >
                        {/* Outer Ripple */}
                        <div className={`absolute inset-0 bg-blue-500/20 rounded-full ${voiceStatus === 'listening' ? 'animate-ping' : ''}`}></div>
                        <div className={`absolute inset-4 bg-purple-500/20 rounded-full ${voiceStatus === 'thinking' ? 'animate-spin-slow' : ''}`}></div>
                        
                        {/* Core */}
                        <div className={`w-32 h-32 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-full shadow-[0_0_50px_rgba(0,243,255,0.4)] flex items-center justify-center relative z-10 transition-all ${voiceStatus === 'speaking' ? 'animate-pulse' : ''}`}>
                            <Mic size={48} className="text-white drop-shadow-md" />
                        </div>
                    </div>

                    <p className="text-sm text-gray-500 text-center max-w-xs">
                        Tap the orb to speak. AI will auto-reply.
                        <br/>(Simulated Live Mode)
                    </p>
                </div>
            </div>
        )}

        {/* === CHAT HISTORY SIDEBAR === */}
        {showHistory && (
            <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm animate-fade-in-up flex justify-end">
                <div className="w-3/4 max-w-sm h-full bg-[#292d3e] shadow-2xl p-6 overflow-y-auto border-l border-white/10">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-gray-200">History</h2>
                        <button onClick={() => setShowHistory(false)} className="p-2 bg-[#292d3e] shadow-neu rounded-full text-gray-400 active:shadow-neu-pressed"><X size={16}/></button>
                    </div>
                    <div className="space-y-3">
                        {savedSessions.map(s => (
                            <div key={s.id} onClick={() => loadSession(s)} className="bg-[#292d3e] shadow-neu p-4 rounded-xl cursor-pointer active:shadow-neu-pressed group relative">
                                <h4 className="text-sm font-bold text-gray-300 truncate pr-6">{s.title}</h4>
                                <p className="text-[10px] text-gray-500 mt-1">{new Date(s.timestamp).toLocaleDateString()} • {PERSONAS.find(p=>p.id===s.personaId)?.name}</p>
                                <button onClick={(e) => deleteSession(s.id, e)} className="absolute right-3 top-3 text-gray-600 hover:text-red-400"><Trash2 size={14}/></button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )}

        {/* === ACTION SHEET (NATIVE STYLE BOTTOM DRAWER) === */}
        <div 
            className={`fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm transition-opacity duration-300 flex items-end justify-center ${menuOpenId ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`} 
            onClick={() => setMenuOpenId(null)}
        >
            <div 
                className={`bg-[#1e212d] w-full max-w-md rounded-t-3xl shadow-2xl transform transition-transform duration-300 overflow-hidden ${menuOpenId ? 'translate-y-0' : 'translate-y-full'}`}
                onClick={e => e.stopPropagation()}
            >
                <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mt-3 mb-6"></div>
                <div className="grid grid-cols-4 gap-y-6 gap-x-2 px-6 pb-10">
                    {[
                        { id: 'copy', label: 'Copy', icon: Copy, color: 'text-gray-300' },
                        { id: 'reply', label: 'Reply', icon: Reply, color: 'text-blue-400' },
                        { id: 'save', label: 'Save Note', icon: FileText, color: 'text-yellow-400' },
                        { id: 'speak', label: 'Speak', icon: Volume2, color: 'text-purple-400' },
                        { id: 'regenerate', label: 'Retry', icon: RefreshCw, color: 'text-green-400', hide: mode !== 'AI' },
                        { id: 'delete', label: 'Delete', icon: Trash2, color: 'text-red-400' }
                    ].map(action => (
                        !action.hide && (
                            <button 
                                key={action.id}
                                onClick={() => handleAction(action.id, messages.find(m=>m.id===menuOpenId) || p2pMessages.find(m=>m.id===menuOpenId))} 
                                className="flex flex-col items-center gap-2 group"
                            >
                                <div className={`w-14 h-14 bg-[#292d3e] rounded-2xl flex items-center justify-center ${action.color} group-active:scale-90 transition-all shadow-neu`}>
                                    <action.icon size={22}/>
                                </div>
                                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wide">{action.label}</span>
                            </button>
                        )
                    ))}
                </div>
            </div>
        </div>

        {/* === SPACIOUS INPUT BAR === */}
        <div className="p-4 fixed bottom-0 left-0 right-0 z-50 pointer-events-none pb-20 bg-gradient-to-t from-[#292d3e] to-transparent">
            <div className="max-w-md mx-auto pointer-events-auto flex items-end gap-3">
                {/* Plus Button */}
                <div className="relative">
                    <div className={`absolute bottom-full left-0 mb-3 flex flex-col gap-2 transition-all duration-300 ${isPlusOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
                        <button onClick={() => { fileRef.current?.click(); setIsPlusOpen(false); }} className="w-10 h-10 rounded-full bg-[#292d3e] shadow-neu flex items-center justify-center text-blue-400 active:shadow-neu-pressed border border-white/5"><ImageIcon size={18} /></button>
                        <button onClick={() => { setIsPlusOpen(false); }} className="w-10 h-10 rounded-full bg-[#292d3e] shadow-neu flex items-center justify-center text-pink-400 active:shadow-neu-pressed border border-white/5"><Smile size={18} /></button>
                    </div>
                    <button onClick={() => setIsPlusOpen(!isPlusOpen)} className={`w-11 h-11 rounded-full bg-[#292d3e] shadow-neu flex items-center justify-center text-gray-400 active:shadow-neu-pressed transition-transform duration-300 border border-white/5 ${isPlusOpen ? 'rotate-45 text-red-400' : ''}`}><Plus size={22} /></button>
                </div>
                
                {/* Main Input Field */}
                <div className="flex-1 relative group bg-[#292d3e] shadow-neu-pressed rounded-2xl flex items-center pr-2 border border-white/5">
                    <textarea 
                        ref={textareaRef} 
                        value={input} 
                        onChange={e => setInput(e.target.value)} 
                        onKeyDown={handleKeyDown} 
                        placeholder={mode === 'AI' ? "Message..." : "Secure chat..."} 
                        className="w-full bg-transparent px-4 py-3.5 text-gray-200 outline-none text-sm placeholder-gray-600 resize-none max-h-32 min-h-[48px] hide-scrollbar leading-relaxed" 
                        rows={1} 
                        disabled={mode === 'P2P' && p2pStatus !== 'connected'}
                    />
                    
                    {/* Inline Mic Button */}
                    <button 
                        onClick={() => startRecognition()} 
                        className={`p-2 rounded-xl transition-colors ${isListening ? 'text-red-400 animate-pulse' : 'text-gray-500 hover:text-white'}`}
                    >
                        {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                    </button>
                </div>

                {/* Send Button */}
                <button 
                    onClick={() => handleSend()} 
                    disabled={!input.trim() || (mode === 'P2P' && p2pStatus !== 'connected')} 
                    className="w-11 h-11 bg-[#292d3e] shadow-neu rounded-full text-blue-400 active:shadow-neu-pressed disabled:opacity-50 flex items-center justify-center transition-all hover:scale-105 active:scale-95 flex-shrink-0 border border-white/5"
                >
                    <Send size={20} className={input.trim() ? "fill-current" : ""} />
                </button>
            </div>
            <input type="file" ref={fileRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
        </div>
    </div>
  );
};

// Message Item Component
const MessageItem = ({ msg, isUser, persona, isSpeaking, onToggleSpeech, onOpenMenu, mode }: any) => {
    const longPress = useLongPress(() => {
        onOpenMenu(); 
    });

    return (
        <div className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'} animate-fade-in-up group relative`}>
            {!isUser && <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 mt-2 shadow-neu border border-white/5 bg-[#292d3e] flex items-center justify-center">{mode === 'AI' ? <img src={persona.avatar} className="w-full h-full object-cover" alt="AI" /> : <span className="text-[10px] font-bold text-green-400">{msg.sender?.[0]}</span>}</div>}
            
            <div 
                className={`max-w-[85%] space-y-1 relative`}
                onContextMenu={(e) => { e.preventDefault(); onOpenMenu(); }}
                onTouchStart={longPress.onTouchStart}
                onTouchEnd={longPress.onTouchEnd}
                onMouseDown={longPress.onMouseDown}
                onMouseUp={longPress.onMouseUp}
            >
                {!isUser && mode === 'P2P' && <p className="text-[9px] text-gray-500 ml-2">{msg.sender}</p>}
                {msg.image && <img src={msg.image} className="w-48 rounded-xl border border-white/10" alt="Upload" />}
                {msg.text && (
                    <div className={`p-3.5 rounded-2xl text-sm leading-relaxed shadow-neu relative select-none transition-transform active:scale-[0.98] ${isUser ? 'bg-[#292d3e] text-blue-400 rounded-tr-none border border-blue-500/10' : 'bg-[#292d3e] text-gray-300 rounded-tl-none border border-white/5'}`}>
                        {msg.text.includes('[Replying to') && (
                             <div className="text-[10px] text-gray-500 italic mb-2 border-l-2 border-white/20 pl-2">
                                 {msg.text.split(']:')[0].replace('[Replying to "', 'Replying: "')}
                             </div>
                        )}
                        <div dangerouslySetInnerHTML={{ __html: msg.text.replace(/\[Replying to.*?\]:\s/, '').replace(/\n/g, '<br/>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                        
                        {!isUser && mode === 'AI' && <button onClick={(e) => {e.stopPropagation(); onToggleSpeech();}} className={`absolute -right-8 bottom-0 p-2 text-gray-500 hover:text-white transition-opacity ${isSpeaking ? 'opacity-100 text-green-400' : 'opacity-0 group-hover:opacity-100'}`}>{isSpeaking ? <Activity className="animate-pulse" size={14}/> : <Volume2 size={14}/>}</button>}
                    </div>
                )}
            </div>

            {isUser && <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 mt-2 shadow-neu border border-white/5 bg-[#1e212d] flex items-center justify-center"><User size={14} className="text-gray-500"/></div>}
        </div>
    );
};

export default Chat;
