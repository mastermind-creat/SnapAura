
import React, { useState, useRef } from 'react';
import { UserCheck, Upload, Wand2, Download, RefreshCw, Layers, Sparkles, Zap } from './Icons';
import { editImageWithPrompt } from '../services/geminiService';
import { showToast } from './Toast';

const ProfileStudio: React.FC = () => {
    const [image, setImage] = useState<string | null>(null);
    const [processed, setProcessed] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const fileRef = useRef<HTMLInputElement>(null);

    const THEMES = [
        { id: 'corporate', label: 'Corporate', prompt: 'Make this a professional corporate profile picture, suit and tie, office background, high key lighting.' },
        { id: 'luxury', label: 'Luxury', prompt: 'Make this a luxury lifestyle profile picture, rich colors, golden hour lighting, expensive vibe.' },
        { id: 'aesthetic', label: 'Aesthetic', prompt: 'Make this an aesthetic profile picture, soft pastel tones, dreamy blur background, trendy look.' },
        { id: 'anime', label: 'Anime', prompt: 'Turn this into a high quality anime character profile picture, vibrant colors, studio ghibli style.' },
        { id: 'cinematic', label: 'Cinematic', prompt: 'Make this a cinematic movie character portrait, dramatic lighting, teal and orange color grading.' }
    ];

    const RETOUCH_OPTS = [
        { id: 'light', label: 'Fix Lighting', icon: Zap, prompt: 'Fix the lighting in this portrait. Make it balanced, professional studio lighting, remove harsh shadows.' },
        { id: 'smooth', label: 'Smooth Skin', icon: Sparkles, prompt: 'Retouch the skin in this portrait to look smooth and natural. Remove blemishes but keep skin texture.' },
        { id: 'bokeh', label: 'Blur Background', icon: Layers, prompt: 'Keep the person in focus but apply a strong professional bokeh blur to the background.' }
    ];

    const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if(file) {
            const reader = new FileReader();
            reader.onload = () => {
                setImage(reader.result as string);
                setProcessed(null);
            }
            reader.readAsDataURL(file);
        }
    };

    const processImage = async (prompt: string) => {
        const src = processed || image;
        if(!src) return;
        
        setIsProcessing(true);
        try {
            const res = await editImageWithPrompt(src, prompt + " Keep facial features recognizable and high quality.");
            setProcessed(res);
            showToast("Update complete!", "success");
        } catch(e) {
            showToast("Failed to process", "error");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDownload = () => {
        if (!processed && !image) return;
        const link = document.createElement('a');
        link.href = processed || image!;
        link.download = `snapaura-profile-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast("Saved to Photos", "success");
    };

    return (
        <div className="space-y-6 animate-fade-in-up">
            <div className="bg-[#292d3e] shadow-neu p-6 rounded-2xl text-center relative overflow-hidden">
                <div className="w-16 h-16 rounded-full bg-[#292d3e] shadow-neu flex items-center justify-center mx-auto mb-4 text-indigo-400">
                    <UserCheck size={32} />
                </div>
                <h2 className="text-xl font-bold text-gray-200">Profile Studio</h2>
                <p className="text-sm text-gray-500 mb-6">Turn selfies into pro headshots</p>

                {!image ? (
                    <button onClick={() => fileRef.current?.click()} className="w-full py-8 bg-[#292d3e] shadow-neu rounded-xl active:shadow-neu-pressed transition-all flex flex-col items-center gap-2 text-gray-400 hover:text-indigo-400">
                        <Upload size={24} />
                        <span className="text-sm font-bold">Upload Selfie</span>
                    </button>
                ) : (
                    <div className="space-y-6">
                        {/* Main Preview */}
                        <div className="relative h-64 w-64 mx-auto rounded-full overflow-hidden bg-[#292d3e] shadow-neu-pressed p-2 group">
                            <div className="w-full h-full rounded-full overflow-hidden relative">
                                <img src={processed || image} className="w-full h-full object-cover" alt="Profile" />
                                {isProcessing && (
                                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm">
                                        <RefreshCw className="animate-spin text-indigo-400" size={32} />
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        {/* Themes Grid */}
                        <div className="space-y-3">
                             <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest text-left ml-1">Select Theme</h4>
                             <div className="grid grid-cols-2 gap-3">
                                {THEMES.map(t => (
                                    <button 
                                        key={t.id} 
                                        onClick={() => processImage(t.prompt)}
                                        disabled={isProcessing}
                                        className="bg-[#292d3e] shadow-neu active:shadow-neu-pressed py-3 rounded-xl text-xs font-bold text-gray-400 hover:text-indigo-400 transition-all disabled:opacity-50"
                                    >
                                        {t.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Quick Retouch */}
                        <div className="space-y-3">
                             <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest text-left ml-1">Quick Adjustments</h4>
                             <div className="flex gap-3 overflow-x-auto pb-4 hide-scrollbar px-1">
                                 {RETOUCH_OPTS.map(opt => (
                                     <button
                                        key={opt.id}
                                        onClick={() => processImage(opt.prompt)}
                                        disabled={isProcessing}
                                        className="flex-shrink-0 flex items-center gap-2 px-4 py-3 bg-[#292d3e] shadow-neu active:shadow-neu-pressed rounded-xl text-xs font-bold text-gray-400 hover:text-indigo-400 transition-all disabled:opacity-50"
                                     >
                                         <opt.icon size={14}/> {opt.label}
                                     </button>
                                 ))}
                             </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-4 pt-2">
                            <button 
                                onClick={handleDownload}
                                className="flex-1 bg-[#292d3e] text-indigo-400 shadow-neu py-4 rounded-xl font-bold flex items-center justify-center gap-2 active:shadow-neu-pressed transition-all"
                            >
                                <Download size={18} /> Save Image
                            </button>
                            <button 
                                onClick={() => {setProcessed(null); setImage(null);}} 
                                className="p-4 bg-[#292d3e] shadow-neu rounded-xl text-gray-400 hover:text-red-400 active:shadow-neu-pressed transition-all"
                                title="Reset"
                            >
                                <RefreshCw size={20} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
            <input type="file" ref={fileRef} onChange={handleUpload} className="hidden" accept="image/*" />
        </div>
    );
};

export default ProfileStudio;
