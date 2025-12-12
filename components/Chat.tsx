
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Send, Sparkles, ImageIcon, RotateCcw, User, Heart, Zap, Briefcase, Camera, TrendingUp, Smile, Activity, Radio, Users, Copy, Link2, CheckCircle, AlertCircle, Plus, X, Volume2, Reply, FileText, RefreshCw, Trash2, MoreVertical, Mic, Archive, Save, ChevronDown } from './Icons';
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

// Hook for long press
function useLongPress(callback: () => void, ms = 500) {
  const [startLongPress, setStartLongPress] = useState(false);

  useEffect(() => {
    let timerId: any;
    if (startLongPress) {
      timerId = setTimeout(callback, ms);
    } else {
      clearTimeout(timerId);
    }

    return () => {
      clearTimeout(timerId);
    };
  }, [callback, ms, startLongPress]);

  return {
    onMouseDown: () => setStartLongPress(true),
    onMouseUp: () => setStartLongPress(false),
    onMouseLeave: () => setStartLongPress(false),
    onTouchStart: () => setStartLongPress(true),
    onTouchEnd: () => setStartLongPress(false),
  };
}

const Chat: React.FC<any> = () => {
  const { state, dispatchIntent } = useNeural(); // Access Global State
  const [mode, setMode] = useState<'AI' | 'P2P'>('AI');
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [isPlusOpen, setIsPlusOpen] = useState(false);
  
  // --- AI STATE ---
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [activePersona, setActivePersona] = useState(PERSONAS[0]);

  // --- NEW: VOICE & HISTORY STATE ---
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [savedSessions, setSavedSessions] = useState<any[]>([]);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState<string>('');
  const [showVoiceMenu, setShowVoiceMenu] = useState(false);

  // --- P2P STATE ---
  const [peer, setPeer] = useState<any>(null);
  const [myId, setMyId] = useState('');
  const [conn, setConn] = useState<any>(null);
  const [remoteId, setRemoteId] = useState('');
  const [p2pMessages, setP2pMessages] = useState<any[]>([]);
  const [p2pStatus, setP2pStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  const [username, setUsername] = useState('');
  const [isSetup, setIsSetup] = useState(false);

  // --- TTS & ACTION MENU State ---
  const [speakingMsgId, setSpeakingMsgId] = useState<number | null>(null);
  const [menuOpenId, setMenuOpenId] = useState<number | null>(null);
  const [replyingTo, setReplyingTo] = useState<any>(null); // New Reply State

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
        ctx.fillStyle = 'rgba(41, 45, 62, 0.1)'; 
        ctx.fillRect(0, 0, width, height);
        ctx.fillStyle = '#00f3ff';
        ctx.font = `${fontSize}px monospace`;
        for (let i = 0; i < drops.length; i++) {
            const text = Math.floor(Math.random() * 10).toString(); 
            ctx.fillText(text, i * fontSize, drops[i] * fontSize);
            if (drops[i] * fontSize > height && Math.random() > 0.975) drops[i] = 0;
            drops[i]++;
        }
    };
    const interval = setInterval(draw, 50);
    const handleResize = () => {
        width = canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
        height = canvas.height = canvas.parentElement?.clientHeight || window.innerHeight;
    };
    window.addEventListener('resize', handleResize);
    return () => { clearInterval(interval); window.removeEventListener('resize', handleResize); };
  }, []);

  // Persistence
  useEffect(() => {
      const storedHistory = localStorage.getItem('SNAPAURA_CHAT_HISTORY');
      const storedAvatar = localStorage.getItem('SNAPAURA_AVATAR');
      const storedSessions = localStorage.getItem('SNAPAURA_SAVED_SESSIONS');
      let effectiveUsername = state.userProfile?.username || localStorage.getItem('SNAPAURA_USERNAME');
      
      if (storedAvatar) setUserAvatar(storedAvatar);
      if (effectiveUsername) { setUsername(effectiveUsername); setIsSetup(true); }
      if (storedHistory) { try { setMessages(JSON.parse(storedHistory)); } catch(e) {} } 
      else { setMessages([{ role: 'model', text: activePersona.intro, personaId: activePersona.id, id: Date.now() }]); }
      
      if (storedSessions) { try { setSavedSessions(JSON.parse(storedSessions)); } catch(e) {} }

      // Load Voices
      const loadVoices = () => {
          const vs = window.speechSynthesis.getVoices();
          setVoices(vs);
          const pref = localStorage.getItem('SNAPAURA_TTS_VOICE');
          if (pref) setSelectedVoiceURI(pref);
      };
      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;

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
      
      if (state.activeAnalysis && messages.length === 0) {
          const analysisSnippet = state.activeAnalysis?.analysis?.substring(0, 50) || "your image";
          setMessages([{ role: 'model', text: `I see you're working on an image. It looks like: "${analysisSnippet}...". How can I help?`, personaId: 'system', id: Date.now() }]);
      }
      return () => window.removeEventListener('neural-chat-intent', handleIntent);
  }, [state.activeAnalysis]);

  useEffect(() => {
      if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, p2pMessages, mode, input, replyingTo, isListening]);

  // --- NEW: Voice Input Handler ---
  const handleVoiceInput = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      showToast("Voice input not supported", "error");
      return;
    }
    
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(prev => prev + (prev ? ' ' : '') + transcript);
    };

    recognition.onerror = () => {
      setIsListening(false);
      showToast("Voice input failed", "error");
    };
    
    recognitionRef.current = recognition;
    recognition.start();
  };

  // --- NEW: Session Management ---
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
      try {
          const historyForApi = history.slice(0, -1).filter(m => m.role).map(m => ({ role: m.role, parts: [{ text: m.text }] }));
          const res = await sendChatMessage(historyForApi, lastMsg, persona.prompt, img, state);
          setMessages(prev => [...prev, { role: 'model', text: res, personaId: persona.id, id: Date.now() }]);
      } catch (e: any) {
          setMessages(prev => [...prev, { role: 'model', text: e.message || "Connection error.", personaId: persona.id, id: Date.now() }]);
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

  // --- IMPROVED TTS ---
  const cleanTextForSpeech = (text: string) => {
      return text
          .replace(/[*_`#]/g, '') // Markdown
          .replace(/\[.*?\]/g, '') // Brackets
          // Remove emojis (replace with silence)
          .replace(/([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g, ' ');
  };

  const toggleSpeech = (text: string, id: number) => {
      if (speakingMsgId === id) { 
          window.speechSynthesis.cancel(); 
          setSpeakingMsgId(null); 
      } else { 
          window.speechSynthesis.cancel(); 
          const utterance = new SpeechSynthesisUtterance(cleanTextForSpeech(text)); 
          if(selectedVoiceURI) {
              const v = voices.find(v => v.voiceURI === selectedVoiceURI);
              if(v) utterance.voice = v;
          }
          utterance.onend = () => setSpeakingMsgId(null); 
          setSpeakingMsgId(id); 
          window.speechSynthesis.speak(utterance); 
      }
  };

  const handleSend = () => {
      if (!input.trim()) return;
      
      const textToSend = replyingTo 
          ? `[Replying to "${replyingTo.text.substring(0, 50)}..."]: ${input}` 
          : input;

      if (mode === 'AI') {
          const newMsgs = [...messages, { role: 'user', text: textToSend, id: Date.now() }];
          setMessages(newMsgs);
          processAiResponse(newMsgs, textToSend, activePersona);
      } else { sendP2P(textToSend); }
      
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
          case 'copy':
              navigator.clipboard.writeText(msg.text);
              showToast("Copied", "success");
              break;
          case 'reply':
              setReplyingTo(msg);
              textareaRef.current?.focus();
              break;
          case 'save':
              dispatchIntent({ type: 'SEND_TO_NOTES', payload: { text: msg.text, title: `Chat with ${activePersona.name}` } });
              break;
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
          case 'speak':
              toggleSpeech(msg.text, msg.id);
              break;
      }
  };

  return (
    <div className="h-full flex flex-col bg-[#292d3e] relative overflow-hidden pb-24" onClick={() => { setMenuOpenId(null); setShowVoiceMenu(false); }}>
        <canvas id="matrix-bg" className="absolute inset-0 z-0 opacity-10 pointer-events-none"></canvas>
        <div className="absolute inset-0 z-0 opacity-20 pointer-events-none bg-[linear-gradient(rgba(0,243,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,243,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px]"></div>

        <div className="bg-[#292d3e]/90 backdrop-blur-md border-b border-white/5 z-20">
            <div className="flex justify-between items-center p-4">
                <div className="flex bg-[#1e212d] rounded-xl p-1 shadow-neu-pressed">
                    <button onClick={() => setMode('AI')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${mode === 'AI' ? 'bg-[#292d3e] shadow-neu text-blue-400' : 'text-gray-500'}`}><Sparkles size={14}/> AI Chat</button>
                    <button onClick={() => setMode('P2P')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${mode === 'P2P' ? 'bg-[#292d3e] shadow-neu text-green-400' : 'text-gray-500'}`}><Users size={14}/> P2P</button>
                </div>
                <div className="flex gap-2">
                    {mode === 'AI' && (
                        <div className="relative">
                            <button onClick={(e) => { e.stopPropagation(); setShowVoiceMenu(!showVoiceMenu); }} className="p-2 text-gray-500 hover:text-white transition-colors bg-[#292d3e] shadow-neu rounded-full active:shadow-neu-pressed"><Volume2 size={16}/></button>
                            {showVoiceMenu && (
                                <div className="absolute top-full right-0 mt-2 w-48 bg-[#292d3e] shadow-xl border border-white/10 rounded-xl overflow-hidden p-2 z-50">
                                    <h4 className="text-[10px] font-bold text-gray-500 uppercase px-2 mb-2">Select Voice</h4>
                                    <div className="max-h-40 overflow-y-auto hide-scrollbar space-y-1">
                                        {voices.map(v => (
                                            <button key={v.voiceURI} onClick={() => { setSelectedVoiceURI(v.voiceURI); localStorage.setItem('SNAPAURA_TTS_VOICE', v.voiceURI); }} className={`w-full text-left text-xs p-2 rounded-lg truncate ${selectedVoiceURI === v.voiceURI ? 'bg-blue-400/20 text-blue-400' : 'text-gray-400 hover:bg-white/5'}`}>
                                                {v.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                    <button onClick={() => saveSession()} className="p-2 text-gray-500 hover:text-yellow-400 transition-colors bg-[#292d3e] shadow-neu rounded-full active:shadow-neu-pressed" title="Save Chat"><Save size={16}/></button>
                    <button onClick={() => setShowHistory(true)} className="p-2 text-gray-500 hover:text-blue-400 transition-colors bg-[#292d3e] shadow-neu rounded-full active:shadow-neu-pressed" title="History"><Archive size={16}/></button>
                    <button onClick={handleClear} className="p-2 text-gray-500 hover:text-red-400 transition-colors bg-[#292d3e] shadow-neu rounded-full active:shadow-neu-pressed" title="Reset"><RotateCcw size={16}/></button>
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
            {mode === 'P2P' && isSetup && (
                <div className="px-4 pb-3 flex justify-between items-center text-xs">
                    <div className="flex items-center gap-2 text-gray-400"><Radio size={14} className={p2pStatus === 'connected' ? "text-green-400 animate-pulse" : "text-gray-500"} />{p2pStatus === 'connected' ? 'Encrypted Connection Active' : 'Waiting for connection...'}</div>
                    {myId && <button onClick={() => {navigator.clipboard.writeText(myId); showToast("ID Copied", "success")}} className="flex items-center gap-1 text-blue-400 font-bold bg-[#292d3e] px-2 py-1 rounded-lg shadow-neu active:shadow-neu-pressed"><Copy size={12}/> My ID</button>}
                </div>
            )}
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 relative z-10 pb-44" ref={scrollRef}>
            {mode === 'P2P' && !isSetup && (
                <div className="flex flex-col items-center justify-center h-full space-y-6 p-6">
                    <div className="w-20 h-20 bg-[#292d3e] shadow-neu rounded-full flex items-center justify-center text-green-400 mb-4"><Users size={40} /></div>
                    <h2 className="text-xl font-bold text-gray-200">Secure P2P Chat</h2>
                    <input value={username} onChange={e => setUsername(e.target.value)} placeholder="Enter your display name" className="w-full bg-[#292d3e] shadow-neu-pressed p-4 rounded-xl text-center text-white outline-none"/>
                    <button onClick={saveUsername} disabled={!username.trim()} className="w-full py-4 bg-[#292d3e] shadow-neu text-green-400 font-bold rounded-xl active:shadow-neu-pressed">Start Chatting</button>
                </div>
            )}
            {mode === 'P2P' && isSetup && p2pStatus === 'disconnected' && (
                <div className="bg-[#292d3e] shadow-neu p-6 rounded-2xl space-y-6 mx-4 mt-10">
                    <div className="text-center space-y-2"><h3 className="font-bold text-gray-200">Connect with Friend</h3><p className="text-xs text-gray-500">Share your ID or enter theirs below.</p></div>
                    <div className="flex items-center justify-between bg-[#1e212d] p-3 rounded-xl"><span className="text-xs text-gray-500 font-mono">{myId || "Generating ID..."}</span><button onClick={() => {navigator.clipboard.writeText(myId); showToast("ID Copied", "success")}} className="text-blue-400"><Copy size={16}/></button></div>
                    <div className="space-y-4"><input value={remoteId} onChange={e => setRemoteId(e.target.value)} placeholder="Paste Friend's ID here..." className="w-full bg-[#292d3e] shadow-neu-pressed p-4 rounded-xl text-sm text-white outline-none"/><button onClick={connectToPeer} className="w-full py-3 bg-[#292d3e] shadow-neu text-blue-400 font-bold rounded-xl active:shadow-neu-pressed flex justify-center items-center gap-2"><Link2 size={18}/> Connect</button></div>
                </div>
            )}

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

        {/* --- CHAT HISTORY SIDEBAR --- */}
        {showHistory && (
            <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm animate-fade-in-up flex justify-end">
                <div className="w-3/4 max-w-sm h-full bg-[#292d3e] shadow-2xl p-6 overflow-y-auto border-l border-white/10">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-gray-200">Chat History</h2>
                        <button onClick={() => setShowHistory(false)} className="p-2 bg-[#292d3e] shadow-neu rounded-full text-gray-400 active:shadow-neu-pressed"><X size={16}/></button>
                    </div>
                    <div className="space-y-3">
                        {savedSessions.length === 0 ? <p className="text-gray-500 text-sm text-center">No saved chats.</p> : savedSessions.map(s => (
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

        {/* --- FIXED ACTION SHEET MENU --- */}
        {menuOpenId && (
            <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in-up" onClick={() => setMenuOpenId(null)}>
                <div className="bg-[#292d3e] w-full sm:w-auto sm:min-w-[320px] p-6 pb-8 rounded-t-3xl sm:rounded-3xl shadow-2xl border-t border-white/10 sm:border-0" onClick={e => e.stopPropagation()}>
                    <div className="w-12 h-1 bg-white/10 rounded-full mx-auto mb-6 sm:hidden"></div>
                    <div className="grid grid-cols-4 gap-4">
                        <button onClick={() => handleAction('copy', messages.find(m=>m.id===menuOpenId) || p2pMessages.find(m=>m.id===menuOpenId))} className="flex flex-col items-center gap-2 group">
                            <div className="w-12 h-12 bg-[#1e212d] rounded-2xl flex items-center justify-center text-gray-300 group-active:scale-95 transition-transform"><Copy size={20}/></div>
                            <span className="text-[10px] text-gray-500 font-bold uppercase">Copy</span>
                        </button>
                        <button onClick={() => handleAction('reply', messages.find(m=>m.id===menuOpenId) || p2pMessages.find(m=>m.id===menuOpenId))} className="flex flex-col items-center gap-2 group">
                            <div className="w-12 h-12 bg-[#1e212d] rounded-2xl flex items-center justify-center text-blue-400 group-active:scale-95 transition-transform"><Reply size={20}/></div>
                            <span className="text-[10px] text-gray-500 font-bold uppercase">Reply</span>
                        </button>
                         <button onClick={() => handleAction('save', messages.find(m=>m.id===menuOpenId) || p2pMessages.find(m=>m.id===menuOpenId))} className="flex flex-col items-center gap-2 group">
                            <div className="w-12 h-12 bg-[#1e212d] rounded-2xl flex items-center justify-center text-yellow-400 group-active:scale-95 transition-transform"><FileText size={20}/></div>
                            <span className="text-[10px] text-gray-500 font-bold uppercase">Save</span>
                        </button>
                         <button onClick={() => handleAction('speak', messages.find(m=>m.id===menuOpenId) || p2pMessages.find(m=>m.id===menuOpenId))} className="flex flex-col items-center gap-2 group">
                            <div className="w-12 h-12 bg-[#1e212d] rounded-2xl flex items-center justify-center text-purple-400 group-active:scale-95 transition-transform"><Volume2 size={20}/></div>
                            <span className="text-[10px] text-gray-500 font-bold uppercase">Speak</span>
                        </button>
                        {mode === 'AI' && (
                            <button onClick={() => handleAction('regenerate', null)} className="flex flex-col items-center gap-2 group">
                                <div className="w-12 h-12 bg-[#1e212d] rounded-2xl flex items-center justify-center text-green-400 group-active:scale-95 transition-transform"><RefreshCw size={20}/></div>
                                <span className="text-[10px] text-gray-500 font-bold uppercase">Retry</span>
                            </button>
                        )}
                         <button onClick={() => handleAction('delete', messages.find(m=>m.id===menuOpenId) || p2pMessages.find(m=>m.id===menuOpenId))} className="flex flex-col items-center gap-2 group">
                            <div className="w-12 h-12 bg-[#1e212d] rounded-2xl flex items-center justify-center text-red-400 group-active:scale-95 transition-transform"><Trash2 size={20}/></div>
                            <span className="text-[10px] text-gray-500 font-bold uppercase">Delete</span>
                        </button>
                    </div>
                </div>
            </div>
        )}

        <div className="p-4 fixed bottom-0 left-0 right-0 z-50 pointer-events-none pb-20">
            <div className="max-w-md mx-auto pointer-events-auto flex items-end gap-2">
                <div className="relative">
                    <div className={`absolute bottom-full left-0 mb-2 flex flex-col gap-2 transition-all duration-300 ${isPlusOpen ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-90 pointer-events-none'}`}>
                        <button onClick={() => { fileRef.current?.click(); setIsPlusOpen(false); }} className="w-10 h-10 rounded-full bg-[#292d3e] shadow-neu flex items-center justify-center text-blue-400 active:shadow-neu-pressed"><ImageIcon size={18} /></button>
                        <button onClick={() => { setIsPlusOpen(false); }} className="w-10 h-10 rounded-full bg-[#292d3e] shadow-neu flex items-center justify-center text-pink-400 active:shadow-neu-pressed"><Smile size={18} /></button>
                    </div>
                    <button onClick={() => setIsPlusOpen(!isPlusOpen)} className={`w-10 h-10 rounded-full bg-[#292d3e] shadow-neu flex items-center justify-center text-gray-400 active:shadow-neu-pressed transition-transform duration-300 ${isPlusOpen ? 'rotate-45 text-red-400' : ''}`}><Plus size={20} /></button>
                </div>
                
                <div className="flex-1 relative group rounded-2xl bg-gradient-to-r from-[#00f3ff] via-[#ff0099] to-[#39ff14] p-[1px] shadow-neon-blue">
                    <div className="bg-[#292d3e] rounded-2xl flex flex-col p-1">
                        {/* Reply Preview */}
                        {replyingTo && (
                            <div className="mx-2 mt-2 mb-1 p-3 bg-[#1e212d] border-l-4 border-blue-500 rounded-r-lg flex justify-between items-center relative animate-fade-in-up">
                                <div className="overflow-hidden pr-6">
                                    <span className="text-[10px] font-bold text-blue-400 block mb-1">
                                        Replying to {replyingTo.role === 'user' || replyingTo.isMe ? 'You' : (replyingTo.sender || 'AI')}
                                    </span>
                                    <p className="text-xs text-gray-400 truncate">{replyingTo.text}</p>
                                </div>
                                <button 
                                    onClick={() => setReplyingTo(null)}
                                    className="absolute top-2 right-2 text-gray-500 hover:text-white"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        )}
                        <textarea ref={textareaRef} value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKeyDown} placeholder={mode === 'AI' ? `Message ${activePersona.name}...` : "Type a secure message..."} className="w-full bg-transparent px-3 py-3 text-gray-200 outline-none text-sm placeholder-gray-600 resize-none max-h-32 min-h-[44px] hide-scrollbar leading-relaxed" rows={1} disabled={mode === 'P2P' && p2pStatus !== 'connected'}/>
                    </div>
                </div>
                 <button onClick={handleVoiceInput} className={`w-10 h-10 bg-[#292d3e] shadow-neu rounded-full active:shadow-neu-pressed flex items-center justify-center transition-all flex-shrink-0 ${isListening ? 'text-red-400 animate-pulse shadow-neon-pink' : 'text-gray-400 hover:text-white'}`}><Mic size={18} /></button>
                <button onClick={handleSend} disabled={!input.trim() || (mode === 'P2P' && p2pStatus !== 'connected')} className="w-10 h-10 bg-[#292d3e] shadow-neu rounded-full text-blue-400 active:shadow-neu-pressed disabled:opacity-50 flex items-center justify-center transition-all hover:scale-105 active:scale-95 flex-shrink-0"><Send size={18} className={input.trim() ? "fill-current" : ""} /></button>
            </div>
            <input type="file" ref={fileRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
        </div>
    </div>
  );
};

// Extracted Message Item for better hook usage
const MessageItem = ({ msg, isUser, persona, isSpeaking, onToggleSpeech, onOpenMenu, mode }: any) => {
    const longPress = useLongPress(() => {
        onOpenMenu(); // Trigger menu on long press
    });

    return (
        <div className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'} animate-fade-in-up group relative`}>
            {!isUser && <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 mt-2 shadow-neu border border-white/5 bg-[#292d3e] flex items-center justify-center">{mode === 'AI' ? <img src={persona.avatar} className="w-full h-full object-cover" alt="AI" /> : <span className="text-[10px] font-bold text-green-400">{msg.sender?.[0]}</span>}</div>}
            
            <div 
                className={`max-w-[85%] space-y-1 relative`}
                // Support both Right Click and Long Press
                onContextMenu={(e) => { e.preventDefault(); onOpenMenu(); }}
                onTouchStart={longPress.onTouchStart}
                onTouchEnd={longPress.onTouchEnd}
                onMouseDown={longPress.onMouseDown}
                onMouseUp={longPress.onMouseUp}
                onClick={(e) => {
                    // Mobile fix: if user just taps, verify if we should open menu or not
                    // Ideally taps shouldn't trigger menu, only long press
                }}
            >
                {!isUser && mode === 'P2P' && <p className="text-[9px] text-gray-500 ml-2">{msg.sender}</p>}
                {msg.image && <img src={msg.image} className="w-48 rounded-xl border border-white/10" alt="Upload" />}
                {msg.text && (
                    <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-neu relative select-none transition-transform active:scale-[0.98] ${isUser ? 'bg-[#292d3e] text-blue-400 rounded-tr-none border border-blue-500/10' : 'bg-[#292d3e] text-gray-300 rounded-tl-none border border-white/5'}`}>
                        {/* Quote visualization if message contains Reply metadata */}
                        {msg.text.includes('[Replying to') && (
                             <div className="text-[10px] text-gray-500 italic mb-2 border-l-2 border-white/20 pl-2">
                                 {msg.text.split(']:')[0].replace('[Replying to "', 'Replying: "')}
                             </div>
                        )}
                        <div dangerouslySetInnerHTML={{ __html: msg.text.replace(/\[Replying to.*?\]:\s/, '').replace(/\n/g, '<br/>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                        
                        {!isUser && mode === 'AI' && <button onClick={(e) => {e.stopPropagation(); onToggleSpeech();}} className={`absolute -right-8 bottom-0 p-2 text-gray-500 hover:text-white transition-opacity ${isSpeaking ? 'opacity-100 text-green-400' : 'opacity-0 group-hover:opacity-100'}`}>{isSpeaking ? <Activity className="animate-pulse" size={14}/> : <Volume2 size={14}/>}</button>}
                    </div>
                )}
                 
                 {/* 3-Dots Menu Trigger */}
                <button 
                    onClick={(e) => { e.stopPropagation(); onOpenMenu(); }}
                    className={`absolute top-2 ${isUser ? '-left-8' : '-right-8'} p-1.5 text-gray-500 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity bg-[#292d3e]/50 rounded-full md:block hidden`}
                >
                   <MoreVertical size={14} />
                </button>
            </div>

            {isUser && <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 mt-2 shadow-neu border border-white/5 bg-[#1e212d] flex items-center justify-center"><User size={14} className="text-gray-500"/></div>}
        </div>
    );
};

export default Chat;
