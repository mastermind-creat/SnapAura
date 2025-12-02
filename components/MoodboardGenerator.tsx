
import React, { useState, useRef } from 'react';
import { Layers, Upload, RefreshCw, Download, Palette } from './Icons';
import { analyzeMoodboard } from '../services/geminiService';
import { showToast } from './Toast';

const MoodboardGenerator: React.FC = () => {
    const [image, setImage] = useState<string | null>(null);
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const fileRef = useRef<HTMLInputElement>(null);

    const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if(file) {
            const reader = new FileReader();
            reader.onload = () => {
                setImage(reader.result as string);
                generateBoard(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const generateBoard = async (img: string) => {
        setLoading(true);
        try {
            const res = await analyzeMoodboard([img]);
            setData(res);
        } catch(e) {
            showToast("Analysis failed", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-4 animate-fade-in-up">
            <div className="glass-panel p-6 rounded-2xl border-t-4 border-pink-500">
                <div className="flex items-center gap-3 mb-4">
                    <div className="bg-pink-500/20 p-3 rounded-full text-pink-400"><Layers size={24} /></div>
                    <h2 className="text-xl font-bold text-white">Moodboard AI</h2>
                </div>

                {!image ? (
                    <button onClick={() => fileRef.current?.click()} className="w-full h-40 border-2 border-dashed border-white/20 rounded-xl flex flex-col items-center justify-center gap-2 text-gray-400 hover:bg-white/5 transition-all">
                        <Upload size={32} />
                        <span className="font-bold">Upload Inspiration Image</span>
                    </button>
                ) : (
                    <div className="space-y-6">
                        <div className="relative rounded-xl overflow-hidden shadow-2xl">
                            <img src={image} className="w-full h-48 object-cover" alt="Source" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-4">
                                <div>
                                    <h3 className="text-2xl font-black text-white">{data?.theme || "Analyzing..."}</h3>
                                    <p className="text-sm text-gray-300 italic">"{data?.caption || "..."}"</p>
                                </div>
                            </div>
                        </div>

                        {loading ? (
                            <div className="flex justify-center py-10"><RefreshCw className="animate-spin text-pink-400" size={32} /></div>
                        ) : (
                            <>
                                <div>
                                    <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Color Palette</h4>
                                    <div className="flex h-12 rounded-lg overflow-hidden shadow-lg">
                                        {data?.colors?.map((c: string, i: number) => (
                                            <div key={i} className="flex-1" style={{backgroundColor: c}} title={c}></div>
                                        ))}
                                    </div>
                                    <div className="flex justify-between mt-1 text-[10px] text-gray-500 font-mono">
                                        {data?.colors?.map((c: string, i: number) => <span key={i}>{c}</span>)}
                                    </div>
                                </div>

                                <div>
                                    <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Vibe Keywords</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {data?.keywords?.map((k: string, i: number) => (
                                            <span key={i} className="px-3 py-1 bg-white/10 rounded-full text-xs text-white border border-white/10">{k}</span>
                                        ))}
                                    </div>
                                </div>
                                
                                <button onClick={() => {setImage(null); setData(null);}} className="w-full py-3 bg-white/5 hover:bg-white/10 rounded-xl text-white font-bold transition-all">
                                    Create New Board
                                </button>
                            </>
                        )}
                    </div>
                )}
            </div>
            <input type="file" ref={fileRef} onChange={handleUpload} className="hidden" />
        </div>
    );
};

export default MoodboardGenerator;
