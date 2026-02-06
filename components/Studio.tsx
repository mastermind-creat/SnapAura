
import React, { useRef, useState, useEffect } from 'react';
import { Upload, RefreshCw, Zap, Camera, Sparkles, Settings, User, TrendingUp, FileText, Star, Heart } from './Icons';
import { analyzeImageAndGenerateCaptions } from '../services/geminiService';
import { showToast } from './Toast';
import { Tab } from '../types';
import { useNeural } from './NeuralContext';
import SmartCard from './SmartCard';
import SystemConsole from './SystemConsole';

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
      // Fix: cast window to any to access confetti loaded from CDN
      if ((window as any).confetti) (window as any).confetti({ particleCount: 50, spread: 60, colors: ['#60A5FA', '#C084FC'] });
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
      <div className="relative h-full flex flex-col bg-dark-900 overflow-hidden">
        <header className="w-full flex justify-between items-center p-6 relative z-30">
             <div className="flex flex-col">
                <div className="h-0.5 w-10 bg-primary/50 rounded-full mb-1"></div>
                <span className="text-[9px] font-black text-primary tracking-[0.3em] uppercase">SnapAura OS</span>
            </div>
             <div className="flex items-center gap-3">
                <button onClick={onOpenDonation} className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-accent hover:text-white transition-all shadow-xl group">
                    <Heart size={20} className="group-hover:fill-current transition-all" />
                </button>
                <button onClick={onUserClick} className="w-10 h-10 rounded-full flex items-center justify-center bg-white/5 border border-white/10 overflow-hidden shadow-2xl hover:scale-105 transition-all">
                    {avatar ? <img src={avatar} className="w-full h-full object-cover" alt="User Avatar" /> : <User size={18} className="text-gray-500" />}
                </button>
                <button onClick={onOpenSettings} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-500 border border-white/10 hover:text-primary transition-all">
                    <Settings size={18} />
                </button>
             </div>
        </header>

        <main className="relative z-20 flex-1 flex flex-col items-center justify-center px-6 -mt-12">
            <div className="relative mb-12 animate-float">
                <div className="absolute -inset-20 bg-primary/10 rounded-full blur-[100px] animate-pulse"></div>
                <div className="relative w-48 h-48 flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full border border-white/5 border-t-primary/40 border-b-secondary/40 animate-spin-slow"></div>
                    <div className="w-28 h-28 rounded-full bg-dark-800 shadow-[inset_0_0_30px_rgba(0,0,0,0.5)] flex items-center justify-center relative overflow-hidden border border-white/10 group">
                         <div className="absolute inset-1 bg-dark-900 rounded-full flex items-center justify-center">
                             <Sparkles size={44} className="text-primary animate-pulse" />
                         </div>
                    </div>
                </div>
            </div>

            <div className="text-center space-y-2 mb-10">
                <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-500 tracking-tighter drop-shadow-2xl">SnapAura</h1>
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em]">Intelligence Studio</p>
            </div>

            <div className="w-full max-w-sm">
                <button onClick={() => fileInputRef.current?.click()} className="group relative w-full h-16 rounded-2xl flex items-center justify-center overflow-hidden transition-all active:scale-95 shadow-xl">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary via-secondary to-accent animate-shimmer bg-[length:200%_100%]"></div>
                    <div className="absolute inset-[1.5px] bg-dark-900 rounded-[0.9rem] flex items-center justify-center gap-4 z-10 group-hover:bg-dark-900/80 transition-all">
                        <Upload size={20} className="text-primary group-hover:-translate-y-1 transition-transform" />
                        <span className="font-black text-white text-xs tracking-[0.2em] uppercase">Initialize Project</span>
                    </div>
                </button>
            </div>
        </main>

        <div className="w-full mt-auto relative z-30 pb-24"><SystemConsole /></div>
        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
        {isUploading && (
            <div className="absolute inset-0 z-[100] bg-black/90 flex flex-col items-center justify-center backdrop-blur-2xl animate-fade-in">
                <div className="w-16 h-16 border-t-2 border-primary rounded-full animate-spin"></div>
                <p className="mt-8 text-[10px] font-black text-primary uppercase tracking-[0.3em] animate-pulse">Syncing Neural Context...</p>
            </div>
        )}
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto hide-scrollbar bg-dark-900 p-4 pb-40">
        <div className="flex justify-between items-center mb-6 px-2">
            <h1 className="text-lg font-black text-white flex items-center gap-3">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div> 
                Active Session
            </h1>
            <button onClick={() => {setImage(''); updateState({activeImage: null, activeAnalysis: null});}} className="text-[10px] font-black uppercase tracking-widest bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-gray-500 hover:text-white transition-all">Close Project</button>
        </div>

        <div className="relative w-full aspect-square rounded-3xl overflow-hidden bg-dark-800 shadow-neu p-2 mb-8 border border-white/5">
            <div className="relative w-full h-full rounded-2xl overflow-hidden bg-black/40">
                <img src={image} alt="Active" className="w-full h-full object-cover" />
                {selectedCaption && (
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/60 to-transparent p-6 text-center">
                        <p className="text-white font-bold text-sm leading-snug">{selectedCaption}</p>
                    </div>
                )}
                {isAnalyzing && (
                    <div className="absolute inset-0 bg-dark-900/80 backdrop-blur-xl flex flex-col items-center justify-center z-20">
                        <RefreshCw className="animate-spin text-primary" size={40} />
                        <p className="text-primary font-black text-[10px] tracking-[0.4em] uppercase animate-pulse">Analyzing Visual Data...</p>
                    </div>
                )}
            </div>
        </div>

        <div className="flex bg-dark-800 rounded-2xl p-1 border border-white/5 mb-8 shadow-neu-pressed">
            <button onClick={() => setInternalTab('analyze')} className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${internalTab === 'analyze' ? 'bg-dark-600 text-primary shadow-neu' : 'text-gray-500'}`}>Visual Intel</button>
            <button onClick={() => setInternalTab('design')} className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${internalTab === 'design' ? 'bg-dark-600 text-secondary shadow-neu' : 'text-gray-500'}`}>Aesthetics</button>
        </div>

        {internalTab === 'analyze' && (
            <div className="space-y-6 animate-fade-in-up">
                {!analysisResult ? (
                    <button onClick={handleAnalyze} disabled={isAnalyzing} className="w-full py-6 bg-dark-800 text-primary border border-white/5 rounded-3xl font-black uppercase tracking-[0.2em] shadow-neu flex items-center justify-center gap-3 active:shadow-neu-pressed hover:brightness-110 transition-all">
                        {isAnalyzing ? <RefreshCw className="animate-spin" /> : <Star size={18} />} Run Analysis
                    </button>
                ) : (
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <button onClick={handleAutoSocial} className="bg-dark-800 p-5 rounded-3xl flex flex-col items-center gap-3 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-primary border border-white/5 transition-all group">
                                <TrendingUp size={24} className="text-primary group-hover:scale-110 transition-transform"/>Strategy
                            </button>
                            <button onClick={handleAutoNote} className="bg-dark-800 p-5 rounded-3xl flex flex-col items-center gap-3 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-secondary border border-white/5 transition-all group">
                                <FileText size={24} className="text-secondary group-hover:scale-110 transition-transform"/>Vault
                            </button>
                        </div>
                        <SmartCard title="Aura Breakdown" icon={Sparkles} content={analysisResult.analysis} rawText={analysisResult.analysis} className="border border-white/5 bg-dark-800/50 rounded-3xl" />
                        <div className="space-y-6">
                            <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-4">Generated Captions</h3>
                            {analysisResult.captions?.map((cat: any, i: number) => (
                                <div key={i} className="space-y-4">
                                    <h4 className="text-[9px] font-black text-primary/60 uppercase ml-4 border-l border-primary/20 pl-3">{cat.category}</h4>
                                    <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar px-2">
                                        {cat.options.map((opt: string, j: number) => (
                                            <button key={j} onClick={() => setSelectedCaption(opt)} className="flex-shrink-0 bg-dark-800 p-6 rounded-2xl text-xs font-bold text-gray-300 w-72 text-left border border-white/5 hover:border-primary/30 hover:text-white transition-all shadow-xl">"{opt}"</button>
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
            <div className="text-center py-20 bg-dark-800 rounded-3xl border border-white/5 animate-fade-in-up">
                <Sparkles size={48} className="mx-auto mb-6 text-primary animate-pulse" />
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.5em]">Creative FX Ready</p>
            </div>
        )}
    </div>
  );
};

export default Studio;
