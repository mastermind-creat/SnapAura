
import React, { useRef, useState, useEffect } from 'react';
import { Upload, Wand2, Copy, RefreshCw, Zap, Rocket, Palette, Brain, Camera, Sparkles, MessageCircle, Share2, Download, Type, Layers, Sliders, Film, LogOut, ImageIcon, Settings, WhatsApp, Briefcase, User } from './Icons';
import { analyzeImageAndGenerateCaptions, rewriteCaption, editImageWithPrompt } from '../services/geminiService';
import { showToast } from './Toast';
import { Logo } from './Logo';
import { Tab } from '../types';

interface StudioProps {
  image: string | null;
  setImage: (img: string) => void;
  onOpenSettings: () => void;
  onUserClick: () => void;
  setActiveTab: (tab: Tab) => void;
  isAuthenticated: boolean;
}

// Global definition for confetti
declare global {
  interface Window {
    confetti: any;
  }
}

type FilterType = 'none' | 'bw' | 'warm' | 'vivid' | 'cool' | 'sepia';
type CaptionStyle = 'modern' | 'neon' | 'polaroid' | 'bold';
type EffectType = 'none' | 'grain' | 'leak1' | 'leak2' | 'vignette' | 'dust';

const Studio: React.FC<StudioProps> = ({ image, setImage, onOpenSettings, onUserClick, setActiveTab, isAuthenticated }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [selectedCaption, setSelectedCaption] = useState<string | null>(null);
  const [rewriting, setRewriting] = useState(false);
  const [autoEnhancing, setAutoEnhancing] = useState(false);
  const [generatingCard, setGeneratingCard] = useState(false);
  const [avatar, setAvatar] = useState<string | null>(null);
  
  // Design State
  const [activeTab, setInternalTab] = useState<'analyze' | 'design' | 'effects'>('analyze');
  const [activeFilter, setActiveFilter] = useState<FilterType>('none');
  const [captionStyle, setCaptionStyle] = useState<CaptionStyle>('modern');
  const [activeEffect, setActiveEffect] = useState<EffectType>('none');

  useEffect(() => {
      const loadAvatar = () => setAvatar(localStorage.getItem('SNAPAURA_AVATAR'));
      loadAvatar();
      window.addEventListener('avatar-update', loadAvatar);
      return () => window.removeEventListener('avatar-update', loadAvatar);
  }, []);

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
      setIsUploading(true);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setAnalysisResult(null); // Reset analysis
        setSelectedCaption(null);
        setActiveFilter('none');
        setCaptionStyle('modern');
        setActiveEffect('none');
        showToast("Image uploaded!", "success");
        // Add slight delay to finish animation smoothly
        setTimeout(() => setIsUploading(false), 800);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!image) return;
    triggerHaptic();
    setIsAnalyzing(true);
    setInternalTab('analyze');
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
        
        // 3. Apply Effect (Overlay) Logic roughly on canvas
        if (activeEffect !== 'none') {
            ctx.save();
            ctx.globalCompositeOperation = 'overlay';
            if (activeEffect === 'vignette') {
                const grad = ctx.createRadialGradient(canvas.width/2, canvas.height/2, canvas.width/4, canvas.width/2, canvas.height/2, canvas.width);
                grad.addColorStop(0, 'rgba(0,0,0,0)');
                grad.addColorStop(1, 'rgba(0,0,0,0.8)');
                ctx.fillStyle = grad;
                ctx.globalCompositeOperation = 'source-over';
                ctx.fillRect(0,0,canvas.width, canvas.height);
            }
            if (activeEffect === 'leak1') {
                const grad = ctx.createLinearGradient(0,0, canvas.width/2, canvas.height);
                grad.addColorStop(0, 'rgba(255,100,0,0.4)');
                grad.addColorStop(1, 'rgba(0,0,0,0)');
                ctx.fillStyle = grad;
                ctx.fillRect(0,0,canvas.width, canvas.height);
            }
            ctx.restore();
        }

        // 4. Draw Caption
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

  // LANDING PAGE VIEW (CINEMATIC + NEON)
  if (!image) {
    return (
      <div className="relative h-full flex flex-col items-center overflow-hidden bg-[#292d3e]">
        
        {/* --- FUTURISTIC BACKGROUND LAYERS --- */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
            {/* 1. Cyber Grid Floor (Perspective) */}
            <div className="absolute -bottom-1/2 -left-1/2 w-[200%] h-[100%] opacity-20"
                 style={{ 
                     backgroundImage: 'linear-gradient(#00f3ff 1px, transparent 1px), linear-gradient(90deg, #00f3ff 1px, transparent 1px)', 
                     backgroundSize: '40px 40px',
                     transform: 'perspective(500px) rotateX(60deg)',
                     animation: 'gridMove 20s linear infinite'
                 }}>
            </div>

            {/* 2. Electric Pink Laser (Horizontal Scan) */}
            <div className="absolute top-[20%] h-[2px] w-full bg-gradient-to-r from-transparent via-[#ff0099] to-transparent opacity-80 blur-[2px] animate-laser-x"></div>
            
            {/* 3. Electric Blue Laser (Vertical Scan) */}
            <div className="absolute left-[30%] w-[2px] h-full bg-gradient-to-b from-transparent via-[#00f3ff] to-transparent opacity-60 blur-[2px] animate-laser-y delay-500"></div>

            {/* 4. Green Pulse Orb (Deep Glow) */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#39ff14] rounded-full blur-[100px] opacity-10 animate-pulse-slow"></div>
            
            {/* 5. Floating Particles */}
            <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-[#00f3ff] rounded-full animate-float blur-[1px]"></div>
            <div className="absolute bottom-1/3 right-1/4 w-2 h-2 bg-[#ff0099] rounded-full animate-float-delayed blur-[1px]"></div>
        </div>

        {/* TOP BAR */}
        <div className="absolute top-6 right-6 left-6 z-50 flex justify-between pointer-events-none">
             <div></div> {/* Spacer */}
             <div className="flex gap-4 pointer-events-auto animate-fade-in-up delay-100">
                 <button 
                    onClick={onUserClick} 
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 active:shadow-neu-pressed hover:scale-105 border border-white/5 overflow-hidden ${
                        isAuthenticated 
                        ? 'bg-[#292d3e] text-electric-blue shadow-[0_0_15px_rgba(0,243,255,0.3)]' 
                        : 'bg-[#292d3e] text-gray-400 shadow-neu'
                    }`}
                 >
                     {isAuthenticated && avatar ? (
                         <img src={avatar} alt="Me" className="w-full h-full object-cover" />
                     ) : (
                         <>
                            <User size={18} />
                            {!isAuthenticated && <div className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full shadow-glow"></div>}
                         </>
                     )}
                 </button>
                 <button 
                    onClick={onOpenSettings} 
                    className="w-10 h-10 rounded-full bg-[#292d3e] shadow-neu text-gray-400 flex items-center justify-center transition-all duration-300 active:shadow-neu-pressed hover:text-white hover:scale-105 border border-white/5"
                 >
                     <Settings size={18} />
                 </button>
             </div>
        </div>

        {/* --- MAIN CONTENT CONTAINER --- */}
        <div className="relative z-10 w-full max-w-md h-full flex flex-col items-center justify-center p-6 pb-28">
            
            {/* HERO SECTION */}
            <div className="flex flex-col items-center text-center space-y-8 w-full">
                
                {/* Rotating Neon Logo Container */}
                <div className="relative group cursor-default animate-fade-in-up">
                    {/* Spinning Gradient Ring */}
                    <div className="absolute inset-[-10px] rounded-full bg-gradient-to-tr from-[#00f3ff] via-[#ff0099] to-[#39ff14] opacity-40 blur-md animate-rotate-glow"></div>
                    
                    <div className="w-36 h-36 rounded-full bg-[#292d3e] shadow-neu flex items-center justify-center mb-2 relative z-10 border-2 border-white/5 transition-transform duration-700 hover:scale-[1.02]">
                        <Logo size={80} className="drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]" />
                    </div>
                </div>

                {/* Identity Text with Neon Shadow */}
                <div className="space-y-3 animate-fade-in-up delay-100">
                    <h1 className="text-5xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-gray-100 to-gray-300 drop-shadow-[0_0_15px_rgba(255,255,255,0.15)]">
                        SnapAura
                    </h1>
                    <p className="text-xs font-bold text-[#00f3ff] tracking-[0.3em] uppercase drop-shadow-[0_0_8px_rgba(0,243,255,0.5)]">
                        AI Creative Studio
                    </p>
                </div>

                {/* MAIN CTA Button (Cyber-Neumorphic) */}
                <div className="w-full px-4 pt-4 animate-fade-in-up delay-200">
                     <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="group w-full rounded-2xl bg-[#292d3e] shadow-neu p-1 relative overflow-hidden transition-all duration-300 hover:scale-[1.02]"
                     >
                         {/* Animated Border Gradient */}
                         <div className="absolute inset-0 bg-gradient-to-r from-[#00f3ff] via-[#ff0099] to-[#39ff14] opacity-30 group-hover:opacity-60 transition-opacity"></div>
                         
                         {/* Inner Button Content */}
                         <div className="relative bg-[#292d3e] rounded-xl p-5 flex items-center justify-between z-10 h-full">
                             <div className="flex items-center gap-4">
                                 <div className="w-12 h-12 rounded-full bg-[#292d3e] shadow-neu-pressed flex items-center justify-center text-[#00f3ff] group-hover:text-white transition-colors duration-500 group-hover:shadow-[0_0_15px_#00f3ff]">
                                     <Upload size={24} strokeWidth={2.5} />
                                 </div>
                                 <div className="text-left">
                                     <span className="block text-lg font-bold text-gray-200 group-hover:text-white transition-colors">Upload Photo</span>
                                     <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider group-hover:text-[#00f3ff]">Start Creating</span>
                                 </div>
                             </div>
                             <div className="w-8 h-8 rounded-full bg-[#292d3e] shadow-neu flex items-center justify-center text-gray-400 group-hover:text-[#39ff14] group-hover:translate-x-1 transition-all duration-300 border border-white/5">
                                <ArrowRightIcon />
                             </div>
                         </div>
                     </button>
                </div>

                {/* Quick Access Tiles (Neon Highlights) */}
                <div className="grid grid-cols-3 gap-4 w-full px-4 animate-fade-in-up delay-300">
                    <button onClick={() => setActiveTab(Tab.GENERATE)} className="aspect-square rounded-2xl bg-[#292d3e] shadow-neu flex flex-col items-center justify-center gap-3 transition-all duration-300 active:shadow-neu-pressed group hover:-translate-y-1 relative overflow-hidden border border-transparent hover:border-[#ff0099]/30">
                            <div className="absolute inset-0 bg-[#ff0099] opacity-0 group-hover:opacity-5 transition-opacity"></div>
                            <div className="text-[#ff0099] group-hover:scale-110 transition-transform duration-300 drop-shadow-[0_0_8px_rgba(255,0,153,0.6)]">
                                <ImageIcon size={24} />
                            </div>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide group-hover:text-[#ff0099] transition-colors">AI Art</span>
                    </button>
                    <button onClick={() => setActiveTab(Tab.CHAT)} className="aspect-square rounded-2xl bg-[#292d3e] shadow-neu flex flex-col items-center justify-center gap-3 transition-all duration-300 active:shadow-neu-pressed group hover:-translate-y-1 relative overflow-hidden border border-transparent hover:border-[#00f3ff]/30">
                            <div className="absolute inset-0 bg-[#00f3ff] opacity-0 group-hover:opacity-5 transition-opacity"></div>
                            <div className="text-[#00f3ff] group-hover:scale-110 transition-transform duration-300 drop-shadow-[0_0_8px_rgba(0,243,255,0.6)]">
                                <MessageCircle size={24} />
                            </div>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide group-hover:text-[#00f3ff] transition-colors">Chat</span>
                    </button>
                    <button onClick={() => setActiveTab(Tab.TOOLKIT)} className="aspect-square rounded-2xl bg-[#292d3e] shadow-neu flex flex-col items-center justify-center gap-3 transition-all duration-300 active:shadow-neu-pressed group hover:-translate-y-1 relative overflow-hidden border border-transparent hover:border-[#39ff14]/30">
                            <div className="absolute inset-0 bg-[#39ff14] opacity-0 group-hover:opacity-5 transition-opacity"></div>
                            <div className="text-[#39ff14] group-hover:scale-110 transition-transform duration-300 drop-shadow-[0_0_8px_rgba(57,255,20,0.6)]">
                                <Briefcase size={24} />
                            </div>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide group-hover:text-[#39ff14] transition-colors">Tools</span>
                    </button>
                </div>
            </div>

            {/* --- FOOTER --- */}
            <div className="mt-auto text-center pt-8 opacity-60 animate-fade-in-up delay-500">
                <p className="text-[9px] font-bold text-gray-500 uppercase tracking-[0.15em] flex items-center justify-center gap-2">
                    <span>Powered by</span>
                    <span className="text-gray-300">Mastermind Labs</span>
                </p>
            </div>
        </div>

        {/* Hidden Input */}
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          accept="image/*" 
          className="hidden" 
        />
        
        {/* Upload Loading Overlay */}
        {isUploading && (
          <div className="absolute inset-0 z-50 bg-[#292d3e] flex flex-col items-center justify-center animate-fade-in-up">
              <div className="w-24 h-24 rounded-full bg-[#292d3e] shadow-neu flex items-center justify-center mb-6 relative">
                <div className="absolute inset-0 rounded-full border-t-2 border-[#00f3ff] animate-spin shadow-[0_0_15px_#00f3ff]"></div>
                <RefreshCw className="text-gray-400" size={32} />
              </div>
              <h2 className="text-xl font-bold text-gray-200 tracking-tight animate-pulse">Initializing Studio...</h2>
          </div>
        )}
      </div>
    );
  }

  // STUDIO VIEW (NEUMORPHIC)
  return (
    <div className="h-full overflow-y-auto hide-scrollbar scroll-smooth relative bg-[#292d3e]">
      
      <div className="p-4 pb-48 space-y-6 animate-fade-in-up max-w-lg mx-auto relative z-10">
        
        {/* Header */}
        <div className="flex justify-between items-center rounded-2xl p-4 bg-[#292d3e] shadow-neu sticky top-4 z-40">
          <h1 className="text-lg font-bold text-gray-200 flex items-center gap-2">
            <Camera size={20} className="text-primary" /> Studio
          </h1>
          <div className="flex gap-4">
             <button 
                 onClick={handleDownloadComposite}
                 className="text-gray-400 hover:text-white transition-colors active:scale-95"
                 title="Download"
             >
                 <Download size={20} />
             </button>
             <button 
                 onClick={() => setImage('')} 
                 className="text-xs font-bold text-gray-500 hover:text-gray-300 bg-[#292d3e] shadow-neu px-3 py-1.5 rounded-lg active:shadow-neu-pressed transition-all"
             >
                 New
             </button>
             <button 
                 onClick={onOpenSettings}
                 className="text-gray-400 hover:text-white transition-colors active:scale-95"
             >
                 <Settings size={20} />
             </button>
          </div>
        </div>

        {/* Image Area - "Polaroid" style if caption selected */}
        <div className={`relative w-full aspect-square md:aspect-[4/5] transition-all duration-500 flex items-center justify-center group ${
            captionStyle === 'polaroid' ? 'bg-white p-4 pb-16 shadow-xl' : 'rounded-3xl overflow-hidden bg-[#292d3e] shadow-neu-pressed p-2'
        }`}>
            
            {/* The Image */}
            <div className={`relative w-full h-full overflow-hidden ${captionStyle === 'polaroid' ? '' : 'rounded-2xl'}`}>
                <img 
                    src={image} 
                    alt="Upload" 
                    className="w-full h-full object-cover transition-all duration-300" 
                    style={{ filter: getFilterCss(activeFilter) }}
                />
                
                {/* FX Overlays */}
                {activeEffect === 'grain' && <div className="absolute inset-0 pointer-events-none grain-overlay opacity-30 mix-blend-overlay"></div>}
                {activeEffect === 'vignette' && <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle,transparent_50%,rgba(0,0,0,0.8)_100%)]"></div>}
                {activeEffect === 'leak1' && <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-orange-500/20 to-transparent mix-blend-screen"></div>}
                {activeEffect === 'leak2' && <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-purple-500/20 via-transparent to-pink-500/20 mix-blend-screen"></div>}
                {activeEffect === 'dust' && <div className="absolute inset-0 pointer-events-none opacity-20 bg-[url('https://www.transparenttextures.com/patterns/dust.png')]"></div>}

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
                        className="bg-[#292d3e] text-yellow-400 p-3 rounded-full shadow-neu active:shadow-neu-pressed transition-all flex items-center gap-2"
                    >
                        <Zap size={20} className={autoEnhancing ? "animate-spin" : ""} fill={autoEnhancing ? "currentColor" : "none"} />
                    </button>
                </div>
            )}
        </div>
        
        {/* Toggle Mode (Neumorphic Tabs) */}
        <div className="flex bg-[#292d3e] rounded-xl p-2 shadow-neu-pressed">
            <button 
                onClick={() => setInternalTab('analyze')}
                className={`flex-1 py-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${activeTab === 'analyze' ? 'bg-[#292d3e] text-primary shadow-neu' : 'text-gray-500 hover:text-gray-300'}`}
            >
                <Brain size={16} /> Analysis
            </button>
            <button 
                onClick={() => setInternalTab('design')}
                className={`flex-1 py-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${activeTab === 'design' ? 'bg-[#292d3e] text-secondary shadow-neu' : 'text-gray-500 hover:text-gray-300'}`}
            >
                <Sliders size={16} /> Design
            </button>
            <button 
                onClick={() => setInternalTab('effects')}
                className={`flex-1 py-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${activeTab === 'effects' ? 'bg-[#292d3e] text-blue-400 shadow-neu' : 'text-gray-500 hover:text-gray-300'}`}
            >
                <Film size={16} /> Effects
            </button>
        </div>

        {/* --- ANALYSIS MODE --- */}
        {activeTab === 'analyze' && (
            <div className="space-y-6 animate-fade-in-up">
                {/* Analysis Trigger */}
                {!analysisResult && (
                <div className="space-y-4">
                    <button
                    onClick={handleAnalyze}
                    disabled={isAnalyzing}
                    className="w-full py-5 bg-[#292d3e] text-primary rounded-2xl font-bold text-lg flex items-center justify-center gap-3 hover:text-secondary shadow-neu active:shadow-neu-pressed transition-all"
                    >
                    {isAnalyzing ? (
                        <><RefreshCw className="animate-spin" /> Analyzing Vibes...</>
                    ) : (
                        <><Brain size={22} /> Generate Captions</>
                    )}
                    </button>
                    <p className="text-center text-xs text-gray-500 font-medium">Powered by Gemini 2.5 Flash</p>
                </div>
                )}

                {/* Results Section */}
                {analysisResult && (
                <div className="space-y-6">
                    
                    {/* Mood Analysis Card */}
                    <div className="bg-[#292d3e] p-5 rounded-2xl shadow-neu relative group">
                    <div className="flex justify-between items-start mb-3">
                        <h3 className="text-xs font-bold text-primary uppercase tracking-widest flex items-center gap-2">
                            <Sparkles size={14} /> Vibe Check
                        </h3>
                        <button onClick={() => handleCopy(analysisResult.analysis)} className="text-gray-500 hover:text-gray-300 transition-colors active:scale-90">
                            <Copy size={16} />
                        </button>
                    </div>
                    <p className="text-sm leading-relaxed text-gray-300">{analysisResult.analysis}</p>
                    </div>

                    {/* Hashtags Card */}
                    <div className="bg-[#292d3e] p-5 rounded-2xl shadow-neu relative">
                    <div className="flex justify-between items-start mb-4">
                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Trending Tags</h3>
                        <button onClick={() => handleCopy(analysisResult.hashtags.join(' '))} className="text-gray-500 hover:text-gray-300 transition-colors active:scale-90">
                            <Copy size={16} />
                        </button>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        {analysisResult.hashtags?.map((tag: string, i: number) => (
                            <span key={i} className="text-xs bg-[#292d3e] shadow-neu px-3 py-2 rounded-lg text-blue-400 hover:text-blue-300 transition-colors cursor-pointer select-all active:shadow-neu-pressed">#{tag.replace('#','')}</span>
                        ))}
                    </div>
                    </div>

                    {/* Captions Scroll Area */}
                    <div>
                    <h3 className="text-lg font-bold text-gray-200 mb-4 flex items-center gap-2 ml-1"><MessageCircle size={20} /> Select a Caption</h3>
                    <div className="space-y-6">
                        {analysisResult.captions?.map((cat: any, idx: number) => (
                        <div key={idx}>
                            <h4 className="text-secondary font-bold mb-3 text-xs uppercase tracking-wider ml-1">{cat.category}</h4>
                            <div className="flex overflow-x-auto gap-4 pb-4 hide-scrollbar px-1">
                            {cat.options.map((opt: string, oIdx: number) => (
                                <div 
                                key={oIdx}
                                onClick={() => { triggerHaptic(); setSelectedCaption(opt); }}
                                className={`flex-shrink-0 w-72 p-5 rounded-2xl cursor-pointer transition-all duration-200 ${
                                    selectedCaption === opt 
                                    ? 'bg-[#292d3e] shadow-neu-pressed border border-secondary/20' 
                                    : 'bg-[#292d3e] shadow-neu hover:translate-y-[-2px]'
                                }`}
                                >
                                <p className={`text-sm relative z-10 leading-relaxed ${selectedCaption === opt ? 'text-secondary font-medium' : 'text-gray-300'}`}>"{opt}"</p>
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
                     <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2 ml-1">
                        <Layers size={14} /> Instant Filters
                     </h3>
                     <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-4 px-1">
                         {(['none', 'bw', 'sepia', 'warm', 'vivid', 'cool'] as FilterType[]).map((f) => (
                             <button
                                key={f}
                                onClick={() => setActiveFilter(f)}
                                className={`flex-shrink-0 w-20 h-24 rounded-xl transition-all relative overflow-hidden group ${activeFilter === f ? 'shadow-neu-pressed ring-2 ring-primary/20' : 'shadow-neu hover:scale-105'}`}
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
                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2 ml-1">
                            <Type size={14} /> Typography Style
                        </h3>
                        <div className="flex gap-3">
                            {(['modern', 'neon', 'polaroid', 'bold'] as CaptionStyle[]).map((style) => (
                                <button
                                    key={style}
                                    onClick={() => setCaptionStyle(style)}
                                    className={`flex-1 py-4 rounded-xl text-xs font-bold uppercase transition-all ${
                                        captionStyle === style 
                                        ? 'bg-[#292d3e] text-white shadow-neu-pressed' 
                                        : 'bg-[#292d3e] text-gray-500 shadow-neu hover:text-gray-300'
                                    }`}
                                >
                                    {style}
                                </button>
                            ))}
                        </div>
                     </div>
                 ) : (
                     <div className="p-6 rounded-xl bg-[#292d3e] shadow-neu-pressed text-center text-gray-500 text-sm">
                         Select a caption in the "Analysis" tab to unlock typography tools.
                     </div>
                 )}
                 
                 <button
                    onClick={handleDownloadComposite}
                    className="w-full py-4 bg-[#292d3e] text-primary rounded-2xl font-bold text-lg flex items-center justify-center gap-3 shadow-neu active:shadow-neu-pressed transition-all mt-4"
                 >
                     {generatingCard ? <RefreshCw className="animate-spin" /> : <Download />} Download Image
                 </button>
             </div>
        )}

        {/* --- EFFECTS MODE --- */}
        {activeTab === 'effects' && (
            <div className="space-y-6 animate-fade-in-up">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2 ml-1">
                   <Film size={14} /> Overlays & FX
                </h3>
                <div className="grid grid-cols-3 gap-4">
                    {[
                        { id: 'none', label: 'None' },
                        { id: 'vignette', label: 'Vignette' },
                        { id: 'grain', label: 'Film Grain' },
                        { id: 'leak1', label: 'Light Leak 1' },
                        { id: 'leak2', label: 'Light Leak 2' },
                        { id: 'dust', label: 'Dust' },
                    ].map((effect) => (
                        <button
                            key={effect.id}
                            onClick={() => setActiveEffect(effect.id as EffectType)}
                            className={`p-4 rounded-xl text-xs font-bold transition-all flex flex-col items-center justify-center gap-2 ${
                                activeEffect === effect.id 
                                ? 'bg-[#292d3e] text-blue-400 shadow-neu-pressed' 
                                : 'bg-[#292d3e] text-gray-500 shadow-neu hover:text-gray-300'
                            }`}
                        >
                            <span className="capitalize">{effect.label}</span>
                        </button>
                    ))}
                </div>
                
                 <button
                    onClick={handleDownloadComposite}
                    className="w-full py-4 bg-[#292d3e] text-blue-400 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 shadow-neu active:shadow-neu-pressed transition-all mt-4"
                 >
                     {generatingCard ? <RefreshCw className="animate-spin" /> : <Download />} Download With FX
                 </button>
            </div>
        )}

        {/* Selected Caption Floating Toolbelt (Only in Analysis Mode) */}
        {selectedCaption && activeTab === 'analyze' && (
            <div className="fixed bottom-[90px] left-4 right-4 bg-[#292d3e] p-5 rounded-2xl shadow-neu z-50 animate-fade-in-up border border-white/5">
                <div className="flex justify-between items-start mb-4">
                    <p className="text-sm font-medium text-gray-200 pr-4 leading-relaxed max-h-20 overflow-y-auto custom-scrollbar">"{selectedCaption}"</p>
                    <div className="flex gap-3 shrink-0">
                       <button onClick={() => setInternalTab('design')} className="text-primary bg-[#292d3e] p-3 rounded-xl transition-all shadow-neu active:shadow-neu-pressed" title="Edit Design">
                          <Sliders size={18} />
                      </button>
                      <button onClick={() => handleCopy(selectedCaption)} className="text-gray-400 bg-[#292d3e] p-3 rounded-xl transition-all shadow-neu active:shadow-neu-pressed hover:text-white" title="Copy Text">
                          <Copy size={18} />
                      </button>
                    </div>
                </div>
                
                <div className="border-t border-gray-700 pt-4">
                    <div className="flex items-center gap-3 overflow-x-auto hide-scrollbar pb-1">
                         <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap mr-2">Remix Vibe:</span>
                        {tones.map(tone => (
                            <button
                                key={tone}
                                onClick={() => handleRewrite(tone)}
                                disabled={rewriting}
                                className="px-4 py-2 rounded-lg bg-[#292d3e] text-[10px] font-bold uppercase tracking-wide whitespace-nowrap transition-all shadow-neu active:shadow-neu-pressed text-gray-400 hover:text-primary"
                            >
                                {tone}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

// Mini Arrow Icon Component for Button
const ArrowRightIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
);

export default Studio;
