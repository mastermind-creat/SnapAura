
import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Sparkles, Users, Copy, Link2, ShieldCheck, RefreshCw, Settings, Mic, Volume2, Radio, Paperclip, ImageIcon, FileText, XCircle, StopCircle, Play, Pause, Download, UserPlus, LogIn, DownloadCloud, Link as LinkIcon, Reply, SmilePlus, Trash, MoreVertical, UserMinus, Heart } from './Icons';
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

  // --- AI CHAT STATE ---
  const [aiInput, setAiInput] = useState('');
  const [aiMessages, setAiMessages] = useState<Message[]>([
    { id: 'init-1', role: 'model', text: "Hey! I'm **SnapAura**. Need help with a caption, a photo idea, or just want to chat?" }
  ]);
  const [aiLoading, setAiLoading] = useState(false);
  const [isAiListening, setIsAiListening] = useState(false);
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
  
  // Refs for PeerJS
  const peerInstance = useRef<any>(null);
  const connectionsRef = useRef<any[]>([]); // Store all connections (Host maintains list)
  const connectedUsersRef = useRef<{id: string, name: string}[]>([]); // For admin view

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [aiMessages, p2pMessages, mode, attachment, replyingTo]);

  // Clean up Peer on unmount
  useEffect(() => {
    return () => {
      destroyPeer();
    };
  }, []);

  // Heartbeat / Keep-alive & Cleanup
  useEffect(() => {
      const interval = setInterval(() => {
          if (!peerInstance.current) return;
          
          // Clean up closed connections
          connectionsRef.current = connectionsRef.current.filter(c => c.open);
          setActiveConnections(connectionsRef.current.length);
          
          // Rebuild Admin User List
          const users = connectionsRef.current.map(c => ({
              id: c.peer,
              name: c.metadata?.username || 'Unknown'
          }));
          connectedUsersRef.current = users;
          
          // Host sends Ping
          if (isHost) {
              connectionsRef.current.forEach(c => {
                  if(c.open) c.send({ type: 'ping' });
              });
          }
      }, 3000);
      return () => clearInterval(interval);
  }, [isHost]);

  // Check URL for join link and Auto Connect
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

  // Auto-trigger connect if we just set username and have a target
  useEffect(() => {
      if (myPeerId && targetPeerId && p2pState === 'setup' && !isConnecting) {
          connectToPeer();
      }
  }, [myPeerId, targetPeerId, p2pState]);

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
          // Deduplication: Remove existing connection from same user if reconnection
          const newUser = conn.metadata?.username;
          const existingConn = connectionsRef.current.find(c => c.metadata?.username === newUser || c.peer === conn.peer);
          
          if (existingConn) {
              existingConn.close();
              connectionsRef.current = connectionsRef.current.filter(c => c !== existingConn);
          }

          connectionsRef.current.push(conn);
          setActiveConnections(prev => connectionsRef.current.length);
          setP2pState('connected');
          
          // Send welcome message and sync history (optional, currently just welcome)
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
          // Handled by heartbeat interval mostly
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
      if (data.type === 'ping') return; // Heartbeat
      
      // Handle Actions (Delete, React)
      if (data.type === 'action') {
          handleAction(data);
          // Relay if Host
          if (isHost) relayToOthers(data, sourceConn);
          return;
      }

      // Standard Message
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
              // Dedupe
              if (prev.find(m => m.id === msg.id)) return prev;
              return [...prev, msg];
          });
          if (navigator.vibrate) navigator.vibrate(20);
      }

      // Relay if Host
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
      // Local Apply
      handleAction(packet);
      // Send
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

      // Send to ALL
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

  // --- MULTIMEDIA HANDLERS ---
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      if (file.size > 5 * 1024 * 1024) { showToast("File too large (Max 5MB)", "error"); return; }

      const reader = new FileReader();
      reader.onload = () => {
          setAttachment({ type: file.type.startsWith('image/') ? 'image' : 'file', content: reader.result as string, name: file.name, size: (file.size / 1024).toFixed(1) + ' KB' });
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
  }, [aiInput]);

  const handleAiSend = async () => {
    if (!aiInput.trim() || aiLoading) return;
    const userMsg: Message = { id: Date.now().toString(), role: 'user', text: aiInput };
    setAiMessages(prev => [...prev, userMsg]);
    setAiInput('');
    setAiLoading(true);
    if(textareaRef.current) textareaRef.current.style.height = 'auto';
    try {
      const history = aiMessages.map(m => ({ role: m.role === 'model' ? 'model' : 'user', parts: [{ text: m.text }] }));
      const responseText = await sendChatMessage(history, userMsg.text);
      setAiMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: responseText }]);
    } catch (error) {
      setAiMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: "Oops, I had a glitch. Try again?" }]);
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
      
      if (msg.role === 'model') content = <div className="prose prose-invert prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: typeof marked !== 'undefined' ? marked.parse(msg.text) : msg.text }}></div>;
      else if (msg.type === 'image') content = <div className="space-y-2"><div className="relative group"><img src={msg.text} alt="Shared" className="rounded-lg max-w-full max-h-60 border border-white/10" /><div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg"><a href={msg.text} download={msg.fileName || 'image.png'} className="p-2 bg-white/20 hover:bg-white/40 rounded-full text-white backdrop-blur-md"><DownloadCloud size={24} /></a></div></div>{msg.fileName && <p className="text-[10px] opacity-70 truncate max-w-[200px]">{msg.fileName}</p>}</div>;
      else if (msg.type === 'audio') content = <div className="flex items-center gap-2 min-w-[150px]"><div className="bg-white/20 p-2 rounded-full"><Play size={16} fill="white" /></div><audio controls src={msg.text} className="h-8 w-48" /></div>;
      else if (msg.type === 'file') content = <div className="flex items-center gap-3 bg-black/20 p-3 rounded-xl border border-white/5"><div className="bg-blue-500/20 p-2.5 rounded-lg text-blue-400"><FileText size={24} /></div><div className="flex flex-col overflow-hidden mr-2"><span className="text-sm font-bold truncate max-w-[140px] text-white">{msg.fileName || 'File'}</span><span className="text-[10px] opacity-60 text-gray-300">{msg.fileSize || 'Unknown size'}</span></div><a href={msg.text} download={msg.fileName || 'download'} className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"><Download size={18} /></a></div>;

      return (
          <div className="relative group/msg">
              {msg.replyTo && (
                  <div className="text-[10px] bg-black/20 p-2 rounded-lg mb-1 border-l-2 border-white/50 opacity-80 truncate">
                      <span className="font-bold mr-1">{msg.replyTo.sender}:</span>
                      {msg.replyTo.type === 'text' ? msg.replyTo.text : `[${msg.replyTo.type}]`}
                  </div>
              )}
              {content}
              {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                  <div className="flex gap-1 mt-1 flex-wrap">
                      {Object.entries(msg.reactions).map(([emoji, count]) => (
                          <span key={emoji} className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded-full">{emoji} {count}</span>
                      ))}
                  </div>
              )}
              {/* Message Actions (Hover/Tap) */}
              {!msg.isDeleted && mode === 'p2p' && (
                  <div className={`absolute -right-8 top-0 flex flex-col gap-1 opacity-0 group-hover/msg:opacity-100 transition-opacity ${msg.role === 'me' ? '-left-8 right-auto' : ''}`}>
                      <button onClick={() => setReplyingTo(msg)} className="p-1 bg-black/50 rounded-full hover:bg-blue-500 text-white"><Reply size={12}/></button>
                      <button onClick={() => sendAction('react', { msgId: msg.id, emoji: '❤️' })} className="p-1 bg-black/50 rounded-full hover:bg-red-500 text-white"><Heart size={12}/></button>
                      <button onClick={() => sendAction('react', { msgId: msg.id, emoji: '😂' })} className="p-1 bg-black/50 rounded-full hover:bg-yellow-500 text-white"><SmilePlus size={12}/></button>
                      {msg.role === 'me' && <button onClick={() => sendAction('delete', { msgId: msg.id })} className="p-1 bg-black/50 rounded-full hover:bg-red-600 text-white"><Trash size={12}/></button>}
                  </div>
              )}
          </div>
      );
  };

  return (
    <div className="flex flex-col h-[calc(100vh-80px)]">
      {/* HEADER & TABS */}
      <div className="p-4 border-b border-white/10 bg-black/20 backdrop-blur-md sticky top-0 z-10 space-y-3">
        <div className="flex justify-between items-center">
            <h1 className="text-xl font-bold flex items-center gap-2">SnapAura Chat</h1>
            <div className="flex gap-2">
                 {isHost && activeConnections > 0 && (
                     <button onClick={() => setShowAdmin(!showAdmin)} className="text-green-400 bg-green-500/10 px-3 py-1.5 rounded-full text-xs font-bold border border-green-500/20 active:scale-95">
                         {activeConnections} Online
                     </button>
                 )}
                 <button onClick={onOpenSettings} className="text-gray-300 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors active:scale-90"><Settings size={20} /></button>
            </div>
        </div>
        <div className="flex bg-white/5 rounded-lg p-1">
            <button onClick={() => setMode('ai')} className={`flex-1 py-2 text-xs font-bold rounded-md flex items-center justify-center gap-2 transition-all ${mode === 'ai' ? 'bg-secondary text-white shadow-lg' : 'text-gray-400'}`}><Sparkles size={14} /> AI Assistant</button>
            <button onClick={() => setMode('p2p')} className={`flex-1 py-2 text-xs font-bold rounded-md flex items-center justify-center gap-2 transition-all ${mode === 'p2p' ? 'bg-green-600 text-white shadow-lg' : 'text-gray-400'}`}><ShieldCheck size={14} /> Secure Group</button>
        </div>
        {/* Admin Panel */}
        {showAdmin && isHost && (
            <div className="bg-black/90 p-4 rounded-xl border border-white/10 animate-fade-in-up">
                <h3 className="text-xs font-bold text-gray-400 uppercase mb-2">Connected Users</h3>
                <div className="space-y-2 max-h-32 overflow-y-auto hide-scrollbar">
                    {connectedUsersRef.current.map(u => (
                        <div key={u.id} className="flex justify-between items-center bg-white/5 p-2 rounded-lg">
                            <span className="text-sm text-white">{u.name}</span>
                            <button onClick={() => kickUser(u.id)} className="text-red-400 hover:bg-red-500/20 p-1 rounded"><UserMinus size={14}/></button>
                        </div>
                    ))}
                    {connectedUsersRef.current.length === 0 && <p className="text-xs text-gray-500">No active peers</p>}
                </div>
            </div>
        )}
      </div>

      {/* --- AI CHAT VIEW --- */}
      {mode === 'ai' && (
          <>
            <div className="flex-1 overflow-y-auto p-4 pb-32 space-y-4 hide-scrollbar" ref={scrollRef}>
                {aiMessages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed shadow-lg ${msg.role === 'user' ? 'bg-secondary text-white rounded-tr-none' : 'bg-white/10 text-gray-200 rounded-tl-none border border-white/5'}`}>
                        {renderMessageContent(msg)}
                        {msg.role === 'model' && (
                            <div className="mt-2 pt-2 border-t border-white/10 flex justify-end">
                                <button onClick={() => { const u = new SpeechSynthesisUtterance(msg.text.replace(/[*#]/g, '')); window.speechSynthesis.speak(u); }} className="p-1 text-gray-400 hover:text-white transition-colors"><Volume2 size={14} /></button>
                            </div>
                        )}
                    </div>
                </div>
                ))}
                {aiLoading && <div className="flex justify-start animate-fade-in-up"><div className="bg-white/10 p-4 rounded-2xl rounded-tl-none flex gap-1"><div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div><div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div><div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div></div></div>}
            </div>
            <div className="absolute bottom-16 left-0 right-0 p-3 bg-black/60 backdrop-blur-xl border-t border-white/10">
                <div className="flex gap-2 items-end bg-white/5 rounded-2xl p-2 border border-white/10 shadow-lg max-w-md mx-auto">
                    <button onClick={handleAiVoiceInput} className={`p-3 rounded-full transition-all ${isAiListening ? 'bg-red-500/20 text-red-400 animate-pulse' : 'text-gray-400 hover:text-white'}`}><Mic size={20} /></button>
                    <textarea ref={textareaRef} value={aiInput} onChange={(e) => setAiInput(e.target.value)} onKeyDown={(e) => {if(e.key === 'Enter' && !e.shiftKey) {e.preventDefault(); handleAiSend();}}} placeholder="Ask Gemini..." rows={1} className="flex-1 bg-transparent px-2 py-3 text-white focus:outline-none placeholder-gray-500 resize-none max-h-32 hide-scrollbar"/>
                    <button onClick={handleAiSend} disabled={!aiInput.trim() || aiLoading} className="bg-secondary p-3 rounded-xl text-white hover:bg-secondary/80 transition-colors disabled:opacity-50 mb-1 active:scale-95"><Send size={18} /></button>
                </div>
            </div>
          </>
      )}

      {/* --- P2P CHAT VIEW --- */}
      {mode === 'p2p' && (
          <div className="flex-1 flex flex-col overflow-hidden relative">
             
             {/* 1. USERNAME SETUP */}
             {p2pState === 'username' && (
                 <div className="flex flex-col items-center justify-center h-full p-8 animate-fade-in-up">
                     <div className="bg-white/5 p-6 rounded-3xl border border-white/10 w-full max-w-xs text-center space-y-6">
                         <div className="bg-green-500/20 p-4 rounded-full w-20 h-20 mx-auto flex items-center justify-center text-green-400">
                             <UserPlus size={40} />
                         </div>
                         <div>
                             <h2 className="text-xl font-bold text-white">Join Secure Chat</h2>
                             <p className="text-sm text-gray-400 mt-2">Enter a display name to start or join.</p>
                         </div>
                         <input 
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Your Name"
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-center font-bold focus:border-green-500 outline-none"
                            onKeyDown={(e) => e.key === 'Enter' && initPeer()}
                         />
                         <button 
                            onClick={initPeer}
                            disabled={!username.trim()}
                            className="w-full bg-green-600 hover:bg-green-500 py-3 rounded-xl font-bold text-white shadow-lg transition-all active:scale-95 disabled:opacity-50"
                         >
                             Start Session
                         </button>
                     </div>
                 </div>
             )}

             {/* 2. CONNECTION SETUP */}
             {p2pState === 'setup' && (
                <div className="flex-1 overflow-y-auto p-4 space-y-6 hide-scrollbar animate-fade-in-up">
                    <div className="glass-panel p-6 rounded-2xl border-t-4 border-green-500 space-y-4">
                        <div className="flex items-center justify-between">
                             <h3 className="font-bold text-white flex items-center gap-2"><Radio size={18} className="text-green-400"/> Session ID</h3>
                             <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-lg">Ready</span>
                        </div>
                        <div className="bg-black/30 p-4 rounded-xl border border-white/10 flex items-center justify-between">
                             <span className="font-mono text-xl font-bold text-green-400 tracking-wider">{myPeerId || '...'}</span>
                             <div className="flex gap-2">
                                <button onClick={() => {navigator.clipboard.writeText(myPeerId); showToast("ID Copied", "success")}} className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors" title="Copy ID"><Copy size={18}/></button>
                                <button onClick={handleCopyLink} className="p-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors" title="Share Link"><LinkIcon size={18}/></button>
                             </div>
                        </div>
                    </div>

                    <div className="glass-panel p-6 rounded-2xl space-y-4">
                        <h3 className="font-bold text-white flex items-center gap-2"><LogIn size={18} className="text-blue-400"/> Join Host</h3>
                        <div className="flex gap-2">
                            <input 
                                value={targetPeerId} 
                                onChange={(e) => setTargetPeerId(e.target.value)} 
                                placeholder="Enter Host ID..." 
                                className="flex-1 bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-blue-500 outline-none"
                            />
                            <button 
                                onClick={connectToPeer} 
                                disabled={isConnecting || !targetPeerId} 
                                className="bg-blue-600 hover:bg-blue-500 px-6 rounded-xl text-white font-bold shadow-lg disabled:opacity-50 transition-all flex items-center gap-2"
                            >
                                {isConnecting ? <RefreshCw className="animate-spin" size={18}/> : "Join"}
                            </button>
                        </div>
                    </div>
                </div>
             )}

             {/* 3. ACTIVE CHAT */}
             {p2pState === 'connected' && (
                 <>
                    {/* Top Bar */}
                    <div className="px-4 py-3 border-b border-white/10 bg-black/40 flex items-center justify-between absolute top-0 left-0 right-0 z-10 backdrop-blur-md">
                         <div className="flex items-center gap-2">
                             <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                             <div>
                                 <h3 className="text-sm font-bold text-white">Secure Group</h3>
                                 <p className="text-[10px] text-gray-400">ID: {myPeerId}</p>
                             </div>
                         </div>
                         <div className="flex gap-2">
                             <button onClick={handleCopyLink} className="text-xs bg-white/10 p-2 rounded hover:bg-white/20"><LinkIcon size={14}/></button>
                             <button onClick={() => setP2pState('setup')} className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded hover:bg-red-500/30">Exit</button>
                         </div>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 pt-16 pb-32 space-y-5 hide-scrollbar relative bg-black/20" ref={scrollRef}>
                        {p2pMessages.map((msg, idx) => (
                            <div key={idx} className={`flex flex-col ${msg.role === 'me' ? 'items-end' : 'items-start'} animate-fade-in-up`}>
                                {msg.sender && msg.role !== 'me' && <span className="text-[10px] text-gray-500 mb-1 ml-1">{msg.sender}</span>}
                                <div className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed shadow-md relative ${msg.role === 'me' ? 'bg-green-600 text-white rounded-tr-none' : 'bg-white/10 text-gray-200 rounded-tl-none border border-white/5'}`}>
                                    {renderMessageContent(msg)}
                                </div>
                                <span className="text-[9px] text-gray-600 mt-1 mr-1">{new Date(msg.timestamp || Date.now()).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                            </div>
                        ))}
                    </div>

                    {/* Input Area */}
                    <div className="absolute bottom-16 left-0 right-0 p-3 bg-black/80 backdrop-blur-xl border-t border-white/10">
                        {/* Reply Context */}
                        {replyingTo && (
                            <div className="flex justify-between items-center bg-white/10 p-2 rounded-lg mb-2 text-xs text-gray-300 border-l-4 border-green-500 mx-2">
                                <span>Replying to <b>{replyingTo.sender}</b>: {replyingTo.type === 'text' ? replyingTo.text.substring(0,30)+'...' : '[Media]'}</span>
                                <button onClick={() => setReplyingTo(null)}><XCircle size={14}/></button>
                            </div>
                        )}

                        {/* Attachment Preview */}
                        {attachment && (
                            <div className="mb-2 p-2 bg-white/10 rounded-xl flex items-center justify-between border border-white/10 animate-fade-in-up mx-2">
                                <div className="flex items-center gap-3">
                                    {attachment.type === 'image' ? (
                                        <img src={attachment.content} alt="Preview" className="w-10 h-10 rounded-lg object-cover" />
                                    ) : (
                                        <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center text-blue-400"><FileText size={20} /></div>
                                    )}
                                    <div className="flex flex-col overflow-hidden">
                                        <span className="text-xs font-bold text-white truncate max-w-[150px]">{attachment.name}</span>
                                        <span className="text-[9px] text-gray-400">{attachment.size}</span>
                                    </div>
                                </div>
                                <button onClick={() => setAttachment(null)} className="p-1 text-gray-400 hover:text-white"><XCircle size={18} /></button>
                            </div>
                        )}

                        <div className="flex gap-2 items-center bg-white/5 rounded-2xl p-2 border border-white/10 max-w-md mx-auto">
                            <div className="relative group">
                                <button onClick={() => fileInputRef.current?.click()} className="p-2.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-all active:scale-95">
                                    <Paperclip size={20} />
                                </button>
                            </div>

                            <input
                                type="text"
                                value={p2pInput}
                                onChange={(e) => setP2pInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleP2pSend()}
                                placeholder={isRecording ? "Recording audio..." : "Type message..."}
                                disabled={isRecording}
                                className="flex-1 bg-transparent px-2 text-white focus:outline-none placeholder-gray-500"
                            />
                            
                            {(p2pInput.trim() || attachment) ? (
                                <button onClick={handleP2pSend} className="bg-green-600 p-2.5 rounded-full text-white hover:bg-green-500 transition-colors shadow-lg active:scale-95">
                                    <Send size={18} />
                                </button>
                            ) : (
                                <button 
                                    onMouseDown={startRecording} 
                                    onMouseUp={stopRecording}
                                    onTouchStart={startRecording}
                                    onTouchEnd={stopRecording}
                                    className={`p-2.5 rounded-full transition-all active:scale-95 ${isRecording ? 'bg-red-500 text-white animate-pulse scale-110 shadow-red-500/50 shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}
                                >
                                    {isRecording ? <StopCircle size={20} /> : <Mic size={20} />}
                                </button>
                            )}
                        </div>
                    </div>
                 </>
             )}

             <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
          </div>
      )}
    </div>
  );
};

export default Chat;
