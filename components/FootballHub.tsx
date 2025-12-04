
import React, { useState, useEffect } from 'react';
import { 
  Trophy, Activity, Shirt, Users, BarChart, CalendarCheck, 
  TrendingUp, TrendingDown, Shield, Search, History, RefreshCw, ChevronRight, 
  AlertCircle, Star, ArrowRight, User 
} from './Icons';
import { 
  getLiveMatchDetails, 
  analyzePlayerPerformance, 
  getFantasyTips, 
  getYesterdayAccuracy 
} from '../services/geminiService';
import { showToast } from './Toast';

// Access marked from global scope
declare const marked: any;

type FootballTab = 'live' | 'player' | 'fantasy' | 'accuracy';

const FootballHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<FootballTab>('live');

  return (
    <div className="space-y-6 animate-fade-in-up pb-24">
      {/* Header */}
      <div className="bg-[#292d3e] shadow-neu p-6 rounded-3xl relative overflow-hidden">
        <div className="relative z-10 flex items-center gap-4">
            <div className="bg-[#292d3e] shadow-neu-pressed p-4 rounded-full text-green-400">
                <Trophy size={28} />
            </div>
            <div>
                <h2 className="text-2xl font-black text-gray-200 tracking-tight">Football Intel</h2>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mt-1">AI-Powered Analytics</p>
            </div>
        </div>
        <div className="absolute -right-8 -bottom-8 opacity-[0.03] text-green-400 rotate-12">
            <Activity size={180} />
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-[#292d3e] shadow-neu-pressed p-1.5 rounded-2xl flex gap-2 overflow-x-auto hide-scrollbar">
          {[
              { id: 'live', label: 'Live', icon: Activity },
              { id: 'player', label: 'Scout', icon: Shirt },
              { id: 'fantasy', label: 'Fantasy', icon: Users },
              { id: 'accuracy', label: 'Review', icon: History },
          ].map(tab => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id as FootballTab)}
                className={`flex-1 flex flex-col items-center gap-1 py-3 px-2 rounded-xl text-[10px] font-bold uppercase transition-all min-w-[70px] ${
                    activeTab === tab.id 
                    ? 'bg-[#292d3e] text-green-400 shadow-neu' 
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                  <tab.icon size={18} className="mb-0.5" /> {tab.label}
              </button>
          ))}
      </div>

      {/* Content Rendering */}
      <div className="min-h-[300px]">
          {activeTab === 'live' && <LiveTracker />}
          {activeTab === 'player' && <PlayerAnalyzer />}
          {activeTab === 'fantasy' && <FantasyOptimizer />}
          {activeTab === 'accuracy' && <AccuracyReview />}
      </div>
    </div>
  );
};

// Helper: Safely render text that might be returned as an object/array by AI
const renderSafe = (content: any) => {
    if (typeof content === 'string') return content;
    if (typeof content === 'number') return String(content);
    if (Array.isArray(content)) return content.join(', ');
    if (typeof content === 'object' && content !== null) {
        return (
            <div className="flex flex-col gap-1">
                {Object.entries(content).map(([k, v]) => (
                    <span key={k}>
                        <strong className="text-gray-400">{k}:</strong> {String(v)}
                    </span>
                ))}
            </div>
        );
    }
    return '';
};

// --- 1. Live Match Tracker ---
const LiveTracker = () => {
    const [matches, setMatches] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => { fetchLive(); }, []);

    const fetchLive = async () => {
        setLoading(true);
        try {
            const data = await getLiveMatchDetails();
            setMatches(Array.isArray(data) ? data : []);
        } catch(e) { showToast("Failed to fetch live data", "error"); }
        finally { setLoading(false); }
    };

    return (
        <div className="space-y-6 animate-fade-in-up">
            <div className="flex justify-between items-center px-2">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div> Live Center
                </h3>
                <button onClick={fetchLive} disabled={loading} className="text-green-400 hover:text-white transition-colors bg-[#292d3e] shadow-neu p-2.5 rounded-xl active:shadow-neu-pressed">
                    <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                </button>
            </div>
            
            {matches.length === 0 && !loading && (
                <div className="text-center py-12 text-gray-500 italic bg-[#292d3e] shadow-neu rounded-3xl p-6">
                    <p className="font-medium">No major live matches found right now.</p>
                    <button onClick={fetchLive} className="mt-4 text-xs font-bold text-green-400">Retry Refresh</button>
                </div>
            )}

            {matches.map((m, i) => (
                <div key={i} className="bg-[#292d3e] shadow-neu p-6 rounded-3xl relative overflow-hidden group">
                    <div className="flex justify-between items-center mb-6">
                         <span className="text-[9px] font-black bg-[#292d3e] shadow-neu-pressed text-red-400 px-3 py-1.5 rounded-lg uppercase tracking-widest">
                             {m.status.includes('FT') ? 'Finished' : m.status}
                         </span>
                         <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wide">{m.league || 'Matchday'}</span>
                    </div>
                    
                    <div className="flex justify-between items-center mb-8 px-2">
                        <div className="text-left w-1/3">
                            <span className="text-lg font-black text-gray-200 block leading-tight">{m.home}</span>
                        </div>
                        <div className="text-3xl font-mono text-green-400 font-bold bg-[#292d3e] shadow-neu-pressed px-5 py-3 rounded-2xl tracking-widest">
                            {m.score}
                        </div>
                        <div className="text-right w-1/3">
                            <span className="text-lg font-black text-gray-200 block leading-tight">{m.away}</span>
                        </div>
                    </div>

                    <div className="bg-[#292d3e] shadow-neu-pressed p-5 rounded-2xl mb-4 border-l-4 border-green-400">
                        <div className="flex items-center gap-2 mb-3">
                            <Activity size={16} className="text-green-400" />
                            <span className="text-xs font-bold text-green-400 uppercase tracking-wide">AI Insight</span>
                        </div>
                        <div className="text-xs text-gray-300 leading-relaxed font-medium">
                            {typeof m.commentary === 'string' ? (
                                <div 
                                    className="prose prose-invert prose-sm max-w-none [&>p]:mb-2 [&>strong]:text-green-400 [&>strong]:font-black"
                                    dangerouslySetInnerHTML={{ __html: typeof marked !== 'undefined' ? marked.parse(m.commentary) : m.commentary }}
                                />
                            ) : (
                                renderSafe(m.commentary)
                            )}
                        </div>
                    </div>
                    
                    <div className="text-[10px] text-gray-500 font-mono px-2">
                        <span className="font-bold uppercase text-gray-600 mr-2">Events:</span>
                        {renderSafe(m.events)}
                    </div>
                </div>
            ))}
        </div>
    );
};

// --- 2. Player Analyzer ---
const PlayerAnalyzer = () => {
    const [query, setQuery] = useState('');
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const handleSearch = async () => {
        if(!query) return;
        setLoading(true);
        setData(null);
        try {
            const res = await analyzePlayerPerformance(query);
            setData(res);
        } catch(e) { showToast("Analysis failed", "error"); }
        finally { setLoading(false); }
    };

    return (
        <div className="space-y-6 animate-fade-in-up">
            <div className="flex gap-4">
                <div className="relative flex-1 group">
                    <div className="absolute inset-0 bg-[#292d3e] rounded-2xl shadow-neu-pressed pointer-events-none"></div>
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 z-10" size={18} />
                    <input 
                        value={query} 
                        onChange={e => setQuery(e.target.value)}
                        placeholder="Player Name (e.g. Haaland)"
                        className="w-full bg-transparent rounded-2xl pl-12 pr-4 py-4 text-gray-200 focus:outline-none relative z-10 text-sm font-bold placeholder-gray-600"
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    />
                </div>
                <button 
                    onClick={handleSearch} 
                    disabled={loading} 
                    className="bg-[#292d3e] shadow-neu text-green-400 w-14 rounded-2xl font-bold active:shadow-neu-pressed transition-all flex items-center justify-center hover:scale-105 active:scale-95"
                >
                    {loading ? <RefreshCw className="animate-spin" /> : <ArrowRight size={20} />}
                </button>
            </div>

            {data && (
                <div className="bg-[#292d3e] shadow-neu p-6 rounded-3xl animate-fade-in-up space-y-6">
                    {/* Player Header */}
                    <div className="flex items-center gap-4 border-b border-white/5 pb-6">
                        <div className="w-16 h-16 rounded-2xl bg-[#292d3e] shadow-neu flex items-center justify-center text-gray-400">
                            <User size={32} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-gray-200 tracking-tight leading-none">{data.name}</h2>
                            <p className="text-xs text-green-400 font-bold uppercase mt-1">{data.position} • {data.team}</p>
                        </div>
                    </div>

                    {/* Scores Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-[#292d3e] shadow-neu-pressed p-4 rounded-2xl text-center flex flex-col justify-center h-28">
                            <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-2">Impact Score</span>
                            <div className="flex items-end justify-center gap-1">
                                <span className={`text-4xl font-black ${data.impactScore >= 8 ? 'text-green-400' : 'text-yellow-400'}`}>
                                    {data.impactScore}
                                </span>
                                <span className="text-xs text-gray-600 font-bold mb-1">/10</span>
                            </div>
                        </div>
                        <div className="bg-[#292d3e] shadow-neu-pressed p-4 rounded-2xl text-center flex flex-col justify-center h-28">
                            <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-2">Availability</span>
                            <div className={`text-lg font-black uppercase ${data.availability === 'Fit' ? 'text-green-400' : 'text-red-400'}`}>
                                {data.availability}
                            </div>
                            <span className="text-[10px] text-gray-600 font-mono mt-1">Form: {data.form}</span>
                        </div>
                    </div>

                    {/* Stats Row */}
                    <div className="flex justify-between bg-[#292d3e] shadow-neu p-2 rounded-2xl">
                        <div className="flex-1 text-center py-2 border-r border-[#1e212d]">
                            <span className="block text-[9px] text-gray-500 uppercase font-bold">Goals</span>
                            <span className="block text-xl font-black text-gray-200 mt-1">{data.stats?.goals || 0}</span>
                        </div>
                        <div className="flex-1 text-center py-2 border-r border-[#1e212d]">
                            <span className="block text-[9px] text-gray-500 uppercase font-bold">Assists</span>
                            <span className="block text-xl font-black text-gray-200 mt-1">{data.stats?.assists || 0}</span>
                        </div>
                        <div className="flex-1 text-center py-2">
                            <span className="block text-[9px] text-gray-500 uppercase font-bold">Mins</span>
                            <span className="block text-xl font-black text-gray-200 mt-1">{data.stats?.mins || 0}</span>
                        </div>
                    </div>

                    {/* Analysis Section */}
                    <div className="space-y-4 pt-2">
                        <div>
                            <h4 className="text-[10px] text-gray-500 uppercase font-bold mb-3 tracking-wider ml-1">Key Strengths</h4>
                            <div className="flex flex-wrap gap-2">
                                {data.analysis?.strengths?.map((s: string, i: number) => (
                                    <span key={i} className="text-[10px] bg-[#292d3e] shadow-neu text-blue-400 px-3 py-1.5 rounded-lg font-bold border border-blue-400/10">
                                        {s}
                                    </span>
                                ))}
                            </div>
                        </div>
                        <div>
                            <h4 className="text-[10px] text-gray-500 uppercase font-bold mb-3 tracking-wider ml-1">Scout Report</h4>
                            <p className="text-xs text-gray-300 bg-[#292d3e] shadow-neu-pressed p-5 rounded-2xl leading-relaxed font-medium">
                                {renderSafe(data.analysis?.style)}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// --- 3. Fantasy Optimizer ---
const FantasyOptimizer = () => {
    const [tips, setTips] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    
    useEffect(() => {
        const fetchTips = async () => {
            setLoading(true);
            try { setTips(await getFantasyTips()); }
            catch(e) { /* silent fail */ }
            finally { setLoading(false); }
        };
        fetchTips();
    }, []);

    if(loading) return <div className="text-center p-12 text-gray-500 animate-pulse bg-[#292d3e] shadow-neu rounded-3xl m-4 font-bold">Analysing fixtures & form...</div>;
    if(!tips) return <div className="text-center p-12 text-gray-500 bg-[#292d3e] shadow-neu rounded-3xl m-4 font-bold">Unable to load fantasy data.</div>;

    return (
        <div className="space-y-8 animate-fade-in-up">
            <div className="flex items-center justify-between px-2">
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">GW {tips.gameweek || 'Next'}</h3>
                <span className="text-[9px] text-green-400 font-bold bg-[#292d3e] shadow-neu px-3 py-1 rounded-lg uppercase tracking-wide">
                    AI Active
                </span>
            </div>

            {/* Captain Pick */}
            <div className="bg-[#292d3e] shadow-neu p-6 rounded-3xl relative overflow-hidden group border border-yellow-400/10">
                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-4 text-yellow-400 font-black text-[10px] uppercase tracking-widest">
                        <div className="bg-yellow-400/10 p-1.5 rounded-lg"><Star size={14} fill="currentColor" /></div>
                        Essential Captain
                    </div>
                    <h2 className="text-3xl font-black text-gray-200 mb-3 tracking-tight">{tips.captain?.name}</h2>
                    <p className="text-xs text-gray-400 leading-relaxed font-medium bg-[#292d3e]/50 p-3 rounded-xl border-l-2 border-yellow-400">
                        {tips.captain?.reason}
                    </p>
                </div>
                <div className="absolute -right-8 -bottom-8 text-[#292d3e] drop-shadow-md opacity-[0.04] rotate-12 pointer-events-none">
                    <Users size={180} className="text-gray-800" />
                </div>
            </div>

            {/* Top Picks */}
            <div>
                <h4 className="text-[10px] font-black text-green-400 uppercase mb-4 ml-2 tracking-widest">Safe Picks</h4>
                <div className="grid gap-4">
                    {tips.topPicks?.map((p: any, i: number) => (
                        <div key={i} className="bg-[#292d3e] shadow-neu p-4 rounded-2xl flex items-center justify-between active:scale-[0.99] transition-transform">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-[#292d3e] shadow-neu-pressed flex items-center justify-center text-xs font-bold text-gray-500">
                                    {i+1}
                                </div>
                                <div>
                                    <div className="font-bold text-gray-200 text-sm">{p.name}</div>
                                    <div className="text-[10px] text-gray-500 font-bold uppercase">{p.team}</div>
                                </div>
                            </div>
                            <div className="text-right bg-[#292d3e] shadow-neu px-3 py-2 rounded-xl">
                                <div className="text-xs text-green-400 font-black">{p.expectedPoints}</div>
                                <div className="text-[9px] text-gray-500 uppercase font-bold">Proj Pts</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Value & Differentials Grid */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#292d3e] shadow-neu p-4 rounded-2xl">
                    <h4 className="text-[10px] font-black text-blue-400 uppercase mb-4 tracking-widest text-center">Value Gems</h4>
                    <div className="space-y-4">
                        {tips.valuePicks?.map((p: any, i: number) => (
                            <div key={i} className="border-b border-gray-800 pb-2 last:border-0 last:pb-0">
                                <div className="font-bold text-gray-200 text-xs truncate">{p.name}</div>
                                <div className="flex justify-between mt-1 items-center">
                                    <span className="text-[9px] text-gray-500 font-mono">{p.cost}</span>
                                    <span className="text-[9px] text-blue-400 font-black bg-[#292d3e] shadow-neu-pressed px-2 py-0.5 rounded">{p.valueRating}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="bg-[#292d3e] shadow-neu p-4 rounded-2xl">
                    <h4 className="text-[10px] font-black text-purple-400 uppercase mb-4 tracking-widest text-center">High Risk</h4>
                    <div className="space-y-4">
                        {tips.differentials?.map((p: any, i: number) => (
                            <div key={i} className="border-b border-gray-800 pb-2 last:border-0 last:pb-0">
                                <div className="font-bold text-gray-200 text-xs truncate">{p.name}</div>
                                <div className="flex justify-between mt-1 items-center">
                                    <span className="text-[9px] text-gray-500">{p.ownership}</span>
                                    <span className="text-[9px] text-purple-400 font-black">{p.riskLevel}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- 4. Accuracy Review ---
const AccuracyReview = () => {
    const [reviews, setReviews] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try { setReviews(await getYesterdayAccuracy()); }
            catch(e) {} finally { setLoading(false); }
        }
        load();
    }, []);

    return (
        <div className="space-y-6 animate-fade-in-up">
            <div className="p-8 bg-[#292d3e] shadow-neu rounded-3xl text-center mb-4">
                <h3 className="text-xl font-black text-gray-200">Reality Check</h3>
                <p className="text-xs text-gray-500 font-bold uppercase mt-2">Did the AI predict correctly?</p>
            </div>

            {loading && <div className="text-center p-8 text-gray-500 animate-pulse bg-[#292d3e] shadow-neu rounded-2xl font-bold">Analyzing match timelines...</div>}

            {reviews.map((r, i) => (
                <div key={i} className="bg-[#292d3e] shadow-neu p-6 rounded-3xl relative overflow-hidden group">
                    <div className="flex justify-between items-start mb-6">
                        <span className="font-bold text-gray-200 text-lg">{r.match}</span>
                        <div className={`text-[10px] font-black px-3 py-1.5 rounded-lg shadow-neu-pressed uppercase tracking-wider ${
                            r.accuracyScore > 75 ? 'text-green-400' : 
                            r.accuracyScore > 40 ? 'text-yellow-400' : 'text-red-400'
                        }`}>
                            {r.accuracyScore}% Accurate
                        </div>
                    </div>
                    
                    <div className="bg-[#292d3e] shadow-neu-pressed p-1 rounded-2xl flex text-xs mb-5">
                        <div className="flex-1 p-3 text-center border-r border-[#1e212d]">
                            <span className="block text-gray-500 uppercase font-black text-[9px] mb-1 tracking-wider">Prediction</span>
                            <span className="text-gray-300 font-bold block">{r.prediction}</span>
                        </div>
                        <div className="flex-1 p-3 text-center">
                            <span className="block text-gray-500 uppercase font-black text-[9px] mb-1 tracking-wider">Actual</span>
                            <span className="text-white font-black block">{r.result}</span>
                        </div>
                    </div>

                    <div className="text-xs text-gray-400 leading-relaxed pl-3 border-l-2 border-gray-700">
                        <span className="font-bold text-gray-300 mr-1">Why:</span>{r.reasoning}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default FootballHub;
