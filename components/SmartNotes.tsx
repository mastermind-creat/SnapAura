
import React, { useState } from 'react';
import { Feather, RefreshCw, Copy, FileText, Languages, BookOpen, Trash2 } from './Icons';
import { generateSmartNote } from '../services/geminiService';
import { showToast } from './Toast';

// Use global marked
declare const marked: any;

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
        <div className="space-y-6 animate-fade-in-up">
            <div className="bg-[#292d3e] shadow-neu p-6 rounded-2xl">
                <div className="flex items-center gap-3 mb-6">
                    <div className="bg-[#292d3e] shadow-neu-pressed p-3 rounded-full text-yellow-400"><Feather size={24} /></div>
                    <h2 className="text-xl font-bold text-gray-200">Smart Notes</h2>
                </div>

                <div className="flex gap-3 overflow-x-auto pb-4 hide-scrollbar px-1 mb-2">
                    {[
                        {id: 'summarize', label: 'Summarize', icon: FileText},
                        {id: 'rewrite', label: 'Rewrite', icon: RefreshCw},
                        {id: 'expand', label: 'Expand', icon: BookOpen},
                        {id: 'translate', label: 'Translate', icon: Languages},
                    ].map(m => (
                        <button 
                            key={m.id} 
                            onClick={() => { setMode(m.id as Mode); setResult(''); }}
                            className={`flex items-center gap-2 px-4 py-3 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${mode === m.id ? 'bg-[#292d3e] shadow-neu-pressed text-yellow-400' : 'bg-[#292d3e] shadow-neu text-gray-400'}`}
                        >
                            <m.icon size={14} /> {m.label}
                        </button>
                    ))}
                </div>

                <div className="relative">
                    <textarea 
                        value={text} 
                        onChange={e => setText(e.target.value)} 
                        placeholder="Paste your text here..." 
                        className="w-full h-32 bg-[#292d3e] shadow-neu-pressed rounded-xl p-4 text-gray-300 text-sm focus:outline-none resize-none mb-4 placeholder-gray-600"
                    />
                    {text && (
                        <button onClick={() => setText('')} className="absolute top-2 right-2 p-2 text-gray-500 hover:text-red-400">
                            <Trash2 size={14} />
                        </button>
                    )}
                </div>

                {mode === 'translate' && (
                    <input 
                        placeholder="Target Language (e.g. Spanish, Swahili)" 
                        value={extra} 
                        onChange={e => setExtra(e.target.value)}
                        className="w-full bg-[#292d3e] shadow-neu-pressed rounded-xl p-4 text-gray-300 text-sm mb-4 outline-none"
                    />
                )}
                {mode === 'rewrite' && (
                    <div className="relative mb-4">
                        <select 
                            value={extra} 
                            onChange={e => setExtra(e.target.value)}
                            className="w-full bg-[#292d3e] shadow-neu-pressed rounded-xl p-4 text-gray-300 text-sm outline-none appearance-none"
                        >
                            <option value="">Select Tone...</option>
                            <option value="professional">Professional</option>
                            <option value="casual">Casual</option>
                            <option value="academic">Academic</option>
                            <option value="creative">Creative</option>
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">▼</div>
                    </div>
                )}

                <button 
                    onClick={handleAction} 
                    disabled={loading || !text}
                    className="w-full bg-[#292d3e] text-yellow-400 shadow-neu font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all active:shadow-neu-pressed disabled:opacity-50"
                >
                    {loading ? <RefreshCw className="animate-spin" /> : 'Process Text'}
                </button>

                {result && (
                    <div className="mt-8 animate-fade-in-up">
                        <div className="flex justify-between items-center mb-4 px-1">
                            <h3 className="text-xs font-bold text-gray-500 uppercase">AI Output</h3>
                            <button onClick={() => {navigator.clipboard.writeText(result); showToast("Copied!", "success")}} className="flex items-center gap-1 text-xs text-yellow-400 hover:text-yellow-300 bg-[#292d3e] shadow-neu px-3 py-1.5 rounded-lg active:shadow-neu-pressed">
                                <Copy size={12} /> Copy
                            </button>
                        </div>
                        <div className="bg-[#292d3e] shadow-neu-pressed p-6 rounded-xl">
                             <div 
                                className="prose prose-invert prose-sm max-w-none text-gray-300 leading-relaxed"
                                dangerouslySetInnerHTML={{ __html: typeof marked !== 'undefined' ? marked.parse(result) : result }}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SmartNotes;
