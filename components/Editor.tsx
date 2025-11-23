import React, { useState } from 'react';
import { Wand2, Download, RefreshCw, Zap } from './Icons';
import { editImageWithPrompt } from '../services/geminiService';

interface EditorProps {
  image: string | null;
  setImage: (img: string) => void;
}

const Editor: React.FC<EditorProps> = ({ image, setImage }) => {
  const [prompt, setPrompt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleEdit = async () => {
    if (!image || !prompt) return;
    setIsProcessing(true);
    try {
      // Using gemini-2.5-flash-image
      const result = await editImageWithPrompt(image, prompt);
      setImage(result);
      setPrompt('');
    } catch (error) {
      alert("Editing failed. Try a different prompt.");
    } finally {
      setIsProcessing(false);
    }
  };

  const suggestions = [
    "Add a retro vintage filter",
    "Make it look like a cyberpunk city",
    "Remove the background",
    "Add fireworks in the sky",
    "Turn this into an anime sketch"
  ];

  if (!image) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
            <Wand2 size={32} className="text-gray-500" />
        </div>
        <h2 className="text-xl font-bold text-gray-300">No Image Selected</h2>
        <p className="text-gray-500 mt-2">Go to the Studio tab to upload a photo first.</p>
      </div>
    );
  }

  return (
    <div className="p-4 pb-24 space-y-6 h-full overflow-y-auto">
      <h1 className="text-2xl font-bold text-white">Magic Editor</h1>
      
      <div className="relative rounded-xl overflow-hidden border border-white/10 bg-black/50">
         <img src={image} alt="To Edit" className="w-full h-auto max-h-[60vh] object-contain mx-auto" />
         {isProcessing && (
             <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center flex-col gap-3">
                 <RefreshCw className="animate-spin text-primary" size={32} />
                 <span className="text-sm font-medium">Gemini is painting...</span>
             </div>
         )}
      </div>

      <div className="glass-panel p-4 rounded-xl space-y-4">
        <div>
            <label className="text-xs font-medium text-gray-400 uppercase ml-1">AI Prompt</label>
            <div className="flex gap-2 mt-1">
                <input
                    type="text"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Ex: Turn the sky pink..."
                    className="flex-1 bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary transition-colors"
                />
                <button
                    onClick={handleEdit}
                    disabled={!prompt || isProcessing}
                    className="bg-primary hover:bg-primary/80 text-white p-3 rounded-xl disabled:opacity-50 transition-colors"
                >
                    <Zap size={20} />
                </button>
            </div>
        </div>

        <div>
            <p className="text-xs text-gray-500 mb-2">Try these:</p>
            <div className="flex flex-wrap gap-2">
                {suggestions.map((s, i) => (
                    <button
                        key={i}
                        onClick={() => setPrompt(s)}
                        className="text-xs bg-white/5 hover:bg-white/10 px-3 py-2 rounded-lg text-gray-300 transition-colors"
                    >
                        {s}
                    </button>
                ))}
            </div>
        </div>
      </div>
      
      <div className="flex justify-center">
           <a href={image} download="snap-aura-edit.png" className="flex items-center gap-2 text-sm text-gray-400 hover:text-white">
                <Download size={16} /> Save to Device
           </a>
      </div>
    </div>
  );
};

export default Editor;