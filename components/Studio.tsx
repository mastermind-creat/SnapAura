
import React, { useRef, useState, useEffect } from 'react';
import { Upload, Wand2, Copy, RefreshCw, Zap, Rocket, Palette, Brain, Camera, Sparkles, MessageCircle, Download, Type, Layers, Sliders, Film, Settings, User, TrendingUp, FileText, Globe, Activity, Aperture, Command } from './Icons';
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
      if (window.confetti) window.confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
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
      <div className="relative h-full flex flex-col items-center justify-between bg-[#0f0f11] overflow-hidden pb-24">
        
        {/* === LAYER 1: CINEMATIC BACKGROUND === */}
        <div className="absolute inset-0 z-0 pointer-events-none">
            {/* Deep Base */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#1a1c29] via-[#0f0f11] to-[#000000]"></div>
            
            {/* Motion GIF Layer (Subtle Tech Background) */}
            <div 
                className="absolute inset-0 opacity-20 mix-blend-color-dodge"
                style={{
                    backgroundImage: `url('https://cdn.dribbble.com/users/124059/screenshots/15437877/media/e5a9c0d9c402636b0002d2953259929d.gif')`, // Fallback or use a reliable abstract tech GIF
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    filter: 'grayscale(100%) contrast(120%)'
                }}
            ></div>

            {/* Grid Floor */}
            <div className="absolute bottom-0 left-0 right-0 h-2/3 bg-[linear-gradient(rgba(0,243,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,243,255,0.05)_1px,transparent_1px)] bg-[size:50px_50px] [transform:perspective(500px)_rotateX(60deg)] origin-bottom animate-grid-move opacity-30"></div>
            
            {/* Vignette */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#0f0f11_90%)]"></div>
        </div>

        {/* === LAYER 2: TOP CONTROLS === */}
        <div className="w-full flex justify-between items-center p-6 relative z-30">
             <div className="flex flex-col gap-1">
                <div className="h-1 w-12 bg-cyan-500 rounded-full animate-pulse"></div>
                <span className="text-[8px] font-mono text-cyan-400">SYS.ONLINE</span>
            </div>
             <div className="flex items-center gap-4">
                <button onClick={onUserClick} className="w-10 h-10 rounded-full flex items-center justify-center bg-white/5 backdrop-blur-md shadow-[0_0_15px_rgba(0,0,0,0.5)] border border-white/10 overflow-hidden hover:scale-105 transition-transform active:scale-95 group">
                    {avatar ? <img src={avatar} className="w-full h-full object-cover"/> : <User size={18} className="text-gray-400 group-hover:text-white" />}
                </button>
                <button onClick={onOpenSettings} className="w-10 h-10 rounded-full bg-white/5 backdrop-blur-md shadow-[0_0_15px_rgba(0,0,0,0.5)] flex items-center justify-center text-gray-400 border border-white/10 hover:scale-105 transition-transform active:scale-95 hover:text-white hover:border-white/20">
                    <Settings size={18} />
                </button>
             </div>
        </div>

        {/* === LAYER 3: CENTER STAGE (THE CORE) === */}
        <div className="z-20 flex flex-col items-center text-center space-y-8 max-w-xs w-full animate-fade-in-up flex-1 justify-center">
            
            {/* THE NEURAL CORE REACTOR */}
            <div className="relative group cursor-pointer" onClick={() => dispatchIntent({ type: 'NAVIGATE_TOOL', payload: { toolId: 'aura-state' }})}>
                {/* 1. Outer Glow Field */}
                <div className="absolute -inset-10 bg-gradient-to-tr from-cyan-500/20 via-purple-500/10 to-blue-500/20 rounded-full blur-2xl opacity-50 group-hover:opacity-80 transition-opacity duration-1000 animate-pulse-slow"></div>
                
                <div className="relative w-40 h-40 flex items-center justify-center">
                    {/* 2. Outer Rotating Ring (Slow) */}
                    <div className="absolute inset-0 rounded-full border border-white/5 border-t-cyan-500/50 border-b-purple-500/50 animate-spin-slow"></div>
                    
                    {/* 3. Middle Counter-Rotating Ring (Fast) */}
                    <div className="absolute inset-4 rounded-full border-[1px] border-transparent border-l-white/20 border-r-white/20 animate-[spin_4s_linear_infinite_reverse]"></div>
                    
                    {/* 4. Dashed Data Ring */}
                    <div className="absolute inset-2 rounded-full border border-dashed border-white/10 animate-[spin_20s_linear_infinite]"></div>

                    {/* 5. The Core Orb */}
                    <div className="w-24 h-24 rounded-full bg-[#151720] shadow-[inset_0_0_20px_rgba(0,0,0,1)] flex items-center justify-center relative overflow-hidden border border-white/10 group-hover:scale-105 transition-transform duration-500">
                         
                         {/* Core Energy (Gradient Spin) */}
                         <div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent_0_300deg,rgba(0,243,255,0.4)_360deg)] animate-[spin_3s_linear_infinite]"></div>
                         
                         {/* Inner Lens */}
                         <div className="absolute inset-[2px] bg-[#0f0f11] rounded-full flex items-center justify-center">
                             {/* Central Icon */}
                             <div className="relative z-10 text-white drop-shadow-[0_0_10px_rgba(0,243,255,0.8)]">
                                 <Aperture size={40} className="animate-[pulse_3s_ease-in-out_infinite]" />
                             </div>
                             
                             {/* Inner Grid */}
                             <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(96,165,250,0.1)_1px,transparent_1px)] bg-[size:10px_10px] opacity-50"></div>
                         </div>
                    </div>
                </div>
            </div>

            {/* Typography */}
            <div className="space-y-1 relative">
                <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-gray-200 to-gray-500 tracking-tighter drop-shadow-2xl">
                    SnapAura
                </h1>
                <p className="text-[10px] font-bold text-cyan-400 uppercase tracking-[0.3em] animate-pulse">
                    Unified Creative System
                </p>
            </div>

            {/* Primary Action Button */}
            <div className="w-full px-4">
                <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="group relative w-full h-14 rounded-2xl flex items-center justify-center overflow-hidden transition-all active:scale-95"
                >
                    {/* Glowing Background */}
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 animate-shimmer bg-[length:200%_100%] opacity-80 group-hover:opacity-100 transition-opacity"></div>
                    
                    {/* Glass Overlay */}
                    <div className="absolute inset-[1px] bg-[#0f0f11]/90 backdrop-blur-sm rounded-[15px] flex items-center justify-center gap-3 z-10 group-hover:bg-[#0f0f11]/80 transition-colors">
                        <Upload size={18} className="text-white group-hover:scale-110 transition-transform" />
                        <span className="font-bold text-white text-xs tracking-widest uppercase">Initialize Upload</span>
                    </div>
                </button>
            </div>
        </div>

        {/* === LAYER 4: SYSTEM CONSOLE (HUD) === */}
        <div className="w-full px-4 mb-2 z-20">
            <SystemConsole />
        </div>

        {/* Hidden Input */}
        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
        
        {/* Upload Overlay */}
        {isUploading && (
            <div className="absolute inset-0 z-50 bg-[#0f0f11]/90 flex flex-col items-center justify-center backdrop-blur-xl animate-fade-in-up">
                <div className="relative">
                    <div className="w-24 h-24 border-t-2 border-b-2 border-cyan-400 rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Zap size={32} className="text-white animate-pulse" />
                    </div>
                </div>
                <p className="mt-8 text-xs font-bold text-cyan-400 uppercase tracking-[0.2em] animate-pulse">Syncing with Core...</p>
            </div>
        )}
      </div>
    );
  }

  // STUDIO INTERFACE (When Image is Active)
  return (
    <div className="h-full overflow-y-auto hide-scrollbar bg-[#292d3e] p-4 pb-32">
        <div className="flex justify-between items-center mb-4">
            <h1 className="text-lg font-bold text-gray-200 flex items-center gap-2">
                <Brain size={20} className="text-primary" /> Neural Studio
            </h1>
            <button onClick={() => {setImage(''); updateState({activeImage: null, activeAnalysis: null});}} className="text-xs bg-[#292d3e] shadow-neu px-3 py-1.5 rounded-lg text-gray-400 hover:text-white transition-colors">Close</button>
        </div>

        {/* Image Preview */}
        <div className="relative w-full aspect-square rounded-3xl overflow-hidden bg-[#292d3e] shadow-neu-pressed p-2 mb-6 group">
            <div className="relative w-full h-full rounded-2xl overflow-hidden">
                <img src={image} alt="Active" className="w-full h-full object-cover" />
                {selectedCaption && (
                    <div className="absolute inset-0 bg-black/40 flex items-end justify-center p-6 text-center">
                        <p className="text-white font-bold text-lg drop-shadow-md">{selectedCaption}</p>
                    </div>
                )}
                
                {/* SCANNING ANIMATION OVERLAY */}
                {isAnalyzing && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center z-20">
                        <div className="relative">
                            <div className="absolute inset-0 bg-primary opacity-20 blur-xl rounded-full animate-pulse-slow"></div>
                            <Brain size={48} className="text-primary animate-pulse relative z-10" />
                        </div>
                        <p className="text-primary font-bold text-sm mt-4 animate-bounce">Analyzing Neural Patterns...</p>
                        <div className="w-48 h-1 bg-gray-800 rounded-full mt-4 overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-primary to-secondary animate-[laserX_1s_infinite]"></div>
                        </div>
                    </div>
                )}
            </div>
        </div>

        {/* Tabs */}
        <div className="flex bg-[#292d3e] rounded-xl p-1 shadow-neu-pressed mb-6">
            <button onClick={() => setInternalTab('analyze')} className={`flex-1 py-3 text-xs font-bold rounded-lg transition-all ${internalTab === 'analyze' ? 'bg-[#292d3e] shadow-neu text-primary' : 'text-gray-500'}`}>Analysis</button>
            <button onClick={() => setInternalTab('design')} className={`flex-1 py-3 text-xs font-bold rounded-lg transition-all ${internalTab === 'design' ? 'bg-[#292d3e] shadow-neu text-secondary' : 'text-gray-500'}`}>Design</button>
        </div>

        {/* ANALYSIS TAB */}
        {internalTab === 'analyze' && (
            <div className="space-y-6 animate-fade-in-up">
                {!analysisResult ? (
                    <button onClick={handleAnalyze} disabled={isAnalyzing} className="w-full py-5 bg-[#292d3e] text-primary rounded-2xl font-bold shadow-neu flex items-center justify-center gap-2 hover:brightness-110 transition-all">
                        {isAnalyzing ? <RefreshCw className="animate-spin" /> : <Sparkles />} Run Neural Analysis
                    </button>
                ) : (
                    <div className="space-y-4">
                        {/* 1. Contextual Suggestions (The "Living System" part) */}
                        <div className="bg-[#292d3e] shadow-neu p-4 rounded-2xl border border-primary/20">
                            <h3 className="text-[10px] font-bold text-primary uppercase mb-3 flex items-center gap-2"><Zap size={12}/> Suggested Actions</h3>
                            <div className="grid grid-cols-2 gap-3">
                                <button onClick={handleAutoSocial} className="bg-[#292d3e] shadow-neu-pressed p-3 rounded-xl flex items-center gap-2 text-xs font-bold text-gray-300 hover:text-blue-400 transition-colors">
                                    <TrendingUp size={16} className="text-blue-400"/> Create Post
                                </button>
                                <button onClick={handleAutoNote} className="bg-[#292d3e] shadow-neu-pressed p-3 rounded-xl flex items-center gap-2 text-xs font-bold text-gray-300 hover:text-yellow-400 transition-colors">
                                    <FileText size={16} className="text-yellow-400"/> Save Report
                                </button>
                            </div>
                        </div>

                        {/* 2. Analysis Result using SmartCard */}
                        <SmartCard 
                            title="Visual Intelligence" 
                            icon={Brain}
                            content={analysisResult.analysis} 
                            rawText={analysisResult.analysis}
                        />

                        {/* 3. Captions */}
                        <div>
                            <h3 className="text-sm font-bold text-gray-400 mb-3">AI Captions</h3>
                            <div className="space-y-4">
                                {analysisResult.captions?.map((cat: any, i: number) => (
                                    <div key={i} className="space-y-2">
                                        <h4 className="text-[10px] font-bold text-secondary uppercase">{cat.category}</h4>
                                        <div className="flex gap-3 overflow-x-auto pb-2 hide-scrollbar">
                                            {cat.options.map((opt: string, j: number) => (
                                                <button key={j} onClick={() => setSelectedCaption(opt)} className="flex-shrink-0 bg-[#292d3e] shadow-neu p-3 rounded-xl text-xs text-gray-300 w-64 text-left active:shadow-neu-pressed hover:text-white transition-colors">
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

        {/* DESIGN TAB (Simplified for brevity) */}
        {internalTab === 'design' && (
            <div className="text-center text-gray-500 py-10">
                <Sliders size={48} className="mx-auto mb-4 opacity-20" />
                <p>Design tools active for current session.</p>
            </div>
        )}
    </div>
  );
};

export default Studio;
