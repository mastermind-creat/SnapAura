
import React, { useRef, useState, useEffect } from 'react';
import { Upload, Wand2, Copy, RefreshCw, Zap, Rocket, Palette, Brain, Camera, Sparkles, MessageCircle, Download, Type, Layers, Sliders, Film, Settings, User, TrendingUp, FileText, Globe, Activity, Aperture, Command, Star } from './Icons';
import { analyzeImageAndGenerateCaptions } from '../services/geminiService';
import { showToast } from './Toast';
import { Logo } from './Logo';
import { Tab } from '../types';
import { useNeural } from './NeuralContext';
import SmartCard from './SmartCard';
import SystemConsole from './SystemConsole';

interface StudioProps {
  image: string | null;
  setImage: (img: string) => void;
  onOpenSettings: () => void;
  onUserClick: () => void;
  setActiveTab: (tab: Tab) => void;
  isAuthenticated: boolean;
}

// Global confetti
declare global { interface Window { confetti: any; } }

const Studio: React.FC<StudioProps> = ({ image, setImage, onOpenSettings, onUserClick, setActiveTab, isAuthenticated }) => {
  const { state, updateState, dispatchIntent } = useNeural(); 
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [selectedCaption, setSelectedCaption] = useState<string | null>(null);
  const [avatar, setAvatar] = useState<string | null>(null);
  
  // Design State
  const [internalTab, setInternalTab] = useState<'analyze' | 'design'>('analyze');

  useEffect(() => {
      setAvatar(localStorage.getItem('SNAPAURA_AVATAR'));
      const handler = () => setAvatar(localStorage.getItem('SNAPAURA_AVATAR'));
      window.addEventListener('avatar-update', handler);
      return () => window.removeEventListener('avatar-update', handler);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImage(result);
        updateState({ activeImage: result, activeAnalysis: null }); 
        setAnalysisResult(null);
        setTimeout(() => setIsUploading(false), 800);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!image) return;
    setIsAnalyzing(true);
    try {
      const result = await analyzeImageAndGenerateCaptions(image, state);
      setAnalysisResult(result);
      updateState({ activeAnalysis: result }); 
      if (window.confetti) window.confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 }, colors: ['#ffd700', '#d42426'] });
    } catch (err) {
      showToast("Analysis failed", "error");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAutoSocial = () => {
      if (!analysisResult) return;
      const keywords = analysisResult.hashtags ? analysisResult.hashtags.join(' ') : "Photo";
      dispatchIntent({ type: 'SOCIAL_GROWTH', payload: { topic: keywords } });
  };

  const handleAutoNote = () => {
      if (!analysisResult) return;
      const text = `Analysis of Uploaded Photo:\n\n${analysisResult.analysis}\n\nSuggested Captions:\n${analysisResult.captions[0].options.join('\n')}`;
      dispatchIntent({ type: 'SEND_TO_NOTES', payload: { text, title: 'Photo Analysis' } });
  };

  // --- DASHBOARD VIEW (DASHBOARD REDESIGN) ---
  if (!image) {
    return (
      <div className="relative h-full flex flex-col bg-[#0a0b10] overflow-hidden">
        
        {/* CINEMATIC BACKGROUND LAYER */}
        <div className="absolute inset-0 z-0 pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-b from-[#0f2a1e] via-[#0a0b10] to-[#000000]"></div>
            <div className="absolute bottom-0 left-0 right-0 h-[40vh] bg-[linear-gradient(rgba(255,215,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,215,0,0.03)_1px,transparent_1px)] bg-[size:60px_60px] [transform:perspective(800px)_rotateX(60deg)] origin-bottom animate-grid-move opacity-40"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,transparent_0%,#0a0b10_80%)]"></div>
        </div>

        {/* TOP STATUS BAR */}
        <header className="w-full flex justify-between items-center p-6 relative z-30">
             <div className="flex flex-col">
                <div className="h-0.5 w-10 bg-festive-gold/50 rounded-full mb-1"></div>
                <span className="text-[9px] font-black text-festive-gold tracking-[0.3em] uppercase">Holiday OS.V2</span>
            </div>
             <div className="flex items-center gap-3">
                <button onClick={onUserClick} className="w-10 h-10 rounded-full flex items-center justify-center bg-white/5 border border-white/10 overflow-hidden shadow-2xl hover:scale-105 transition-all">
                    {avatar ? <img src={avatar} className="w-full h-full object-cover"/> : <User size={18} className="text-gray-500" />}
                </button>
                <button onClick={onOpenSettings} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-500 border border-white/10 hover:text-festive-gold transition-all">
                    <Settings size={18} />
                </button>
             </div>
        </header>

        {/* MAIN INTERACTIVE CORE */}
        <main className="relative z-20 flex-1 flex flex-col items-center justify-center px-6 -mt-12">
            
            {/* THE NORTH STAR REACTOR */}
            <div className="relative mb-12 animate-float-slow">
                <div className="absolute -inset-20 bg-festive-gold/5 rounded-full blur-[100px] animate-pulse"></div>
                <div className="relative w-48 h-48 flex items-center justify-center">
                    {/* Rotating Rings */}
                    <div className="absolute inset-0 rounded-full border border-white/5 border-t-festive-gold/40 border-b-festive-emerald/40 animate-spin-slow"></div>
                    <div className="absolute inset-4 rounded-full border border-white/5 border-l-white/10 border-r-white/10 animate-[spin_8s_linear_infinite_reverse]"></div>
                    
                    {/* The Core Lens */}
                    <div className="w-28 h-28 rounded-full bg-[#12141c] shadow-[inset_0_0_30px_rgba(0,0,0,1)] flex items-center justify-center relative overflow-hidden border border-white/10 group cursor-pointer hover:scale-105 transition-all duration-500">
                         <div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent_0_300deg,rgba(255,215,0,0.3)_360deg)] animate-[spin_4s_linear_infinite]"></div>
                         <div className="absolute inset-1 bg-[#0a0b10] rounded-full flex items-center justify-center">
                             <Star size={44} fill="currentColor" className="text-festive-gold animate-star-pulse drop-shadow-[0_0_15px_#ffd700]" />
                         </div>
                    </div>
                </div>
            </div>

            {/* BRANDING TRAY */}
            <div className="text-center space-y-2 mb-10">
                <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-festive-gold to-orange-900 tracking-tighter drop-shadow-2xl">
                    SnapAura
                </h1>
                <div className="flex items-center justify-center gap-3">
                    <div className="h-px w-6 bg-festive-emerald/30"></div>
                    <p className="text-[10px] font-black text-festive-emerald uppercase tracking-[0.4em]">Intelligence Engine</p>
                    <div className="h-px w-6 bg-festive-emerald/30"></div>
                </div>
            </div>

            {/* ACTION CENTER */}
            <div className="w-full max-w-sm">
                <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="group relative w-full h-16 rounded-[2rem] flex items-center justify-center overflow-hidden transition-all active:scale-95 shadow-[0_20px_40px_rgba(0,0,0,0.6)]"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-festive-pine via-festive-emerald to-festive-gold animate-shimmer bg-[length:200%_100%]"></div>
                    <div className="absolute inset-[1.5px] bg-[#0a0b10]/90 backdrop-blur-md rounded-[1.9rem] flex items-center justify-center gap-4 z-10 group-hover:bg-[#0a0b10]/80 transition-all">
                        <Upload size={20} className="text-festive-gold group-hover:-translate-y-1 transition-transform" />
                        <span className="font-black text-festive-gold text-xs tracking-[0.2em] uppercase">Start Holiday Edit</span>
                    </div>
                </button>
            </div>
        </main>

        {/* DOCKED HUD CONSOLE */}
        <div className="w-full mt-auto relative z-30 pb-20">
            <SystemConsole />
        </div>

        {/* HIDDEN LOGIC */}
        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
        
        {/* OVERLAYS */}
        {isUploading && (
            <div className="absolute inset-0 z-[100] bg-black/90 flex flex-col items-center justify-center backdrop-blur-2xl animate-fade-in-up">
                <div className="w-20 h-20 border-t-2 border-festive-gold rounded-full animate-spin"></div>
                <p className="mt-8 text-[10px] font-black text-festive-gold uppercase tracking-[0.3em] animate-pulse">Initializing Seasonal Context...</p>
            </div>
        )}
      </div>
    );
  }

  // --- STUDIO INTERFACE (ACTIVE SESSION) ---
  return (
    <div className="h-full overflow-y-auto hide-scrollbar bg-[#0a0b10] p-4 pb-40">
        <div className="flex justify-between items-center mb-6 px-2">
            <h1 className="text-lg font-black text-festive-gold flex items-center gap-3">
                <div className="w-2 h-2 bg-festive-gold rounded-full animate-pulse"></div> 
                Holiday Studio
            </h1>
            <button onClick={() => {setImage(''); updateState({activeImage: null, activeAnalysis: null});}} className="text-[10px] font-black uppercase tracking-widest bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-gray-500 hover:text-white transition-all">Term Session</button>
        </div>

        {/* Cinematic Image Preview */}
        <div className="relative w-full aspect-square rounded-[2.5rem] overflow-hidden bg-[#0a0b10] shadow-[0_30px_60px_rgba(0,0,0,0.8)] p-2 mb-8 border border-white/5">
            <div className="relative w-full h-full rounded-[2rem] overflow-hidden bg-black/40">
                <img src={image} alt="Active" className="w-full h-full object-cover" />
                {selectedCaption && (
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/60 to-transparent p-8 text-center">
                        <p className="text-white font-bold text-lg leading-snug">{selectedCaption}</p>
                    </div>
                )}
                
                {isAnalyzing && (
                    <div className="absolute inset-0 bg-[#0a0b10]/80 backdrop-blur-xl flex flex-col items-center justify-center z-20">
                        <div className="relative w-24 h-24 mb-6">
                            <div className="absolute inset-0 border-2 border-festive-gold/20 rounded-full animate-ping"></div>
                            <div className="absolute inset-0 border-2 border-festive-gold/40 rounded-full animate-[ping_2s_linear_infinite_0.5s]"></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Sparkles size={40} className="text-festive-gold animate-jingle" />
                            </div>
                        </div>
                        <p className="text-festive-gold font-black text-[10px] tracking-[0.4em] uppercase animate-pulse">Extracting Aura Data...</p>
                    </div>
                )}
            </div>
        </div>

        {/* Tab Controls */}
        <div className="flex bg-black/40 backdrop-blur-md rounded-2xl p-1 border border-white/5 mb-8">
            <button onClick={() => setInternalTab('analyze')} className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${internalTab === 'analyze' ? 'bg-festive-gold/10 text-festive-gold shadow-2xl' : 'text-gray-500'}`}>Visual Intel</button>
            <button onClick={() => setInternalTab('design')} className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${internalTab === 'design' ? 'bg-festive-emerald/10 text-festive-emerald shadow-2xl' : 'text-gray-500'}`}>Aesthetic FX</button>
        </div>

        {internalTab === 'analyze' && (
            <div className="space-y-6 animate-fade-in-up">
                {!analysisResult ? (
                    <button onClick={handleAnalyze} disabled={isAnalyzing} className="w-full py-6 bg-gradient-to-br from-[#0f2a1e] to-[#0a0b10] text-festive-gold border border-festive-gold/30 rounded-3xl font-black uppercase tracking-[0.2em] shadow-2xl flex items-center justify-center gap-3 hover:brightness-125 transition-all">
                        {isAnalyzing ? <RefreshCw className="animate-spin" /> : <Star size={18} fill="currentColor" />} Run Intelligence
                    </button>
                ) : (
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <button onClick={handleAutoSocial} className="bg-white/5 p-5 rounded-3xl flex flex-col items-center gap-3 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-festive-gold border border-white/5 transition-all group">
                                <div className="p-3 bg-festive-gold/10 rounded-2xl group-hover:scale-110 transition-transform"><TrendingUp size={24} className="text-festive-gold"/></div>
                                Viral Strategy
                            </button>
                            <button onClick={handleAutoNote} className="bg-white/5 p-5 rounded-3xl flex flex-col items-center gap-3 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-festive-emerald border border-white/5 transition-all group">
                                <div className="p-3 bg-festive-emerald/10 rounded-2xl group-hover:scale-110 transition-transform"><FileText size={24} className="text-festive-emerald"/></div>
                                Secure Logs
                            </button>
                        </div>

                        <SmartCard 
                            title="Aura Decoding" 
                            icon={Sparkles}
                            content={analysisResult.analysis} 
                            rawText={analysisResult.analysis}
                            className="border border-white/5 bg-[#0f2a1e]/20 rounded-[2.5rem]"
                        />

                        <div className="space-y-6">
                            <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-4">Suggestive Captions</h3>
                            {analysisResult.captions?.map((cat: any, i: number) => (
                                <div key={i} className="space-y-4">
                                    <h4 className="text-[9px] font-black text-festive-gold/60 uppercase ml-4 border-l border-festive-gold/20 pl-3">{cat.category}</h4>
                                    <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar px-2">
                                        {cat.options.map((opt: string, j: number) => (
                                            <button key={j} onClick={() => setSelectedCaption(opt)} className="flex-shrink-0 bg-white/5 p-6 rounded-[2rem] text-xs font-bold text-gray-300 w-72 text-left border border-white/5 hover:border-festive-gold/30 hover:text-white transition-all shadow-xl">
                                                "{opt}"
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        )}

        {internalTab === 'design' && (
            <div className="text-center py-20 bg-white/5 rounded-[3rem] border border-white/5 animate-fade-in-up">
                <Sparkles size={56} className="mx-auto mb-6 text-festive-gold animate-star-pulse" />
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.5em]">FX Processor Online</p>
            </div>
        )}
    </div>
  );
};

export default Studio;
