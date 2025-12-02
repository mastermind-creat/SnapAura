
import React, { useState, useEffect } from 'react';
import { Trophy, Calendar, Target, TrendingUp, TrendingDown, Percent, RefreshCw, Activity, ChevronRight } from './Icons';
import { getSoccerPredictions } from '../services/geminiService';
import { showToast } from './Toast';

interface SoccerMatch {
  id: string;
  league: string;
  homeTeam: string;
  awayTeam: string;
  time: string;
  probabilities: {
    home: number;
    draw: number;
    away: number;
  };
  metrics: {
    over2_5: number;
    btts: number;
  };
  confidenceScore: number;
  analysis: string;
}

const SoccerPredictions: React.FC = () => {
  const [matches, setMatches] = useState<SoccerMatch[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetchPredictions();
  }, []);

  const fetchPredictions = async () => {
    setIsLoading(true);
    try {
      const data = await getSoccerPredictions();
      if (Array.isArray(data)) {
        setMatches(data);
        showToast("Match analysis refreshed", "success");
      } else {
          throw new Error("Invalid data format");
      }
    } catch (error) {
      console.error(error);
      showToast("Failed to fetch matches", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 80) return 'text-green-400 bg-green-500/20';
    if (score >= 60) return 'text-yellow-400 bg-yellow-500/20';
    return 'text-red-400 bg-red-500/20';
  };

  return (
    <div className="space-y-4 animate-fade-in-up pb-24">
      {/* Header Card */}
      <div className="glass-panel p-6 rounded-2xl relative overflow-hidden border-t-4 border-green-500">
        <div className="relative z-10 flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2 mb-2">
               <Trophy className="text-yellow-400" size={24} />
               <h2 className="text-xl font-bold text-white">Match Day AI</h2>
            </div>
            <p className="text-sm text-gray-400 max-w-[80%]">
              AI-powered analysis based on form, xG metrics, and head-to-head stats.
            </p>
          </div>
          <button 
            onClick={fetchPredictions}
            disabled={isLoading}
            className="p-2 bg-white/10 rounded-xl hover:bg-white/20 transition-colors active:scale-95"
          >
            <RefreshCw size={20} className={isLoading ? "animate-spin text-green-400" : "text-white"} />
          </button>
        </div>
        {/* Decorative BG */}
        <div className="absolute -right-4 -bottom-4 opacity-10 rotate-12">
            <Activity size={120} />
        </div>
      </div>

      {/* Loading Skeleton */}
      {isLoading && matches.length === 0 && (
          <div className="space-y-3">
              {[1,2,3].map(i => (
                  <div key={i} className="glass-panel h-32 rounded-2xl animate-pulse bg-white/5"></div>
              ))}
          </div>
      )}

      {/* Matches List */}
      <div className="space-y-4">
        {matches.map((match, idx) => (
          <div key={idx} className="glass-panel rounded-2xl overflow-hidden border border-white/5 transition-all">
             
             {/* Header / Summary View */}
             <div 
                onClick={() => setExpandedId(expandedId === match.id ? null : match.id)}
                className="p-5 cursor-pointer hover:bg-white/5 transition-colors"
             >
                <div className="flex justify-between items-center mb-3 text-xs text-gray-500 uppercase font-bold tracking-wider">
                    <span>{match.league}</span>
                    <span className="flex items-center gap-1"><Calendar size={12}/> {match.time}</span>
                </div>

                <div className="flex justify-between items-center gap-4 mb-4">
                    <span className="text-lg font-bold text-white flex-1 text-right">{match.homeTeam}</span>
                    <div className="bg-white/10 px-3 py-1 rounded-lg text-xs font-mono font-bold text-gray-300">VS</div>
                    <span className="text-lg font-bold text-white flex-1 text-left">{match.awayTeam}</span>
                </div>

                {/* Win Probabilities Bar */}
                <div className="flex h-2 rounded-full overflow-hidden bg-black/50 mb-3">
                    <div className="bg-green-500 h-full" style={{width: `${match.probabilities.home}%`}}></div>
                    <div className="bg-gray-500 h-full" style={{width: `${match.probabilities.draw}%`}}></div>
                    <div className="bg-blue-500 h-full" style={{width: `${match.probabilities.away}%`}}></div>
                </div>
                
                <div className="flex justify-between text-[10px] text-gray-400 font-mono">
                    <span className="text-green-400">{match.probabilities.home}% Home</span>
                    <span>{match.probabilities.draw}% Draw</span>
                    <span className="text-blue-400">{match.probabilities.away}% Away</span>
                </div>

                {/* Chevron visual cue */}
                <div className="flex justify-center mt-2">
                    <ChevronRight size={16} className={`text-gray-600 transition-transform duration-300 ${expandedId === match.id ? 'rotate-90' : 'rotate-0'}`} />
                </div>
             </div>

             {/* Expanded Analysis */}
             {expandedId === match.id && (
                 <div className="px-5 pb-5 pt-0 border-t border-white/5 bg-black/20 animate-fade-in-up">
                     <div className="grid grid-cols-2 gap-3 my-4">
                         <div className="bg-white/5 p-3 rounded-xl flex items-center justify-between border border-white/5">
                             <span className="text-xs text-gray-400">Over 2.5 Goals</span>
                             <span className={`text-sm font-bold ${match.metrics.over2_5 > 50 ? 'text-green-400' : 'text-red-400'}`}>{match.metrics.over2_5}%</span>
                         </div>
                         <div className="bg-white/5 p-3 rounded-xl flex items-center justify-between border border-white/5">
                             <span className="text-xs text-gray-400">Both Score</span>
                             <span className={`text-sm font-bold ${match.metrics.btts > 50 ? 'text-green-400' : 'text-red-400'}`}>{match.metrics.btts}%</span>
                         </div>
                     </div>

                     <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                            <h4 className="text-sm font-bold text-white flex items-center gap-2"><Target size={14} className="text-primary"/> AI Analysis</h4>
                            <span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase ${getConfidenceColor(match.confidenceScore)}`}>
                                {match.confidenceScore}% Confidence
                            </span>
                        </div>
                        <p className="text-sm text-gray-300 leading-relaxed bg-white/5 p-3 rounded-xl border border-white/5">
                            {match.analysis}
                        </p>
                     </div>
                     
                     <div className="text-[10px] text-gray-600 text-center italic">
                         * Probabilities based on statistical data. Not financial advice.
                     </div>
                 </div>
             )}
          </div>
        ))}
        
        {matches.length === 0 && !isLoading && (
            <div className="text-center text-gray-500 py-10">
                <p>No major matches found for today.</p>
                <button onClick={fetchPredictions} className="mt-2 text-primary font-bold text-sm">Retry Search</button>
            </div>
        )}
      </div>
    </div>
  );
};

export default SoccerPredictions;
