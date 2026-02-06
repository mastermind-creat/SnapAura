
import React, { useState, useRef, useEffect } from 'react';
import { Search, Sparkles, Mic, ArrowRight, Heart, Zap, Globe, MessageCircle, RefreshCw } from './Icons';
import { processOmniCommand } from '../services/geminiService';
import { useNeural } from './NeuralContext';
import { showToast } from './Toast';

interface OmniBarProps {
    onOpenDonation: () => void;
}

const OmniBar: React.FC<OmniBarProps> = ({ onOpenDonation }) => {
    const { dispatchIntent } = useNeural();
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setIsOpen(prev => !prev);
            }
            if (e.key === 'Escape') setIsOpen(false);
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    const handleSubmit = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!input.trim()) return;

        setIsProcessing(true);
        try {
            const { intent, reply } = await processOmniCommand(input);
            showToast(reply, "success");
            
            if (intent) {
                dispatchIntent(intent);
                setIsOpen(false);
                setInput('');
            }
        } catch (e) {
            showToast("Neural Connection Error", "error");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <>
            <button 
                onClick={() => setIsOpen(true)}
                className="fixed bottom-24 right-4 z-40 w-12 h-12 bg-dark-800/80 backdrop-blur-xl border border-white/10 rounded-full flex items-center justify-center text-primary shadow-neu active:scale-95 transition-all group"
            >
                <Sparkles size={20} className="group-hover:animate-spin-slow" />
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-[150] flex items-start justify-center pt-24 px-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setIsOpen(false)}></div>
                    <div className="relative w-full max-w-xl bg-dark-800/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-fade-in-up">
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-secondary to-accent animate-shimmer bg-[length:200%_100%]"></div>
                        <form onSubmit={handleSubmit} className="flex items-center px-4 py-4 gap-3">
                            <Search className="text-gray-500" size={20} />
                            <input 
                                ref={inputRef}
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                placeholder="Neural Command Input..."
                                className="flex-1 bg-transparent text-lg text-white placeholder-gray-600 outline-none font-medium"
                            />
                            {isProcessing ? (
                                <RefreshCw className="animate-spin text-primary" size={20} />
                            ) : (
                                <div className="flex gap-2">
                                    <button type="button" className="text-gray-500 hover:text-white transition-colors"><Mic size={20} /></button>
                                    <button type="submit" disabled={!input.trim()} className="bg-primary/20 p-2 rounded-lg text-primary hover:bg-primary/30 transition-colors"><ArrowRight size={16} /></button>
                                </div>
                            )}
                        </form>
                        {!input && (
                            <div className="px-4 pb-4 border-t border-white/5 bg-dark-900/50">
                                <p className="text-[9px] text-gray-500 font-black uppercase tracking-[0.2em] py-3">Quick Uplinks</p>
                                <div className="grid grid-cols-2 gap-2">
                                    <button onClick={() => { setIsOpen(false); dispatchIntent({ type: 'NAVIGATE_TOOL', payload: { toolId: 'support' } }); }} className="text-left text-[10px] font-bold text-gray-400 hover:text-accent p-2 hover:bg-white/5 rounded-lg transition-colors flex items-center gap-2 uppercase tracking-wider">
                                        <Heart size={12} className="text-accent animate-pulse"/> Support Creator
                                    </button>
                                    <button onClick={() => { setInput("Analyze global vibe"); handleSubmit(); }} className="text-left text-[10px] font-bold text-gray-400 hover:text-primary p-2 hover:bg-white/5 rounded-lg transition-colors flex items-center gap-2 uppercase tracking-wider">
                                        <Globe size={12} className="text-primary"/> Vibe Check
                                    </button>
                                    <button onClick={() => { setInput("Create a cyber-portrait"); handleSubmit(); }} className="text-left text-[10px] font-bold text-gray-400 hover:text-secondary p-2 hover:bg-white/5 rounded-lg transition-colors flex items-center gap-2 uppercase tracking-wider">
                                        <Zap size={12} className="text-secondary"/> AI Imagine
                                    </button>
                                    <button onClick={() => { setInput("New Chat"); handleSubmit(); }} className="text-left text-[10px] font-bold text-gray-400 hover:text-white p-2 hover:bg-white/5 rounded-lg transition-colors flex items-center gap-2 uppercase tracking-wider">
                                        <MessageCircle size={12} className="text-white"/> Open Nexus
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
};

export default OmniBar;
