import React, { useRef, useState } from 'react';
import { Upload, Wand2, Copy, RefreshCw, Zap, Rocket, Palette, Brain, Camera, Sparkles, MessageCircle, Share2, Download, Type, Layers, Sliders } from './Icons';
import { analyzeImageAndGenerateCaptions, rewriteCaption, editImageWithPrompt } from '../services/geminiService';
import { showToast } from './Toast';
import { Logo } from './Logo';

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

type FilterType = 'none' | 'bw' | 'warm' | 'vivid' | 'cool' | 'sepia';
type CaptionStyle = 'modern' | 'neon' | 'polaroid' | 'bold';

const Studio: React.FC<StudioProps> = ({ image, setImage }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [selectedCaption, setSelectedCaption] = useState<string | null>(null);
  const [rewriting, setRewriting] = useState(false);
  const [autoEnhancing, setAutoEnhancing] = useState(false);
  const [generatingCard, setGeneratingCard] = useState(false);
  
  // Design State
  const [activeTab, setActiveTab] = useState<'analyze' | 'design'>('analyze');
  const [activeFilter, setActiveFilter] = useState<FilterType>('none');
  const [captionStyle, setCaptionStyle] = useState<CaptionStyle>('modern');

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

  const triggerHaptic = () => {
    if (navigator.vibrate) navigator.vibrate(50);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setAnalysisResult(null); // Reset analysis
        setSelectedCaption(null);
        setActiveFilter('none');
        setCaptionStyle('modern');
        showToast("Image uploaded!", "success");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!image) return;
    triggerHaptic();
    setIsAnalyzing(true);
    setActiveTab('analyze');
    try {
      const result = await analyzeImageAndGenerateCaptions(image);
      setAnalysisResult(result);
      fireConfetti();
      showToast("Vibes analyzed successfully!", "success");
    } catch (err) {
      showToast("Failed to analyze image. Try again.", "error");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAutoEnhance = async () => {
    if (!image) return;
    triggerHaptic();
    setAutoEnhancing(true);
    showToast("Enhancing image...", "info");
    try {
        const enhanced = await editImageWithPrompt(image, "Enhance this photo to be high quality, professional lighting, clear details, and aesthetic color grading. Keep the original subject intact.");
        setImage(enhanced);
        fireConfetti();
        showToast("Enhancement complete!", "success");
    } catch(err) {
        showToast("Enhancement failed.", "error");
    } finally {
        setAutoEnhancing(false);
    }
  };

  const handleRewrite = async (tone: string) => {
    if (!selectedCaption) return;
    triggerHaptic();
    setRewriting(true);
    try {
      const newCaption = await rewriteCaption(selectedCaption, tone);
      setSelectedCaption(newCaption);
      showToast(`Rewritten as ${tone}`, "success");
    } catch (err) {
      console.error(err);
    } finally {
      setRewriting(false);
    }
  };

  const handleCopy = (text: string) => {
    triggerHaptic();
    navigator.clipboard.writeText(text);
    showToast("Copied to clipboard!", "success");
  };

  // Generate a composite image with filter + caption style
  const handleDownloadComposite = async () => {
    if (!image) return;
    triggerHaptic();
    setGeneratingCard(true);
    showToast("Rendering image...", "info");

    try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const img = new Image();
        img.src = image;
        // Wait for image load
        await new Promise((resolve, reject) => { 
            img.onload = resolve;
            img.onerror = reject;
        });

        // Setup Canvas Dimensions
        // For Polaroid, we need extra height
        const isPolaroid = captionStyle === 'polaroid';
        const padding = isPolaroid ? Math.max(img.width, img.height) * 0.05 : 0;
        const bottomPadding = isPolaroid ? Math.max(img.width, img.height) * 0.2 : 0;

        canvas.width = img.width + (padding * 2);
        canvas.height = img.height + (padding * 2) + (isPolaroid ? bottomPadding : 0);

        // 1. Draw Background (White for Polaroid, Black/Clear for others)
        if (isPolaroid) {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        // 2. Apply Filter & Draw Image
        ctx.save();
        const filterMap: Record<FilterType, string> = {
            'none': 'none',
            'bw': 'grayscale(100%)',
            'sepia': 'sepia(80%)',
            'warm': 'sepia(30%) hue-rotate(-10deg)',
            'vivid': 'saturate(150%) contrast(110%)',
            'cool': 'hue-rotate(30deg) saturate(80%)'
        };
        ctx.filter = filterMap[activeFilter];
        
        ctx.drawImage(img, padding, padding, img.width, img.height);
        ctx.restore();

        // 3. Draw Caption
        if (selectedCaption) {
            const fontSize = Math.max(canvas.width * 0.05, 24);
            ctx.font = `bold ${fontSize}px Inter, sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;

            if (captionStyle === 'modern') {
                // Gradient Overlay at bottom
                const gradient = ctx.createLinearGradient(0, canvas.height - (canvas.height * 0.4), 0, canvas.height);
                gradient.addColorStop(0, 'rgba(0,0,0,0)');
                gradient.addColorStop(1, 'rgba(0,0,0,0.9)');
                ctx.fillStyle = gradient;
                ctx.fillRect(0, canvas.height * 0.6, canvas.width, canvas.height * 0.4);
                
                // Text
                ctx.fillStyle = '#ffffff';
                ctx.shadowColor = 'rgba(0,0,0,0.8)';
                ctx.shadowBlur = 10;
                wrapText(ctx, selectedCaption, centerX, canvas.height - (canvas.height * 0.1), canvas.width * 0.9, fontSize * 1.5);
            } 
            else if (captionStyle === 'neon') {
                 // Dark overlay full
                 ctx.fillStyle = 'rgba(0,0,0,0.3)';
                 ctx.fillRect(0, 0, canvas.width, canvas.height);

                 ctx.font = `900 ${fontSize * 1.5}px monospace`;
                 ctx.fillStyle = '#0ff'; // Cyan
                 ctx.shadowColor = '#f0f'; // Magenta Glow
                 ctx.shadowBlur = 20;
                 ctx.shadowOffsetX = 0;
                 ctx.shadowOffsetY = 0;
                 wrapText(ctx, selectedCaption, centerX, centerY, canvas.width * 0.8, fontSize * 2);
            }
            else if (captionStyle === 'bold') {
                ctx.font = `900 ${fontSize * 2}px sans-serif`;
                ctx.fillStyle = 'white';
                ctx.strokeStyle = 'black';
                ctx.lineWidth = fontSize * 0.1;
                
                // Draw stroke then fill
                wrapText(ctx, selectedCaption, centerX, centerY, canvas.width * 0.9, fontSize * 2.2, true);
            }
            else if (captionStyle === 'polaroid') {
                ctx.fillStyle = '#1a1a1a';
                ctx.font = `${fontSize}px 'Courier New', monospace`;
                // Draw in the bottom white space
                const textY = canvas.height - (bottomPadding / 2) - padding;
                wrapText(ctx, selectedCaption, centerX, textY, canvas.width * 0.8, fontSize * 1.2);
            }
        }

        // Convert and Download
        const dataUrl = canvas.toDataURL('image/png', 1.0);
        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = `snapaura-edit-${Date.now()}.png`;
        a.click();
        
        showToast("Image saved to gallery!", "success");
    } catch (err) {
        console.error(err);
        showToast("Failed to save image.", "error");
    } finally {
        setGeneratingCard(false);
    }
  };

  // Helper for text wrapping on canvas
  const wrapText = (ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number, stroke: boolean = false) => {
      const words = text.split(' ');
      let line = '';
      const lines = [];

      for(let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const metrics = ctx.measureText(testLine);
        const testWidth = metrics.width;
        if (testWidth > maxWidth && n > 0) {
            lines.push(line);
            line = words[n] + ' ';
        } else {
            line = testLine;
        }
      }
      lines.push(line);

      // Adjust Y to center the block of text if needed, or just draw up from bottom
      // Here we treat Y as the baseline of the last line or bottom area
      // Let's treat Y as the bottom-most point
      let startY = y - ((lines.length - 1) * lineHeight);

      lines.forEach((l) => {
          if(stroke) ctx.strokeText(l, x, startY);
          ctx.fillText(l, x, startY);
          startY += lineHeight;
      });
  }

  const tones = ["Luxury", "Soft Girl", "Masculine", "Toxic", "Romantic", "Spiritual", "Gen-Z"];
  
  const getFilterCss = (f: FilterType) => {
      switch(f) {
          case 'bw': return 'grayscale(100%)';
          case 'sepia': return 'sepia(80%)';
          case 'warm': return 'sepia(30%) hue-rotate(-10deg)';
          case 'vivid': return 'saturate(150%) contrast(110%)';
          case 'cool': return 'hue-rotate(30deg) saturate(80%)';
          default: return 'none';
      }
  };

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
                   <Logo size={64} />
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
            className="group relative inline-flex items-center justify-center gap-3 bg-white text-black px-8 py-4 rounded-full font-bold text-lg shadow-xl shadow-white/10 hover:scale-105 active:scale-95 transition-all duration-300 w-full"
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
                 onClick={handleDownloadComposite}
                 className="text-white p-2 rounded-full hover:bg-white/10 transition-colors active:scale-90"
                 title="Download Composite"
             >
                 <Download size={18} />
             </button>
             <button 
                 onClick={() => setImage('')} 
                 className="text-gray-400 hover:text-white text-xs font-medium bg-white/5 px-3 py-1.5 rounded-full transition-colors flex items-center active:scale-95"
             >
                 New
             </button>
          </div>
        </div>

        {/* Image Area - "Polaroid" style if caption selected */}
        <div className={`relative w-full aspect-square md:aspect-[4/5] transition-all duration-500 flex items-center justify-center group shadow-2xl ${
            captionStyle === 'polaroid' ? 'bg-white p-4 pb-16 rounded-sm' : 'rounded-3xl overflow-hidden glass-panel border border-white/10'
        }`}>
            
            {/* The Image */}
            <div className={`relative w-full h-full overflow-hidden ${captionStyle === 'polaroid' ? '' : 'rounded-2xl'}`}>
                <img 
                    src={image} 
                    alt="Upload" 
                    className="w-full h-full object-cover transition-all duration-300" 
                    style={{ filter: getFilterCss(activeFilter) }}
                />
                
                {/* Social Preview Overlay Styles */}
                {selectedCaption && (
                    <div className="absolute inset-0 pointer-events-none transition-all duration-300">
                        {/* Modern */}
                        {captionStyle === 'modern' && (
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/20 flex flex-col justify-end p-6">
                                <p className="text-white font-medium text-lg text-center drop-shadow-md leading-relaxed animate-fade-in-up">
                                    {selectedCaption}
                                </p>
                            </div>
                        )}
                        {/* Neon */}
                        {captionStyle === 'neon' && (
                             <div className="absolute inset-0 bg-black/30 flex items-center justify-center p-6">
                                <p className="text-cyan-400 font-black text-2xl text-center leading-relaxed animate-pulse" style={{ textShadow: '0 0 10px #f0f' }}>
                                    {selectedCaption.toUpperCase()}
                                </p>
                            </div>
                        )}
                        {/* Bold */}
                        {captionStyle === 'bold' && (
                            <div className="absolute inset-0 flex items-center justify-center p-4">
                                <p className="text-white font-black text-3xl text-center leading-tight tracking-tighter" style={{ WebkitTextStroke: '1px black' }}>
                                    {selectedCaption}
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>
            
            {/* Polaroid Text (Outside image) */}
            {selectedCaption && captionStyle === 'polaroid' && (
                <div className="absolute bottom-4 left-0 right-0 text-center px-4">
                     <p className="text-black font-mono text-sm">{selectedCaption}</p>
                </div>
            )}

            {/* Quick Actions Overlay (Hidden in Polaroid mode to keep clean) */}
            {captionStyle !== 'polaroid' && (
                <div className="absolute top-4 right-4 flex gap-2">
                    <button 
                        onClick={handleAutoEnhance}
                        disabled={autoEnhancing}
                        className="bg-black/50 hover:bg-black/70 text-white p-3 rounded-full backdrop-blur-md transition-all flex items-center gap-2 border border-white/10 active:scale-90"
                    >
                        <Zap size={20} className={`text-yellow-400 ${autoEnhancing ? "animate-spin" : ""}`} fill={autoEnhancing ? "currentColor" : "none"} />
                    </button>
                </div>
            )}
        </div>
        
        {/* Toggle Mode */}
        <div className="flex bg-white/5 rounded-xl p-1 border border-white/10">
            <button 
                onClick={() => setActiveTab('analyze')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${activeTab === 'analyze' ? 'bg-primary text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
            >
                <Brain size={14} /> AI Analysis
            </button>
            <button 
                onClick={() => setActiveTab('design')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${activeTab === 'design' ? 'bg-secondary text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
            >
                <Sliders size={14} /> Design Tools
            </button>
        </div>

        {/* --- ANALYSIS MODE --- */}
        {activeTab === 'analyze' && (
            <div className="space-y-6 animate-fade-in-up">
                {/* Analysis Trigger */}
                {!analysisResult && (
                <div className="space-y-3">
                    <button
                    onClick={handleAnalyze}
                    disabled={isAnalyzing}
                    className="w-full py-4 bg-gradient-to-r from-primary to-secondary text-white rounded-2xl font-bold text-lg flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-primary/20"
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
                <div className="space-y-6">
                    
                    {/* Mood Analysis Card */}
                    <div className="glass-panel p-5 rounded-2xl border-l-4 border-primary relative group">
                    <div className="flex justify-between items-start mb-2">
                        <h3 className="text-xs font-bold text-primary uppercase tracking-widest flex items-center gap-2">
                            <Sparkles size={14} /> Vibe Check
                        </h3>
                        <button onClick={() => handleCopy(analysisResult.analysis)} className="text-gray-500 hover:text-white transition-colors active:scale-90">
                            <Copy size={14} />
                        </button>
                    </div>
                    <p className="text-sm leading-relaxed text-gray-200">{analysisResult.analysis}</p>
                    </div>

                    {/* Hashtags Card */}
                    <div className="glass-panel p-5 rounded-2xl relative">
                    <div className="flex justify-between items-start mb-3">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Trending Tags</h3>
                        <button onClick={() => handleCopy(analysisResult.hashtags.join(' '))} className="text-gray-500 hover:text-white transition-colors active:scale-90">
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
                                onClick={() => { triggerHaptic(); setSelectedCaption(opt); }}
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
                </div>
                )}
            </div>
        )}

        {/* --- DESIGN MODE --- */}
        {activeTab === 'design' && (
             <div className="space-y-6 animate-fade-in-up">
                 
                 {/* 1. Filters */}
                 <div>
                     <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <Layers size={14} /> Instant Filters
                     </h3>
                     <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2">
                         {(['none', 'bw', 'sepia', 'warm', 'vivid', 'cool'] as FilterType[]).map((f) => (
                             <button
                                key={f}
                                onClick={() => setActiveFilter(f)}
                                className={`flex-shrink-0 w-20 h-24 rounded-xl border transition-all active:scale-95 relative overflow-hidden group ${activeFilter === f ? 'border-primary ring-2 ring-primary/30' : 'border-white/10 opacity-70 hover:opacity-100'}`}
                             >
                                 <div 
                                    className="absolute inset-0 bg-cover bg-center"
                                    style={{ 
                                        backgroundImage: `url(${image})`, 
                                        filter: getFilterCss(f)
                                    }}
                                 />
                                 <div className="absolute bottom-0 inset-x-0 bg-black/60 backdrop-blur-sm py-1 text-[10px] font-bold uppercase text-center text-white">
                                     {f}
                                 </div>
                             </button>
                         ))}
                     </div>
                 </div>

                 {/* 2. Caption Styles */}
                 {selectedCaption ? (
                     <div>
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                            <Type size={14} /> Typography Style
                        </h3>
                        <div className="flex gap-2">
                            {(['modern', 'neon', 'polaroid', 'bold'] as CaptionStyle[]).map((style) => (
                                <button
                                    key={style}
                                    onClick={() => setCaptionStyle(style)}
                                    className={`flex-1 py-3 rounded-xl border text-xs font-bold uppercase transition-all active:scale-95 ${
                                        captionStyle === style 
                                        ? 'bg-white text-black border-white' 
                                        : 'bg-white/5 text-gray-400 border-white/5 hover:bg-white/10'
                                    }`}
                                >
                                    {style}
                                </button>
                            ))}
                        </div>
                     </div>
                 ) : (
                     <div className="p-4 rounded-xl bg-white/5 border border-white/5 text-center text-gray-500 text-sm">
                         Select a caption in the "AI Analysis" tab to unlock typography tools.
                     </div>
                 )}
                 
                 <button
                    onClick={handleDownloadComposite}
                    className="w-full py-4 bg-white text-black rounded-2xl font-bold text-lg flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all shadow-xl"
                 >
                     {generatingCard ? <RefreshCw className="animate-spin" /> : <Download />} Download Image
                 </button>
             </div>
        )}

        {/* Selected Caption Floating Toolbelt (Only in Analysis Mode) */}
        {selectedCaption && activeTab === 'analyze' && (
            <div className="fixed bottom-[80px] left-4 right-4 glass-panel p-4 rounded-2xl border border-white/20 shadow-2xl z-50 animate-fade-in-up backdrop-blur-xl bg-black/80">
                <div className="flex justify-between items-start mb-4">
                    <p className="text-sm font-medium text-white pr-4 leading-relaxed max-h-20 overflow-y-auto">"{selectedCaption}"</p>
                    <div className="flex gap-2 shrink-0">
                       <button onClick={() => setActiveTab('design')} className="text-white hover:text-secondary bg-primary p-2 rounded-lg transition-colors active:scale-90 shadow-lg shadow-primary/30" title="Edit Design">
                          <Sliders size={16} />
                      </button>
                      <button onClick={() => handleCopy(selectedCaption)} className="text-gray-400 hover:text-white bg-white/10 p-2 rounded-lg transition-colors active:scale-90" title="Copy Text">
                          <Copy size={16} />
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
                                className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/20 text-[10px] font-bold uppercase tracking-wide whitespace-nowrap transition-all border border-white/5 hover:border-white/20 active:scale-95"
                            >
                                {tone}
                            </button>
                        ))}
                    </div>
                </div>
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