
import React, { useState, useEffect } from 'react';
import { 
  Trophy, Activity, Shirt, Users, BarChart, CalendarCheck, 
  TrendingUp, Shield, Search, History, RefreshCw, ChevronRight, 
  AlertCircle, Star, ArrowRight 
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
    <div className="space-y-4 animate-fade-in-up pb-24">
      {/* Header */}
      <div className="glass-panel p-6 rounded-2xl border-t-4 border-green-500 relative overflow-hidden">
        <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
                <div className="bg-green-500/20 p-3 rounded-full text-green-400">
                    <Trophy size={24} />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-white">Football Intel Hub</h2>
                    <p className="text-xs text-gray-400">AI-Powered Stats & Analysis</p>
                </div>
            </div>
        </div>
        <div className="absolute -right-6 -bottom-6 opacity-10">
            <Activity size={140} />
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
          {[
              { id: 'live', label: 'Live Center', icon: Activity },
              { id: 'player', label: 'Player Scout', icon: Shirt },
              { id: 'fantasy', label: 'Fantasy AI', icon: Users },
              { id: 'accuracy', label: 'Reality Check', icon: History },
          ].map(tab => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id as FootballTab)}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                    activeTab === tab.id 
                    ? 'bg-green-500 text-black border-green-500 shadow-lg shadow-green-500/20' 
                    : 'bg-white/5 text-gray-400 border-white/5 hover:bg-white/10'
                }`}
              >
                  <tab.icon size={16} /> {tab.label}
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
        <div className="space-y-4 animate-fade-in-up">
            <div className="flex justify-between items-center px-1">
                <h3 className="text-sm font-bold text-gray-400 uppercase">Live / Recent Matches</h3>
                <button onClick={fetchLive} disabled={loading} className="text-green-400 hover:text-white transition-colors">
                    <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                </button>
            </div>
            
            {matches.length === 0 && !loading && (
                <div className="text-center py-8 text-gray-500 italic">No major live matches found right now.</div>
            )}

            {matches.map((m, i) => (
                <div key={i} className="glass-panel p-5 rounded-2xl border border-white/10 relative overflow-hidden group">
                    <div className="flex justify-between items-center mb-4">
                         <span className="text-xs font-bold bg-red-500 text-white px-2 py-0.5 rounded animate-pulse">
                             {m.status.includes('FT') ? 'Finished' : 'LIVE ' + m.status}
                         </span>
                         <span className="text-xs text-gray-400">{m.league || 'Football'}</span>
                    </div>
                    
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-lg font-black text-white w-1/3">{m.home}</span>
                        <div className="text-2xl font-mono text-green-400 font-bold bg-white/5 px-4 py-2 rounded-lg border border-white/5">
                            {m.score}
                        </div>
                        <span className="text-lg font-black text-white w-1/3 text-right">{m.away}</span>
                    </div>

                    <div className="bg-black/30 p-3 rounded-xl border border-white/5 mb-2">
                        <div className="flex items-center gap-2 mb-1">
                            <Activity size={14} className="text-green-400" />
                            <span className="text-xs font-bold text-green-400 uppercase">AI Commentary</span>
                        </div>
                        <p className="text-xs text-gray-300 leading-relaxed">{m.commentary}</p>
                    </div>
                    
                    <div className="text-[10px] text-gray-500 truncate">{m.events}</div>
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
        <div className="space-y-4 animate-fade-in-up">
            <div className="flex gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-3.5 text-gray-500" size={16} />
                    <input 
                        value={query} 
                        onChange={e => setQuery(e.target.value)}
                        placeholder="Search Player (e.g. Bukayo Saka)"
                        className="w-full bg-black/30 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:border-green-500 outline-none"
                    />
                </div>
                <button onClick={handleSearch} disabled={loading} className="bg-green-600 hover:bg-green-500 text-white px-4 rounded-xl font-bold active:scale-95 transition-all">
                    {loading ? <RefreshCw className="animate-spin" /> : <ArrowRight />}
                </button>
            </div>

            {data && (
                <div className="glass-panel p-5 rounded-2xl border-t-4 border-blue-500 animate-fade-in-up">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h2 className="text-2xl font-bold text-white">{data.name}</h2>
                            <p className="text-sm text-gray-400">{data.position} • {data.team}</p>
                        </div>
                        <div className="text-right">
                            <span className="text-[10px] text-gray-500 uppercase font-bold">Availability</span>
                            <div className={`text-xs font-bold px-2 py-1 rounded ${data.availability === 'Fit' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                {data.availability}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="bg-white/5 p-3 rounded-xl border border-white/5 text-center">
                            <span className="block text-xs text-gray-500 uppercase mb-1">Impact Score</span>
                            <div className={`text-3xl font-black ${data.impactScore >= 8 ? 'text-green-400' : 'text-yellow-400'}`}>
                                {data.impactScore}<span className="text-sm text-gray-500">/10</span>
                            </div>
                        </div>
                        <div className="bg-white/5 p-3 rounded-xl border border-white/5 text-center">
                            <span className="block text-xs text-gray-500 uppercase mb-1">Recent Form</span>
                            <div className="text-lg font-mono font-bold text-white tracking-widest">
                                {data.form}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 mb-4">
                        <div className="bg-black/30 p-2 rounded-lg text-center">
                            <span className="block text-[10px] text-gray-500">Goals</span>
                            <span className="block text-sm font-bold text-white">{data.stats?.goals || 0}</span>
                        </div>
                        <div className="bg-black/30 p-2 rounded-lg text-center">
                            <span className="block text-[10px] text-gray-500">Assists</span>
                            <span className="block text-sm font-bold text-white">{data.stats?.assists || 0}</span>
                        </div>
                        <div className="bg-black/30 p-2 rounded-lg text-center">
                            <span className="block text-[10px] text-gray-500">Mins</span>
                            <span className="block text-sm font-bold text-white">{data.stats?.mins || 0}</span>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div>
                            <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Strengths</h4>
                            <div className="flex flex-wrap gap-1">
                                {data.analysis?.strengths?.map((s: string, i: number) => (
                                    <span key={i} className="text-[10px] bg-blue-500/10 text-blue-300 px-2 py-1 rounded-full border border-blue-500/20">{s}</span>
                                ))}
                            </div>
                        </div>
                        <div>
                            <h4 className="text-xs font-bold text-gray-500 uppercase mb-1">Analysis</h4>
                            <p className="text-xs text-gray-300 bg-white/5 p-3 rounded-lg leading-relaxed border border-white/5">{data.analysis?.style}</p>
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

    if(loading) return <div className="text-center p-8 text-gray-500 animate-pulse">Scouting players...</div>;
    if(!tips) return <div className="text-center p-8 text-gray-500">Unable to load fantasy data.</div>;

    return (
        <div className="space-y-4 animate-fade-in-up">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Gameweek {tips.gameweek || 'Next'}</h3>
                <span className="text-[10px] text-gray-500">AI Suggested</span>
            </div>

            {/* Captain Pick */}
            <div className="bg-gradient-to-r from-yellow-600/20 to-orange-600/20 border border-yellow-500/30 p-4 rounded-2xl relative overflow-hidden">
                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-2 text-yellow-400 font-bold text-xs uppercase">
                        <Star size={14} fill="currentColor" /> Captain Choice
                    </div>
                    <h2 className="text-2xl font-black text-white mb-1">{tips.captain?.name}</h2>
                    <p className="text-xs text-gray-300 leading-relaxed max-w-[90%]">{tips.captain?.reason}</p>
                </div>
                <Users size={100} className="absolute -right-4 -bottom-4 text-yellow-500/10" />
            </div>

            {/* Top Picks */}
            <div>
                <h4 className="text-xs font-bold text-green-400 uppercase mb-2 ml-1">Safe Picks (High Ownership)</h4>
                <div className="space-y-2">
                    {tips.topPicks?.map((p: any, i: number) => (
                        <div key={i} className="glass-panel p-3 rounded-xl flex items-center justify-between border border-white/5">
                            <div>
                                <div className="font-bold text-white text-sm">{p.name}</div>
                                <div className="text-[10px] text-gray-500">{p.team}</div>
                            </div>
                            <div className="text-right">
                                <div className="text-[10px] text-green-400 font-bold">{p.expectedPoints} pts</div>
                                <div className="text-[9px] text-gray-500">Exp.</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Value & Differentials */}
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <h4 className="text-xs font-bold text-blue-400 uppercase mb-2 ml-1">Value Gems</h4>
                    <div className="space-y-2">
                        {tips.valuePicks?.map((p: any, i: number) => (
                            <div key={i} className="bg-white/5 p-3 rounded-xl border border-white/5">
                                <div className="font-bold text-white text-xs">{p.name}</div>
                                <div className="flex justify-between mt-1">
                                    <span className="text-[9px] text-gray-500">{p.cost}</span>
                                    <span className="text-[9px] text-blue-300 font-bold">{p.valueRating}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div>
                    <h4 className="text-xs font-bold text-purple-400 uppercase mb-2 ml-1">High Risk</h4>
                    <div className="space-y-2">
                        {tips.differentials?.map((p: any, i: number) => (
                            <div key={i} className="bg-white/5 p-3 rounded-xl border border-white/5">
                                <div className="font-bold text-white text-xs">{p.name}</div>
                                <div className="flex justify-between mt-1">
                                    <span className="text-[9px] text-gray-500">{p.ownership}</span>
                                    <span className="text-[9px] text-purple-300 font-bold">{p.riskLevel}</span>
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
        <div className="space-y-4 animate-fade-in-up">
            <div className="p-4 bg-white/5 rounded-xl border border-white/10 text-center">
                <h3 className="text-lg font-bold text-white">Yesterday's Reality Check</h3>
                <p className="text-xs text-gray-400">Did the AI see it coming?</p>
            </div>

            {loading && <div className="text-center p-8 text-gray-500 animate-pulse">Analyzing past timelines...</div>}

            {reviews.map((r, i) => (
                <div key={i} className="glass-panel p-5 rounded-2xl border-l-4 relative overflow-hidden group" style={{
                    borderColor: r.accuracyScore > 75 ? '#4ade80' : r.accuracyScore > 40 ? '#facc15' : '#f87171'
                }}>
                    <div className="flex justify-between items-start mb-3">
                        <span className="font-bold text-white">{r.match}</span>
                        <div className={`text-xs font-black px-2 py-1 rounded ${
                            r.accuracyScore > 75 ? 'bg-green-500/20 text-green-400' : 
                            r.accuracyScore > 40 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'
                        }`}>
                            {r.accuracyScore}% Accurate
                        </div>
                    </div>
                    
                    <div className="flex gap-4 mb-3 text-xs bg-black/20 p-2 rounded-lg">
                        <div className="flex-1 border-r border-white/10 pr-2">
                            <span className="block text-gray-500 uppercase font-bold text-[9px] mb-1">Prediction</span>
                            <span className="text-gray-300 font-medium">{r.prediction}</span>
                        </div>
                        <div className="flex-1 pl-2">
                            <span className="block text-gray-500 uppercase font-bold text-[9px] mb-1">Actual</span>
                            <span className="text-white font-bold">{r.result}</span>
                        </div>
                    </div>

                    <div className="text-xs text-gray-400 leading-relaxed border-t border-white/5 pt-2 mt-2">
                        <span className="font-bold text-gray-300">Why:</span> {r.reasoning}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default FootballHub;
