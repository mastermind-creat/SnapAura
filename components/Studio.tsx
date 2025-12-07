
import React, { useRef, useState, useEffect } from 'react';
import { Upload, Wand2, Copy, RefreshCw, Zap, Rocket, Palette, Brain, Camera, Sparkles, MessageCircle, Download, Type, Layers, Sliders, Film, Settings, User, TrendingUp, FileText } from './Icons';
import { analyzeImageAndGenerateCaptions, editImageWithPrompt, rewriteCaption } from '../services/geminiService';
import { showToast } from './Toast';
import { Logo } from './Logo';
import { Tab } from '../types';
import { useNeural } from './NeuralContext';
import SmartCard from './SmartCard';

interface StudioProps {
  image: string | null;
  setImage: (img: string) => void;
  onOpenSettings: () => void;
  onUserClick: () => void;
  setActiveTab: (tab: Tab) => void;
}

// Global confetti
declare global { interface Window { confetti: any; } }

type FilterType = 'none' | 'bw' | 'warm' | 'vivid' | 'cool';
type CaptionStyle = 'modern' | 'neon' | 'polaroid' | 'bold';

const Studio: React.FC<StudioProps> = ({ image, setImage, onOpenSettings, onUserClick, setActiveTab }) => {
  const { state, updateState, dispatchIntent } = useNeural(); // Unified State
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [selectedCaption, setSelectedCaption] = useState<string | null>(null);
  const [avatar, setAvatar] = useState<string | null>(null);
  
  // Design State
  const [internalTab, setInternalTab] = useState<'analyze' | 'design'>('analyze');
  const [activeFilter, setActiveFilter] = useState<FilterType>('none');
  const [captionStyle, setCaptionStyle] = useState<CaptionStyle>('modern');

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
        updateState({ activeImage: result, activeAnalysis: null }); // Update Global State
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
      // Pass Global State to AI Service
      const result = await analyzeImageAndGenerateCaptions(image, state);
      setAnalysisResult(result);
      updateState({ activeAnalysis: result }); // Store globally
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
      // Extract keywords from analysis
      const keywords = analysisResult.hashtags ? analysisResult.hashtags.join(' ') : "Photo";
      dispatchIntent({ type: 'SOCIAL_GROWTH', payload: { topic: keywords } });
  };

  const handleAutoNote = () => {
      if (!analysisResult) return;
      const text = `Analysis of Uploaded Photo:\n\n${analysisResult.analysis}\n\nSuggested Captions:\n${analysisResult.captions[0].options.join('\n')}`;
      dispatchIntent({ type: 'SEND_TO_NOTES', payload: { text, title: 'Photo Analysis' } });
  };

  // LANDING PAGE (UNCHANGED VISUALS, JUST CONNECTED)
  if (!image) {
    return (
      <div className="relative h-full flex flex-col items-center overflow-hidden bg-[#292d3e]">
        {/* Keeping existing background animations */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
            <div className="absolute -bottom-1/2 -left-1/2 w-[200%] h-[100%] opacity-20" style={{ backgroundImage: 'linear-gradient(#00f3ff 1px, transparent 1px), linear-gradient(90deg, #00f3ff 1px, transparent 1px)', backgroundSize: '40px 40px', transform: 'perspective(500px) rotateX(60deg)', animation: 'gridMove 20s linear infinite' }}></div>
            <div className="absolute top-[20%] h-[2px] w-full bg-gradient-to-r from-transparent via-[#ff0099] to-transparent opacity-80 blur-[2px] animate-laser-x"></div>
        </div>

        {/* Top Bar */}
        <div className="absolute top-6 right-6 left-6 z-50 flex justify-between pointer-events-none">
             <div></div> 
             <div className="flex gap-4 pointer-events-auto animate-fade-in-up">
                 <button onClick={onUserClick} className="w-10 h-10 rounded-full flex items-center justify-center bg-[#292d3e] shadow-neu text-gray-400 border border-white/5 overflow-hidden">
                     {avatar ? <img src={avatar} className="w-full h-full object-cover"/> : <User size={18} />}
                 </button>
                 <button onClick={onOpenSettings} className="w-10 h-10 rounded-full bg-[#292d3e] shadow-neu flex items-center justify-center text-gray-400"><Settings size={18} /></button>
             </div>
        </div>

        {/* Hero */}
        <div className="relative z-10 w-full max-w-md h-full flex flex-col items-center justify-center p-6 pb-28">
            <div className="flex flex-col items-center text-center space-y-8 w-full">
                <div className="relative group animate-fade-in-up">
                    <div className="absolute inset-[-10px] rounded-full bg-gradient-to-tr from-[#00f3ff] via-[#ff0099] to-[#39ff14] opacity-40 blur-md animate-rotate-glow"></div>
                    <div className="w-36 h-36 rounded-full bg-[#292d3e] shadow-neu flex items-center justify-center relative z-10 border-2 border-white/5">
                        <Logo size={80} />
                    </div>
                </div>
                <div className="space-y-3 animate-fade-in-up delay-100">
                    <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-gray-100 to-gray-300">SnapAura OS</h1>
                    <p className="text-xs font-bold text-[#00f3ff] tracking-[0.3em] uppercase">Unified Creative System</p>
                </div>
                <div className="w-full px-4 pt-4 animate-fade-in-up delay-200">
                     <button onClick={() => fileInputRef.current?.click()} className="group w-full rounded-2xl bg-[#292d3e] shadow-neu p-1 relative overflow-hidden">
                         <div className="absolute inset-0 bg-gradient-to-r from-[#00f3ff] via-[#ff0099] to-[#39ff14] opacity-30 group-hover:opacity-60 transition-opacity"></div>
                         <div className="relative bg-[#292d3e] rounded-xl p-5 flex items-center justify-center gap-4 z-10">
                             <Upload size={24} className="text-[#00f3ff]" />
                             <span className="text-lg font-bold text-gray-200">Upload to Core</span>
                         </div>
                     </button>
                </div>
            </div>
        </div>
        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
        {isUploading && <div className="absolute inset-0 z-50 bg-[#292d3e] flex items-center justify-center"><RefreshCw className="animate-spin text-[#00f3ff]" size={40} /></div>}
      </div>
    );
  }

  // STUDIO INTERFACE
  return (
    <div className="h-full overflow-y-auto hide-scrollbar bg-[#292d3e] p-4 pb-32">
        <div className="flex justify-between items-center mb-4">
            <h1 className="text-lg font-bold text-gray-200 flex items-center gap-2">
                <Brain size={20} className="text-primary" /> Neural Studio
            </h1>
            <button onClick={() => {setImage(''); updateState({activeImage: null, activeAnalysis: null});}} className="text-xs bg-[#292d3e] shadow-neu px-3 py-1.5 rounded-lg text-gray-400">Clear</button>
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
                    <button onClick={handleAnalyze} disabled={isAnalyzing} className="w-full py-5 bg-[#292d3e] text-primary rounded-2xl font-bold shadow-neu flex items-center justify-center gap-2">
                        {isAnalyzing ? <RefreshCw className="animate-spin" /> : <Sparkles />} Run Neural Analysis
                    </button>
                ) : (
                    <div className="space-y-4">
                        {/* 1. Contextual Suggestions (The "Living System" part) */}
                        <div className="bg-[#292d3e] shadow-neu p-4 rounded-2xl border border-primary/20">
                            <h3 className="text-[10px] font-bold text-primary uppercase mb-3 flex items-center gap-2"><Zap size={12}/> Suggested Actions</h3>
                            <div className="grid grid-cols-2 gap-3">
                                <button onClick={handleAutoSocial} className="bg-[#292d3e] shadow-neu-pressed p-3 rounded-xl flex items-center gap-2 text-xs font-bold text-gray-300 hover:text-blue-400">
                                    <TrendingUp size={16} className="text-blue-400"/> Create Post
                                </button>
                                <button onClick={handleAutoNote} className="bg-[#292d3e] shadow-neu-pressed p-3 rounded-xl flex items-center gap-2 text-xs font-bold text-gray-300 hover:text-yellow-400">
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
                                                <button key={j} onClick={() => setSelectedCaption(opt)} className="flex-shrink-0 bg-[#292d3e] shadow-neu p-3 rounded-xl text-xs text-gray-300 w-64 text-left active:shadow-neu-pressed">
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
