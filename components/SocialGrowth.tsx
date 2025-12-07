
import React, { useState } from 'react';
import { TrendingUp, Hash, Clock, MessageSquare, RefreshCw, Copy, Lightbulb, FileText, User } from './Icons';
import { generateSocialContent } from '../services/geminiService';
import { showToast } from './Toast';
import { useNeural } from './NeuralContext';

// Access marked from global scope
declare const marked: any;

const SocialGrowth: React.FC = () => {
    const { dispatchIntent, updateState, state } = useNeural();
    const [topic, setTopic] = useState('');
    const [result, setResult] = useState('');
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'hashtag' | 'idea' | 'reply' | 'timing'>('hashtag');

    const handleGenerate = async () => {
        if(!topic) return;
        setLoading(true);
        try {
            const res = await generateSocialContent(topic, activeTab, activeTab === 'reply' ? topic : undefined);
            setResult(res);
        } catch(e) {
            showToast("Failed to generate", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleSaveToNotes = (content: string, type: string) => {
        dispatchIntent({ type: 'SEND_TO_NOTES', payload: { text: content, title: `${type} for ${topic}` } });
    };

    const handleSetAsBio = () => {
        if (!state.userProfile) {
            showToast("Log in to set profile bio", "error");
            return;
        }
        // Clean markdown and quotes
        const bioText = result.replace(/[*#"`]/g, '').trim();
        updateState({
            userProfile: {
                ...state.userProfile,
                bio: bioText
            }
        });
        showToast("Profile Bio Updated!", "success");
    };

    const renderResult = () => {
        if (!result) return null;

        if (activeTab === 'hashtag') {
            const tags = result.split(/[\s,]+/).filter(t => t.trim().startsWith('#') || t.trim().length > 0);
            return (
                <div className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                        {tags.map((tag, i) => (
                            <button 
                                key={i}
                                onClick={() => {navigator.clipboard.writeText(tag); showToast("Copied tag", "success")}}
                                className="px-3 py-1.5 bg-[#292d3e] shadow-neu rounded-full text-xs text-blue-400 active:shadow-neu-pressed transition-all"
                            >
                                {tag}
                            </button>
                        ))}
                    </div>
                    <div className="flex gap-2">
                        <button 
                            onClick={() => {navigator.clipboard.writeText(result); showToast("Copied all tags", "success")}}
                            className="flex-1 py-3 bg-[#292d3e] shadow-neu rounded-xl text-sm font-bold text-blue-400 active:shadow-neu-pressed transition-all flex items-center justify-center gap-2"
                        >
                            <Copy size={16} /> Copy All
                        </button>
                    </div>
                </div>
            );
        }

        const htmlContent = typeof marked !== 'undefined' ? marked.parse(result) : result;

        return (
            <div className="bg-[#292d3e] shadow-neu p-6 rounded-2xl relative group">
                <div className="absolute top-4 right-4 flex gap-2 z-10">
                    <button 
                        onClick={() => handleSaveToNotes(result, activeTab)}
                        className="p-2 bg-[#292d3e] shadow-neu active:shadow-neu-pressed rounded-lg text-yellow-400 hover:text-white transition-all"
                        title="Save to Notes"
                    >
                        <FileText size={16} />
                    </button>
                    <button 
                        onClick={() => {navigator.clipboard.writeText(result); showToast("Copied!", "success")}}
                        className="p-2 bg-[#292d3e] shadow-neu active:shadow-neu-pressed rounded-lg text-gray-400 hover:text-white transition-all"
                        title="Copy Text"
                    >
                        <Copy size={16} />
                    </button>
                </div>
                
                <div 
                    className="prose prose-invert prose-sm max-w-none text-gray-300 leading-relaxed mb-4"
                    dangerouslySetInnerHTML={{ __html: htmlContent }}
                />

                {/* Automation Button for Reply/Bio context */}
                {activeTab === 'reply' && (
                    <button 
                        onClick={handleSetAsBio}
                        className="w-full py-3 bg-[#292d3e] shadow-neu rounded-xl text-xs font-bold text-green-400 flex items-center justify-center gap-2 active:shadow-neu-pressed"
                    >
                        <User size={14} /> Set as Profile Bio
                    </button>
                )}
            </div>
        );
    };

    return (
        <div className="space-y-6 animate-fade-in-up">
            <div className="bg-[#292d3e] shadow-neu p-6 rounded-2xl">
                <div className="flex items-center gap-3 mb-6">
                    <div className="bg-[#292d3e] shadow-neu-pressed p-3 rounded-full text-blue-400">
                        <TrendingUp size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-200">Growth Hub</h2>
                        <p className="text-xs text-gray-500">AI-powered social tools</p>
                    </div>
                </div>

                <div className="flex gap-2 mb-6 bg-[#292d3e] shadow-neu-pressed p-1.5 rounded-2xl overflow-x-auto hide-scrollbar">
                    <button onClick={() => {setActiveTab('hashtag'); setResult('');}} className={`flex-1 py-3 px-2 rounded-xl flex flex-col items-center gap-1 transition-all ${activeTab === 'hashtag' ? 'bg-[#292d3e] text-blue-400 shadow-neu' : 'text-gray-500'}`}>
                        <Hash size={18} /> <span className="text-[10px] font-bold">Tags</span>
                    </button>
                    <button onClick={() => {setActiveTab('idea'); setResult('');}} className={`flex-1 py-3 px-2 rounded-xl flex flex-col items-center gap-1 transition-all ${activeTab === 'idea' ? 'bg-[#292d3e] text-blue-400 shadow-neu' : 'text-gray-500'}`}>
                        <Lightbulb size={18} /> <span className="text-[10px] font-bold">Ideas</span>
                    </button>
                    <button onClick={() => {setActiveTab('reply'); setResult('');}} className={`flex-1 py-3 px-2 rounded-xl flex flex-col items-center gap-1 transition-all ${activeTab === 'reply' ? 'bg-[#292d3e] text-blue-400 shadow-neu' : 'text-gray-500'}`}>
                        <MessageSquare size={18} /> <span className="text-[10px] font-bold">Bio/Reply</span>
                    </button>
                    <button onClick={() => {setActiveTab('timing'); setResult('');}} className={`flex-1 py-3 px-2 rounded-xl flex flex-col items-center gap-1 transition-all ${activeTab === 'timing' ? 'bg-[#292d3e] text-blue-400 shadow-neu' : 'text-gray-500'}`}>
                        <Clock size={18} /> <span className="text-[10px] font-bold">Time</span>
                    </button>
                </div>

                <div className="space-y-4">
                    <textarea 
                        value={topic}
                        onChange={e => setTopic(e.target.value)}
                        placeholder={activeTab === 'reply' ? "Describe yourself for a Bio, or paste a comment..." : "Enter your Niche / Topic..."}
                        className="w-full bg-[#292d3e] shadow-neu-pressed rounded-xl p-4 text-gray-300 placeholder-gray-600 outline-none resize-none min-h-[120px] text-sm leading-relaxed"
                    />
                    
                    <button 
                        onClick={handleGenerate}
                        disabled={loading || !topic}
                        className="w-full bg-[#292d3e] text-blue-400 font-bold py-4 rounded-xl shadow-neu active:shadow-neu-pressed transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {loading ? <RefreshCw className="animate-spin" /> : <><TrendingUp size={18} /> Generate Content</>}
                    </button>
                </div>

                {result && (
                    <div className="mt-8 pt-6 border-t border-[#1e212d] animate-fade-in-up">
                        <h3 className="text-xs font-bold text-gray-500 uppercase mb-4 ml-1">AI Generated Result</h3>
                        {renderResult()}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SocialGrowth;
