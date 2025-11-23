import React, { useState } from 'react';
import { Wand2, Download, RefreshCw, Zap, Sparkles } from './Icons';
import { editImageWithPrompt } from '../services/geminiService';
import { showToast } from './Toast';

interface EditorProps {
  image: string | null;
  setImage: (img: string) => void;
}

const Editor: React.FC<EditorProps> = ({ image, setImage }) => {
  const [prompt, setPrompt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Dedicated Aesthetic Filters
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
    
    if (navigator.vibrate) navigator.vibrate(50);
    setIsProcessing(true);
    showToast("Applying magic...", "info");
    
    try {
      // Using gemini-2.5-flash-image
      const result = await editImageWithPrompt(image, promptToUse);
      setImage(result);
      if (!customPrompt) setPrompt(''); // Clear input if it was a manual prompt
      showToast("Edit complete!", "success");
    } catch (error) {
      showToast("Editing failed. Try a different prompt.", "error");
    } finally {
      setIsProcessing(false);
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
      <div className="h-full flex flex-col items-center justify-center p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 animate-float">
            <Wand2 size={32} className="text-gray-500" />
        </div>
        <h2 className="text-xl font-bold text-gray-300">No Image Selected</h2>
        <p className="text-gray-500 mt-2">Go to the Studio tab to upload a photo first.</p>
      </div>
    );
  }

  return (
    <div className="p-4 pb-24 space-y-6 h-full overflow-y-auto hide-scrollbar">
      <div className="flex justify-between items-center">
         <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Wand2 className="text-primary" /> Magic Editor
         </h1>
      </div>
      
      {/* Image Preview */}
      <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-black/50 group shadow-lg">
         <img src={image} alt="To Edit" className="w-full h-auto max-h-[50vh] object-contain mx-auto" />
         {isProcessing && (
             <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center flex-col gap-3 z-10">
                 <RefreshCw className="animate-spin text-primary" size={32} />
                 <span className="text-sm font-medium animate-pulse">Gemini is painting...</span>
             </div>
         )}
      </div>

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
      
      <div className="flex justify-center pt-2">
           <a 
            href={image} 
            download="snap-aura-edit.png" 
            className="flex items-center gap-2 text-sm text-white bg-white/10 hover:bg-white/20 px-6 py-3 rounded-full border border-white/10 active:scale-95 transition-all shadow-lg backdrop-blur-md"
            onClick={() => showToast("Downloading...", "info")}
           >
                <Download size={16} /> Save to Device
           </a>
      </div>
    </div>
  );
};

export default Editor;