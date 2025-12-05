
import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Copy, ShieldCheck, RefreshCw, Settings, Mic, Volume2, Radio, Paperclip, ImageIcon, FileText, XCircle, StopCircle, Play, Download, LogIn, Reply, SmilePlus, Trash, MoreVertical, UserMinus, Heart, DownloadCloud, Link as LinkIcon, User, RotateCcw, Square, Plus } from './Icons';
import { sendChatMessage } from '../services/geminiService';
import { showToast } from './Toast';

// Message Types
interface Message {
  id: string;
  role: 'user' | 'model' | 'peer' | 'me';
  sender?: string; // Username of sender
  text: string;
  type?: 'text' | 'image' | 'audio' | 'file';
  fileName?: string;
  fileSize?: string;
  timestamp?: number;
  replyTo?: Message;
  reactions?: { [key: string]: number };
  isDeleted?: boolean;
}

type ChatMode = 'ai' | 'p2p';
type P2PState = 'username' | 'setup' | 'connected';

interface Persona {
  id: string;
  name: string;
  role: string;
  avatar: string;
  color: string;
  systemPrompt: string;
  intro: string; // New field for natural openers
}

// Updated Personas with Unsplash Avatars and Human Prompts
const PERSONAS: Persona[] = [
  {
    id: 'aesthetic',
    name: 'Aesthetic Coach',
    role: 'Vibe Curator',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop',
    color: 'text-pink-400',
    systemPrompt: "You are a Gen-Z Aesthetic Coach. Talk like a trendy creative director. Be super helpful but chill. Use emojis. Keep advice short and practical. Don't be robotic.",
    intro: "Hey! ✨ Ready to fix the vibe or planning a new aesthetic? Let's see what you've got."
  },
  {
    id: 'photo',
    name: 'Photo Mentor',
    role: 'Pro Photographer',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop',
    color: 'text-blue-400',
    systemPrompt: "You are a seasoned photographer. Talk like a mentor. Explain lighting/composition simply. Don't use jargon without explaining. Keep it brief and encouraging.",
    intro: "Cameras ready? 📸 Ask me anything about lighting, composition, or gear."
  },
  {
    id: 'social',
    name: 'Growth Guru',
    role: 'Social Strategist',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop',
    color: 'text-purple-400',
    systemPrompt: "You are a Social Media Strategist. Talk like a growth hacker. Be punchy. Focus on viral hooks and engagement. No fluff. Give clear, actionable steps.",
    intro: "Let's blow up your engagement. 🚀 What's the niche we're targeting today?"
  },
  {
    id: 'vibe',
    name: 'Vibe Advisor',
    role: 'Relationship & Mood',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop',
    color: 'text-red-400',
    systemPrompt: "You are an empathetic Vibe Advisor. Listen like a best friend. Give warm, real advice. Be supportive but honest. Keep it conversational.",
    intro: "Hey you. ❤️ Everything okay? I'm here if you need to vent or just chat."
  },
  {
    id: 'productivity',
    name: 'Focus Coach',
    role: 'Productivity Expert',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop',
    color: 'text-orange-400',
    systemPrompt: "You are a no-nonsense Productivity Coach. Be direct and efficient. Bullet points are your friend. Help the user get things done fast.",
    intro: "Time is money. ⏳ What's the blockage? Let's solve it."
  },
  {
    id: 'football',
    name: 'Footy Analyst',
    role: 'Sports Pundit',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop',
    color: 'text-green-400',
    systemPrompt: "You are a football pundit. Talk stats and tactics like a fan. Be objective but passionate. Analyze form and key players concisely.",
    intro: "Kickoff time! ⚽ Who are we analyzing today? Or need a prediction?"
  },
  {
    id: 'friend',
    name: 'Bestie',
    role: 'Chat Companion',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop',
    color: 'text-yellow-400',
    systemPrompt: "You are a friendly chat companion. Just hang out. Be casual, use slang if appropriate. Ask questions. Don't act like an assistant.",
    intro: "Yo! What's the tea? ☕ Or we just chilling?"
  }
];

interface ChatProps {
  onOpenSettings: () => void;
}

// Global for marked (loaded via CDN)
declare const marked: any;
// Global for PeerJS
declare const Peer: any;

const Chat: React.FC<ChatProps> = ({ onOpenSettings }) => {
  const [mode, setMode] = useState<ChatMode>('ai');
  const scrollRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // --- AI CHAT STATE ---
  const [selectedPersona, setSelectedPersona] = useState<Persona | null>(null);
  const [aiInput, setAiInput] = useState('');
  const [aiMessages, setAiMessages] = useState<Message[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [isAiListening, setIsAiListening] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // --- P2P CHAT STATE (PeerJS) ---
  const [username, setUsername] = useState('');
  const [p2pState, setP2pState] = useState<P2PState>('username');
  const [p2pMessages, setP2pMessages] = useState<Message[]>([]);
  const [p2pInput, setP2pInput] = useState('');
  const [myPeerId, setMyPeerId] = useState('');
  const [targetPeerId, setTargetPeerId] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [activeConnections, setActiveConnections] = useState<number>(0);
  const [isHost, setIsHost] = useState(false);
  
  // Advanced P2P UI
  const [showAdmin, setShowAdmin] = useState(false);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  
  // Multimedia State
  const [attachment, setAttachment] = useState<{type: 'image' | 'file', content: string, name: string, size?: string} | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // User Avatar State
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  
  // Actions UI State
  const [actionsExpanded, setActionsExpanded] = useState(false);

  // Refs for PeerJS
  const peerInstance = useRef<any>(null);
  const connectionsRef = useRef<any[]>([]); 
  const connectedUsersRef = useRef<{id: string, name: string}[]>([]); 

  // Matrix Animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;
    
    const chars = '0123456789';
    const fontSize = 14;
    const columns = width / fontSize;
    const drops: number[] = [];

    for (let i = 0; i < columns; i++) {
        drops[i] = Math.random() * -100;
    }

    let animationId: number;

    const draw = () => {
        // Fade effect
        ctx.fillStyle = 'rgba(41, 45, 62, 0.1)'; // Matches bg-[#292d3e]
        ctx.fillRect(0, 0, width, height);

        ctx.fillStyle = '#00f3ff'; // Electric Cyan
        ctx.font = `${fontSize}px monospace`;

        for (let i = 0; i < drops.length; i++) {
            const text = chars.charAt(Math.floor(Math.random() * chars.length));
            ctx.fillText(text, i * fontSize, drops[i] * fontSize);

            if (drops[i] * fontSize > height && Math.random() > 0.975) {
                drops[i] = 0;
            }
            drops[i]++;
        }
        animationId = requestAnimationFrame(draw);
    };

    const handleResize = () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);
    draw();

    return () => {
        cancelAnimationFrame(animationId);
        window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Load Persona from LocalStorage
  useEffect(() => {
    const savedId = localStorage.getItem('SNAPAURA_PERSONA');
    if (savedId) {
      const persona = PERSONAS.find(p => p.id === savedId);
      if (persona) {
        setSelectedPersona(persona);
        setAiMessages([{ id: 'init-p', role: 'model', text: persona.intro }]);
      }
    }
  }, []);

  // Load User Avatar
  useEffect(() => {
      const loadAvatar = () => {
          const stored = localStorage.getItem('SNAPAURA_AVATAR');
          setUserAvatar(stored);
      };
      loadAvatar();
      window.addEventListener('avatar-update', loadAvatar);
      return () => window.removeEventListener('avatar-update', loadAvatar);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [aiMessages, p2pMessages, mode, attachment, replyingTo]);

  useEffect(() => {
    return () => {
      destroyPeer();
      window.speechSynthesis.cancel();
    };
  }, []);

  useEffect(() => {
      const interval = setInterval(() => {
          if (!peerInstance.current) return;
          connectionsRef.current = connectionsRef.current.filter(c => c.open);
          setActiveConnections(connectionsRef.current.length);
          const users = connectionsRef.current.map(c => ({
              id: c.peer,
              name: c.metadata?.username || 'Unknown'
          }));
          connectedUsersRef.current = users;
          if (isHost) {
              connectionsRef.current.forEach(c => {
                  if(c.open) c.send({ type: 'ping' });
              });
          }
      }, 3000);
      return () => clearInterval(interval);
  }, [isHost]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const joinId = params.get('join');
    if (joinId) {
      setTargetPeerId(joinId);
      if (mode === 'ai') {
        setMode('p2p'); 
        showToast("Join link detected. Set username to connect.", "info");
      }
    }
  }, []);

  useEffect(() => {
      if (myPeerId && targetPeerId && p2pState === 'setup' && !isConnecting) {
          connectToPeer();
      }
  }, [myPeerId, targetPeerId, p2pState]);

  const selectPersona = (persona: Persona) => {
    setSelectedPersona(persona);
    localStorage.setItem('SNAPAURA_PERSONA', persona.id);
    setAiMessages([{ id: Date.now().toString(), role: 'model', text: persona.intro }]);
    showToast(`${persona.name} active`, "success");
  };

  const clearPersona = () => {
    setSelectedPersona(null);
    localStorage.removeItem('SNAPAURA_PERSONA');
  };

  const handleNewChat = () => {
      setAiMessages([]);
      if (selectedPersona) {
          setAiMessages([{ id: Date.now().toString(), role: 'model', text: selectedPersona.intro }]);
      }
      showToast("Chat history reset", "success");
  };

  // --- TTS LOGIC ---
  const cleanTextForSpeech = (text: string) => {
      // Remove bold/italic markers (*, **, _, __, #, etc.)
      let clean = text.replace(/[*_#`~]/g, '');
      // Remove markdown links [text](url) keeping only text
      clean = clean.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
      return clean;
  };

  const toggleSpeech = (msgId: string, text: string) => {
      if (speakingMessageId === msgId) {
          window.speechSynthesis.cancel();
          setSpeakingMessageId(null);
          return;
      }

      window.speechSynthesis.cancel();
      setSpeakingMessageId(msgId);
      
      const cleanText = cleanTextForSpeech(text);
      const u = new SpeechSynthesisUtterance(cleanText);
      u.rate = 1.1;
      u.pitch = 1;
      
      u.onend = () => setSpeakingMessageId(null);
      u.onerror = () => setSpeakingMessageId(null);
      
      window.speechSynthesis.speak(u);
  };

  const destroyPeer = () => {
      connectionsRef.current.forEach(conn => conn.close());
      connectionsRef.current = [];
      if (peerInstance.current) {
          peerInstance.current.destroy();
          peerInstance.current = null;
      }
      setP2pState('username');
      setMyPeerId('');
      setActiveConnections(0);
      setIsHost(false);
      setP2pMessages([]);
  };

  const initPeer = () => {
      if (!username) {
        showToast("Please enter a username", "error");
        return;
      }

      if (typeof Peer === 'undefined') {
          showToast("P2P library loading...", "info");
          setTimeout(initPeer, 500); 
          return;
      }

      setP2pState('setup');

      const randomId = 'snap-' + Math.random().toString(36).substr(2, 4);
      const peer = new Peer(randomId);
      
      peer.on('open', (id: string) => {
          setMyPeerId(id);
      });

      peer.on('connection', (conn: any) => {
          setIsHost(true);
          handleIncomingConnection(conn);
      });

      peer.on('error', (err: any) => {
          console.error(err);
          if (err.type === 'peer-unavailable') {
              showToast("User offline.", "error");
          } else {
              showToast("Connection Error", "error");
          }
          setIsConnecting(false);
      });

      peerInstance.current = peer;
  };

  const handleIncomingConnection = (conn: any) => {
      conn.on('open', () => {
          const newUser = conn.metadata?.username;
          const existingConn = connectionsRef.current.find(c => c.metadata?.username === newUser || c.peer === conn.peer);
          
          if (existingConn) {
              existingConn.close();
              connectionsRef.current = connectionsRef.current.filter(c => c !== existingConn);
          }

          connectionsRef.current.push(conn);
          setActiveConnections(prev => connectionsRef.current.length);
          setP2pState('connected');
          
          conn.send({
              type: 'system',
              text: `Connected to ${username} (Host)`,
              sender: 'System'
          });
          
          showToast(`${newUser || 'User'} joined!`, "success");
      });

      conn.on('data', (data: any) => {
          handleIncomingData(data, conn);
      });
      
      conn.on('close', () => {
          showToast("A user disconnected", "info");
      });
  };

  const connectToPeer = () => {
      if (!targetPeerId.trim() || !peerInstance.current) return;
      if (targetPeerId === myPeerId) return;

      setIsConnecting(true);
      const conn = peerInstance.current.connect(targetPeerId, {
          metadata: { username: username }
      });
      
      conn.on('open', () => {
          connectionsRef.current.push(conn);
          setP2pState('connected');
          setIsConnecting(false);
          setIsHost(false);
          showToast(`Joined session!`, "success");
      });

      conn.on('data', (data: any) => {
          handleIncomingData(data, conn);
      });

      conn.on('close', () => {
          connectionsRef.current = connectionsRef.current.filter(c => c !== conn);
          setP2pState('setup');
          showToast("Disconnected from host", "info");
      });
  };

  const handleIncomingData = (data: any, sourceConn: any) => {
      if (data.type === 'ping') return;
      
      if (data.type === 'action') {
          handleAction(data);
          if (isHost) relayToOthers(data, sourceConn);
          return;
      }

      let msg: Message = { 
          id: data.id || Date.now().toString(),
          role: 'peer', 
          text: data.text || '', 
          sender: data.sender || 'Unknown',
          type: data.type || 'text',
          fileName: data.fileName,
          fileSize: data.fileSize,
          timestamp: data.timestamp || Date.now(),
          replyTo: data.replyTo,
          reactions: data.reactions
      };

      if (data.type !== 'system') {
          setP2pMessages(prev => {
              if (prev.find(m => m.id === msg.id)) return prev;
              return [...prev, msg];
          });
          if (navigator.vibrate) navigator.vibrate(20);
      }

      if (isHost) relayToOthers(data, sourceConn);
  };

  const relayToOthers = (data: any, sourceConn: any) => {
      connectionsRef.current.forEach(conn => {
          if (conn !== sourceConn && conn.open) {
              conn.send(data);
          }
      });
  };

  const handleAction = (data: any) => {
      if (data.action === 'delete') {
          setP2pMessages(prev => prev.map(m => m.id === data.msgId ? { ...m, isDeleted: true, text: 'This message was deleted' } : m));
      } else if (data.action === 'react') {
          setP2pMessages(prev => prev.map(m => {
              if (m.id === data.msgId) {
                  const reactions = { ...(m.reactions || {}) };
                  reactions[data.emoji] = (reactions[data.emoji] || 0) + 1;
                  return { ...m, reactions };
              }
              return m;
          }));
      }
  };

  const sendAction = (action: string, payload: any) => {
      const packet = { type: 'action', action, ...payload };
      handleAction(packet);
      connectionsRef.current.forEach(c => c.open && c.send(packet));
  };

  const handleP2pSend = () => {
      if (connectionsRef.current.length === 0) {
          showToast("No active connections", "error");
          return;
      }
      
      const msgId = Date.now().toString() + Math.random().toString().substr(2, 5);
      
      let payload: any = {
          id: msgId,
          timestamp: Date.now(),
          sender: username,
          replyTo: replyingTo
      };

      if (attachment) {
          payload = { ...payload, text: attachment.content, type: attachment.type, fileName: attachment.name, fileSize: attachment.size };
      } else if (p2pInput.trim()) {
          payload = { ...payload, text: p2pInput, type: 'text' };
      } else {
          return;
      }

      connectionsRef.current.forEach(conn => { if (conn.open) conn.send(payload); });

      setP2pMessages(prev => [...prev, { ...payload, role: 'me', sender: 'Me' } as Message]);
      
      setP2pInput('');
      setAttachment(null);
      setReplyingTo(null);
  };

  const kickUser = (peerId: string) => {
      const conn = connectionsRef.current.find(c => c.peer === peerId);
      if (conn) {
          conn.close();
          connectionsRef.current = connectionsRef.current.filter(c => c !== conn);
          showToast("User kicked", "info");
          setActiveConnections(prev => prev - 1);
      }
  };

  const handleCopyLink = () => {
      const url = `${window.location.origin}/?join=${myPeerId}`;
      navigator.clipboard.writeText(url);
      showToast("Session Link Copied!", "success");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      if (file.size > 5 * 1024 * 1024) { showToast("File too large (Max 5MB)", "error"); return; }

      const reader = new FileReader();
      reader.onload = () => {
          setAttachment({ type: file.type.startsWith('image/') ? 'image' : 'file', content: reader.result as string, name: file.name, size: (file.size / 1024).toFixed(1) + ' KB' });
          if(mode === 'ai') showToast("Image attached. Type a prompt.", "info");
      };
      reader.readAsDataURL(file);
      e.target.value = '';
  };

  const startRecording = async () => {
      try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          const mediaRecorder = new MediaRecorder(stream);
          mediaRecorderRef.current = mediaRecorder;
          audioChunksRef.current = [];

          mediaRecorder.ondataavailable = (event) => { if (event.data.size > 0) audioChunksRef.current.push(event.data); };

          mediaRecorder.onstop = () => {
              const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
              const reader = new FileReader();
              reader.onloadend = () => {
                  const base64 = reader.result as string;
                  const msgId = Date.now().toString();
                  const payload = { id: msgId, text: base64, type: 'audio' as const, sender: username, timestamp: Date.now() };
                  connectionsRef.current.forEach(conn => { if(conn.open) conn.send(payload); });
                  setP2pMessages(prev => [...prev, { ...payload, role: 'me', sender: 'Me' } as Message]);
              };
              reader.readAsDataURL(audioBlob);
              stream.getTracks().forEach(track => track.stop()); 
          };
          mediaRecorder.start();
          setIsRecording(true);
      } catch (err) { showToast("Microphone access denied", "error"); }
  };

  const stopRecording = () => {
      if (mediaRecorderRef.current && isRecording) { mediaRecorderRef.current.stop(); setIsRecording(false); }
  };

  useEffect(() => {
      if(textareaRef.current) {
          textareaRef.current.style.height = 'auto';
          textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
      }
  }, [aiInput, p2pInput]);

  const handleAiSend = async () => {
    if ((!aiInput.trim() && !attachment) || aiLoading) return;
    
    const userMsg: Message = { 
        id: Date.now().toString(), 
        role: 'user', 
        text: aiInput,
        type: attachment && attachment.type === 'image' ? 'image' : 'text'
    };
    
    // If sending an image, store content in text for local display logic (though messy for history, fine for display)
    // Better: separate content. For history, we reconstruct.
    if (attachment && attachment.type === 'image') {
        userMsg.text = attachment.content; // base64
        userMsg.fileName = attachment.name;
    }

    setAiMessages(prev => [...prev, userMsg]);
    setAiInput('');
    const currentAttachment = attachment; // Capture current
    setAttachment(null); // Clear immediately
    setAiLoading(true);
    
    if(textareaRef.current) textareaRef.current.style.height = 'auto';
    
    try {
      // Construct history for Gemini. Only text history is robustly supported in simple chat array. 
      // Images are usually single turn in basic implementation, but we can try passing multimodal history if we structured it.
      // For simplicity and stability: Send previous text history + current multimodal message.
      const history = aiMessages.filter(m => m.type === 'text').map(m => ({ 
          role: m.role === 'model' ? 'model' : 'user', 
          parts: [{ text: m.text }] 
      }));
      
      const responseText = await sendChatMessage(
          history, 
          userMsg.type === 'image' ? (aiInput || "Analyze this image") : userMsg.text, 
          selectedPersona?.systemPrompt,
          currentAttachment?.type === 'image' ? currentAttachment.content : undefined
      );
      
      setAiMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: responseText }]);
    } catch (error) {
      console.error(error);
      setAiMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: "Sorry, I encountered an error processing that request." }]);
    } finally { setAiLoading(false); }
  };

  const handleAiVoiceInput = () => {
      if (!('webkitSpeechRecognition' in window)) { showToast("Voice input not supported", "error"); return; }
      const recognition = new (window as any).webkitSpeechRecognition();
      recognition.continuous = false;
      recognition.lang = 'en-US';
      recognition.onstart = () => setIsAiListening(true);
      recognition.onresult = (event: any) => setAiInput(prev => prev + ' ' + event.results[0][0].transcript);
      recognition.onend = () => setIsAiListening(false);
      recognition.start();
  };

  const renderMessageContent = (msg: Message) => {
      if (msg.isDeleted) return <span className="italic opacity-50 text-gray-400 text-xs">This message was deleted</span>;

      let content: React.ReactNode = msg.text;
      
      // Special Handling for user sent images in AI mode (stored in msg.text as base64)
      if (msg.role === 'user' && msg.type === 'image') {
           content = (
               <div className="space-y-2">
                   <img src={msg.text} alt="Uploaded" className="rounded-xl max-w-full max-h-60 shadow-lg border border-white/10" />
                   {msg.fileName && <p className="text-[10px] opacity-70 truncate">{msg.fileName}</p>}
               </div>
           );
      }
      else if (msg.role === 'model') {
          content = <div className="prose prose-invert prose-sm max-w-none text-gray-300 leading-snug" dangerouslySetInnerHTML={{ __html: typeof marked !== 'undefined' ? marked.parse(msg.text) : msg.text }}></div>;
      }
      else if (msg.type === 'image') {
          content = <div className="space-y-2"><div className="relative group"><img src={msg.text} alt="Shared" className="rounded-xl max-w-full max-h-60 shadow-lg" /><div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl"><a href={msg.text} download={msg.fileName || 'image.png'} className="p-3 bg-[#292d3e] shadow-neu rounded-full text-white"><DownloadCloud size={20} /></a></div></div>{msg.fileName && <p className="text-[10px] opacity-70 truncate max-w-[200px]">{msg.fileName}</p>}</div>;
      }
      else if (msg.type === 'audio') {
          content = <div className="flex items-center gap-2 min-w-[150px]"><div className="bg-[#292d3e] shadow-neu p-2 rounded-full"><Play size={16} className="text-primary" /></div><audio controls src={msg.text} className="h-8 w-48" /></div>;
      }
      else if (msg.type === 'file') {
          content = <div className="flex items-center gap-3 bg-[#292d3e] p-3 rounded-xl shadow-neu-pressed"><div className="text-blue-400"><FileText size={24} /></div><div className="flex flex-col overflow-hidden mr-2"><span className="text-sm font-bold truncate max-w-[140px] text-gray-200">{msg.fileName || 'File'}</span><span className="text-[10px] opacity-60 text-gray-400">{msg.fileSize || 'Unknown size'}</span></div><a href={msg.text} download={msg.fileName || 'download'} className="p-2 bg-[#292d3e] shadow-neu hover:text-primary rounded-full text-gray-400 transition-colors"><Download size={18} /></a></div>;
      }

      return (
          <div className="relative group/msg">
              {msg.replyTo && (
                  <div className="text-[10px] bg-black/20 p-2 rounded-lg mb-1 border-l-2 border-primary opacity-80 truncate">
                      <span className="font-bold mr-1">{msg.replyTo.sender}:</span>
                      {msg.replyTo.type === 'text' ? msg.replyTo.text : `[${msg.replyTo.type}]`}
                  </div>
              )}
              {content}
              {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                  <div className="flex gap-1 mt-1 flex-wrap">
                      {Object.entries(msg.reactions).map(([emoji, count]) => (
                          <span key={emoji} className="text-[10px] bg-[#292d3e] shadow-neu px-2 py-0.5 rounded-full text-gray-300">{emoji} {count}</span>
                      ))}
                  </div>
              )}
              {/* Message Actions */}
              {!msg.isDeleted && mode === 'p2p' && (
                  <div className={`absolute -right-8 top-0 flex flex-col gap-1 opacity-0 group-hover/msg:opacity-100 transition-opacity ${msg.role === 'me' ? '-left-8 right-auto' : ''}`}>
                      <button onClick={() => setReplyingTo(msg)} className="p-1 bg-[#292d3e] shadow-neu rounded-full hover:text-blue-500 text-gray-400"><Reply size={12}/></button>
                      <button onClick={() => sendAction('react', { msgId: msg.id, emoji: '❤️' })} className="p-1 bg-[#292d3e] shadow-neu rounded-full hover:text-red-500 text-gray-400"><Heart size={12}/></button>
                      <button onClick={() => sendAction('react', { msgId: msg.id, emoji: '😂' })} className="p-1 bg-[#292d3e] shadow-neu rounded-full hover:text-yellow-500 text-gray-400"><SmilePlus size={12}/></button>
                      {msg.role === 'me' && <button onClick={() => sendAction('delete', { msgId: msg.id })} className="p-1 bg-[#292d3e] shadow-neu rounded-full hover:text-red-600 text-gray-400"><Trash size={12}/></button>}
                  </div>
              )}
          </div>
      );
  };

  return (
    <div className="h-full flex flex-col relative bg-[#292d3e] overflow-hidden">
        
      {/* --- MATRIX BACKGROUND --- */}
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 z-0 pointer-events-none opacity-20"
      />

      {/* Header */}
      <div className="p-3 bg-[#292d3e]/95 backdrop-blur-md sticky top-0 z-30 flex flex-col shadow-sm gap-2 border-b border-white/5">
        <div className="flex justify-between items-center">
            {mode === 'ai' ? (
                <div className="flex items-center gap-3">
                   {selectedPersona ? (
                       <div className="flex items-center gap-3" onClick={clearPersona}>
                           <div className="w-9 h-9 rounded-full overflow-hidden shadow-neu bg-[#292d3e] border border-white/10 relative">
                               <img src={selectedPersona.avatar} className="w-full h-full object-cover" alt="Avatar" />
                               {aiLoading && <div className="absolute inset-0 bg-black/40 flex items-center justify-center"><RefreshCw size={12} className="animate-spin text-white"/></div>}
                           </div>
                           <div>
                               <h1 className="font-bold text-gray-200 leading-tight text-sm">{selectedPersona.name}</h1>
                               <p className="text-[10px] text-gray-500">{selectedPersona.role}</p>
                           </div>
                       </div>
                   ) : (
                       <div className="flex items-center gap-2">
                           <div className="p-2 bg-[#292d3e] shadow-neu text-blue-400 rounded-full"><Sparkles size={18} /></div>
                           <h1 className="text-lg font-bold text-gray-200">SnapAura AI</h1>
                       </div>
                   )}
                </div>
            ) : (
                <div className="flex items-center gap-3">
                   <div className="p-2 bg-[#292d3e] shadow-neu text-green-400 rounded-full relative">
                       <ShieldCheck size={18} />
                       {activeConnections > 0 && <span className="absolute -top-1 -right-1 flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span></span>}
                   </div>
                   <div>
                       <h1 className="text-sm font-bold text-gray-200">Secure Chat</h1>
                       <p className="text-[10px] text-gray-500 flex items-center gap-1">
                           <Radio size={10} className={activeConnections > 0 ? "text-green-500" : "text-gray-500"} />
                           {activeConnections} Peers Online
                       </p>
                   </div>
                </div>
            )}
            
            <div className="flex gap-2">
                {mode === 'p2p' && isHost && (
                    <button onClick={() => setShowAdmin(!showAdmin)} className="p-2.5 bg-[#292d3e] shadow-neu rounded-full text-gray-400 active:shadow-neu-pressed">
                        <MoreVertical size={18} />
                    </button>
                )}
                {/* New Chat Button for AI */}
                {mode === 'ai' && selectedPersona && (
                    <button onClick={handleNewChat} className="p-2.5 bg-[#292d3e] shadow-neu rounded-full text-gray-400 active:shadow-neu-pressed hover:text-green-400 transition-colors" title="New Chat">
                        <RotateCcw size={18} />
                    </button>
                )}

                <div className="bg-[#292d3e] shadow-neu-pressed p-1 rounded-xl flex">
                    <button onClick={() => setMode('ai')} className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${mode === 'ai' ? 'bg-[#292d3e] text-blue-400 shadow-neu' : 'text-gray-500'}`}>AI</button>
                    <button onClick={() => setMode('p2p')} className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${mode === 'p2p' ? 'bg-[#292d3e] text-green-400 shadow-neu' : 'text-gray-500'}`}>P2P</button>
                </div>
                <button 
                     onClick={onOpenSettings}
                     className="text-gray-400 hover:text-white p-2.5 rounded-full bg-[#292d3e] shadow-neu active:shadow-neu-pressed transition-colors"
                 >
                     <Settings size={18} />
                 </button>
            </div>
        </div>

        {/* Quick Persona Switcher (Horizontal Scroll) */}
        {mode === 'ai' && (
            <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2 pt-1 border-t border-[#1e212d]">
                {PERSONAS.map(p => (
                    <button 
                        key={p.id}
                        onClick={() => selectPersona(p)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all shrink-0 ${
                            selectedPersona?.id === p.id 
                            ? 'bg-[#292d3e] shadow-neu-pressed border border-white/5' 
                            : 'bg-[#292d3e] shadow-neu opacity-70 hover:opacity-100'
                        }`}
                    >
                        <div className="w-5 h-5 rounded-full overflow-hidden">
                            <img src={p.avatar} className="w-full h-full object-cover" />
                        </div>
                        <span className={`text-[10px] font-bold ${selectedPersona?.id === p.id ? p.color : 'text-gray-500'}`}>{p.name}</span>
                    </button>
                ))}
            </div>
        )}
      </div>

      {/* Admin Panel (Host Only) */}
      {showAdmin && mode === 'p2p' && (
          <div className="bg-[#292d3e] p-4 shadow-neu-pressed animate-fade-in-up mx-2 rounded-xl mb-2 relative z-20">
              <h3 className="text-xs font-bold text-gray-500 uppercase mb-2">Connected Users</h3>
              <div className="space-y-2">
                  {connectedUsersRef.current.map(u => (
                      <div key={u.id} className="flex justify-between items-center bg-[#292d3e] shadow-neu p-2 rounded-lg">
                          <span className="text-sm text-gray-200">{u.name} <span className="text-xs text-gray-500">({u.id.substr(0,4)})</span></span>
                          <button onClick={() => kickUser(u.id)} className="text-red-400 hover:text-red-300 p-1 bg-[#292d3e] shadow-neu rounded active:shadow-neu-pressed"><UserMinus size={14}/></button>
                      </div>
                  ))}
                  {connectedUsersRef.current.length === 0 && <p className="text-xs text-gray-500 italic">No active peers</p>}
              </div>
          </div>
      )}

      {/* Main Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-44 hide-scrollbar relative z-10" ref={scrollRef}>
        
        {/* --- AI MODE --- */}
        {mode === 'ai' && (
            <>
                {!selectedPersona && aiMessages.length === 0 ? (
                    <div className="mt-4 animate-fade-in-up">
                        <h2 className="text-lg font-bold text-gray-200 mb-2 text-center">Who do you want to talk to?</h2>
                        <div className="grid grid-cols-2 gap-3">
                            {PERSONAS.map(p => (
                                <button 
                                    key={p.id}
                                    onClick={() => selectPersona(p)}
                                    className="bg-[#292d3e] shadow-neu p-3 rounded-2xl text-left transition-all active:shadow-neu-pressed flex items-center gap-3 hover:scale-[1.02]"
                                >
                                    <div className="w-10 h-10 rounded-full bg-[#292d3e] shadow-neu flex-shrink-0 overflow-hidden border border-white/5">
                                        <img src={p.avatar} className="w-full h-full object-cover" alt={p.name} />
                                    </div>
                                    <div className="overflow-hidden">
                                        <h3 className="font-bold text-gray-200 text-xs truncate">{p.name}</h3>
                                        <p className="text-[9px] text-gray-500 truncate">{p.role}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    <>
                        {aiMessages.map((msg) => (
                          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in-up items-end gap-2`}>
                            {/* Avatar for User or AI */}
                            {msg.role === 'user' && userAvatar && (
                                <img src={userAvatar} alt="Me" className="w-8 h-8 rounded-full border border-white/10 order-2 object-cover" />
                            )}
                            {msg.role === 'model' && selectedPersona && (
                                <div className="w-8 h-8 rounded-full overflow-hidden shadow-neu border border-white/10 flex-shrink-0">
                                    <img src={selectedPersona.avatar} alt="AI" className="w-full h-full object-cover" />
                                </div>
                            )}
                            
                            <div 
                              className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed relative ${
                                msg.role === 'user' 
                                  ? 'bg-[#292d3e] text-blue-400 shadow-neu rounded-br-none border border-blue-500/10 order-1' 
                                  : 'bg-[#292d3e] text-gray-300 shadow-neu rounded-bl-none'
                              }`}
                            >
                               {renderMessageContent(msg)}
                               {/* Speaking Indicator */}
                               {speakingMessageId === msg.id && (
                                   <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-ping"></div>
                               )}
                            </div>
                            
                            {msg.role === 'model' && (
                                <button 
                                    onClick={() => toggleSpeech(msg.id, msg.text)}
                                    className={`self-end transition-colors ${speakingMessageId === msg.id ? 'text-green-400 animate-pulse' : 'text-gray-500 hover:text-primary'}`}
                                >
                                    {speakingMessageId === msg.id ? <Square size={14} fill="currentColor" /> : <Volume2 size={14} />}
                                </button>
                            )}
                          </div>
                        ))}
                        {aiLoading && (
                          <div className="flex justify-start items-center gap-2">
                             <div className="w-8 h-8 rounded-full overflow-hidden shadow-neu border border-white/10 flex-shrink-0">
                                {selectedPersona && <img src={selectedPersona.avatar} alt="AI" className="w-full h-full object-cover" />}
                             </div>
                            <div className="bg-[#292d3e] shadow-neu px-4 py-3 rounded-2xl rounded-bl-none flex gap-1 items-center">
                              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-75"></span>
                              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-150"></span>
                            </div>
                          </div>
                        )}
                    </>
                )}
            </>
        )}

        {/* --- P2P MODE --- */}
        {mode === 'p2p' && (
            <>
                {p2pState === 'username' && (
                    <div className="flex flex-col items-center justify-center h-full space-y-8 p-6 text-center animate-fade-in-up">
                        <div className="bg-[#292d3e] shadow-neu p-6 rounded-full text-green-400">
                            <ShieldCheck size={48} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-200">Encrypted Chat</h2>
                            <p className="text-gray-500 text-sm mt-2">Serverless. Private. Secure.</p>
                        </div>
                        <input 
                            value={username} 
                            onChange={e => setUsername(e.target.value)}
                            placeholder="Enter Display Name"
                            className="w-full bg-[#292d3e] shadow-neu-pressed rounded-xl px-4 py-4 text-gray-200 text-center outline-none"
                            autoFocus
                        />
                        <button onClick={initPeer} className="w-full bg-[#292d3e] text-green-400 font-bold py-4 rounded-xl shadow-neu active:shadow-neu-pressed transition-all">
                            Start Secure Session
                        </button>
                    </div>
                )}

                {p2pState === 'setup' && (
                    <div className="bg-[#292d3e] shadow-neu p-6 rounded-2xl space-y-6 text-center animate-fade-in-up m-auto mt-10">
                         <h3 className="text-lg font-bold text-gray-200">Invite Friends</h3>
                         <div className="bg-[#292d3e] shadow-neu-pressed p-4 rounded-xl flex items-center justify-between gap-3">
                             <div className="text-left overflow-hidden">
                                 <p className="text-[10px] text-gray-500 uppercase font-bold">Your Session ID</p>
                                 <p className="text-2xl font-mono text-green-400 font-bold tracking-widest">{myPeerId}</p>
                             </div>
                             <div className="flex gap-2">
                                <button onClick={() => {navigator.clipboard.writeText(myPeerId); showToast("ID Copied", "success")}} className="p-3 bg-[#292d3e] shadow-neu rounded-lg hover:text-green-400 active:shadow-neu-pressed"><Copy size={20}/></button>
                                <button onClick={handleCopyLink} className="p-3 bg-[#292d3e] shadow-neu text-blue-400 rounded-lg hover:text-blue-500 active:shadow-neu-pressed"><LinkIcon size={20}/></button>
                             </div>
                         </div>
                         
                         <div className="relative">
                             <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[#292d3e] shadow-sm"></div></div>
                             <div className="relative flex justify-center text-xs uppercase"><span className="bg-[#292d3e] px-2 text-gray-500 font-bold">Or Join Session</span></div>
                         </div>

                         <div className="flex gap-3">
                             <input 
                                value={targetPeerId} 
                                onChange={e => setTargetPeerId(e.target.value)}
                                placeholder="Enter Friend's ID..."
                                className="flex-1 bg-[#292d3e] shadow-neu-pressed rounded-xl px-4 py-3 text-gray-200 text-sm outline-none"
                             />
                             <button onClick={connectToPeer} disabled={isConnecting} className="bg-[#292d3e] shadow-neu text-green-400 px-4 rounded-xl font-bold active:shadow-neu-pressed transition-all">
                                 {isConnecting ? <RefreshCw className="animate-spin" /> : <LogIn />}
                             </button>
                         </div>
                    </div>
                )}

                {p2pState === 'connected' && (
                    <>
                        <div className="text-center py-2">
                            <span className="text-[10px] bg-[#292d3e] shadow-neu text-green-400 px-4 py-1.5 rounded-full font-bold">
                                End-to-End Encrypted
                            </span>
                        </div>
                        {p2pMessages.map((msg) => (
                           <div key={msg.id} className={`flex flex-col ${msg.role === 'me' ? 'items-end' : 'items-start'} animate-fade-in-up`}>
                               {msg.role !== 'me' && msg.sender && <span className="text-[10px] text-gray-500 mb-1 ml-1 font-bold">{msg.sender}</span>}
                               
                               <div className="flex items-end gap-2">
                                   {msg.role === 'me' && userAvatar && (
                                       <img src={userAvatar} alt="Me" className="w-6 h-6 rounded-full border border-white/10 order-2 object-cover" />
                                   )}
                                   
                                   <div 
                                    className={`p-3 rounded-2xl text-sm ${
                                        msg.role === 'me' 
                                        ? 'bg-[#292d3e] text-green-400 shadow-neu rounded-br-none order-1' 
                                        : 'bg-[#292d3e] text-gray-300 shadow-neu rounded-bl-none'
                                    }`}
                                   >
                                       {renderMessageContent(msg)}
                                   </div>
                               </div>
                               
                               <span className="text-[9px] text-gray-600 mt-1 px-1">{new Date(msg.timestamp || 0).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                           </div>
                        ))}
                    </>
                )}
            </>
        )}

      </div>

      {/* Input Area (Refined Spacing) */}
      {((mode === 'ai') || (mode === 'p2p' && p2pState === 'connected')) && (
          <div className="p-4 bg-[#292d3e]/90 backdrop-blur-lg fixed bottom-[72px] left-0 right-0 max-w-md mx-auto z-40 border-t border-white/5 rounded-t-3xl shadow-[0_-10px_30px_rgba(0,0,0,0.2)]">
              
              {/* Reply Preview */}
              {replyingTo && (
                  <div className="flex justify-between items-center bg-[#292d3e] shadow-neu-pressed p-2 rounded-lg mb-2 border-l-2 border-blue-500 mx-2">
                      <div className="text-xs text-gray-400 truncate">
                          <span className="font-bold text-blue-400 mr-2">Replying to {replyingTo.sender}:</span>
                          {replyingTo.text}
                      </div>
                      <button onClick={() => setReplyingTo(null)}><XCircle size={14} className="text-gray-500"/></button>
                  </div>
              )}

              {/* Attachment Preview */}
              {attachment && (
                  <div className="flex items-center gap-3 bg-[#292d3e] shadow-neu p-2 rounded-xl mb-3 mx-1">
                      {attachment.type === 'image' ? <ImageIcon size={16} className="text-pink-400"/> : <FileText size={16} className="text-blue-400"/>}
                      <span className="text-xs text-gray-300 truncate flex-1">{attachment.name}</span>
                      <span className="text-[10px] text-gray-500">{attachment.size}</span>
                      <button onClick={() => setAttachment(null)}><XCircle size={16} className="text-gray-400 hover:text-red-400"/></button>
                  </div>
              )}

              <div className="flex items-end gap-3">
                  
                  {/* EXPANDABLE ACTIONS MENU */}
                  <div className="flex items-end mb-3">
                      <button 
                        onClick={() => setActionsExpanded(!actionsExpanded)}
                        className={`p-3 rounded-full bg-[#292d3e] shadow-neu text-gray-400 active:shadow-neu-pressed transition-all z-10 hover:text-white ${actionsExpanded ? 'rotate-45 text-red-400' : ''}`}
                      >
                          <Plus size={20} />
                      </button>
                      
                      <div 
                        className={`flex items-center gap-2 overflow-hidden transition-all duration-300 ease-in-out ${actionsExpanded ? 'w-[100px] opacity-100 ml-2' : 'w-0 opacity-0'}`}
                      >
                          {/* File Input */}
                          <button onClick={() => fileInputRef.current?.click()} className="p-3 text-gray-400 bg-[#292d3e] shadow-neu rounded-full active:shadow-neu-pressed hover:text-primary transition-all">
                               {mode === 'ai' ? <ImageIcon size={20} /> : <Paperclip size={20} />}
                          </button>

                          {/* Voice Button */}
                          <button 
                            onClick={mode === 'ai' ? handleAiVoiceInput : (isRecording ? stopRecording : startRecording)} 
                            className={`p-3 rounded-full shadow-neu transition-all active:shadow-neu-pressed ${
                                (isRecording || isAiListening) ? 'text-red-500 animate-pulse bg-[#292d3e]' : 'text-gray-400 bg-[#292d3e] hover:text-red-400'
                            }`}
                          >
                              {isRecording ? <StopCircle size={20} /> : <Mic size={20} />}
                          </button>
                      </div>
                  </div>

                  {/* Text Input with Gradient Border */}
                  <div className="flex-1 relative group">
                      {/* Gradient Border Glow */}
                      <div className="absolute -inset-[1.5px] bg-gradient-to-r from-[#00f3ff] via-[#bc13fe] to-[#ff0099] rounded-2xl opacity-40 group-hover:opacity-70 group-focus-within:opacity-100 blur-[2px] transition-all duration-500"></div>
                      
                      <div className="relative bg-[#292d3e] rounded-2xl flex items-center pr-2 overflow-hidden h-full shadow-neu-pressed">
                          <textarea
                              ref={textareaRef}
                              value={mode === 'ai' ? aiInput : p2pInput}
                              onChange={(e) => mode === 'ai' ? setAiInput(e.target.value) : setP2pInput(e.target.value)}
                              placeholder={mode === 'ai' ? (isAiListening ? "Listening..." : "Message AI...") : "Secure message..."}
                              className="w-full bg-transparent border-none text-gray-200 px-4 py-4 max-h-32 focus:ring-0 resize-none text-sm placeholder-gray-500 hide-scrollbar leading-relaxed"
                              style={{ minHeight: '56px' }}
                              rows={1}
                              onKeyDown={(e) => {
                                  if (e.key === 'Enter' && !e.shiftKey) {
                                      e.preventDefault();
                                      mode === 'ai' ? handleAiSend() : handleP2pSend();
                                  }
                              }}
                          />
                      </div>
                  </div>

                  {/* Send Button */}
                  <button 
                      onClick={mode === 'ai' ? handleAiSend : handleP2pSend}
                      disabled={mode === 'ai' ? ((!aiInput.trim() && !attachment) || aiLoading) : (!p2pInput.trim() && !attachment)}
                      className="mb-2 p-3.5 bg-[#292d3e] shadow-neu rounded-2xl text-primary active:shadow-neu-pressed disabled:opacity-50 disabled:shadow-none transition-all hover:scale-105 active:scale-95"
                  >
                      {aiLoading ? <RefreshCw className="animate-spin" size={20} /> : <Send size={20} fill="currentColor" />}
                  </button>
              </div>
          </div>
      )}

      {/* Hidden File Input */}
      <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept={mode === 'ai' ? "image/*" : "*"} />
    </div>
  );
};

export default Chat;
