
import React, { useState, useRef, useEffect } from 'react';
import { Search, Sparkles, Command, Mic, ArrowRight } from './Icons';
import { processOmniCommand } from '../services/geminiService';
import { useNeural } from './NeuralContext';
import { showToast } from './Toast';

const OmniBar: React.FC = () => {
    const { dispatchIntent } = useNeural();
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    // Keyboard shortcut (CMD+K)
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
            showToast("Neural Link Failed", "error");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <>
            {/* Trigger Button (Floating) */}
            <button 
                onClick={() => setIsOpen(true)}
                className="fixed bottom-24 right-4 z-40 w-12 h-12 bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center text-white shadow-neu active:scale-95 transition-all group"
            >
                <Sparkles size={20} className="group-hover:animate-spin-slow text-primary" />
            </button>

            {/* Modal */}
            {isOpen && (
                <div className="fixed inset-0 z-[150] flex items-start justify-center pt-24 px-4">
                    <div 
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in-up"
                        onClick={() => setIsOpen(false)}
                    ></div>

                    <div className="relative w-full max-w-xl bg-[#1e212d]/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-fade-in-up">
                        {/* Glow */}
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 animate-shimmer bg-[length:200%_100%]"></div>

                        <form onSubmit={handleSubmit} className="flex items-center px-4 py-4 gap-3">
                            <Search className="text-gray-500" size={20} />
                            <input 
                                ref={inputRef}
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                placeholder="Tell SnapAura what to do..."
                                className="flex-1 bg-transparent text-lg text-white placeholder-gray-500 outline-none"
                            />
                            {isProcessing ? (
                                <Sparkles className="animate-spin text-primary" size={20} />
                            ) : (
                                <div className="flex gap-2">
                                    <button type="button" className="text-gray-500 hover:text-white transition-colors">
                                        <Mic size={20} />
                                    </button>
                                    <button type="submit" disabled={!input.trim()} className="bg-white/10 p-2 rounded-lg text-white hover:bg-white/20 transition-colors">
                                        <ArrowRight size={16} />
                                    </button>
                                </div>
                            )}
                        </form>

                        {/* Quick Suggestions */}
                        {!input && (
                            <div className="px-4 pb-4 border-t border-white/5 bg-[#1a1c29]/50">
                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest py-3">Neural Shortcuts</p>
                                <div className="grid grid-cols-2 gap-2">
                                    <button onClick={() => { setInput("Check Bitcoin price"); handleSubmit(); }} className="text-left text-xs text-gray-400 hover:text-white p-2 hover:bg-white/5 rounded-lg transition-colors flex items-center gap-2">
                                        <Sparkles size={12} className="text-yellow-400"/> Check Bitcoin Price
                                    </button>
                                    <button onClick={() => { setInput("Create a cyber-punk landscape"); handleSubmit(); }} className="text-left text-xs text-gray-400 hover:text-white p-2 hover:bg-white/5 rounded-lg transition-colors flex items-center gap-2">
                                        <Sparkles size={12} className="text-blue-400"/> Generate Image
                                    </button>
                                    <button onClick={() => { setInput("World mood status"); handleSubmit(); }} className="text-left text-xs text-gray-400 hover:text-white p-2 hover:bg-white/5 rounded-lg transition-colors flex items-center gap-2">
                                        <Sparkles size={12} className="text-green-400"/> World Vibe Check
                                    </button>
                                    <button onClick={() => { setInput("Open profile settings"); handleSubmit(); }} className="text-left text-xs text-gray-400 hover:text-white p-2 hover:bg-white/5 rounded-lg transition-colors flex items-center gap-2">
                                        <Sparkles size={12} className="text-purple-400"/> Profile Settings
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
