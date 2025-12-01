
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
    "Remove the background",
    "Add fireworks in the sky",
    "Turn this into an anime sketch",
    "Make it look like a cyberpunk city"
  ];

  if (!image) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center relative">
        <div className="absolute top-4 right-4">
             <button 
                 onClick={onOpenSettings}
                 className="text-gray-300 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors active:scale-90"
                 title="Settings"
             >
                 <Settings size={20} />
             </button>
        </div>
        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 animate-float">
            <Wand2 size={32} className="text-gray-500" />
        </div>
        <h2 className="text-xl font-bold text-gray-300">No Image Selected</h2>
        <p className="text-gray-500 mt-2">Go to the Studio tab to upload a photo first.</p>
      </div>
    );
  }

  return (
    <div className="p-4 pb-40 space-y-6 h-full overflow-y-auto hide-scrollbar relative">
      <div className="flex justify-between items-center">
         <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Wand2 className="text-primary" /> Magic Editor
         </h1>
         <button 
             onClick={onOpenSettings}
             className="text-gray-300 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors active:scale-90"
             title="Settings"
         >
             <Settings size={20} />
         </button>
      </div>
      
      {/* Image Preview & Comparison Slider */}
      <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-black/50 group shadow-lg select-none">
         {/* If we have original image and it differs from current, show slider UI */}
         {originalImage && originalImage !== image && !isProcessing ? (
             <div className="relative w-full h-auto min-h-[300px] touch-pan-y">
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
            <>
                <img src={image} alt="To Edit" className="w-full h-auto max-h-[50vh] object-contain mx-auto" />
                {isProcessing && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center flex-col gap-3 z-10">
                        <RefreshCw className="animate-spin text-primary" size={32} />
                        <span className="text-sm font-medium animate-pulse">Gemini is painting...</span>
                    </div>
                )}
            </>
         )}
      </div>
      
      {originalImage && originalImage !== image && (
          <p className="text-center text-[10px] text-gray-500 uppercase tracking-widest">Slide to compare</p>
      )}

      {/* Aesthetic Filters */}
      <div className="space-y-3">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1 flex items-center gap-1">
              <Sparkles size={12} /> Instant Aesthetics
          </label>
          <div className="grid grid-cols-3 gap-2">
              {filters.map((f) => (
                  <button
                      key={f.id}
                      onClick={() => handleEdit(f.prompt)}
                      disabled={isProcessing}
                      className="relative overflow-hidden group rounded-xl p-3 border border-white/5 bg-white/5 hover:bg-white/10 transition-all active:scale-95 text-left h-20 flex flex-col justify-end"
                  >
                      <div className={`absolute top-0 right-0 w-12 h-12 bg-gradient-to-br ${f.color} opacity-20 blur-xl group-hover:opacity-40 transition-opacity`}></div>
                      <span className="text-xs font-medium relative z-10">{f.name}</span>
                  </button>
              ))}
          </div>
      </div>

      {/* Manual Prompt */}
      <div className="glass-panel p-4 rounded-xl space-y-4">
        <div>
            <label className="text-xs font-bold text-gray-400 uppercase ml-1">Custom Prompt</label>
            <div className="flex gap-2 mt-2">
                <input
                    type="text"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Ex: Add a neon sign..."
                    className="flex-1 bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary transition-colors"
                />
                <button
                    onClick={() => handleEdit()}
                    disabled={!prompt || isProcessing}
                    className="bg-primary hover:bg-primary/80 text-white p-3 rounded-xl disabled:opacity-50 transition-colors active:scale-95 shadow-lg shadow-primary/20"
                >
                    <Zap size={20} />
                </button>
            </div>
        </div>

        <div>
            <p className="text-xs text-gray-500 mb-2">Creative ideas:</p>
            <div className="flex flex-wrap gap-2">
                {suggestions.map((s, i) => (
                    <button
                        key={i}
                        onClick={() => setPrompt(s)}
                        className="text-[10px] bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-full text-gray-300 transition-colors active:scale-95 border border-white/5"
                    >
                        {s}
                    </button>
                ))}
            </div>
        </div>
      </div>
      
      {/* Sticky Bottom Action Bar */}
      <div className="fixed bottom-20 left-4 right-4 z-40 animate-fade-in-up">
           <div className="max-w-md mx-auto glass-panel p-2 rounded-2xl border border-white/10 shadow-2xl flex gap-2 bg-black/80 backdrop-blur-xl">
               <button
                   onClick={handleRevert}
                   disabled={!originalImage || originalImage === image}
                   className="p-3 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 disabled:opacity-30 transition-colors"
                   title="Revert to Original"
               >
                   <RotateCcw size={20} />
               </button>
               <button
                   onClick={handleDownload}
                   className="flex-1 bg-white text-black font-bold py-3 rounded-xl shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
               >
                   <Download size={18} /> Download Image
               </button>
           </div>
      </div>
    </div>
  );
};

export default Editor;
