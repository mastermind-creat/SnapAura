
import React, { useState, useEffect } from 'react';
import { Trophy, Calendar, TrendingUp, RefreshCw, BarChart } from './Icons';
import { getLeagueData } from '../services/geminiService';
import { showToast } from './Toast';

const LEAGUES = [
    { id: 'Premier League', label: 'EPL', icon: '🦁' },
    { id: 'La Liga', label: 'La Liga', icon: '🇪🇸' },
    { id: 'Bundesliga', label: 'Bundesliga', icon: '🇩🇪' },
    { id: 'Serie A', label: 'Serie A', icon: '🇮🇹' },
    { id: 'Ligue 1', label: 'Ligue 1', icon: '🇫🇷' },
    { id: 'Champions League', label: 'UCL', icon: '🇪🇺' },
];

const LeagueCentral: React.FC = () => {
    const [activeLeague, setActiveLeague] = useState(LEAGUES[0].id);
    const [view, setView] = useState<'standings' | 'fixtures'>('standings');
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchData();
    }, [activeLeague]);

    const fetchData = async () => {
        setLoading(true);
        setData(null);
        try {
            const res = await getLeagueData(activeLeague);
            setData(res);
        } catch (e) {
            showToast("Failed to fetch league data", "error");
        } finally {
            setLoading(false);
        }
    };

    const getFormColor = (char: string) => {
        const c = char.toUpperCase();
        if (c === 'W') return 'bg-green-500 text-white';
        if (c === 'D') return 'bg-gray-500 text-white';
        if (c === 'L') return 'bg-red-500 text-white';
        return 'bg-gray-700 text-gray-400';
    };

    return (
        <div className="space-y-6 animate-fade-in-up pb-24">
            {/* Header */}
            <div className="bg-[#292d3e] shadow-neu p-6 rounded-3xl relative overflow-hidden">
                <div className="relative z-10 flex justify-between items-start">
                    <div className="flex items-center gap-3">
                        <div className="bg-[#292d3e] shadow-neu-pressed p-3 rounded-full text-orange-400">
                            <Trophy size={28} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-gray-200 tracking-tight">League Center</h2>
                            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mt-1">Standings & Fixtures</p>
                        </div>
                    </div>
                    <button onClick={fetchData} disabled={loading} className="p-3 bg-[#292d3e] shadow-neu rounded-xl text-orange-400 active:shadow-neu-pressed transition-all">
                        <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
                    </button>
                </div>
            </div>

            {/* League Selector */}
            <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2">
                {LEAGUES.map(league => (
                    <button
                        key={league.id}
                        onClick={() => setActiveLeague(league.id)}
                        className={`flex items-center gap-2 px-4 py-3 rounded-2xl whitespace-nowrap transition-all font-bold text-xs ${
                            activeLeague === league.id
                            ? 'bg-[#292d3e] shadow-neu text-orange-400'
                            : 'bg-[#292d3e] shadow-neu-pressed text-gray-500 hover:text-gray-300'
                        }`}
                    >
                        <span className="text-sm">{league.icon}</span> {league.label}
                    </button>
                ))}
            </div>

            {/* View Toggle */}
            <div className="bg-[#292d3e] shadow-neu-pressed p-1.5 rounded-2xl flex gap-1">
                <button 
                    onClick={() => setView('standings')}
                    className={`flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                        view === 'standings' ? 'bg-[#292d3e] shadow-neu text-orange-400' : 'text-gray-500'
                    }`}
                >
                    <BarChart size={14} /> Standings
                </button>
                <button 
                    onClick={() => setView('fixtures')}
                    className={`flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                        view === 'fixtures' ? 'bg-[#292d3e] shadow-neu text-orange-400' : 'text-gray-500'
                    }`}
                >
                    <Calendar size={14} /> Fixtures
                </button>
            </div>

            {/* Content Area */}
            {loading && !data && (
                <div className="space-y-3">
                    {[1,2,3,4,5].map(i => <div key={i} className="h-14 bg-[#292d3e] shadow-neu-pressed rounded-xl animate-pulse"></div>)}
                </div>
            )}

            {!loading && data && view === 'standings' && (
                <div className="bg-[#292d3e] shadow-neu rounded-2xl overflow-hidden">
                    <div className="grid grid-cols-12 bg-[#1e212d] p-3 text-[9px] font-black text-gray-500 uppercase tracking-wider">
                        <div className="col-span-1 text-center">#</div>
                        <div className="col-span-5">Team</div>
                        <div className="col-span-1 text-center">PL</div>
                        <div className="col-span-1 text-center">GD</div>
                        <div className="col-span-1 text-center">PTS</div>
                        <div className="col-span-3 text-center">Form</div>
                    </div>
                    <div className="divide-y divide-white/5">
                        {data.standings?.map((row: any, i: number) => (
                            <div key={i} className="grid grid-cols-12 p-3 items-center hover:bg-white/5 transition-colors text-xs">
                                <div className={`col-span-1 text-center font-bold ${i < 4 ? 'text-green-400' : i > 17 ? 'text-red-400' : 'text-gray-500'}`}>{row.rank}</div>
                                <div className="col-span-5 font-bold text-gray-200 truncate pr-2">{row.team}</div>
                                <div className="col-span-1 text-center text-gray-400 font-mono">{row.played}</div>
                                <div className="col-span-1 text-center text-gray-500 font-mono">{row.gd}</div>
                                <div className="col-span-1 text-center font-black text-orange-400">{row.points}</div>
                                <div className="col-span-3 flex justify-center gap-0.5">
                                    {row.form?.split('').slice(0, 5).map((char: string, j: number) => (
                                        <div key={j} className={`w-4 h-4 rounded-sm flex items-center justify-center text-[8px] font-bold ${getFormColor(char)}`}>
                                            {char.toUpperCase()}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                    {(!data.standings || data.standings.length === 0) && (
                         <div className="p-8 text-center text-gray-500">No standings data available.</div>
                    )}
                </div>
            )}

            {!loading && data && view === 'fixtures' && (
                <div className="space-y-3">
                    {data.fixtures?.map((match: any, i: number) => (
                        <div key={i} className="bg-[#292d3e] shadow-neu p-4 rounded-2xl flex items-center justify-between group hover:scale-[1.01] transition-transform">
                             <div className="text-right flex-1 font-bold text-gray-300 text-sm">{match.home}</div>
                             <div className="mx-4 flex flex-col items-center min-w-[60px]">
                                 <div className="bg-[#292d3e] shadow-neu-pressed px-3 py-1 rounded-lg text-xs font-mono font-bold text-orange-400 border border-orange-400/20">
                                     {match.time}
                                 </div>
                                 <span className="text-[9px] text-gray-600 font-bold uppercase mt-1">{match.date}</span>
                             </div>
                             <div className="text-left flex-1 font-bold text-gray-300 text-sm">{match.away}</div>
                        </div>
                    ))}
                    {(!data.fixtures || data.fixtures.length === 0) && (
                         <div className="p-8 text-center text-gray-500 bg-[#292d3e] shadow-neu rounded-2xl">No upcoming fixtures found.</div>
                    )}
                </div>
            )}
        </div>
    );
};

export default LeagueCentral;
