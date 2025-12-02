
import React, { useState } from 'react';
import { Feather, RefreshCw, Copy, CheckCircle, FileText, Languages, BookOpen } from './Icons';
import { generateSmartNote } from '../services/geminiService';
import { showToast } from './Toast';

type Mode = 'summarize' | 'rewrite' | 'expand' | 'translate';

const SmartNotes: React.FC = () => {
    const [text, setText] = useState('');
    const [result, setResult] = useState('');
    const [mode, setMode] = useState<Mode>('summarize');
    const [loading, setLoading] = useState(false);
    const [extra, setExtra] = useState('');

    const handleAction = async () => {
        if(!text) return;
        setLoading(true);
        try {
            const res = await generateSmartNote(text, mode, extra);
            setResult(res);
        } catch(e) {
            showToast("Failed to process", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-4 animate-fade-in-up">
            <div className="glass-panel p-6 rounded-2xl border-t-4 border-yellow-400">
                <div className="flex items-center gap-3 mb-4">
                    <div className="bg-yellow-500/20 p-3 rounded-full text-yellow-400"><Feather size={24} /></div>
                    <h2 className="text-xl font-bold text-white">Smart Notes</h2>
                </div>

                <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar mb-4">
                    {[
                        {id: 'summarize', label: 'Summarize', icon: FileText},
                        {id: 'rewrite', label: 'Rewrite', icon: RefreshCw},
                        {id: 'expand', label: 'Expand', icon: BookOpen},
                        {id: 'translate', label: 'Translate', icon: Languages},
                    ].map(m => (
                        <button 
                            key={m.id} 
                            onClick={() => setMode(m.id as Mode)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${mode === m.id ? 'bg-yellow-500 text-black' : 'bg-white/5 text-gray-400'}`}
                        >
                            <m.icon size={14} /> {m.label}
                        </button>
                    ))}
                </div>

                <textarea 
                    value={text} 
                    onChange={e => setText(e.target.value)} 
                    placeholder="Paste your text here..." 
                    className="w-full h-32 bg-black/30 border border-white/10 rounded-xl p-4 text-white text-sm focus:border-yellow-500 outline-none resize-none mb-4"
                />

                {mode === 'translate' && (
                    <input 
                        placeholder="Target Language (e.g. Spanish, Swahili)" 
                        value={extra} 
                        onChange={e => setExtra(e.target.value)}
                        className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-white text-sm mb-4"
                    />
                )}
                {mode === 'rewrite' && (
                    <select 
                        value={extra} 
                        onChange={e => setExtra(e.target.value)}
                        className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-white text-sm mb-4"
                    >
                        <option value="professional">Professional</option>
                        <option value="casual">Casual</option>
                        <option value="academic">Academic</option>
                        <option value="creative">Creative</option>
                    </select>
                )}

                <button 
                    onClick={handleAction} 
                    disabled={loading || !text}
                    className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
                >
                    {loading ? <RefreshCw className="animate-spin" /> : 'Process Text'}
                </button>

                {result && (
                    <div className="mt-6 bg-white/5 p-4 rounded-xl border border-white/10 relative group">
                        <button 
                            onClick={() => {navigator.clipboard.writeText(result); showToast("Copied!", "success")}}
                            className="absolute top-2 right-2 p-2 bg-black/50 rounded-lg text-gray-400 hover:text-white transition-colors"
                        >
                            <Copy size={16} />
                        </button>
                        <div className="prose prose-invert prose-sm max-w-none text-gray-200 leading-relaxed whitespace-pre-wrap">
                            {result}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SmartNotes;
