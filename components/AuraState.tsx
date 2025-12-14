
import React, { useState, useEffect } from 'react';
import { Globe, Activity, Thermometer, Newspaper, Rocket, RefreshCw, TrendingUp } from './Icons';
import { calculateAuraState, getAuraHistory } from '../services/auraStateService';
import { showToast } from './Toast';

const AuraState: React.FC = () => {
    const [state, setState] = useState<any>(null);
    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        refresh();
    }, []);

    const refresh = async () => {
        setLoading(true);
        try {
            const data = await calculateAuraState();
            setState(data);
            setHistory(getAuraHistory());
            if(navigator.vibrate) navigator.vibrate(50);
        } catch (e) {
            showToast("Failed to sense world pulse", "error");
        } finally {
            setLoading(false);
        }
    };

    // Color mapping based on score
    const getOrbColor = (score: number) => {
        if (score <= 20) return { from: '#3b82f6', to: '#60a5fa', shadow: 'rgba(59, 130, 246, 0.5)' }; // Blue
        if (score <= 40) return { from: '#10b981', to: '#34d399', shadow: 'rgba(16, 185, 129, 0.5)' }; // Green
        if (score <= 60) return { from: '#eab308', to: '#facc15', shadow: 'rgba(234, 179, 8, 0.5)' }; // Yellow
        if (score <= 80) return { from: '#f97316', to: '#fb923c', shadow: 'rgba(249, 115, 22, 0.5)' }; // Orange
        return { from: '#ef4444', to: '#f87171', shadow: 'rgba(239, 68, 68, 0.5)' }; // Red
    };

    if (!state) return (
        <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-4">
            <Globe className="animate-pulse text-blue-400" size={48} />
            <p className="text-gray-500 font-bold animate-pulse">Initializing World Pulse...</p>
        </div>
    );

    const colors = getOrbColor(state.score);

    return (
        <div className="space-y-6 animate-fade-in-up pb-24">
            {/* Header / Orb Section */}
            <div className="bg-[#292d3e] shadow-neu p-8 rounded-3xl relative overflow-hidden flex flex-col items-center justify-center min-h-[300px]">
                <div className="absolute top-4 right-4 z-20">
                    <button onClick={refresh} disabled={loading} className="p-2 bg-[#292d3e] shadow-neu rounded-full text-gray-400 hover:text-white active:shadow-neu-pressed transition-all">
                        <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
                    </button>
                </div>

                {/* The Orb */}
                <div className="relative mb-6">
                    <div 
                        className="w-40 h-40 rounded-full blur-2xl absolute inset-0 animate-pulse-slow"
                        style={{ background: colors.shadow }}
                    ></div>
                    <div 
                        className="w-40 h-40 rounded-full relative z-10 flex items-center justify-center shadow-2xl border border-white/10"
                        style={{ 
                            background: `radial-gradient(circle at 30% 30%, ${colors.to}, ${colors.from})`,
                            boxShadow: `0 0 50px ${colors.shadow}`
                        }}
                    >
                        <span className="text-4xl font-black text-white drop-shadow-md">{state.score}</span>
                    </div>
                </div>

                <div className="text-center z-10">
                    <h2 className="text-2xl font-black text-gray-200 tracking-tight uppercase">{state.label}</h2>
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">Global Mood Index</p>
                    <p className="text-xs text-gray-400 mt-4 max-w-xs mx-auto italic">"{state.breakdown.intel.summary}"</p>
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#292d3e] shadow-neu p-4 rounded-2xl border-l-2 border-blue-400">
                    <div className="flex items-center gap-2 mb-2 text-blue-400">
                        <Newspaper size={16} />
                        <span className="text-[10px] font-bold uppercase">News</span>
                    </div>
                    <div className="text-2xl font-black text-white">{state.breakdown.intel.newsStress}<span className="text-sm text-gray-600 font-medium">/100</span></div>
                    <p className="text-[9px] text-gray-500 mt-1 truncate">Chaos Level</p>
                </div>
                <div className="bg-[#292d3e] shadow-neu p-4 rounded-2xl border-l-2 border-green-400">
                    <div className="flex items-center gap-2 mb-2 text-green-400">
                        <TrendingUp size={16} />
                        <span className="text-[10px] font-bold uppercase">Markets</span>
                    </div>
                    <div className="text-2xl font-black text-white">{Math.round(state.breakdown.market.stress)}<span className="text-sm text-gray-600 font-medium">/100</span></div>
                    <p className="text-[9px] text-gray-500 mt-1 truncate">{state.breakdown.market.label}</p>
                </div>
                <div className="bg-[#292d3e] shadow-neu p-4 rounded-2xl border-l-2 border-yellow-400">
                    <div className="flex items-center gap-2 mb-2 text-yellow-400">
                        <Thermometer size={16} />
                        <span className="text-[10px] font-bold uppercase">Weather</span>
                    </div>
                    <div className="text-2xl font-black text-white">{state.breakdown.weather.temp}°<span className="text-sm text-gray-600 font-medium">C</span></div>
                    <p className="text-[9px] text-gray-500 mt-1 truncate">Stress: {state.breakdown.weather.stress}</p>
                </div>
                <div className="bg-[#292d3e] shadow-neu p-4 rounded-2xl border-l-2 border-purple-400">
                    <div className="flex items-center gap-2 mb-2 text-purple-400">
                        <Rocket size={16} />
                        <span className="text-[10px] font-bold uppercase">Space</span>
                    </div>
                    <div className="text-2xl font-black text-white">{state.breakdown.intel.spaceStress}<span className="text-sm text-gray-600 font-medium">/100</span></div>
                    <p className="text-[9px] text-gray-500 mt-1 truncate">Solar Activity</p>
                </div>
            </div>

            {/* Headlines */}
            <div className="bg-[#292d3e] shadow-neu p-6 rounded-2xl">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Activity size={14}/> Top Signals
                </h3>
                <div className="space-y-3">
                    {state.breakdown.intel.headlines?.slice(0, 3).map((h: string, i: number) => (
                        <div key={i} className="text-xs text-gray-300 font-medium border-b border-white/5 pb-2 last:border-0">
                            • {h}
                        </div>
                    ))}
                    {(!state.breakdown.intel.headlines || state.breakdown.intel.headlines.length === 0) && (
                        <div className="text-xs text-gray-500 italic">No significant signals detected.</div>
                    )}
                </div>
            </div>

            {/* History Mini-Chart (CSS Bars) */}
            <div className="bg-[#292d3e] shadow-neu p-6 rounded-2xl">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Mood Trend (Last 7 Checks)</h3>
                <div className="flex items-end justify-between h-24 gap-2">
                    {history.slice(0, 7).reverse().map((h, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                            <div 
                                className="w-full rounded-t-lg transition-all hover:opacity-80 relative"
                                style={{ 
                                    height: `${h.score}%`, 
                                    background: getOrbColor(h.score).from 
                                }}
                            >
                                <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-black/80 text-[9px] text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                                    {h.score} - {new Date(h.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                                </div>
                            </div>
                        </div>
                    ))}
                    {history.length === 0 && <div className="text-xs text-gray-500 w-full text-center mt-8">No history yet.</div>}
                </div>
            </div>
        </div>
    );
};

export default AuraState;
