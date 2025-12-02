
import React, { useState } from 'react';
import { TrendingUp, Hash, Clock, MessageSquare, RefreshCw, Copy, Lightbulb } from './Icons';
import { generateSocialContent } from '../services/geminiService';
import { showToast } from './Toast';

// Access marked from global scope (loaded via CDN)
declare const marked: any;

const SocialGrowth: React.FC = () => {
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

    const renderResult = () => {
        if (!result) return null;

        if (activeTab === 'hashtag') {
            // Simple split for hashtags
            const tags = result.split(/[\s,]+/).filter(t => t.trim().startsWith('#') || t.trim().length > 0);
            return (
                <div className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                        {tags.map((tag, i) => (
                            <button 
                                key={i}
                                onClick={() => {navigator.clipboard.writeText(tag); showToast("Copied tag", "success")}}
                                className="px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 rounded-full text-xs text-blue-300 transition-colors"
                            >
                                {tag}
                            </button>
                        ))}
                    </div>
                    <button 
                        onClick={() => {navigator.clipboard.writeText(result); showToast("Copied all tags", "success")}}
                        className="w-full py-3 bg-white/5 hover:bg-white/10 rounded-xl text-sm font-bold text-white transition-colors flex items-center justify-center gap-2"
                    >
                        <Copy size={16} /> Copy All Tags
                    </button>
                </div>
            );
        }

        if (activeTab === 'reply') {
            const replies = result.split('||').filter(r => r.trim().length > 0);
            return (
                <div className="space-y-3">
                    {replies.map((reply, i) => (
                        <div key={i} className="bg-white/5 p-4 rounded-xl border border-white/5 relative group hover:bg-white/10 transition-colors">
                            <p className="text-sm text-gray-200 leading-relaxed pr-8">"{reply.trim()}"</p>
                            <button 
                                onClick={() => {navigator.clipboard.writeText(reply.trim()); showToast("Copied reply", "success")}}
                                className="absolute top-2 right-2 p-2 bg-black/40 rounded-lg text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity hover:text-white"
                            >
                                <Copy size={14} />
                            </button>
                        </div>
                    ))}
                </div>
            );
        }

        // Parse Markdown for Ideas and Timing
        const htmlContent = typeof marked !== 'undefined' ? marked.parse(result) : result;

        return (
            <div className="bg-white/5 p-6 rounded-xl border border-white/10 relative group">
                <button 
                    onClick={() => {navigator.clipboard.writeText(result); showToast("Copied!", "success")}}
                    className="absolute top-3 right-3 p-2 bg-black/50 rounded-lg text-gray-400 hover:text-white transition-colors opacity-80 hover:opacity-100 z-10"
                    title="Copy Text"
                >
                    <Copy size={16} />
                </button>
                
                <div 
                    className="prose prose-invert prose-sm max-w-none text-gray-200 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: htmlContent }}
                />
            </div>
        );
    };

    return (
        <div className="space-y-4 animate-fade-in-up">
            <div className="glass-panel p-6 rounded-2xl border-t-4 border-blue-500">
                <div className="flex items-center gap-3 mb-6">
                    <div className="bg-blue-500/20 p-3 rounded-full text-blue-400 shadow-lg shadow-blue-500/20">
                        <TrendingUp size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white">Growth Hub</h2>
                        <p className="text-xs text-gray-400">AI-powered social media tools</p>
                    </div>
                </div>

                <div className="grid grid-cols-4 gap-2 mb-6 bg-black/20 p-1 rounded-2xl">
                    <button onClick={() => {setActiveTab('hashtag'); setResult('');}} className={`py-3 rounded-xl flex flex-col items-center gap-1 transition-all ${activeTab === 'hashtag' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}>
                        <Hash size={18} /> <span className="text-[10px] font-bold">Tags</span>
                    </button>
                    <button onClick={() => {setActiveTab('idea'); setResult('');}} className={`py-3 rounded-xl flex flex-col items-center gap-1 transition-all ${activeTab === 'idea' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}>
                        <Lightbulb size={18} /> <span className="text-[10px] font-bold">Ideas</span>
                    </button>
                    <button onClick={() => {setActiveTab('reply'); setResult('');}} className={`py-3 rounded-xl flex flex-col items-center gap-1 transition-all ${activeTab === 'reply' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}>
                        <MessageSquare size={18} /> <span className="text-[10px] font-bold">Reply</span>
                    </button>
                    <button onClick={() => {setActiveTab('timing'); setResult('');}} className={`py-3 rounded-xl flex flex-col items-center gap-1 transition-all ${activeTab === 'timing' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}>
                        <Clock size={18} /> <span className="text-[10px] font-bold">Time</span>
                    </button>
                </div>

                <div className="space-y-4">
                    <textarea 
                        value={topic}
                        onChange={e => setTopic(e.target.value)}
                        placeholder={activeTab === 'reply' ? "Paste the comment you want to reply to..." : "Enter your Niche / Topic (e.g. Travel, Tech, Fitness)..."}
                        className="w-full bg-black/30 border border-white/10 rounded-xl p-4 text-white placeholder-gray-500 outline-none focus:border-blue-500 transition-colors resize-none min-h-[120px] text-sm leading-relaxed"
                    />
                    
                    <button 
                        onClick={handleGenerate}
                        disabled={loading || !topic}
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 shadow-lg shadow-blue-500/20"
                    >
                        {loading ? <RefreshCw className="animate-spin" /> : <><TrendingUp size={18} /> Generate Content</>}
                    </button>
                </div>

                {result && (
                    <div className="mt-8 pt-6 border-t border-white/10 animate-fade-in-up">
                        <h3 className="text-xs font-bold text-gray-500 uppercase mb-4 ml-1">AI Generated Result</h3>
                        {renderResult()}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SocialGrowth;
