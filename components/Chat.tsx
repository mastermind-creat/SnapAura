import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Sparkles, Users, Copy, Link2, ShieldCheck, RefreshCw, Settings, Mic, Volume2, Radio } from './Icons';
import { sendChatMessage } from '../services/geminiService';
import { showToast } from './Toast';

interface Message {
  role: 'user' | 'model' | 'peer' | 'me';
  text: string;
}

type ChatMode = 'ai' | 'p2p';
type P2PState = 'idle' | 'setup' | 'connected';

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
    { role: 'model', text: "Hey! I'm **SnapAura**. Need help with a caption, a photo idea, or just want to chat?" }
  ]);
  const [aiLoading, setAiLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // --- P2P CHAT STATE (PeerJS) ---
  const [p2pState, setP2pState] = useState<P2PState>('idle');
  const [p2pMessages, setP2pMessages] = useState<Message[]>([]);
  const [p2pInput, setP2pInput] = useState('');
  const [myPeerId, setMyPeerId] = useState('');
  const [targetPeerId, setTargetPeerId] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  
  // Refs for PeerJS
  const peerInstance = useRef<any>(null);
  const connInstance = useRef<any>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [aiMessages, p2pMessages, mode]);

  // Clean up Peer on unmount
  useEffect(() => {
    return () => {
      destroyPeer();
    };
  }, []);

  // Initialize Peer when switching to P2P mode
  useEffect(() => {
      if (mode === 'p2p' && !peerInstance.current) {
          setP2pState('setup');
          initPeer();
      }
  }, [mode]);

  const destroyPeer = () => {
      if (connInstance.current) {
          connInstance.current.close();
          connInstance.current = null;
      }
      if (peerInstance.current) {
          peerInstance.current.destroy();
          peerInstance.current = null;
      }
      setP2pState('idle');
      setMyPeerId('');
  };

  const initPeer = () => {
      if (typeof Peer === 'undefined') {
          showToast("P2P library loading...", "info");
          setTimeout(initPeer, 500); // Retry if CDN is slow
          return;
      }

      // Generate a friendly random ID: snap-XXXX
      const randomId = 'snap-' + Math.random().toString(36).substr(2, 4);
      
      const peer = new Peer(randomId);
      
      peer.on('open', (id: string) => {
          setMyPeerId(id);
      });

      peer.on('connection', (conn: any) => {
          // Incoming connection
          setupConnection(conn);
          showToast(`Connected to ${conn.peer}!`, "success");
      });

      peer.on('error', (err: any) => {
          console.error(err);
          if (err.type === 'peer-unavailable') {
              showToast("User not found. Check ID.", "error");
          } else if (err.type === 'unavailable-id') {
              // Retry with new ID if taken
              initPeer(); 
          } else {
              showToast("Connection Error", "error");
          }
          setIsConnecting(false);
      });

      peerInstance.current = peer;
  };

  const connectToPeer = () => {
      if (!targetPeerId.trim() || !peerInstance.current) return;
      
      if (targetPeerId === myPeerId) {
          showToast("Cannot connect to yourself", "error");
          return;
      }

      setIsConnecting(true);
      const conn = peerInstance.current.connect(targetPeerId);
      setupConnection(conn);
  };

  const setupConnection = (conn: any) => {
      connInstance.current = conn;
      
      conn.on('open', () => {
          setP2pState('connected');
          setIsConnecting(false);
          // showToast("Secure Channel Established", "success");
      });

      conn.on('data', (data: any) => {
          setP2pMessages(prev => [...prev, { role: 'peer', text: data }]);
          if (navigator.vibrate) navigator.vibrate(20);
      });

      conn.on('close', () => {
          setP2pState('setup');
          showToast("Peer disconnected", "info");
          connInstance.current = null;
      });
  };

  const handleP2pSend = () => {
      if (!p2pInput.trim() || !connInstance.current) return;
      connInstance.current.send(p2pInput);
      setP2pMessages(prev => [...prev, { role: 'me', text: p2pInput }]);
      setP2pInput('');
  };

  // Auto-Resize Textarea
  useEffect(() => {
      if(textareaRef.current) {
          textareaRef.current.style.height = 'auto';
          textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
      }
  }, [aiInput]);

  // --- SPEECH RECOGNITION ---
  const handleVoiceInput = () => {
      if (!('webkitSpeechRecognition' in window)) {
          showToast("Voice input not supported", "error");
          return;
      }
      
      const recognition = new (window as any).webkitSpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      
      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event: any) => {
          const text = event.results[0][0].transcript;
          setAiInput(prev => prev + (prev ? ' ' : '') + text);
      };
      recognition.onend = () => setIsListening(false);
      recognition.start();
  };

  // --- TEXT TO SPEECH ---
  const speakText = (text: string) => {
      if ('speechSynthesis' in window) {
          const utterance = new SpeechSynthesisUtterance(text.replace(/[*#]/g, ''));
          window.speechSynthesis.speak(utterance);
      }
  };

  // --- AI HANDLERS ---
  const handleAiSend = async () => {
    if (!aiInput.trim() || aiLoading) return;

    const userMsg: Message = { role: 'user', text: aiInput };
    setAiMessages(prev => [...prev, userMsg]);
    setAiInput('');
    setAiLoading(true);

    if(textareaRef.current) textareaRef.current.style.height = 'auto';

    try {
      const history = aiMessages.map(m => ({
        role: m.role === 'model' ? 'model' : 'user', 
        parts: [{ text: m.text }]
      }));
      
      const responseText = await sendChatMessage(history, userMsg.text);
      setAiMessages(prev => [...prev, { role: 'model', text: responseText }]);
    } catch (error) {
      setAiMessages(prev => [...prev, { role: 'model', text: "Oops, I had a glitch. Try again?" }]);
    } finally {
      setAiLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
      navigator.clipboard.writeText(text);
      showToast("ID Copied!", "success");
  };

  // Helper to render MD
  const renderMarkdown = (text: string) => {
      if (typeof marked !== 'undefined') {
          return { __html: marked.parse(text) };
      }
      return { __html: text };
  };

  return (
    <div className="flex flex-col h-[calc(100vh-80px)]">
      {/* HEADER & TABS */}
      <div className="p-4 border-b border-white/10 bg-black/20 backdrop-blur-md sticky top-0 z-10 space-y-3">
        <div className="flex justify-between items-center">
            <h1 className="text-xl font-bold flex items-center gap-2">
            SnapAura Chat
            </h1>
            <button 
                onClick={onOpenSettings}
                className="text-gray-300 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors active:scale-90"
                title="Settings"
            >
                <Settings size={20} />
            </button>
        </div>
        <div className="flex bg-white/5 rounded-lg p-1">
            <button 
                onClick={() => setMode('ai')}
                className={`flex-1 py-2 text-xs font-bold rounded-md flex items-center justify-center gap-2 transition-all ${mode === 'ai' ? 'bg-secondary text-white shadow-lg' : 'text-gray-400'}`}
            >
                <Sparkles size={14} /> AI Assistant
            </button>
            <button 
                onClick={() => setMode('p2p')}
                className={`flex-1 py-2 text-xs font-bold rounded-md flex items-center justify-center gap-2 transition-all ${mode === 'p2p' ? 'bg-green-600 text-white shadow-lg' : 'text-gray-400'}`}
            >
                <ShieldCheck size={14} /> Instant P2P
            </button>
        </div>
      </div>

      {/* --- AI CHAT VIEW --- */}
      {mode === 'ai' && (
          <>
            <div className="flex-1 overflow-y-auto p-4 space-y-4 hide-scrollbar" ref={scrollRef}>
                {aiMessages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed shadow-lg ${
                    msg.role === 'user' 
                        ? 'bg-secondary text-white rounded-tr-none' 
                        : 'bg-white/10 text-gray-200 rounded-tl-none border border-white/5'
                    }`}>
                        {msg.role === 'model' ? (
                            <div className="prose prose-invert prose-sm max-w-none" dangerouslySetInnerHTML={renderMarkdown(msg.text)}></div>
                        ) : (
                            msg.text
                        )}
                        
                        {msg.role === 'model' && (
                            <div className="mt-2 pt-2 border-t border-white/10 flex justify-end">
                                <button onClick={() => speakText(msg.text)} className="p-1 text-gray-400 hover:text-white transition-colors">
                                    <Volume2 size={14} />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
                ))}
                {aiLoading && (
                <div className="flex justify-start animate-fade-in-up">
                    <div className="bg-white/10 p-4 rounded-2xl rounded-tl-none flex gap-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                    </div>
                </div>
                )}
            </div>

            <div className="p-3 pb-20 bg-black/30 backdrop-blur-md">
                <div className="flex gap-2 items-end bg-white/5 rounded-2xl p-2 border border-white/10 shadow-lg">
                
                <button 
                    onClick={handleVoiceInput}
                    className={`p-3 rounded-full transition-all ${isListening ? 'bg-red-500/20 text-red-400 animate-pulse' : 'text-gray-400 hover:text-white'}`}
                >
                    <Mic size={20} />
                </button>

                <textarea
                    ref={textareaRef}
                    value={aiInput}
                    onChange={(e) => setAiInput(e.target.value)}
                    onKeyDown={(e) => {
                        if(e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleAiSend();
                        }
                    }}
                    placeholder="Ask Gemini anything..."
                    rows={1}
                    className="flex-1 bg-transparent px-2 py-3 text-white focus:outline-none placeholder-gray-500 resize-none max-h-32 hide-scrollbar"
                />
                
                <button 
                    onClick={handleAiSend}
                    disabled={!aiInput.trim() || aiLoading}
                    className="bg-secondary p-3 rounded-xl text-white hover:bg-secondary/80 transition-colors disabled:opacity-50 mb-1 active:scale-95"
                >
                    <Send size={18} />
                </button>
                </div>
            </div>
          </>
      )}

      {/* --- P2P CHAT VIEW (PeerJS) --- */}
      {mode === 'p2p' && (
          <div className="flex-1 flex flex-col overflow-hidden">
             
             {/* P2P TOP BAR (ID & CONNECT) */}
             <div className="p-4 border-b border-white/5 bg-white/5 space-y-4">
                 {/* My ID Display */}
                 <div className="flex items-center justify-between bg-black/40 p-3 rounded-xl border border-white/10">
                    <div className="flex flex-col">
                        <span className="text-[10px] text-gray-400 uppercase font-bold">Your Session ID</span>
                        <span className="font-mono text-green-400 font-bold tracking-wider">{myPeerId || 'Generating...'}</span>
                    </div>
                    <button 
                        onClick={() => copyToClipboard(myPeerId)}
                        className="bg-white/10 p-2 rounded-lg hover:bg-white/20 transition-colors text-white active:scale-95"
                    >
                        <Copy size={16} />
                    </button>
                 </div>

                 {/* Connect Input (Only if not connected) */}
                 {p2pState !== 'connected' && (
                     <div className="flex gap-2">
                         <input 
                            value={targetPeerId}
                            onChange={(e) => setTargetPeerId(e.target.value)}
                            placeholder="Enter friend's ID..."
                            className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 text-sm text-white focus:border-green-500 outline-none"
                         />
                         <button 
                            onClick={connectToPeer}
                            disabled={isConnecting || !targetPeerId}
                            className="bg-green-600 hover:bg-green-500 px-4 rounded-xl text-white font-bold text-sm shadow-lg disabled:opacity-50 transition-all flex items-center gap-2"
                         >
                             {isConnecting ? <RefreshCw className="animate-spin" size={16}/> : <Link2 size={16}/>}
                             Connect
                         </button>
                     </div>
                 )}

                 {/* Connected Status */}
                 {p2pState === 'connected' && (
                     <div className="bg-green-500/10 border border-green-500/30 p-2 rounded-xl text-center animate-fade-in-up">
                         <p className="text-xs text-green-400 flex items-center justify-center gap-2 font-bold">
                             <Radio size={14} className="animate-pulse" /> Secure Channel Active
                         </p>
                     </div>
                 )}
             </div>

             {/* P2P MESSAGES */}
             <div className="flex-1 overflow-y-auto p-4 space-y-4 hide-scrollbar relative" ref={scrollRef}>
                 {p2pState === 'setup' && !isConnecting && (
                     <div className="flex flex-col items-center justify-center h-full text-center opacity-60 space-y-4">
                         <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center">
                             <Users size={32} className="text-gray-400" />
                         </div>
                         <div>
                             <p className="text-white font-bold">Waiting for connection...</p>
                             <p className="text-sm text-gray-500">Share your ID or enter a friend's ID above.</p>
                         </div>
                     </div>
                 )}

                 {p2pMessages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'me' ? 'justify-end' : 'justify-start'} animate-fade-in-up`}>
                        <div className={`max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed shadow-md ${
                        msg.role === 'me' 
                            ? 'bg-green-600 text-white rounded-tr-none' 
                            : 'bg-white/10 text-gray-200 rounded-tl-none border border-white/5'
                        }`}>
                        {msg.text}
                        </div>
                    </div>
                ))}
             </div>
             
             {/* P2P INPUT */}
             {p2pState === 'connected' && (
                <div className="p-4 pb-20 bg-black/30 backdrop-blur-md">
                    <div className="flex gap-2 items-center bg-white/5 rounded-full p-2 border border-white/10">
                        <input
                            type="text"
                            value={p2pInput}
                            onChange={(e) => setP2pInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleP2pSend()}
                            placeholder="Type a secure message..."
                            className="flex-1 bg-transparent px-4 text-white focus:outline-none placeholder-gray-500"
                        />
                        <button 
                            onClick={handleP2pSend}
                            disabled={!p2pInput.trim()}
                            className="bg-green-600 p-2.5 rounded-full text-white hover:bg-green-500 transition-colors disabled:opacity-50"
                        >
                            <Send size={18} />
                        </button>
                    </div>
                </div>
             )}
          </div>
      )}
    </div>
  );
};

export default Chat;