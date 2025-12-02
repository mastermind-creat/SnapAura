
import React, { useState } from 'react';
import { TrendingUp, Hash, Clock, MessageSquare, RefreshCw, Copy, Lightbulb } from './Icons';
import { generateSocialContent } from '../services/geminiService';
import { showToast } from './Toast';

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

    return (
        <div className="space-y-4 animate-fade-in-up">
            <div className="glass-panel p-6 rounded-2xl border-t-4 border-blue-500">
                <div className="flex items-center gap-3 mb-4">
                    <div className="bg-blue-500/20 p-3 rounded-full text-blue-400"><TrendingUp size={24} /></div>
                    <h2 className="text-xl font-bold text-white">Growth Hub</h2>
                </div>

                <div className="grid grid-cols-4 gap-2 mb-6">
                    <button onClick={() => setActiveTab('hashtag')} className={`p-2 rounded-xl flex flex-col items-center gap-1 ${activeTab === 'hashtag' ? 'bg-blue-500 text-white' : 'bg-white/5 text-gray-400'}`}>
                        <Hash size={18} /> <span className="text-[9px] font-bold">Tags</span>
                    </button>
                    <button onClick={() => setActiveTab('idea')} className={`p-2 rounded-xl flex flex-col items-center gap-1 ${activeTab === 'idea' ? 'bg-blue-500 text-white' : 'bg-white/5 text-gray-400'}`}>
                        <Lightbulb size={18} /> <span className="text-[9px] font-bold">Ideas</span>
                    </button>
                    <button onClick={() => setActiveTab('reply')} className={`p-2 rounded-xl flex flex-col items-center gap-1 ${activeTab === 'reply' ? 'bg-blue-500 text-white' : 'bg-white/5 text-gray-400'}`}>
                        <MessageSquare size={18} /> <span className="text-[9px] font-bold">Reply</span>
                    </button>
                    <button onClick={() => setActiveTab('timing')} className={`p-2 rounded-xl flex flex-col items-center gap-1 ${activeTab === 'timing' ? 'bg-blue-500 text-white' : 'bg-white/5 text-gray-400'}`}>
                        <Clock size={18} /> <span className="text-[9px] font-bold">Time</span>
                    </button>
                </div>

                <div className="space-y-4">
                    <input 
                        value={topic}
                        onChange={e => setTopic(e.target.value)}
                        placeholder={activeTab === 'reply' ? "Paste comment to reply to..." : "Enter Niche / Topic (e.g. Travel, Tech)..."}
                        className="w-full bg-black/30 border border-white/10 rounded-xl p-4 text-white placeholder-gray-500 outline-none focus:border-blue-500"
                    />
                    
                    <button 
                        onClick={handleGenerate}
                        disabled={loading || !topic}
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
                    >
                        {loading ? <RefreshCw className="animate-spin" /> : 'Generate Magic'}
                    </button>
                </div>

                {result && (
                    <div className="mt-6 bg-white/5 p-4 rounded-xl border border-white/10 relative group">
                        <button 
                            onClick={() => {navigator.clipboard.writeText(result); showToast("Copied!", "success")}}
                            className="absolute top-2 right-2 p-2 bg-black/50 rounded-lg text-gray-400 hover:text-white transition-colors"
                        >
                            <Copy size={16} />
                        </button>
                        <div className="prose prose-invert prose-sm max-w-none text-gray-200 leading-relaxed whitespace-pre-wrap font-medium">
                            {result.split('||').map((line, i) => <p key={i} className="mb-2 last:mb-0">{line}</p>)}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SocialGrowth;
