
import React, { useState } from 'react';
import { ImageIcon, Download, RefreshCw, Settings, Wand2 } from './Icons';
import { generateImageFromPrompt } from '../services/geminiService';
import { ImageSize } from '../types';
import { showToast } from './Toast';
import { useNeural } from './NeuralContext';

interface GeneratorProps {
  onOpenSettings: () => void;
}

const Generator: React.FC<GeneratorProps> = ({ onOpenSettings }) => {
  const { dispatchIntent } = useNeural(); // For cross-tool automation
  const [prompt, setPrompt] = useState('');
  const [size, setSize] = useState<ImageSize>(ImageSize.S_1K);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!prompt) return;
    if (navigator.vibrate) navigator.vibrate(50);
    setIsGenerating(true);
    showToast("Starting generation...", "info");
    try {
      const result = await generateImageFromPrompt(prompt, size);
      setGeneratedImage(result);
      showToast("Image generated!", "success");
    } catch (error) {
      showToast("Generation failed. Try again.", "error");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRemix = () => {
      if (!generatedImage) return;
      dispatchIntent({ 
          type: 'SMART_EDIT', 
          payload: { image: generatedImage, prompt: '' } 
      });
  };

  return (
    <div className="h-full overflow-y-auto hide-scrollbar p-4 pb-24 space-y-6 bg-[#292d3e] relative">
      {/* Background FX */}
      <div className="absolute inset-0 pointer-events-none z-0">
          <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-purple-900/10 via-transparent to-blue-900/10 animate-pulse-slow"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[100px] animate-breathe"></div>
      </div>

      <div className="flex justify-between items-start relative z-10">
        <div>
            <h1 className="text-2xl font-bold text-gray-200">
                AI Artist
            </h1>
            <p className="text-gray-500 text-sm font-medium">Text to Image Studio</p>
        </div>
        <button 
             onClick={onOpenSettings}
             className="text-gray-400 hover:text-white p-3 rounded-full bg-[#292d3e] shadow-neu active:shadow-neu-pressed transition-all"
             title="Settings"
         >
             <Settings size={20} />
         </button>
      </div>

      <div className="bg-[#292d3e] shadow-neu p-5 rounded-2xl space-y-5 relative z-10">
        <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe your imagination..."
            className="w-full bg-[#292d3e] shadow-neu-pressed rounded-xl p-4 text-gray-200 placeholder-gray-600 focus:outline-none focus:text-primary transition-colors h-32 resize-none text-sm leading-relaxed"
        />
        
        <div className="flex justify-between items-center">
            <div className="flex gap-3 bg-[#292d3e] shadow-neu-pressed p-1 rounded-xl">
                {Object.values(ImageSize).map((s) => (
                    <button
                        key={s}
                        onClick={() => setSize(s)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            size === s 
                            ? 'bg-[#292d3e] text-primary shadow-neu' 
                            : 'text-gray-500 hover:text-gray-300'
                        }`}
                    >
                        {s}
                    </button>
                ))}
            </div>
            
            <button
                onClick={handleGenerate}
                disabled={!prompt || isGenerating}
                className="bg-[#292d3e] text-green-400 px-6 py-3 rounded-xl font-bold disabled:opacity-50 flex items-center gap-2 shadow-neu active:shadow-neu-pressed transition-all hover:text-green-300"
            >
                {isGenerating ? <RefreshCw className="animate-spin" size={18}/> : 'Create'}
            </button>
        </div>
      </div>

      <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-[#292d3e] shadow-neu-pressed p-2 flex items-center justify-center z-10">
        {generatedImage ? (
             <div className="relative w-full h-full rounded-xl overflow-hidden group">
                <img src={generatedImage} alt="Generated" className="w-full h-full object-contain bg-[#1e212d]" />
                
                {/* Result Actions */}
                <div className="absolute bottom-4 right-4 flex gap-3">
                    <button 
                        onClick={handleRemix}
                        className="bg-[#292d3e] p-3 rounded-full text-blue-400 shadow-neu active:shadow-neu-pressed transition-all hover:text-blue-300"
                        title="Remix in Editor"
                    >
                        <Wand2 size={20} />
                    </button>
                    <a 
                        href={generatedImage} 
                        download={`snapaura-gen-${Date.now()}.png`}
                        className="bg-[#292d3e] p-3 rounded-full text-green-400 shadow-neu active:shadow-neu-pressed transition-all hover:text-green-300"
                        onClick={() => showToast("Downloading...", "success")}
                        title="Download"
                    >
                        <Download size={20} />
                    </a>
                </div>
             </div>
        ) : (
            <div className="text-center text-gray-500 p-4">
                {isGenerating ? (
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-[#292d3e] shadow-neu flex items-center justify-center">
                             <RefreshCw className="animate-spin text-primary" size={28}/>
                        </div>
                        <p className="text-sm font-bold animate-pulse text-gray-400">Dreaming...</p>
                    </div>
                ) : (
                    <>
                        <ImageIcon size={48} className="mx-auto mb-3 opacity-20" />
                        <p className="text-sm font-medium">Your masterpiece will appear here.</p>
                    </>
                )}
            </div>
        )}
      </div>
    </div>
  );
};

export default Generator;
