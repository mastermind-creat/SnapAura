
import React, { useState } from 'react';
import { Wand2, Download, RefreshCw, Zap, Sparkles, Settings, Grid, RotateCcw } from './Icons';
import { editImageWithPrompt } from '../services/geminiService';
import { showToast } from './Toast';

interface EditorProps {
  image: string | null;
  setImage: (img: string) => void;
  onOpenSettings: () => void;
}

const Editor: React.FC<EditorProps> = ({ image, setImage, onOpenSettings }) => {
  const [prompt, setPrompt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [sliderPos, setSliderPos] = useState(50);

  // Store original image when first loaded
  React.useEffect(() => {
    if (image && !originalImage) {
        setOriginalImage(image);
    }
  }, [image]);

  const filters = [
    { 
        id: 'cinematic', 
        name: 'Cinematic', 
        prompt: 'Apply a cinematic movie grade filter, teal and orange tones, dramatic lighting, high contrast, 4k resolution.',
        color: 'from-blue-500 to-teal-500'
    },
    { 
        id: 'vintage', 
        name: 'Vintage', 
        prompt: 'Apply a retro vintage aesthetic, 90s film grain, warm tones, slight vignette, nostalgic vibe.',
        color: 'from-orange-400 to-amber-600'
    },
    { 
        id: 'moody', 
        name: 'Moody', 
        prompt: 'Apply a moody aesthetic filter, dark undertones, desaturated colors, emotional atmosphere, soft shadows.',
        color: 'from-gray-600 to-slate-800'
    },
    { 
        id: 'pastel', 
        name: 'Pastel', 
        prompt: 'Apply a soft pastel aesthetic, dreamy colors, pink and lavender hues, bright exposure, soft glow.',
        color: 'from-pink-300 to-purple-300'
    },
    { 
        id: 'luxury', 
        name: 'Luxury', 
        prompt: 'Apply a high-end luxury aesthetic, rich textures, golden lighting, sharp details, magazine editorial look.',
        color: 'from-yellow-400 to-amber-500'
    },
  ];

  const handleEdit = async (customPrompt?: string) => {
    const promptToUse = customPrompt || prompt;
    if (!image || !promptToUse) return;
    
    // Lock original if this is the first edit
    if(!originalImage) setOriginalImage(image);

    if (navigator.vibrate) navigator.vibrate(50);
    setIsProcessing(true);
    showToast("Applying magic...", "info");
    
    try {
      const result = await editImageWithPrompt(image, promptToUse);
      setImage(result);
      if (!customPrompt) setPrompt('');
      showToast("Edit complete!", "success");
    } catch (error: any) {
      showToast(error.message || "Editing failed.", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!image) return;
    const link = document.createElement('a');
    link.href = image;
    link.download = `snapaura-edit-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Downloading...", "success");
  };

  const handleRevert = () => {
      if (originalImage) {
          setImage(originalImage);
          showToast("Reverted to original", "info");
      }
  };

  const suggestions = [
    "Remove background",
    "Add fireworks",
    "Anime sketch style",
    "Cyberpunk city"
  ];

  if (!image) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center relative bg-[#292d3e]">
        <div className="absolute top-4 right-4">
             <button 
                 onClick={onOpenSettings}
                 className="text-gray-400 hover:text-white p-3 rounded-full bg-[#292d3e] shadow-neu active:shadow-neu-pressed transition-all"
                 title="Settings"
             >
                 <Settings size={20} />
             </button>
        </div>
        <div className="w-20 h-20 rounded-full bg-[#292d3e] shadow-neu flex items-center justify-center mb-6 animate-float">
            <Wand2 size={32} className="text-gray-400" />
        </div>
        <h2 className="text-xl font-bold text-gray-200">No Image Selected</h2>
        <p className="text-gray-500 mt-2 text-sm">Go to the Studio tab to upload a photo first.</p>
      </div>
    );
  }

  return (
    <div className="p-4 pb-40 space-y-6 h-full overflow-y-auto hide-scrollbar relative bg-[#292d3e]">
      <div className="flex justify-between items-center sticky top-0 z-30 bg-[#292d3e] py-2">
         <h1 className="text-xl font-bold text-gray-200 flex items-center gap-2">
            <Wand2 className="text-primary" /> Magic Editor
         </h1>
         <button 
             onClick={onOpenSettings}
             className="text-gray-400 hover:text-white p-3 rounded-full bg-[#292d3e] shadow-neu active:shadow-neu-pressed transition-all"
             title="Settings"
         >
             <Settings size={20} />
         </button>
      </div>
      
      {/* Image Preview & Comparison Slider */}
      <div className="relative rounded-2xl overflow-hidden bg-[#292d3e] shadow-neu-pressed p-2 select-none group">
         {/* If we have original image and it differs from current, show slider UI */}
         {originalImage && originalImage !== image && !isProcessing ? (
             <div className="relative w-full h-auto min-h-[300px] touch-pan-y rounded-xl overflow-hidden">
                 {/* Background (Edited) */}
                 <img src={image} className="w-full h-full object-contain pointer-events-none" alt="Edited" />
                 
                 {/* Foreground (Original) - clipped */}
                 <div 
                    className="absolute inset-0 overflow-hidden border-r-2 border-white/50 shadow-[2px_0_10px_rgba(0,0,0,0.5)]"
                    style={{ width: `${sliderPos}%` }}
                 >
                     <img src={originalImage} className="w-full h-full object-contain max-w-none pointer-events-none" style={{width: '100%', height: '100%'}} alt="Original" />
                     <div className="absolute bottom-2 left-2 bg-black/60 px-2 rounded text-[10px] text-white">Before</div>
                 </div>
                 
                 <div className="absolute bottom-2 right-2 bg-black/60 px-2 rounded text-[10px] text-white">After</div>

                 {/* Slider Handle */}
                 <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={sliderPos}
                    onChange={(e) => setSliderPos(parseInt(e.target.value))}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-20 touch-pan-y"
                 />
                 
                 {/* Visual Handle Icon */}
                 <div 
                    className="absolute top-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg z-10 pointer-events-none"
                    style={{ left: `calc(${sliderPos}% - 16px)` }}
                 >
                     <Grid size={14} className="text-black" />
                 </div>
             </div>
         ) : (
            <div className="rounded-xl overflow-hidden relative min-h-[250px] bg-[#1e212d] flex items-center justify-center">
                <img src={image} alt="To Edit" className="w-full h-auto max-h-[50vh] object-contain mx-auto" />
                {isProcessing && (
                    <div className="absolute inset-0 bg-[#292d3e]/80 flex items-center justify-center flex-col gap-3 z-10">
                        <div className="w-16 h-16 rounded-full bg-[#292d3e] shadow-neu flex items-center justify-center">
                            <RefreshCw className="animate-spin text-primary" size={24} />
                        </div>
                        <span className="text-sm font-bold text-gray-300 animate-pulse">Gemini is painting...</span>
                    </div>
                )}
            </div>
         )}
      </div>
      
      {originalImage && originalImage !== image && (
          <p className="text-center text-[10px] text-gray-500 uppercase tracking-widest font-bold">Slide to compare</p>
      )}

      {/* Aesthetic Filters */}
      <div className="space-y-3">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1 flex items-center gap-1">
              <Sparkles size={12} /> Instant Aesthetics
          </label>
          <div className="grid grid-cols-3 gap-3">
              {filters.map((f) => (
                  <button
                      key={f.id}
                      onClick={() => handleEdit(f.prompt)}
                      disabled={isProcessing}
                      className="relative overflow-hidden group rounded-2xl bg-[#292d3e] shadow-neu active:shadow-neu-pressed transition-all h-20 p-2 flex flex-col justify-end border border-[#292d3e]"
                  >
                      <div className={`absolute top-0 right-0 w-16 h-16 bg-gradient-to-br ${f.color} opacity-20 blur-xl group-hover:opacity-40 transition-opacity rounded-full -mr-6 -mt-6`}></div>
                      <span className="text-[10px] font-bold text-gray-400 group-hover:text-gray-200 relative z-10 uppercase tracking-wide">{f.name}</span>
                  </button>
              ))}
          </div>
      </div>

      {/* Manual Prompt */}
      <div className="bg-[#292d3e] shadow-neu p-4 rounded-2xl space-y-4">
        <div>
            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Custom Prompt</label>
            <div className="flex gap-3 mt-2">
                <input
                    type="text"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Ex: Add a neon sign..."
                    className="flex-1 bg-[#292d3e] shadow-neu-pressed rounded-xl px-4 py-3 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:text-primary transition-colors"
                />
                <button
                    onClick={() => handleEdit()}
                    disabled={!prompt || isProcessing}
                    className="bg-[#292d3e] shadow-neu text-primary hover:text-secondary p-3 rounded-xl disabled:opacity-50 transition-all active:shadow-neu-pressed"
                >
                    <Zap size={20} />
                </button>
            </div>
        </div>

        <div>
            <p className="text-[10px] font-bold text-gray-500 mb-2 uppercase">Ideas:</p>
            <div className="flex flex-wrap gap-2">
                {suggestions.map((s, i) => (
                    <button
                        key={i}
                        onClick={() => setPrompt(s)}
                        className="text-[10px] font-bold bg-[#292d3e] shadow-neu px-3 py-2 rounded-lg text-gray-400 active:shadow-neu-pressed hover:text-primary transition-all"
                    >
                        {s}
                    </button>
                ))}
            </div>
        </div>
      </div>
      
      {/* Sticky Bottom Action Bar */}
      <div className="fixed bottom-20 left-4 right-4 z-40 animate-fade-in-up">
           <div className="max-w-md mx-auto bg-[#292d3e] p-2 rounded-2xl shadow-neu flex gap-3 border border-[#292d3e]">
               <button
                   onClick={handleRevert}
                   disabled={!originalImage || originalImage === image}
                   className="p-3.5 rounded-xl bg-[#292d3e] shadow-neu text-gray-400 hover:text-red-400 disabled:opacity-30 transition-all active:shadow-neu-pressed"
                   title="Revert to Original"
               >
                   <RotateCcw size={20} />
               </button>
               <button
                   onClick={handleDownload}
                   className="flex-1 bg-[#292d3e] text-primary font-bold py-3.5 rounded-xl shadow-neu active:shadow-neu-pressed transition-all flex items-center justify-center gap-2 hover:text-secondary"
               >
                   <Download size={18} /> Download Image
               </button>
           </div>
      </div>
    </div>
  );
};

export default Editor;
