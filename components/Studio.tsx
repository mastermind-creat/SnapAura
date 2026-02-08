
import React, { useRef, useState, useEffect } from 'react';
import { Upload, RefreshCw, Star, Settings, User, Sparkles, FileText, TrendingUp } from './Icons';
import { analyzeImageAndGenerateCaptions } from '../services/geminiService';
import { showToast } from './Toast';
import { Tab } from '../types';
import { useNeural } from './NeuralContext';
import SmartCard from './SmartCard';
import SystemConsole from './SystemConsole';
import { Logo } from './Logo';

interface StudioProps {
  image: string | null;
  setImage: (img: string) => void;
  onOpenSettings: () => void;
  onOpenDonation: () => void;
  onUserClick: () => void;
  setActiveTab: (tab: Tab) => void;
  isAuthenticated: boolean;
}

const Studio: React.FC<StudioProps> = ({ image, setImage, onOpenSettings, onOpenDonation, onUserClick, setActiveTab, isAuthenticated }) => {
  const { state, updateState, dispatchIntent } = useNeural(); 
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [selectedCaption, setSelectedCaption] = useState<string | null>(null);
  const [avatar, setAvatar] = useState<string | null>(null);
  
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
      if ((window as any).confetti) (window as any).confetti({ particleCount: 50, spread: 60, colors: ['#4FD1C5', '#6366F1'] });
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

  if (!image) {
    return (
      <div className="relative h-full flex flex-col bg-[#0a0b10] overflow-hidden">
        {/* Cinematic Backdrop Layers */}
        <div className="absolute inset-0 z-0 pointer-events-none">
            <div className="absolute top-[-10%] left-[-10%] w-[120%] h-[120%] bg-[linear-gradient(rgba(0,243,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,243,255,0.03)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_20%,transparent_100%)]"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] animate-pulse-slow"></div>
        </div>

        <header className="w-full flex justify-end items-center p-6 relative z-30 gap-4">
             <button onClick={onUserClick} className="w-12 h-12 rounded-full flex items-center justify-center bg-dark-800 shadow-neu border border-white/5 overflow-hidden transition-all hover:scale-105 active:shadow-neu-pressed">
                {avatar ? <img src={avatar} className="w-full h-full object-cover" alt="User" /> : <User size={20} className="text-gray-400" />}
             </button>
             <button onClick={onOpenSettings} className="w-12 h-12 rounded-full bg-dark-800 shadow-neu flex items-center justify-center text-gray-400 border border-white/5 hover:text-white transition-all active:shadow-neu-pressed">
                <Settings size={20} />
             </button>
        </header>

        <main className="relative z-20 flex-1 flex flex-col items-center justify-center px-6 -mt-12">
            
            {/* ADVANCED LIQUID METABALL NEURAL CORE */}
            <div className="relative w-80 h-80 flex items-center justify-center mb-16">
                
                {/* 1. The Fluid Layer (Metaball Container) */}
                <div className="metaball-container absolute inset-0 animate-hue-rotate">
                    {/* Blob 1: Teal/Primary */}
                    <div className="liquid-blob top-[20%] left-[20%] bg-primary/80 animate-liquid-blob-1"></div>
                    {/* Blob 2: Indigo/Secondary */}
                    <div className="liquid-blob top-[30%] right-[20%] bg-secondary/80 animate-liquid-blob-2"></div>
                    {/* Blob 3: Pink/Accent */}
                    <div className="liquid-blob bottom-[20%] right-[30%] bg-accent/80 animate-liquid-blob-3"></div>
                    {/* Blob 4: Deep Blue */}
                    <div className="liquid-blob bottom-[30%] left-[30%] bg-blue-500/80 animate-liquid-blob-1" style={{ animationDelay: '-5s' }}></div>
                </div>

                {/* 2. Concentric Orbitals (Outside the liquid) */}
                <div className="absolute w-[110%] h-[110%] border border-dashed border-white/10 rounded-full animate-spin-slow opacity-30"></div>
                <div className="absolute w-[95%] h-[95%] border border-dotted border-white/5 rounded-full animate-reverse-spin opacity-20"></div>

                {/* 3. The Quantum Nucleus (Refractive Spherical Shell) */}
                <div className="relative w-52 h-52 rounded-full shadow-2xl flex items-center justify-center overflow-hidden animate-float">
                    {/* Glass Surface with Backdrop Filter */}
                    <div className="absolute inset-0 bg-dark-800/40 backdrop-blur-md rounded-full border border-white/20 z-20 pointer-events-none"></div>
                    
                    {/* Internal Specular Highlight */}
                    <div className="absolute top-2 left-4 w-24 h-12 bg-gradient-to-b from-white/20 to-transparent rotate-[-30deg] blur-md rounded-full z-30"></div>
                    
                    {/* The Nucleus Content */}
                    <div className="relative z-10 scale-[1.2] animate-pulse-slow">
                        <Logo size={150} />
                    </div>

                    {/* Scanning Synapse Sweep */}
                    <div className="absolute inset-x-0 h-1.5 bg-gradient-to-r from-transparent via-white/40 to-transparent blur-sm animate-scan z-40"></div>
                </div>

                {/* Satellite Neural Particles */}
                <div className="absolute top-0 right-10 w-2 h-2 bg-primary rounded-full blur-[1px] animate-float"></div>
                <div className="absolute bottom-10 left-4 w-1.5 h-1.5 bg-secondary rounded-full blur-[1px] animate-float" style={{ animationDelay: '-3s' }}></div>
            </div>

            <div className="text-center space-y-4 mb-16">
                <h1 className="text-6xl font-black premium-title tracking-tighter leading-none drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
                  SnapAura OS
                </h1>
                <div className="flex items-center justify-center gap-3">
                  <div className="h-[1px] w-10 bg-gradient-to-r from-transparent to-primary"></div>
                  <p className="text-[11px] font-black text-primary uppercase tracking-[0.5em] opacity-80">Unified Creative System</p>
                  <div className="h-[1px] w-10 bg-gradient-to-l from-transparent to-primary"></div>
                </div>
            </div>

            <div className="w-full max-w-xs">
                <button 
                  onClick={() => fileInputRef.current?.click()} 
                  className="group relative w-full h-20 rounded-[2.5rem] flex items-center justify-center overflow-hidden transition-all active:scale-95 shadow-neu"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-primary via-secondary to-accent animate-shimmer bg-[length:200%_100%]"></div>
                    <div className="absolute inset-[1.5px] bg-dark-800 rounded-[2.4rem] z-10 flex items-center justify-center gap-4 group-hover:bg-dark-700 transition-colors">
                        <Upload size={24} className="text-primary group-hover:-translate-y-1 transition-transform" />
                        <span className="font-black text-gray-200 text-sm tracking-[0.1em]">Upload to Core</span>
                    </div>
                </button>
            </div>
        </main>

        <div className="w-full mt-auto relative z-30 pb-32 opacity-40 scale-90 translate-y-4 filter blur-[0.5px]">
            <SystemConsole />
        </div>
        
        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
        
        {isUploading && (
            <div className="absolute inset-0 z-[100] bg-[#0a0b10]/95 flex flex-col items-center justify-center backdrop-blur-3xl animate-fade-in">
                <div className="w-20 h-20 border-t-2 border-primary rounded-full animate-spin"></div>
                <p className="mt-8 text-[11px] font-black text-primary uppercase tracking-[0.4em] animate-pulse">Syncing Neural Context...</p>
            </div>
        )}
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto hide-scrollbar bg-dark-900 p-4 pb-44">
        <div className="flex justify-between items-center mb-8 px-2">
            <h1 className="text-lg font-black text-white flex items-center gap-3">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse shadow-[0_0_10px_#4FD1C5]"></div> 
                Core Session
            </h1>
            <button onClick={() => {setImage(''); updateState({activeImage: null, activeAnalysis: null});}} className="text-[10px] font-black uppercase tracking-widest bg-dark-800 shadow-neu border border-white/5 px-6 py-3 rounded-2xl text-gray-500 hover:text-white transition-all active:shadow-neu-pressed">Eject Core</button>
        </div>

        <div className="relative w-full aspect-square rounded-[3rem] overflow-hidden bg-dark-800 shadow-neu p-4 mb-8 border border-white/5">
            <div className="relative w-full h-full rounded-[2.5rem] overflow-hidden bg-black/40">
                <img src={image} alt="Active" className="w-full h-full object-cover" />
                {selectedCaption && (
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/90 to-transparent p-10 text-center backdrop-blur-md">
                        <p className="text-white font-bold text-sm leading-relaxed italic">"{selectedCaption}"</p>
                    </div>
                )}
                {isAnalyzing && (
                    <div className="absolute inset-0 bg-dark-900/80 backdrop-blur-2xl flex flex-col items-center justify-center z-20">
                        <RefreshCw className="animate-spin text-primary mb-6" size={56} />
                        <p className="text-primary font-black text-[11px] tracking-[0.5em] uppercase animate-pulse">Probing Neural Nexus...</p>
                    </div>
                )}
            </div>
        </div>

        <div className="flex bg-dark-800 rounded-[2.5rem] p-2 border border-white/5 mb-10 shadow-neu-pressed">
            <button onClick={() => setInternalTab('analyze')} className={`flex-1 py-4 text-[11px] font-black uppercase tracking-widest rounded-3xl transition-all ${internalTab === 'analyze' ? 'bg-dark-900 shadow-neu text-primary' : 'text-gray-600'}`}>Visual Intel</button>
            <button onClick={() => setInternalTab('design')} className={`flex-1 py-4 text-[11px] font-black uppercase tracking-widest rounded-3xl transition-all ${internalTab === 'design' ? 'bg-dark-900 shadow-neu text-secondary' : 'text-gray-600'}`}>Aesthetics</button>
        </div>

        {internalTab === 'analyze' && (
            <div className="space-y-8 animate-fade-in-up">
                {!analysisResult ? (
                    <button onClick={handleAnalyze} disabled={isAnalyzing} className="group w-full py-10 bg-dark-800 text-primary border border-white/5 rounded-[3rem] font-black uppercase tracking-[0.3em] shadow-neu flex items-center justify-center gap-4 active:shadow-neu-pressed hover:brightness-110 transition-all text-sm">
                        {isAnalyzing ? <RefreshCw className="animate-spin" /> : <Sparkles size={24} className="group-hover:rotate-12 transition-transform"/>} 
                        <span>Run Neural Probe</span>
                    </button>
                ) : (
                    <div className="space-y-8">
                        <div className="grid grid-cols-2 gap-5">
                            <button onClick={handleAutoSocial} className="bg-dark-800 p-8 rounded-[2.5rem] flex flex-col items-center gap-4 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-primary border border-white/5 transition-all group shadow-neu active:shadow-neu-pressed">
                                <TrendingUp size={32} className="text-primary group-hover:scale-110 transition-transform"/>
                                <span>Strategy</span>
                            </button>
                            <button onClick={handleAutoNote} className="bg-dark-800 p-8 rounded-[2.5rem] flex flex-col items-center gap-4 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-secondary border border-white/5 transition-all group shadow-neu active:shadow-neu-pressed">
                                <FileText size={32} className="text-secondary group-hover:scale-110 transition-transform"/>
                                <span>Vault</span>
                            </button>
                        </div>
                        
                        <SmartCard title="Vision Analysis" icon={Sparkles} content={analysisResult.analysis} rawText={analysisResult.analysis} className="border border-white/5 bg-dark-800/40 rounded-[3rem] shadow-neu" />
                        
                        <div className="space-y-6">
                            <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-4 flex items-center gap-2">
                                <Star size={12} className="text-primary"/> Suggested Narratives
                            </h3>
                            {analysisResult.captions?.map((cat: any, i: number) => (
                                <div key={i} className="space-y-4">
                                    <h4 className="text-[9px] font-black text-primary/60 uppercase ml-6 border-l-2 border-primary/20 pl-4">{cat.category}</h4>
                                    <div className="flex gap-5 overflow-x-auto pb-6 hide-scrollbar px-2">
                                        {cat.options.map((opt: string, j: number) => (
                                            <button key={j} onClick={() => setSelectedCaption(opt)} className="flex-shrink-0 bg-dark-800 p-8 rounded-[2.5rem] text-xs font-bold text-gray-400 w-80 text-left border border-white/5 hover:border-primary/40 hover:text-white transition-all shadow-neu active:shadow-neu-pressed leading-relaxed">"{opt}"</button>
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
            <div className="text-center py-28 bg-dark-800 rounded-[4rem] border border-white/5 shadow-neu animate-fade-in-up">
                <div className="bg-dark-900 shadow-neu-pressed w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8 border border-white/5">
                    <Sparkles size={48} className="text-primary animate-pulse" />
                </div>
                <p className="text-[12px] font-black text-gray-500 uppercase tracking-[0.5em]">Neural FX Interface Ready</p>
                <button className="mt-10 px-8 py-4 bg-dark-800 shadow-neu rounded-2xl text-primary font-black text-[10px] uppercase tracking-widest border border-primary/10 hover:bg-primary hover:text-black transition-all">Initialize Engine</button>
            </div>
        )}
    </div>
  );
};

export default Studio;
