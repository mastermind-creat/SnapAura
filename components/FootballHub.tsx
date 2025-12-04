
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
    <div className="space-y-6 animate-fade-in-up pb-24">
      {/* Header */}
      <div className="bg-[#292d3e] shadow-neu p-6 rounded-2xl relative overflow-hidden">
        <div className="relative z-10 flex items-center gap-3">
            <div className="bg-[#292d3e] shadow-neu-pressed p-3 rounded-full text-green-400">
                <Trophy size={24} />
            </div>
            <div>
                <h2 className="text-xl font-bold text-gray-200">Football Intel</h2>
                <p className="text-xs text-gray-500">AI-Powered Stats & Analysis</p>
            </div>
        </div>
        <div className="absolute -right-6 -bottom-6 opacity-5 text-green-400">
            <Activity size={140} />
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-3 overflow-x-auto pb-4 hide-scrollbar px-1">
          {[
              { id: 'live', label: 'Live Center', icon: Activity },
              { id: 'player', label: 'Player Scout', icon: Shirt },
              { id: 'fantasy', label: 'Fantasy AI', icon: Users },
              { id: 'accuracy', label: 'Reality Check', icon: History },
          ].map(tab => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id as FootballTab)}
                className={`flex items-center gap-2 px-5 py-4 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    activeTab === tab.id 
                    ? 'bg-[#292d3e] text-green-400 shadow-neu-pressed' 
                    : 'bg-[#292d3e] text-gray-500 shadow-neu'
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
        <div className="space-y-6 animate-fade-in-up">
            <div className="flex justify-between items-center px-2">
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Live / Recent Matches</h3>
                <button onClick={fetchLive} disabled={loading} className="text-green-400 hover:text-white transition-colors bg-[#292d3e] shadow-neu p-2 rounded-full active:shadow-neu-pressed">
                    <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                </button>
            </div>
            
            {matches.length === 0 && !loading && (
                <div className="text-center py-8 text-gray-500 italic bg-[#292d3e] shadow-neu rounded-2xl p-6">No major live matches found right now.</div>
            )}

            {matches.map((m, i) => (
                <div key={i} className="bg-[#292d3e] shadow-neu p-6 rounded-2xl relative overflow-hidden group">
                    <div className="flex justify-between items-center mb-6">
                         <span className="text-[10px] font-bold bg-[#292d3e] shadow-neu-pressed text-red-400 px-3 py-1 rounded-full uppercase tracking-wider">
                             {m.status.includes('FT') ? 'Finished' : 'LIVE ' + m.status}
                         </span>
                         <span className="text-xs text-gray-500 font-bold">{m.league || 'Football'}</span>
                    </div>
                    
                    <div className="flex justify-between items-center mb-6">
                        <span className="text-lg font-black text-gray-200 w-1/3 break-words">{m.home}</span>
                        <div className="text-2xl font-mono text-green-400 font-bold bg-[#292d3e] shadow-neu-pressed px-4 py-2 rounded-xl">
                            {m.score}
                        </div>
                        <span className="text-lg font-black text-gray-200 w-1/3 text-right break-words">{m.away}</span>
                    </div>

                    <div className="bg-[#292d3e] shadow-neu-pressed p-4 rounded-xl mb-3">
                        <div className="flex items-center gap-2 mb-2">
                            <Activity size={14} className="text-green-400" />
                            <span className="text-xs font-bold text-green-400 uppercase">AI Commentary</span>
                        </div>
                        <p className="text-xs text-gray-400 leading-relaxed">{m.commentary}</p>
                    </div>
                    
                    <div className="text-[10px] text-gray-600 truncate px-1">{m.events}</div>
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
            <div className="flex gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-4 text-gray-500" size={18} />
                    <input 
                        value={query} 
                        onChange={e => setQuery(e.target.value)}
                        placeholder="Search Player (e.g. Saka)"
                        className="w-full bg-[#292d3e] shadow-neu-pressed rounded-xl pl-12 pr-4 py-4 text-gray-200 focus:outline-none"
                    />
                </div>
                <button onClick={handleSearch} disabled={loading} className="bg-[#292d3e] shadow-neu text-green-400 px-5 rounded-xl font-bold active:shadow-neu-pressed transition-all">
                    {loading ? <RefreshCw className="animate-spin" /> : <ArrowRight />}
                </button>
            </div>

            {data && (
                <div className="bg-[#292d3e] shadow-neu p-6 rounded-2xl animate-fade-in-up">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-200">{data.name}</h2>
                            <p className="text-sm text-gray-500 font-medium">{data.position} • {data.team}</p>
                        </div>
                        <div className="text-right">
                            <span className="text-[10px] text-gray-500 uppercase font-bold block mb-1">Status</span>
                            <div className={`text-xs font-bold px-3 py-1 rounded-full shadow-neu-pressed inline-block ${data.availability === 'Fit' ? 'text-green-400' : 'text-red-400'}`}>
                                {data.availability}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="bg-[#292d3e] shadow-neu-pressed p-4 rounded-xl text-center">
                            <span className="block text-xs text-gray-500 uppercase mb-2 font-bold">Impact Score</span>
                            <div className={`text-3xl font-black ${data.impactScore >= 8 ? 'text-green-400' : 'text-yellow-400'}`}>
                                {data.impactScore}<span className="text-sm text-gray-600">/10</span>
                            </div>
                        </div>
                        <div className="bg-[#292d3e] shadow-neu-pressed p-4 rounded-xl text-center">
                            <span className="block text-xs text-gray-500 uppercase mb-2 font-bold">Recent Form</span>
                            <div className="text-lg font-mono font-bold text-gray-200 tracking-widest">
                                {data.form}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3 mb-6">
                        <div className="bg-[#292d3e] shadow-neu p-3 rounded-xl text-center">
                            <span className="block text-[10px] text-gray-500 uppercase font-bold">Goals</span>
                            <span className="block text-lg font-bold text-gray-200">{data.stats?.goals || 0}</span>
                        </div>
                        <div className="bg-[#292d3e] shadow-neu p-3 rounded-xl text-center">
                            <span className="block text-[10px] text-gray-500 uppercase font-bold">Assists</span>
                            <span className="block text-lg font-bold text-gray-200">{data.stats?.assists || 0}</span>
                        </div>
                        <div className="bg-[#292d3e] shadow-neu p-3 rounded-xl text-center">
                            <span className="block text-[10px] text-gray-500 uppercase font-bold">Mins</span>
                            <span className="block text-lg font-bold text-gray-200">{data.stats?.mins || 0}</span>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Strengths</h4>
                            <div className="flex flex-wrap gap-2">
                                {data.analysis?.strengths?.map((s: string, i: number) => (
                                    <span key={i} className="text-[10px] bg-[#292d3e] shadow-neu text-blue-400 px-3 py-1.5 rounded-full font-bold">{s}</span>
                                ))}
                            </div>
                        </div>
                        <div>
                            <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Analysis</h4>
                            <p className="text-xs text-gray-400 bg-[#292d3e] shadow-neu-pressed p-4 rounded-xl leading-relaxed">{data.analysis?.style}</p>
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

    if(loading) return <div className="text-center p-8 text-gray-500 animate-pulse bg-[#292d3e] shadow-neu rounded-2xl m-4">Scouting players...</div>;
    if(!tips) return <div className="text-center p-8 text-gray-500 bg-[#292d3e] shadow-neu rounded-2xl m-4">Unable to load fantasy data.</div>;

    return (
        <div className="space-y-6 animate-fade-in-up">
            <div className="flex items-center justify-between px-2">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Gameweek {tips.gameweek || 'Next'}</h3>
                <span className="text-[10px] text-green-400 font-bold bg-[#292d3e] shadow-neu px-3 py-1 rounded-full">AI Recommended</span>
            </div>

            {/* Captain Pick */}
            <div className="bg-[#292d3e] shadow-neu p-6 rounded-2xl relative overflow-hidden group">
                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-3 text-yellow-400 font-bold text-xs uppercase tracking-widest">
                        <Star size={14} fill="currentColor" /> Captain Choice
                    </div>
                    <h2 className="text-3xl font-black text-gray-200 mb-2">{tips.captain?.name}</h2>
                    <p className="text-xs text-gray-400 leading-relaxed max-w-[90%]">{tips.captain?.reason}</p>
                </div>
                <div className="absolute -right-6 -bottom-6 text-[#292d3e] drop-shadow-md opacity-50">
                    <Users size={120} className="text-gray-800" />
                </div>
            </div>

            {/* Top Picks */}
            <div>
                <h4 className="text-xs font-bold text-green-400 uppercase mb-3 ml-2">Safe Picks (High Ownership)</h4>
                <div className="space-y-3">
                    {tips.topPicks?.map((p: any, i: number) => (
                        <div key={i} className="bg-[#292d3e] shadow-neu p-4 rounded-xl flex items-center justify-between">
                            <div>
                                <div className="font-bold text-gray-200 text-sm">{p.name}</div>
                                <div className="text-[10px] text-gray-500">{p.team}</div>
                            </div>
                            <div className="text-right">
                                <div className="text-xs text-green-400 font-bold">{p.expectedPoints} pts</div>
                                <div className="text-[9px] text-gray-500">Exp.</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Value & Differentials */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <h4 className="text-xs font-bold text-blue-400 uppercase mb-3 ml-2">Value Gems</h4>
                    <div className="space-y-3">
                        {tips.valuePicks?.map((p: any, i: number) => (
                            <div key={i} className="bg-[#292d3e] shadow-neu p-4 rounded-xl">
                                <div className="font-bold text-gray-200 text-xs truncate">{p.name}</div>
                                <div className="flex justify-between mt-2">
                                    <span className="text-[9px] text-gray-500">{p.cost}</span>
                                    <span className="text-[9px] text-blue-400 font-bold">{p.valueRating}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div>
                    <h4 className="text-xs font-bold text-purple-400 uppercase mb-3 ml-2">High Risk</h4>
                    <div className="space-y-3">
                        {tips.differentials?.map((p: any, i: number) => (
                            <div key={i} className="bg-[#292d3e] shadow-neu p-4 rounded-xl">
                                <div className="font-bold text-gray-200 text-xs truncate">{p.name}</div>
                                <div className="flex justify-between mt-2">
                                    <span className="text-[9px] text-gray-500">{p.ownership}</span>
                                    <span className="text-[9px] text-purple-400 font-bold">{p.riskLevel}</span>
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
            <div className="p-6 bg-[#292d3e] shadow-neu rounded-2xl text-center">
                <h3 className="text-lg font-bold text-gray-200">Yesterday's Reality Check</h3>
                <p className="text-xs text-gray-500">Did the AI see it coming?</p>
            </div>

            {loading && <div className="text-center p-8 text-gray-500 animate-pulse bg-[#292d3e] shadow-neu rounded-2xl">Analyzing match timelines...</div>}

            {reviews.map((r, i) => (
                <div key={i} className="bg-[#292d3e] shadow-neu p-6 rounded-2xl relative overflow-hidden group">
                    <div className="flex justify-between items-start mb-4">
                        <span className="font-bold text-gray-200">{r.match}</span>
                        <div className={`text-[10px] font-black px-3 py-1 rounded-full shadow-neu-pressed ${
                            r.accuracyScore > 75 ? 'text-green-400' : 
                            r.accuracyScore > 40 ? 'text-yellow-400' : 'text-red-400'
                        }`}>
                            {r.accuracyScore}% Accurate
                        </div>
                    </div>
                    
                    <div className="flex gap-4 mb-4 text-xs bg-[#292d3e] shadow-neu-pressed p-3 rounded-xl">
                        <div className="flex-1 border-r border-[#1e212d] pr-2">
                            <span className="block text-gray-500 uppercase font-bold text-[9px] mb-1">Prediction</span>
                            <span className="text-gray-300 font-medium">{r.prediction}</span>
                        </div>
                        <div className="flex-1 pl-2">
                            <span className="block text-gray-500 uppercase font-bold text-[9px] mb-1">Actual</span>
                            <span className="text-gray-200 font-bold">{r.result}</span>
                        </div>
                    </div>

                    <div className="text-xs text-gray-400 leading-relaxed pt-2">
                        <span className="font-bold text-gray-300">Why:</span> {r.reasoning}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default FootballHub;
