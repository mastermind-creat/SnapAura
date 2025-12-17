
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

  // --- AUTOMATION TRIGGERS ---
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

  // --- DASHBOARD VIEW (NEW HOME) ---
  if (!image) {
    return (
      <div className="relative h-full flex flex-col items-center justify-between bg-[#0a0b10] overflow-hidden pb-24">
        
        {/* === LAYER 1: CINEMATIC BACKGROUND === */}
        <div className="absolute inset-0 z-0 pointer-events-none">
            {/* Deep Festive Base */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#0f2a1e] via-[#0a0b10] to-[#000000]"></div>
            
            {/* Grid Floor */}
            <div className="absolute bottom-0 left-0 right-0 h-2/3 bg-[linear-gradient(rgba(255,215,0,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,215,0,0.05)_1px,transparent_1px)] bg-[size:50px_50px] [transform:perspective(500px)_rotateX(60deg)] origin-bottom animate-grid-move opacity-30"></div>
            
            {/* Vignette */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#0a0b10_90%)]"></div>
        </div>

        {/* === LAYER 2: TOP CONTROLS === */}
        <div className="w-full flex justify-between items-center p-6 relative z-30">
             <div className="flex flex-col gap-1">
                <div className="h-1 w-12 bg-festive-gold rounded-full animate-pulse"></div>
                <span className="text-[8px] font-mono text-festive-gold tracking-widest uppercase">Holiday OS.Online</span>
            </div>
             <div className="flex items-center gap-4">
                <button onClick={onUserClick} className="w-10 h-10 rounded-full flex items-center justify-center bg-white/5 holiday-blur shadow-2xl border border-white/10 overflow-hidden hover:scale-105 transition-transform active:scale-95 group">
                    {avatar ? <img src={avatar} className="w-full h-full object-cover"/> : <User size={18} className="text-gray-400 group-hover:text-white" />}
                </button>
                <button onClick={onOpenSettings} className="w-10 h-10 rounded-full bg-white/5 holiday-blur shadow-2xl flex items-center justify-center text-gray-400 border border-white/10 hover:scale-105 transition-transform active:scale-95 hover:text-festive-gold hover:border-festive-gold/20">
                    <Settings size={18} />
                </button>
             </div>
        </div>

        {/* === LAYER 3: CENTER STAGE (THE FESTIVE CORE) === */}
        <div className="z-20 flex flex-col items-center text-center space-y-8 max-w-xs w-full animate-fade-in-up flex-1 justify-center">
            
            {/* THE HOLIDAY REACTOR */}
            <div className="relative group cursor-pointer" onClick={() => dispatchIntent({ type: 'NAVIGATE_TOOL', payload: { toolId: 'aura-state' }})}>
                {/* 1. Outer Glow Field */}
                <div className="absolute -inset-10 bg-gradient-to-tr from-festive-gold/20 via-festive-emerald/10 to-festive-crimson/10 rounded-full blur-2xl opacity-50 group-hover:opacity-80 transition-opacity duration-1000 animate-pulse-slow"></div>
                
                <div className="relative w-40 h-40 flex items-center justify-center">
                    {/* 2. Outer Rotating Ring */}
                    <div className="absolute inset-0 rounded-full border border-white/5 border-t-festive-gold/50 border-b-festive-emerald/50 animate-spin-slow"></div>
                    
                    {/* 3. Middle Counter-Rotating Ring */}
                    <div className="absolute inset-4 rounded-full border-[1px] border-transparent border-l-white/20 border-r-white/20 animate-[spin_4s_linear_infinite_reverse]"></div>

                    {/* 5. The Core Orb */}
                    <div className="w-24 h-24 rounded-full bg-[#151720] shadow-[inset_0_0_20px_rgba(0,0,0,1)] flex items-center justify-center relative overflow-hidden border border-white/10 group-hover:scale-105 transition-transform duration-500">
                         {/* Core Energy */}
                         <div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent_0_300deg,rgba(255,215,0,0.4)_360deg)] animate-[spin_3s_linear_infinite]"></div>
                         
                         {/* Inner Lens */}
                         <div className="absolute inset-[2px] bg-[#0a0b10] rounded-full flex items-center justify-center">
                             <div className="relative z-10 text-white drop-shadow-[0_0_10px_#ffd700]">
                                 <Star size={40} className="animate-[star-pulse_3s_ease-in-out_infinite]" />
                             </div>
                         </div>
                    </div>
                </div>
            </div>

            {/* Typography */}
            <div className="space-y-1 relative">
                <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-b from-festive-snow via-festive-gold to-orange-800 tracking-tighter drop-shadow-2xl">
                    SnapAura
                </h1>
                <p className="text-[10px] font-bold text-festive-emerald uppercase tracking-[0.3em] animate-pulse">
                    Festive Intel Engine
                </p>
            </div>

            {/* Primary Action Button */}
            <div className="w-full px-4">
                <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="group relative w-full h-14 rounded-3xl flex items-center justify-center overflow-hidden transition-all active:scale-95"
                >
                    {/* Glowing Holiday Shimmer */}
                    <div className="absolute inset-0 bg-gradient-to-r from-festive-pine via-festive-emerald to-festive-gold animate-shimmer bg-[length:200%_100%] opacity-100"></div>
                    
                    {/* Glass Overlay */}
                    <div className="absolute inset-[1.5px] bg-[#0a0b10]/90 backdrop-blur-sm rounded-[22px] flex items-center justify-center gap-3 z-10 group-hover:bg-[#0a0b10]/80 transition-colors">
                        <Upload size={18} className="text-festive-gold group-hover:scale-110 transition-transform" />
                        <span className="font-black text-festive-gold text-xs tracking-widest uppercase">Start Holiday Edit</span>
                    </div>
                </button>
            </div>
        </div>

        {/* HUD Console */}
        <div className="w-full px-4 mb-2 z-20">
            <SystemConsole />
        </div>

        {/* Hidden Input */}
        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
        
        {/* Upload Overlay */}
        {isUploading && (
            <div className="absolute inset-0 z-50 bg-[#0a0b10]/90 flex flex-col items-center justify-center backdrop-blur-xl animate-fade-in-up">
                <div className="relative">
                    <div className="w-24 h-24 border-t-2 border-b-2 border-festive-gold rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Sparkles size={32} className="text-festive-gold animate-pulse" />
                    </div>
                </div>
                <p className="mt-8 text-xs font-bold text-festive-gold uppercase tracking-[0.2em] animate-pulse">Minting Seasonal Context...</p>
            </div>
        )}
      </div>
    );
  }

  // STUDIO INTERFACE (Active Session)
  return (
    <div className="h-full overflow-y-auto hide-scrollbar bg-[#0f1117] p-4 pb-32">
        <div className="flex justify-between items-center mb-4">
            <h1 className="text-lg font-black text-festive-gold flex items-center gap-2">
                <Star size={20} fill="currentColor" /> Holiday Studio
            </h1>
            <button onClick={() => {setImage(''); updateState({activeImage: null, activeAnalysis: null});}} className="text-[10px] font-black uppercase tracking-widest bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-gray-400 hover:text-white transition-colors">Abort</button>
        </div>

        {/* Image Preview */}
        <div className="relative w-full aspect-square rounded-[2rem] overflow-hidden bg-[#0a0b10] shadow-2xl p-2 mb-6 border border-white/5 group">
            <div className="relative w-full h-full rounded-[1.5rem] overflow-hidden">
                <img src={image} alt="Active" className="w-full h-full object-cover" />
                {selectedCaption && (
                    <div className="absolute inset-0 bg-black/40 flex items-end justify-center p-6 text-center">
                        <p className="text-white font-bold text-lg drop-shadow-md">{selectedCaption}</p>
                    </div>
                )}
                
                {isAnalyzing && (
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-md flex flex-col items-center justify-center z-20">
                        <div className="relative">
                            <div className="absolute inset-0 bg-festive-gold opacity-20 blur-2xl rounded-full animate-pulse-slow"></div>
                            <Sparkles size={48} className="text-festive-gold animate-jingle relative z-10" />
                        </div>
                        <p className="text-festive-gold font-black text-sm mt-6 animate-pulse tracking-widest uppercase">Reading Vibes...</p>
                    </div>
                )}
            </div>
        </div>

        {/* Internal Tabs */}
        <div className="flex bg-[#0a0b10] rounded-2xl p-1 border border-white/5 mb-6">
            <button onClick={() => setInternalTab('analyze')} className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${internalTab === 'analyze' ? 'bg-white/5 text-festive-gold shadow-lg' : 'text-gray-500'}`}>Analysis</button>
            <button onClick={() => setInternalTab('design')} className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${internalTab === 'design' ? 'bg-white/5 text-festive-emerald shadow-lg' : 'text-gray-500'}`}>Filters</button>
        </div>

        {internalTab === 'analyze' && (
            <div className="space-y-6 animate-fade-in-up">
                {!analysisResult ? (
                    <button onClick={handleAnalyze} disabled={isAnalyzing} className="w-full py-5 bg-gradient-to-r from-[#0f2a1e] to-[#0a0b10] text-festive-gold border border-festive-gold/30 rounded-2xl font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-2 hover:brightness-125 transition-all">
                        {isAnalyzing ? <RefreshCw className="animate-spin" /> : <Star size={16} fill="currentColor" />} Run Intelligence
                    </button>
                ) : (
                    <div className="space-y-4">
                        <div className="bg-[#0f2a1e]/40 holiday-blur p-5 rounded-[2rem] border border-festive-emerald/20">
                            <h3 className="text-[10px] font-black text-festive-emerald uppercase tracking-widest mb-4 flex items-center gap-2"><Zap size={12}/> Auto-Actions</h3>
                            <div className="grid grid-cols-2 gap-3">
                                <button onClick={handleAutoSocial} className="bg-white/5 p-4 rounded-2xl flex flex-col items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-300 hover:text-festive-gold border border-white/5 transition-all">
                                    <TrendingUp size={20} className="text-festive-gold"/> Post Idea
                                </button>
                                <button onClick={handleAutoNote} className="bg-white/5 p-4 rounded-2xl flex flex-col items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-300 hover:text-festive-gold border border-white/5 transition-all">
                                    <FileText size={20} className="text-festive-emerald"/> Save Log
                                </button>
                            </div>
                        </div>

                        <SmartCard 
                            title="Festive Intelligence" 
                            icon={Sparkles}
                            content={analysisResult.analysis} 
                            rawText={analysisResult.analysis}
                            className="border border-white/5"
                        />

                        <div>
                            <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4 ml-2">Creative Captions</h3>
                            <div className="space-y-5">
                                {analysisResult.captions?.map((cat: any, i: number) => (
                                    <div key={i} className="space-y-3">
                                        <h4 className="text-[9px] font-black text-festive-gold/60 uppercase ml-2">{cat.category}</h4>
                                        <div className="flex gap-3 overflow-x-auto pb-2 hide-scrollbar px-1">
                                            {cat.options.map((opt: string, j: number) => (
                                                <button key={j} onClick={() => setSelectedCaption(opt)} className="flex-shrink-0 bg-white/5 p-4 rounded-[1.5rem] text-xs font-medium text-gray-300 w-64 text-left border border-white/5 hover:text-white transition-colors">
                                                    "{opt}"
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        )}

        {internalTab === 'design' && (
            <div className="text-center text-gray-500 py-16 holiday-blur bg-white/5 rounded-[2rem] border border-white/5 animate-fade-in-up">
                <Sparkles size={48} className="mx-auto mb-4 text-festive-gold animate-star-pulse" />
                <p className="text-xs font-black uppercase tracking-[0.2em]">Festive Filter Kit Active</p>
            </div>
        )}
    </div>
  );
};

export default Studio;
