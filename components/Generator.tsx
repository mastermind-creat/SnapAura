import React, { useState } from 'react';
import { ImageIcon, Download, RefreshCw } from './Icons';
import { generateImageFromPrompt } from '../services/geminiService';
import { ImageSize } from '../types';

const Generator: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [size, setSize] = useState<ImageSize>(ImageSize.S_1K);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!prompt) return;
    setIsGenerating(true);
    try {
      const result = await generateImageFromPrompt(prompt, size);
      setGeneratedImage(result);
    } catch (error) {
      alert("Generation failed. The prompt might be blocked or the API is busy.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="p-4 pb-24 space-y-6">
      <h1 className="text-2xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
        AI Artist
      </h1>
      <p className="text-gray-400 text-sm">Powered by Gemini 3 Pro Image</p>

      <div className="glass-panel p-4 rounded-xl space-y-4">
        <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe the image you want to create in detail..."
            className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-white placeholder-gray-500 focus:outline-none focus:border-green-500 transition-colors h-24 resize-none"
        />
        
        <div className="flex justify-between items-center">
            <div className="flex gap-2">
                {Object.values(ImageSize).map((s) => (
                    <button
                        key={s}
                        onClick={() => setSize(s)}
                        className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${
                            size === s 
                            ? 'bg-white text-black' 
                            : 'bg-white/10 text-gray-400 hover:bg-white/20'
                        }`}
                    >
                        {s}
                    </button>
                ))}
            </div>
            
            <button
                onClick={handleGenerate}
                disabled={!prompt || isGenerating}
                className="bg-gradient-to-r from-green-500 to-blue-600 text-white px-6 py-2 rounded-xl font-medium disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-green-500/20"
            >
                {isGenerating ? <RefreshCw className="animate-spin" size={18}/> : 'Create'}
            </button>
        </div>
      </div>

      <div className="relative w-full aspect-square rounded-2xl overflow-hidden glass-panel border border-dashed border-white/20 flex items-center justify-center">
        {generatedImage ? (
             <>
                <img src={generatedImage} alt="Generated" className="w-full h-full object-contain" />
                <a 
                    href={generatedImage} 
                    download={`snapaura-gen-${Date.now()}.png`}
                    className="absolute bottom-4 right-4 bg-black/60 p-2 rounded-full text-white backdrop-blur-md hover:bg-white hover:text-black transition-colors"
                >
                    <Download size={20} />
                </a>
             </>
        ) : (
            <div className="text-center text-gray-500 p-4">
                {isGenerating ? (
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-12 h-12 border-4 border-white/10 border-t-green-500 rounded-full animate-spin"></div>
                        <p className="text-sm animate-pulse">Dreaming up your image...</p>
                    </div>
                ) : (
                    <>
                        <ImageIcon size={48} className="mx-auto mb-2 opacity-20" />
                        <p className="text-sm">Your masterpiece will appear here.</p>
                    </>
                )}
            </div>
        )}
      </div>
    </div>
  );
};

export default Generator;