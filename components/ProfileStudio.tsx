
import React, { useState, useRef } from 'react';
import { UserCheck, Upload, Wand2, Download, RefreshCw, Layers } from './Icons';
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

    const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if(file) {
            const reader = new FileReader();
            reader.onload = () => setImage(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const generateProfile = async (prompt: string) => {
        if(!image) return;
        setIsProcessing(true);
        try {
            const res = await editImageWithPrompt(image, prompt + " Keep facial features recognizable.");
            setProcessed(res);
            showToast("Profile generated!", "success");
        } catch(e) {
            showToast("Failed to generate", "error");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="space-y-4 animate-fade-in-up">
            <div className="glass-panel p-6 rounded-2xl text-center border-t-4 border-indigo-500">
                <div className="bg-indigo-500/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-indigo-400">
                    <UserCheck size={32} />
                </div>
                <h2 className="text-xl font-bold text-white">Profile Studio</h2>
                <p className="text-sm text-gray-400 mb-6">Turn selfies into pro headshots</p>

                {!image ? (
                    <button onClick={() => fileRef.current?.click()} className="w-full py-8 border-2 border-dashed border-white/20 rounded-xl hover:bg-white/5 transition-all flex flex-col items-center gap-2 text-gray-400">
                        <Upload size={24} />
                        <span className="text-sm font-bold">Upload Selfie</span>
                    </button>
                ) : (
                    <div className="space-y-4">
                        <div className="relative h-64 w-64 mx-auto rounded-full overflow-hidden border-4 border-white/10 shadow-2xl">
                            <img src={processed || image} className="w-full h-full object-cover" alt="Profile" />
                            {isProcessing && (
                                <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm">
                                    <RefreshCw className="animate-spin text-white" size={32} />
                                </div>
                            )}
                        </div>
                        
                        {!processed && (
                            <div className="grid grid-cols-2 gap-2">
                                {THEMES.map(t => (
                                    <button 
                                        key={t.id} 
                                        onClick={() => generateProfile(t.prompt)}
                                        disabled={isProcessing}
                                        className="bg-white/5 hover:bg-indigo-500/20 border border-white/10 hover:border-indigo-500/50 py-3 rounded-xl text-xs font-bold text-gray-300 hover:text-indigo-300 transition-all active:scale-95"
                                    >
                                        {t.label}
                                    </button>
                                ))}
                            </div>
                        )}

                        {processed && (
                            <div className="flex gap-2">
                                <a href={processed} download="snapaura-profile.png" className="flex-1 bg-white text-black py-3 rounded-xl font-bold flex items-center justify-center gap-2">
                                    <Download size={16} /> Save
                                </a>
                                <button onClick={() => {setProcessed(null); setImage(null);}} className="p-3 bg-white/10 rounded-xl text-white">
                                    <RefreshCw size={20} />
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
            <input type="file" ref={fileRef} onChange={handleUpload} className="hidden" accept="image/*" />
        </div>
    );
};

export default ProfileStudio;
