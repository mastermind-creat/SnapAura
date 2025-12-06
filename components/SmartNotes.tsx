
import React, { useState, useEffect } from 'react';
import { Feather, RefreshCw, Copy, FileText, Languages, BookOpen, Trash2, Save, History, ArrowLeft, ChevronRight } from './Icons';
import { generateSmartNote } from '../services/geminiService';
import { showToast } from './Toast';

// Use global marked
declare const marked: any;

type Mode = 'summarize' | 'rewrite' | 'expand' | 'translate';

interface SavedNote {
    id: string;
    text: string;
    result: string;
    date: string;
    mode: string;
}

const SmartNotes: React.FC = () => {
    const [text, setText] = useState('');
    const [result, setResult] = useState('');
    const [mode, setMode] = useState<Mode>('summarize');
    const [loading, setLoading] = useState(false);
    const [extra, setExtra] = useState('');
    
    // History State
    const [showHistory, setShowHistory] = useState(false);
    const [savedNotes, setSavedNotes] = useState<SavedNote[]>([]);

    // 1. Load Saved Notes on Mount
    useEffect(() => {
        const stored = localStorage.getItem('SNAPAURA_NOTES');
        if (stored) {
            setSavedNotes(JSON.parse(stored));
        }

        // 2. Check for Neural Intents (Drafts from other tools)
        const draft = localStorage.getItem('NEURAL_NOTE_DRAFT');
        if (draft) {
            try {
                const payload = JSON.parse(draft);
                setText(payload.text);
                if (payload.title) showToast(`Loaded draft: ${payload.title}`, "info");
                localStorage.removeItem('NEURAL_NOTE_DRAFT'); // Clear after use
            } catch (e) {}
        }
    }, []);

    // Save to LocalStorage helper
    const persistNotes = (notes: SavedNote[]) => {
        setSavedNotes(notes);
        localStorage.setItem('SNAPAURA_NOTES', JSON.stringify(notes));
    };

    const handleAction = async () => {
        if(!text) return;
        setLoading(true);
        try {
            const res = await generateSmartNote(text, mode, extra);
            setResult(res);
            
            // Auto-save to history
            const newNote: SavedNote = {
                id: Date.now().toString(),
                text: text.substring(0, 50) + "...",
                result: res,
                date: new Date().toLocaleDateString(),
                mode: mode
            };
            persistNotes([newNote, ...savedNotes].slice(0, 20)); // Keep last 20
        } catch(e) {
            showToast("Failed to process", "error");
        } finally {
            setLoading(false);
        }
    };

    const deleteNote = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const updated = savedNotes.filter(n => n.id !== id);
        persistNotes(updated);
        showToast("Note deleted", "info");
    };

    const loadNote = (note: SavedNote) => {
        setText(note.text); // Note: In a real app we'd store full original text, here we just used snippet for demo.
        setResult(note.result);
        setShowHistory(false);
    };

    if (showHistory) {
        return (
            <div className="space-y-6 animate-fade-in-up">
                <div className="bg-[#292d3e] shadow-neu p-6 rounded-2xl">
                    <div className="flex items-center gap-3 mb-6">
                        <button onClick={() => setShowHistory(false)} className="bg-[#292d3e] shadow-neu p-2 rounded-full text-gray-400 hover:text-white active:shadow-neu-pressed">
                            <ArrowLeft size={18} />
                        </button>
                        <h2 className="text-xl font-bold text-gray-200">Saved Notes</h2>
                    </div>

                    <div className="space-y-3">
                        {savedNotes.length === 0 ? (
                            <p className="text-gray-500 text-center py-8 text-sm">No saved history yet.</p>
                        ) : (
                            savedNotes.map(note => (
                                <div key={note.id} onClick={() => loadNote(note)} className="bg-[#292d3e] shadow-neu p-4 rounded-xl cursor-pointer active:shadow-neu-pressed group">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-[10px] font-bold uppercase text-yellow-400 bg-[#292d3e] shadow-neu-pressed px-2 py-1 rounded">{note.mode}</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] text-gray-500">{note.date}</span>
                                            <button onClick={(e) => deleteNote(note.id, e)} className="text-gray-600 hover:text-red-400">
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-300 line-clamp-2">{note.result.replace(/[#*]/g, '')}</p>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in-up">
            <div className="bg-[#292d3e] shadow-neu p-6 rounded-2xl relative">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="bg-[#292d3e] shadow-neu-pressed p-3 rounded-full text-yellow-400"><Feather size={24} /></div>
                        <h2 className="text-xl font-bold text-gray-200">Smart Notes</h2>
                    </div>
                    <button 
                        onClick={() => setShowHistory(true)}
                        className="flex items-center gap-2 px-3 py-2 bg-[#292d3e] shadow-neu rounded-xl text-xs font-bold text-gray-400 hover:text-yellow-400 active:shadow-neu-pressed transition-all"
                    >
                        <History size={16} /> History
                    </button>
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
