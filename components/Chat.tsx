import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Sparkles, Users, Copy, Link2, ShieldCheck, RefreshCw, Settings, Mic, Volume2, Radio, Paperclip, ImageIcon, FileText, XCircle, StopCircle, Play, Pause, Download } from './Icons';
import { sendChatMessage } from '../services/geminiService';
import { showToast } from './Toast';

// Message Types
interface Message {
  role: 'user' | 'model' | 'peer' | 'me';
  text: string;
  type?: 'text' | 'image' | 'audio' | 'file';
  fileName?: string;
  fileSize?: string;
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
  const [isAiListening, setIsAiListening] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // --- P2P CHAT STATE (PeerJS) ---
  const [p2pState, setP2pState] = useState<P2PState>('idle');
  const [p2pMessages, setP2pMessages] = useState<Message[]>([]);
  const [p2pInput, setP2pInput] = useState('');
  const [myPeerId, setMyPeerId] = useState('');
  const [targetPeerId, setTargetPeerId] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  
  // Multimedia State
  const [attachment, setAttachment] = useState<{type: 'image' | 'file', content: string, name: string, size?: string} | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Refs for PeerJS
  const peerInstance = useRef<any>(null);
  const connInstance = useRef<any>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [aiMessages, p2pMessages, mode, attachment]);

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

      const randomId = 'snap-' + Math.random().toString(36).substr(2, 4);
      
      const peer = new Peer(randomId);
      
      peer.on('open', (id: string) => {
          setMyPeerId(id);
      });

      peer.on('connection', (conn: any) => {
          setupConnection(conn);
          showToast(`Connected to ${conn.peer}!`, "success");
      });

      peer.on('error', (err: any) => {
          console.error(err);
          if (err.type === 'peer-unavailable') {
              showToast("User not found. Check ID.", "error");
          } else if (err.type === 'unavailable-id') {
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
      if (targetPeerId === myPeerId) return;

      setIsConnecting(true);
      const conn = peerInstance.current.connect(targetPeerId);
      setupConnection(conn);
  };

  const setupConnection = (conn: any) => {
      connInstance.current = conn;
      
      conn.on('open', () => {
          setP2pState('connected');
          setIsConnecting(false);
      });

      conn.on('data', (data: any) => {
          // Handle incoming message object
          // Format expected: { text, type, fileName, fileSize }
          let msg: Message = { role: 'peer', text: '' };
          
          if (typeof data === 'string') {
              msg.text = data;
              msg.type = 'text';
          } else {
              // It's an object
              msg.text = data.text || ''; // Base64 content often stored here for media
              msg.type = data.type || 'text';
              msg.fileName = data.fileName;
              msg.fileSize = data.fileSize;
          }
          
          setP2pMessages(prev => [...prev, msg]);
          if (navigator.vibrate) navigator.vibrate(20);
      });

      conn.on('close', () => {
          setP2pState('setup');
          showToast("Peer disconnected", "info");
          connInstance.current = null;
      });
  };

  const handleP2pSend = () => {
      if (!connInstance.current) return;
      
      let payload: any = {};
      let displayText = '';

      if (attachment) {
          payload = {
              text: attachment.content,
              type: attachment.type,
              fileName: attachment.name,
              fileSize: attachment.size
          };
          displayText = attachment.content; // Render locally
      } else if (p2pInput.trim()) {
          payload = { text: p2pInput, type: 'text' };
          displayText = p2pInput;
      } else {
          return;
      }

      connInstance.current.send(payload);
      setP2pMessages(prev => [...prev, { 
          role: 'me', 
          text: displayText, 
          type: payload.type,
          fileName: payload.fileName,
          fileSize: payload.fileSize
      }]);
      
      setP2pInput('');
      setAttachment(null);
  };

  // --- MULTIMEDIA HANDLERS ---
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (file.size > 5 * 1024 * 1024) { // 5MB Limit for Data Channel stability
          showToast("File too large (Max 5MB)", "error");
          return;
      }

      const reader = new FileReader();
      reader.onload = () => {
          const base64 = reader.result as string;
          const type = file.type.startsWith('image/') ? 'image' : 'file';
          setAttachment({
              type: type,
              content: base64,
              name: file.name,
              size: (file.size / 1024).toFixed(1) + ' KB'
          });
      };
      reader.readAsDataURL(file);
      // Reset input
      e.target.value = '';
  };

  const startRecording = async () => {
      try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          const mediaRecorder = new MediaRecorder(stream);
          mediaRecorderRef.current = mediaRecorder;
          audioChunksRef.current = [];

          mediaRecorder.ondataavailable = (event) => {
              if (event.data.size > 0) audioChunksRef.current.push(event.data);
          };

          mediaRecorder.onstop = () => {
              const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
              const reader = new FileReader();
              reader.onloadend = () => {
                  const base64 = reader.result as string;
                  // Send immediately
                  if (connInstance.current) {
                      const payload = { text: base64, type: 'audio' };
                      connInstance.current.send(payload);
                      setP2pMessages(prev => [...prev, { role: 'me', text: base64, type: 'audio' }]);
                  }
              };
              reader.readAsDataURL(audioBlob);
              stream.getTracks().forEach(track => track.stop()); // Stop mic
          };

          mediaRecorder.start();
          setIsRecording(true);
      } catch (err) {
          showToast("Microphone access denied", "error");
      }
  };

  const stopRecording = () => {
      if (mediaRecorderRef.current && isRecording) {
          mediaRecorderRef.current.stop();
          setIsRecording(false);
      }
  };

  // Auto-Resize Textarea
  useEffect(() => {
      if(textareaRef.current) {
          textareaRef.current.style.height = 'auto';
          textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
      }
  }, [aiInput]);

  // --- AI HANDLERS --- (Keeping existing AI logic minimal for brevity, focused on P2P)
  const handleAiSend = async () => {
    if (!aiInput.trim() || aiLoading) return;
    const userMsg: Message = { role: 'user', text: aiInput };
    setAiMessages(prev => [...prev, userMsg]);
    setAiInput('');
    setAiLoading(true);
    if(textareaRef.current) textareaRef.current.style.height = 'auto';
    try {
      const history = aiMessages.map(m => ({ role: m.role === 'model' ? 'model' : 'user', parts: [{ text: m.text }] }));
      const responseText = await sendChatMessage(history, userMsg.text);
      setAiMessages(prev => [...prev, { role: 'model', text: responseText }]);
    } catch (error) {
      setAiMessages(prev => [...prev, { role: 'model', text: "Oops, I had a glitch. Try again?" }]);
    } finally {
      setAiLoading(false);
    }
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

  const renderMarkdown = (text: string) => {
      if (typeof marked !== 'undefined') return { __html: marked.parse(text) };
      return { __html: text };
  };

  const renderMessageContent = (msg: Message) => {
      if (msg.role === 'model') return <div className="prose prose-invert prose-sm max-w-none" dangerouslySetInnerHTML={renderMarkdown(msg.text)}></div>;
      
      // P2P Content Types
      if (msg.type === 'image') {
          return (
              <div className="space-y-1">
                  <img src={msg.text} alt="Shared" className="rounded-lg max-w-full max-h-60 border border-white/10" />
                  {msg.fileName && <p className="text-[10px] opacity-70 truncate max-w-[200px]">{msg.fileName}</p>}
              </div>
          );
      }
      if (msg.type === 'audio') {
          return (
              <div className="flex items-center gap-2 min-w-[150px]">
                 <div className="bg-white/20 p-2 rounded-full"><Play size={16} fill="white" /></div>
                 <audio controls src={msg.text} className="h-8 w-48" />
              </div>
          );
      }
      if (msg.type === 'file') {
          return (
              <div className="flex items-center gap-3 bg-black/20 p-2 rounded-lg">
                  <div className="bg-blue-500/20 p-2 rounded-lg text-blue-400">
                      <FileText size={24} />
                  </div>
                  <div className="flex flex-col overflow-hidden">
                      <span className="text-sm font-bold truncate max-w-[140px]">{msg.fileName || 'File'}</span>
                      <span className="text-[10px] opacity-60">{msg.fileSize || 'Unknown size'}</span>
                  </div>
                  <a href={msg.text} download={msg.fileName || 'download'} className="p-2 text-gray-400 hover:text-white">
                      <Download size={20} />
                  </a>
              </div>
          );
      }

      return msg.text;
  };

  return (
    <div className="flex flex-col h-[calc(100vh-80px)]">
      {/* HEADER & TABS */}
      <div className="p-4 border-b border-white/10 bg-black/20 backdrop-blur-md sticky top-0 z-10 space-y-3">
        <div className="flex justify-between items-center">
            <h1 className="text-xl font-bold flex items-center gap-2">SnapAura Chat</h1>
            <button onClick={onOpenSettings} className="text-gray-300 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors active:scale-90"><Settings size={20} /></button>
        </div>
        <div className="flex bg-white/5 rounded-lg p-1">
            <button onClick={() => setMode('ai')} className={`flex-1 py-2 text-xs font-bold rounded-md flex items-center justify-center gap-2 transition-all ${mode === 'ai' ? 'bg-secondary text-white shadow-lg' : 'text-gray-400'}`}><Sparkles size={14} /> AI Assistant</button>
            <button onClick={() => setMode('p2p')} className={`flex-1 py-2 text-xs font-bold rounded-md flex items-center justify-center gap-2 transition-all ${mode === 'p2p' ? 'bg-green-600 text-white shadow-lg' : 'text-gray-400'}`}><ShieldCheck size={14} /> P2P Secure</button>
        </div>
      </div>

      {/* --- AI CHAT VIEW --- */}
      {mode === 'ai' && (
          <>
            <div className="flex-1 overflow-y-auto p-4 space-y-4 hide-scrollbar" ref={scrollRef}>
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
            <div className="p-3 pb-20 bg-black/30 backdrop-blur-md">
                <div className="flex gap-2 items-end bg-white/5 rounded-2xl p-2 border border-white/10 shadow-lg">
                    <button onClick={handleAiVoiceInput} className={`p-3 rounded-full transition-all ${isAiListening ? 'bg-red-500/20 text-red-400 animate-pulse' : 'text-gray-400 hover:text-white'}`}><Mic size={20} /></button>
                    <textarea ref={textareaRef} value={aiInput} onChange={(e) => setAiInput(e.target.value)} onKeyDown={(e) => {if(e.key === 'Enter' && !e.shiftKey) {e.preventDefault(); handleAiSend();}}} placeholder="Ask Gemini..." rows={1} className="flex-1 bg-transparent px-2 py-3 text-white focus:outline-none placeholder-gray-500 resize-none max-h-32 hide-scrollbar"/>
                    <button onClick={handleAiSend} disabled={!aiInput.trim() || aiLoading} className="bg-secondary p-3 rounded-xl text-white hover:bg-secondary/80 transition-colors disabled:opacity-50 mb-1 active:scale-95"><Send size={18} /></button>
                </div>
            </div>
          </>
      )}

      {/* --- P2P CHAT VIEW --- */}
      {mode === 'p2p' && (
          <div className="flex-1 flex flex-col overflow-hidden">
             
             {/* P2P STATUS BAR */}
             <div className="p-4 border-b border-white/5 bg-white/5 space-y-4">
                 <div className="flex items-center justify-between bg-black/40 p-3 rounded-xl border border-white/10">
                    <div className="flex flex-col">
                        <span className="text-[10px] text-gray-400 uppercase font-bold">Your Session ID</span>
                        <span className="font-mono text-green-400 font-bold tracking-wider">{myPeerId || 'Generating...'}</span>
                    </div>
                    <button onClick={() => {navigator.clipboard.writeText(myPeerId); showToast("Copied", "success")}} className="bg-white/10 p-2 rounded-lg hover:bg-white/20 transition-colors text-white active:scale-95"><Copy size={16} /></button>
                 </div>
                 {p2pState !== 'connected' && (
                     <div className="flex gap-2">
                         <input value={targetPeerId} onChange={(e) => setTargetPeerId(e.target.value)} placeholder="Friend's ID..." className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 text-sm text-white focus:border-green-500 outline-none"/>
                         <button onClick={connectToPeer} disabled={isConnecting || !targetPeerId} className="bg-green-600 hover:bg-green-500 px-4 rounded-xl text-white font-bold text-sm shadow-lg disabled:opacity-50 transition-all flex items-center gap-2">{isConnecting ? <RefreshCw className="animate-spin" size={16}/> : <Link2 size={16}/>} Connect</button>
                     </div>
                 )}
                 {p2pState === 'connected' && (
                     <div className="bg-green-500/10 border border-green-500/30 p-2 rounded-xl text-center animate-fade-in-up flex justify-center items-center gap-2">
                         <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div> <span className="text-xs text-green-400 font-bold">Secure Encrypted Channel Active</span>
                     </div>
                 )}
             </div>

             {/* P2P MESSAGES */}
             <div className="flex-1 overflow-y-auto p-4 space-y-4 hide-scrollbar relative" ref={scrollRef}>
                 {p2pState === 'setup' && !isConnecting && (
                     <div className="flex flex-col items-center justify-center h-full text-center opacity-60 space-y-4">
                         <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center"><Users size={32} className="text-gray-400" /></div>
                         <div><p className="text-white font-bold">Waiting for connection...</p><p className="text-sm text-gray-500">Share your ID or enter a friend's ID above.</p></div>
                     </div>
                 )}
                 {p2pMessages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'me' ? 'justify-end' : 'justify-start'} animate-fade-in-up`}>
                        <div className={`max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed shadow-md ${msg.role === 'me' ? 'bg-green-600 text-white rounded-tr-none' : 'bg-white/10 text-gray-200 rounded-tl-none border border-white/5'}`}>
                             {renderMessageContent(msg)}
                        </div>
                    </div>
                ))}
             </div>
             
             {/* P2P INPUT AREA */}
             {p2pState === 'connected' && (
                <div className="p-4 pb-20 bg-black/30 backdrop-blur-md">
                    
                    {/* Attachment Preview */}
                    {attachment && (
                        <div className="mb-2 p-2 bg-white/10 rounded-xl flex items-center justify-between border border-white/10 animate-fade-in-up">
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

                    <div className="flex gap-2 items-center bg-white/5 rounded-2xl p-2 border border-white/10">
                        {/* Attach Button */}
                        <div className="relative group">
                            <button onClick={() => fileInputRef.current?.click()} className="p-2.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-all active:scale-95">
                                <Paperclip size={20} />
                            </button>
                        </div>

                        {/* Text Input */}
                        <input
                            type="text"
                            value={p2pInput}
                            onChange={(e) => setP2pInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleP2pSend()}
                            placeholder={isRecording ? "Recording audio..." : "Type message..."}
                            disabled={isRecording}
                            className="flex-1 bg-transparent px-2 text-white focus:outline-none placeholder-gray-500"
                        />
                        
                        {/* Mic / Send Logic */}
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
             )}

             <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
          </div>
      )}
    </div>
  );
};

export default Chat;