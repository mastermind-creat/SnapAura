
import React, { useState, useRef } from 'react';
import { Ghost, Flame, Gem, Upload, RefreshCw, Copy, MessageCircle, Star, Music, Zap, Happy, Sparkles } from './Icons';
import { analyzeAura, generateRizz, rateAesthetic } from '../services/geminiService';
import { showToast } from './Toast';

const GenZLab: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'aura' | 'rizz' | 'fit'>('aura');
    const [image, setImage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [rizzContext, setRizzContext] = useState('');
    const fileRef = useRef<HTMLInputElement>(null);

    const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                setImage(reader.result as string);
                setResult(null);
            };
            reader.readAsDataURL(file);
        }
    };

    const runAuraScan = async () => {
        if (!image) return;
        setLoading(true);
        try {
            const res = await analyzeAura(image);
            setResult(res);
        } catch (e) { showToast("Vibe check failed", "error"); } 
        finally { setLoading(false); }
    };

    const runFitCheck = async () => {
        if (!image) return;
        setLoading(true);
        try {
            const res = await rateAesthetic(image);
            setResult(res);
        } catch (e) { showToast("Roast failed", "error"); } 
        finally { setLoading(false); }
    };

    const runRizz = async (tone: string) => {
        if (!rizzContext) return;
        setLoading(true);
        try {
            const res = await generateRizz(rizzContext, tone);
            setResult(res); // Array of strings
        } catch (e) { showToast("Rizz machine broken", "error"); } 
        finally { setLoading(false); }
    };

    return (
        <div className="space-y-6 animate-fade-in-up pb-24">
            {/* Header */}
            <div className="bg-[#292d3e] shadow-neu p-6 rounded-3xl relative overflow-hidden">
                <div className="relative z-10 flex items-center gap-4">
                    <div className="bg-[#292d3e] shadow-neu-pressed p-4 rounded-full text-pink-400">
                        <Ghost size={28} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-gray-200 tracking-tight">Gen Z Lab</h2>
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mt-1">Vibes, Rizz & Roasts</p>
                    </div>
                </div>
                {/* Decoration */}
                <div className="absolute -right-5 -bottom-5 text-pink-500/10 rotate-12">
                   <Flame size={120} />
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-[#292d3e] shadow-neu-pressed p-1.5 rounded-2xl flex gap-2">
                {[
                    { id: 'aura', label: 'Aura Scan', icon: Sparkles },
                    { id: 'rizz', label: 'Rizz Key', icon: MessageCircle },
                    { id: 'fit', label: 'Fit Check', icon: Gem },
                ].map(tab => (
                    <button 
                        key={tab.id}
                        onClick={() => { setActiveTab(tab.id as any); setResult(null); setImage(null); }}
                        className={`flex-1 py-3 rounded-xl text-[10px] font-bold uppercase transition-all flex flex-col items-center gap-1 ${
                            activeTab === tab.id 
                            ? 'bg-[#292d3e] text-pink-400 shadow-neu' 
                            : 'text-gray-500 hover:text-gray-300'
                        }`}
                    >
                        <tab.icon size={16} /> {tab.label}
                    </button>
                ))}
            </div>

            {/* CONTENT: AURA SCANNER */}
            {activeTab === 'aura' && (
                <div className="space-y-6 animate-fade-in-up">
                    {!image ? (
                        <button onClick={() => fileRef.current?.click()} className="w-full h-48 bg-[#292d3e] shadow-neu rounded-2xl flex flex-col items-center justify-center gap-3 text-gray-400 hover:text-pink-400 transition-colors border border-dashed border-gray-700 hover:border-pink-400">
                            <Upload size={32} />
                            <span className="font-bold text-sm">Upload Selfie for Vibe Check</span>
                        </button>
                    ) : (
                        <div className="relative rounded-2xl overflow-hidden bg-[#292d3e] shadow-neu p-2">
                            <img src={image} className="w-full h-64 object-cover rounded-xl opacity-60" />
                            {!result && !loading && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <button onClick={runAuraScan} className="bg-pink-500 hover:bg-pink-400 text-white px-6 py-3 rounded-xl font-bold shadow-lg transform hover:scale-105 transition-all flex items-center gap-2">
                                        <Sparkles size={18} /> Read My Aura
                                    </button>
                                </div>
                            )}
                            {loading && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <RefreshCw className="animate-spin text-pink-400" size={40} />
                                </div>
                            )}
                        </div>
                    )}

                    {result && (
                        <div className="bg-[#292d3e] shadow-neu p-6 rounded-3xl relative overflow-hidden border border-white/5">
                            {/* Dynamic Aura Background */}
                            <div 
                                className="absolute inset-0 opacity-20 blur-3xl"
                                style={{ background: `radial-gradient(circle at center, ${result.color}, transparent 70%)` }}
                            ></div>
                            
                            <div className="relative z-10 text-center space-y-4">
                                <span className="inline-block px-4 py-1 rounded-full bg-black/30 backdrop-blur-md text-xs font-mono font-bold text-white border border-white/10">
                                    {result.color}
                                </span>
                                <h3 className="text-3xl font-black text-white drop-shadow-lg uppercase italic tracking-tighter">
                                    {result.archetype}
                                </h3>
                                <p className="text-sm text-gray-200 font-medium leading-relaxed bg-black/20 p-4 rounded-xl">
                                    {result.reading}
                                </p>
                                <div className="flex items-center justify-center gap-2 text-xs text-pink-300 font-bold bg-[#292d3e] p-3 rounded-xl shadow-neu">
                                    <Music size={14} /> Anthem: {result.song}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* CONTENT: RIZZ KEY */}
            {activeTab === 'rizz' && (
                <div className="space-y-6 animate-fade-in-up">
                    <div className="bg-[#292d3e] shadow-neu p-6 rounded-2xl">
                        <label className="text-[10px] font-bold text-gray-500 uppercase ml-1 mb-2 block">They said:</label>
                        <textarea 
                            value={rizzContext}
                            onChange={(e) => setRizzContext(e.target.value)}
                            placeholder="Paste the text you received..."
                            className="w-full bg-[#1e212d] rounded-xl p-4 text-gray-200 text-sm outline-none resize-none h-24 mb-4"
                        />
                        <div className="grid grid-cols-3 gap-2">
                            <button onClick={() => runRizz('Flirty')} disabled={loading} className="py-3 bg-[#292d3e] shadow-neu rounded-xl text-xs font-bold text-pink-400 active:shadow-neu-pressed">😏 Spicy</button>
                            <button onClick={() => runRizz('Unhinged')} disabled={loading} className="py-3 bg-[#292d3e] shadow-neu rounded-xl text-xs font-bold text-yellow-400 active:shadow-neu-pressed">🤪 Chaos</button>
                            <button onClick={() => runRizz('Nonchalant')} disabled={loading} className="py-3 bg-[#292d3e] shadow-neu rounded-xl text-xs font-bold text-blue-400 active:shadow-neu-pressed">🥶 Cold</button>
                        </div>
                    </div>

                    {loading && <div className="text-center text-xs font-bold text-pink-400 animate-pulse">Cooking up replies...</div>}

                    {result && Array.isArray(result) && (
                        <div className="space-y-3">
                            {result.map((reply: string, i: number) => (
                                <div key={i} className="bg-[#292d3e] shadow-neu p-4 rounded-xl flex justify-between items-center group">
                                    <p className="text-sm text-gray-300 font-medium">{reply}</p>
                                    <button 
                                        onClick={() => {navigator.clipboard.writeText(reply); showToast("Copied!", "success")}}
                                        className="p-2 text-gray-500 hover:text-white"
                                    >
                                        <Copy size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* CONTENT: FIT CHECK */}
            {activeTab === 'fit' && (
                <div className="space-y-6 animate-fade-in-up">
                    {!image ? (
                        <button onClick={() => fileRef.current?.click()} className="w-full h-48 bg-[#292d3e] shadow-neu rounded-2xl flex flex-col items-center justify-center gap-3 text-gray-400 hover:text-yellow-400 transition-colors border border-dashed border-gray-700 hover:border-yellow-400">
                            <Upload size={32} />
                            <span className="font-bold text-sm">Upload Fit Pic</span>
                        </button>
                    ) : (
                        <div className="relative rounded-2xl overflow-hidden bg-[#292d3e] shadow-neu p-2">
                            <img src={image} className="w-full h-64 object-cover rounded-xl" />
                             {!result && !loading && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                                    <button onClick={runFitCheck} className="bg-yellow-500 hover:bg-yellow-400 text-black px-6 py-3 rounded-xl font-bold shadow-lg transform hover:scale-105 transition-all flex items-center gap-2">
                                        <Flame size={18} /> Roast My Fit
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {loading && <div className="text-center text-xs font-bold text-yellow-400 animate-pulse">Analyzing drip...</div>}

                    {result && !Array.isArray(result) && (
                        <div className="bg-[#292d3e] shadow-neu p-6 rounded-3xl text-center space-y-4">
                            <div className="flex justify-center items-end gap-1">
                                <span className={`text-6xl font-black ${result.rating > 7 ? 'text-green-400' : result.rating < 4 ? 'text-red-400' : 'text-yellow-400'}`}>
                                    {result.rating}
                                </span>
                                <span className="text-xl text-gray-500 font-bold mb-2">/10</span>
                            </div>
                            
                            <div className="bg-[#1e212d] p-4 rounded-xl border-l-4 border-yellow-400 text-left">
                                <h4 className="text-[10px] font-bold text-yellow-400 uppercase tracking-widest mb-1">Verdict</h4>
                                <p className="text-sm text-gray-300 font-bold italic">"{result.verdict}"</p>
                            </div>

                            <div className="flex items-start gap-3 text-left bg-[#292d3e] shadow-neu-pressed p-4 rounded-xl">
                                <Zap className="text-blue-400 shrink-0 mt-1" size={16} />
                                <div>
                                    <h4 className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-1">Advice</h4>
                                    <p className="text-xs text-gray-400">{result.advice}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
            
            <input type="file" ref={fileRef} onChange={handleUpload} className="hidden" accept="image/*" />
        </div>
    );
};

export default GenZLab;
