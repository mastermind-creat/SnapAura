import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Sparkles, Users, Copy, Link2, ShieldCheck, RefreshCw, Settings, Mic, Volume2 } from './Icons';
import { sendChatMessage } from '../services/geminiService';
import { showToast } from './Toast';

interface Message {
  role: 'user' | 'model' | 'peer' | 'me';
  text: string;
}

type ChatMode = 'ai' | 'p2p';
type P2PState = 'idle' | 'creating' | 'waiting_for_answer' | 'joining' | 'connected';

interface ChatProps {
  onOpenSettings: () => void;
}

// Global for marked (loaded via CDN)
declare const marked: any;

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

  // --- P2P CHAT STATE ---
  const [p2pState, setP2pState] = useState<P2PState>('idle');
  const [p2pMessages, setP2pMessages] = useState<Message[]>([]);
  const [p2pInput, setP2pInput] = useState('');
  const [sessionCode, setSessionCode] = useState('');
  const [remoteCode, setRemoteCode] = useState('');
  
  // WebRTC Refs
  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const dataChannel = useRef<RTCDataChannel | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [aiMessages, p2pMessages, mode]);

  // Clean up WebRTC on unmount
  useEffect(() => {
    return () => {
      if (peerConnection.current) {
        peerConnection.current.close();
      }
    };
  }, []);

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
          showToast("Voice input not supported in this browser", "error");
          return;
      }
      
      const recognition = new (window as any).webkitSpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      
      recognition.onstart = () => {
          setIsListening(true);
      };
      
      recognition.onresult = (event: any) => {
          const text = event.results[0][0].transcript;
          setAiInput(prev => prev + (prev ? ' ' : '') + text);
      };
      
      recognition.onend = () => {
          setIsListening(false);
      };
      
      recognition.start();
  };

  // --- TEXT TO SPEECH ---
  const speakText = (text: string) => {
      if ('speechSynthesis' in window) {
          const utterance = new SpeechSynthesisUtterance(text.replace(/[*#]/g, '')); // Strip markdown
          utterance.rate = 1.0;
          utterance.pitch = 1.0;
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

    // Reset textarea height
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

  // --- P2P HANDLERS ---
  const initPeerConnection = () => {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    });

    pc.onicecandidate = (event) => {
      if (event.candidate === null) {
        if (pc.localDescription) {
          const code = btoa(JSON.stringify(pc.localDescription));
          setSessionCode(code);
        }
      }
    };

    pc.onconnectionstatechange = () => {
        if (pc.connectionState === 'connected') {
            setP2pState('connected');
            showToast("Secure connection established!", "success");
        } else if (pc.connectionState === 'disconnected') {
            setP2pState('idle');
            showToast("Peer disconnected", "info");
        }
    };

    return pc;
  };

  const setupDataChannel = (dc: RTCDataChannel) => {
    dc.onopen = () => {
        setP2pState('connected');
        showToast("Chat channel open!", "success");
    };
    dc.onmessage = (e) => {
        setP2pMessages(prev => [...prev, { role: 'peer', text: e.data }]);
    };
    dataChannel.current = dc;
  };

  const handleCreateRoom = async () => {
    setP2pState('creating');
    const pc = initPeerConnection();
    peerConnection.current = pc;

    const dc = pc.createDataChannel("chat");
    setupDataChannel(dc);

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
  };

  const handleJoinRoom = () => {
    setP2pState('joining');
  };

  const handleGenerateAnswer = async () => {
      if (!remoteCode) return;
      try {
        const pc = initPeerConnection();
        peerConnection.current = pc;

        pc.ondatachannel = (e) => {
            setupDataChannel(e.channel);
        };

        const offerDesc = JSON.parse(atob(remoteCode));
        await pc.setRemoteDescription(offerDesc);

        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
      } catch (e) {
          showToast("Invalid Session ID", "error");
      }
  };

  const handleCompleteConnection = async () => {
      if (!remoteCode || !peerConnection.current) return;
      try {
          const answerDesc = JSON.parse(atob(remoteCode));
          await peerConnection.current.setRemoteDescription(answerDesc);
      } catch (e) {
          showToast("Invalid Answer Code", "error");
      }
  };

  const handleP2pSend = () => {
      if (!p2pInput.trim() || !dataChannel.current) return;
      dataChannel.current.send(p2pInput);
      setP2pMessages(prev => [...prev, { role: 'me', text: p2pInput }]);
      setP2pInput('');
  };

  const copyToClipboard = (text: string) => {
      navigator.clipboard.writeText(text);
      showToast("Copied to clipboard", "success");
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
                <ShieldCheck size={14} /> Secure P2P
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

      {/* --- P2P CHAT VIEW --- */}
      {mode === 'p2p' && (
          <div className="flex-1 flex flex-col overflow-hidden">
             
             {/* P2P SETUP UI */}
             {p2pState !== 'connected' && (
                 <div className="flex-1 overflow-y-auto p-6 space-y-6 animate-fade-in-up">
                     <div className="text-center space-y-2">
                        <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto text-green-400 mb-4">
                            <ShieldCheck size={32} />
                        </div>
                        <h2 className="text-xl font-bold text-white">Encrypted P2P Chat</h2>
                        <p className="text-sm text-gray-400">Direct browser-to-browser connection. No servers, no logs.</p>
                     </div>

                     {p2pState === 'idle' && (
                         <div className="grid grid-cols-1 gap-4">
                             <button onClick={handleCreateRoom} className="bg-white/10 hover:bg-white/20 p-4 rounded-xl text-left transition-all border border-white/5">
                                 <div className="flex items-center gap-3 mb-1">
                                     <Users className="text-blue-400" />
                                     <span className="font-bold text-white">Create Room</span>
                                 </div>
                                 <p className="text-xs text-gray-500">Generate a session ID to share with a friend.</p>
                             </button>
                             <button onClick={handleJoinRoom} className="bg-white/10 hover:bg-white/20 p-4 rounded-xl text-left transition-all border border-white/5">
                                 <div className="flex items-center gap-3 mb-1">
                                     <Link2 className="text-purple-400" />
                                     <span className="font-bold text-white">Join Room</span>
                                 </div>
                                 <p className="text-xs text-gray-500">Enter a session ID from a friend.</p>
                             </button>
                         </div>
                     )}

                     {p2pState === 'creating' && (
                         <div className="glass-panel p-4 rounded-xl space-y-4">
                             <h3 className="font-bold text-white text-sm">1. Share this Session ID</h3>
                             {sessionCode ? (
                                <div className="relative">
                                    <textarea readOnly value={sessionCode} className="w-full h-24 bg-black/30 rounded-lg p-3 text-xs text-gray-300 break-all resize-none border border-white/10" />
                                    <button onClick={() => copyToClipboard(sessionCode)} className="absolute top-2 right-2 bg-white/10 p-2 rounded hover:bg-white/20 text-white"><Copy size={14} /></button>
                                </div>
                             ) : (
                                 <div className="flex items-center gap-2 text-sm text-gray-400"><RefreshCw className="animate-spin" size={16}/> Generating keys...</div>
                             )}
                             
                             <h3 className="font-bold text-white text-sm pt-4 border-t border-white/10">2. Paste Peer's Answer</h3>
                             <textarea 
                                value={remoteCode}
                                onChange={(e) => setRemoteCode(e.target.value)}
                                placeholder="Paste the answer code here..."
                                className="w-full h-24 bg-black/30 rounded-lg p-3 text-xs text-white break-all resize-none border border-white/10 focus:border-green-500 outline-none" 
                             />
                             
                             <button onClick={handleCompleteConnection} className="w-full bg-green-600 py-3 rounded-lg font-bold text-white shadow-lg active:scale-95 transition-all">
                                 Connect
                             </button>
                             <button onClick={() => setP2pState('idle')} className="w-full text-xs text-gray-500 mt-2 underline">Cancel</button>
                         </div>
                     )}

                     {p2pState === 'joining' && (
                         <div className="glass-panel p-4 rounded-xl space-y-4">
                             {!sessionCode ? (
                                 <>
                                    <h3 className="font-bold text-white text-sm">1. Paste Session ID</h3>
                                    <textarea 
                                        value={remoteCode}
                                        onChange={(e) => setRemoteCode(e.target.value)}
                                        placeholder="Paste the host's session ID here..."
                                        className="w-full h-24 bg-black/30 rounded-lg p-3 text-xs text-white break-all resize-none border border-white/10 focus:border-purple-500 outline-none" 
                                    />
                                    <button onClick={handleGenerateAnswer} className="w-full bg-purple-600 py-3 rounded-lg font-bold text-white shadow-lg active:scale-95 transition-all">
                                        Generate Answer
                                    </button>
                                 </>
                             ) : (
                                 <>
                                     <h3 className="font-bold text-white text-sm">2. Share Answer Code</h3>
                                     <div className="relative">
                                        <textarea readOnly value={sessionCode} className="w-full h-24 bg-black/30 rounded-lg p-3 text-xs text-gray-300 break-all resize-none border border-white/10" />
                                        <button onClick={() => copyToClipboard(sessionCode)} className="absolute top-2 right-2 bg-white/10 p-2 rounded hover:bg-white/20 text-white"><Copy size={14} /></button>
                                    </div>
                                    <p className="text-center text-xs text-yellow-400 animate-pulse">Waiting for host to connect...</p>
                                 </>
                             )}
                             <button onClick={() => setP2pState('idle')} className="w-full text-xs text-gray-500 mt-2 underline">Cancel</button>
                         </div>
                     )}
                 </div>
             )}

             {/* P2P MESSAGING UI */}
             {p2pState === 'connected' && (
                 <>
                    <div className="bg-green-500/10 border-b border-green-500/20 p-2 text-center">
                        <p className="text-xs text-green-400 flex items-center justify-center gap-1"><ShieldCheck size={12}/> Secure Channel Active</p>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 hide-scrollbar" ref={scrollRef}>
                        {p2pMessages.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.role === 'me' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed ${
                                msg.role === 'me' 
                                    ? 'bg-green-600 text-white rounded-tr-none' 
                                    : 'bg-white/10 text-gray-200 rounded-tl-none'
                                }`}>
                                {msg.text}
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="p-4 pb-20">
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
                 </>
             )}
          </div>
      )}
    </div>
  );
};

export default Chat;