import React, { useRef, useState } from 'react';
import { Upload, Wand2, Copy, RefreshCw, Zap, Rocket, Palette, Brain, Camera, Sparkles, MessageCircle, Share2, Download } from './Icons';
import { analyzeImageAndGenerateCaptions, rewriteCaption, editImageWithPrompt } from '../services/geminiService';

interface StudioProps {
  image: string | null;
  setImage: (img: string) => void;
}

// Global definition for confetti
declare global {
  interface Window {
    confetti: any;
  }
}

const Studio: React.FC<StudioProps> = ({ image, setImage }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [selectedCaption, setSelectedCaption] = useState<string | null>(null);
  const [rewriting, setRewriting] = useState(false);
  const [autoEnhancing, setAutoEnhancing] = useState(false);

  // Helper to trigger confetti
  const fireConfetti = () => {
    if (window.confetti) {
      window.confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#8b5cf6', '#ec4899', '#ffffff']
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setAnalysisResult(null); // Reset analysis
        setSelectedCaption(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!image) return;
    setIsAnalyzing(true);
    try {
      const result = await analyzeImageAndGenerateCaptions(image);
      setAnalysisResult(result);
      fireConfetti();
    } catch (err) {
      alert("Failed to analyze image. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAutoEnhance = async () => {
    if (!image) return;
    setAutoEnhancing(true);
    try {
        const enhanced = await editImageWithPrompt(image, "Enhance this photo to be high quality, professional lighting, clear details, and aesthetic color grading. Keep the original subject intact.");
        setImage(enhanced);
        fireConfetti();
    } catch(err) {
        alert("Enhancement failed.");
    } finally {
        setAutoEnhancing(false);
    }
  };

  const handleRewrite = async (tone: string) => {
    if (!selectedCaption) return;
    setRewriting(true);
    try {
      const newCaption = await rewriteCaption(selectedCaption, tone);
      setSelectedCaption(newCaption);
    } catch (err) {
      console.error(err);
    } finally {
      setRewriting(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    // Visual feedback could be added here
  };

  const handleShare = async () => {
    if (!image) return;
    
    try {
      const blob = await (await fetch(image)).blob();
      const file = new File([blob], 'snapaura-edit.png', { type: blob.type });
      
      const shareData: ShareData = {
        title: 'SnapAura Edit',
        text: selectedCaption || 'Created with SnapAura AI',
        files: [file]
      };

      if (navigator.share && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        alert("Sharing not supported on this browser/device. Image downloaded.");
        const a = document.createElement('a');
        a.href = image;
        a.download = 'snapaura-edit.png';
        a.click();
      }
    } catch (e) {
      console.error("Share failed", e);
    }
  };

  const tones = ["Luxury", "Soft Girl", "Masculine", "Toxic", "Romantic", "Spiritual", "Gen-Z"];

  // LANDING PAGE VIEW
  if (!image) {
    return (
      <div className="relative min-h-full flex flex-col items-center justify-center p-6 overflow-hidden">
        
        {/* Animated Background Elements */}
        <div className="absolute top-10 right-10 w-32 h-32 bg-secondary/20 rounded-full blur-[40px] animate-pulse-slow"></div>
        <div className="absolute bottom-20 left-10 w-40 h-40 bg-primary/20 rounded-full blur-[50px] animate-pulse-slow delay-700"></div>

        {/* Hero Section */}
        <div className="text-center z-10 space-y-6 max-w-sm animate-fade-in-up">
          <div className="flex justify-center mb-4">
             <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary blur-xl opacity-50 rounded-full animate-pulse-slow"></div>
                <div className="bg-black/40 p-4 rounded-2xl border border-white/10 backdrop-blur-md relative">
                   <Camera size={48} className="text-white" />
                </div>
                <Sparkles className="absolute -top-2 -right-2 text-yellow-400 animate-bounce" size={24} />
             </div>
          </div>

          <h1 className="text-4xl md:text-5xl font-black tracking-tight">
            <span className="block text-white">SnapAura</span>
            <span className="bg-gradient-to-r from-primary via-purple-400 to-secondary bg-clip-text text-transparent">
              AI Studio
            </span>
          </h1>
          
          <p className="text-gray-400 text-lg leading-relaxed">
            Transform your reality with next-gen AI. Edit, generate, and caption in seconds.
          </p>

          <button 
            onClick={() => fileInputRef.current?.click()}
            className="group relative inline-flex items-center justify-center gap-3 bg-white text-black px-8 py-4 rounded-full font-bold text-lg shadow-xl shadow-white/10 hover:scale-105 transition-all duration-300 w-full"
          >
            <Upload size={24} className="group-hover:-translate-y-1 transition-transform" />
            <span>Start Creating</span>
            <div className="absolute inset-0 rounded-full border border-white/50 opacity-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"></div>
          </button>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-3 gap-3 w-full max-w-md mt-12 z-10 animate-fade-in-up" style={{animationDelay: '0.2s'}}>
            {[
                { icon: Rocket, label: "Enhance", color: "text-blue-400" },
                { icon: Palette, label: "Create", color: "text-pink-400" },
                { icon: Brain, label: "Witty", color: "text-purple-400" },
            ].map((feature, i) => (
                <div key={i} className="glass-panel p-3 rounded-xl flex flex-col items-center gap-2 text-center hover:bg-white/5 transition-colors">
                    <feature.icon className={`${feature.color}`} size={24} />
                    <span className="text-xs font-medium text-gray-300">{feature.label}</span>
                </div>
            ))}
        </div>

        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          accept="image/*" 
          className="hidden" 
        />
      </div>
    );
  }

  // STUDIO VIEW
  // NOTE: pb-32 added to account for bottom nav and floating caption tools
  return (
    <div className="h-full overflow-y-auto hide-scrollbar scroll-smooth">
      <div className="p-4 pb-48 space-y-6 animate-fade-in-up max-w-lg mx-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center glass-panel p-4 rounded-xl sticky top-4 z-40 bg-black/60 backdrop-blur-xl border-white/10 shadow-lg">
          <h1 className="text-xl font-bold bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent flex items-center gap-2">
            <Camera size={20} className="text-white" /> Studio
          </h1>
          <div className="flex gap-2">
             <button 
                 onClick={handleShare}
                 className="text-white p-2 rounded-full hover:bg-white/10 transition-colors"
                 title="Share Image"
             >
                 <Share2 size={18} />
             </button>
             <button 
                 onClick={() => setImage('')} 
                 className="text-gray-400 hover:text-white text-xs font-medium bg-white/5 px-3 py-1.5 rounded-full transition-colors flex items-center"
             >
                 New
             </button>
          </div>
        </div>

        {/* Image Area - "Polaroid" style if caption selected */}
        <div className={`relative w-full aspect-square md:aspect-[4/5] rounded-3xl overflow-hidden glass-panel flex items-center justify-center group shadow-2xl transition-all duration-500 border border-white/10 ${selectedCaption ? 'p-1 bg-white/5' : ''}`}>
            
            {/* The Image */}
            <div className="relative w-full h-full rounded-2xl overflow-hidden">
                <img src={image} alt="Upload" className="w-full h-full object-cover" />
                
                {/* Social Preview Overlay */}
                {selectedCaption && (
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 flex flex-col justify-end p-6">
                        <p className="text-white font-medium text-lg text-center drop-shadow-md leading-relaxed animate-fade-in-up">
                            {selectedCaption}
                        </p>
                        <div className="flex justify-center mt-2 opacity-60">
                            <Sparkles size={16} className="text-white" />
                        </div>
                    </div>
                )}
            </div>

            {/* Quick Actions Overlay */}
            <div className="absolute top-4 right-4 flex gap-2">
                 <button 
                    onClick={handleAutoEnhance}
                    disabled={autoEnhancing}
                    className="bg-black/50 hover:bg-black/70 text-white p-3 rounded-full backdrop-blur-md transition-all flex items-center gap-2 border border-white/10"
                >
                    <Zap size={20} className={`text-yellow-400 ${autoEnhancing ? "animate-spin" : ""}`} fill={autoEnhancing ? "currentColor" : "none"} />
                </button>
            </div>
        </div>

        {/* Analysis Trigger */}
        {!analysisResult && (
          <div className="space-y-3">
              <button
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="w-full py-4 bg-gradient-to-r from-primary to-secondary text-white rounded-2xl font-bold text-lg flex items-center justify-center gap-3 hover:scale-[1.02] transition-transform shadow-lg shadow-primary/20"
              >
              {isAnalyzing ? (
                  <><RefreshCw className="animate-spin" /> Analyzing Vibes...</>
              ) : (
                  <><Brain size={20} /> Generate Captions & Vibe</>
              )}
              </button>
              <p className="text-center text-xs text-gray-500">Powered by Gemini 2.5 Flash</p>
          </div>
        )}

        {/* Results Section */}
        {analysisResult && (
          <div className="space-y-6 animate-fade-in-up">
            
            {/* Mood Analysis Card */}
            <div className="glass-panel p-5 rounded-2xl border-l-4 border-primary relative group">
              <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xs font-bold text-primary uppercase tracking-widest flex items-center gap-2">
                      <Sparkles size={14} /> Vibe Check
                  </h3>
                  <button onClick={() => handleCopy(analysisResult.analysis)} className="text-gray-500 hover:text-white transition-colors">
                      <Copy size={14} />
                  </button>
              </div>
              <p className="text-sm leading-relaxed text-gray-200">{analysisResult.analysis}</p>
            </div>

            {/* Hashtags Card */}
            <div className="glass-panel p-5 rounded-2xl relative">
               <div className="flex justify-between items-start mb-3">
                   <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Trending Tags</h3>
                   <button onClick={() => handleCopy(analysisResult.hashtags.join(' '))} className="text-gray-500 hover:text-white transition-colors">
                      <Copy size={14} />
                  </button>
               </div>
               <div className="flex flex-wrap gap-2">
                  {analysisResult.hashtags?.map((tag: string, i: number) => (
                      <span key={i} className="text-xs bg-white/5 border border-white/10 px-2.5 py-1.5 rounded-lg text-blue-300 hover:bg-white/10 transition-colors select-all">#{tag.replace('#','')}</span>
                  ))}
               </div>
            </div>

            {/* Captions Scroll Area */}
            <div>
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><MessageCircle size={20} /> Select a Caption</h3>
              <div className="space-y-5">
                {analysisResult.captions?.map((cat: any, idx: number) => (
                  <div key={idx}>
                    <h4 className="text-secondary font-bold mb-2 text-xs uppercase tracking-wider ml-1">{cat.category}</h4>
                    <div className="flex overflow-x-auto gap-3 pb-2 hide-scrollbar">
                      {cat.options.map((opt: string, oIdx: number) => (
                        <div 
                          key={oIdx}
                          onClick={() => setSelectedCaption(opt)}
                          className={`flex-shrink-0 w-72 p-4 rounded-2xl cursor-pointer transition-all border relative overflow-hidden group active:scale-95 duration-200 ${
                            selectedCaption === opt 
                              ? 'bg-secondary/20 border-secondary shadow-lg shadow-secondary/10' 
                              : 'bg-white/5 border-white/5 hover:bg-white/10'
                          }`}
                        >
                          <p className="text-sm text-gray-200 relative z-10 leading-relaxed">"{opt}"</p>
                          {selectedCaption === opt && <div className="absolute top-2 right-2 w-2 h-2 bg-secondary rounded-full animate-pulse"></div>}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Selected Caption Floating Toolbelt */}
            {selectedCaption && (
              <div className="fixed bottom-[80px] left-4 right-4 glass-panel p-4 rounded-2xl border border-white/20 shadow-2xl z-50 animate-fade-in-up backdrop-blur-xl bg-black/80">
                  <div className="flex justify-between items-start mb-4">
                      <p className="text-sm font-medium text-white pr-4 leading-relaxed max-h-20 overflow-y-auto">"{selectedCaption}"</p>
                      <div className="flex gap-2">
                        <button onClick={() => handleCopy(selectedCaption)} className="text-gray-400 hover:text-white bg-white/10 p-2 rounded-lg transition-colors" title="Copy Text">
                            <Copy size={16} />
                        </button>
                         <button onClick={handleShare} className="text-gray-400 hover:text-secondary bg-white/10 p-2 rounded-lg transition-colors" title="Share">
                            <Share2 size={16} />
                        </button>
                      </div>
                  </div>
                  
                  <div className="border-t border-white/10 pt-3">
                      <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar pb-1">
                           <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap mr-2">Remix Vibe:</span>
                          {tones.map(tone => (
                              <button
                                  key={tone}
                                  onClick={() => handleRewrite(tone)}
                                  disabled={rewriting}
                                  className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/20 text-[10px] font-bold uppercase tracking-wide whitespace-nowrap transition-all border border-white/5 hover:border-white/20"
                              >
                                  {tone}
                              </button>
                          ))}
                      </div>
                  </div>
              </div>
            )}
          </div>
        )}
        
        {/* Hidden file input */}
        <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept="image/*" 
            className="hidden" 
          />
      </div>
    </div>
  );
};

export default Studio;