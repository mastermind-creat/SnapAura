
import React, { useState, useEffect, useRef } from 'react';
import { useNeural } from './NeuralContext';
import { Activity, Wifi, Cpu, Database, Globe, Zap } from './Icons';

interface Log {
  id: number;
  text: string;
  type: 'info' | 'success' | 'warn' | 'system';
  timestamp: string;
}

const FLAVOR_TEXT = [
  "Calibrating festive weights...",
  "Optimizing Holiday VRAM...",
  "Syncing North Pole uplink...",
  "Refreshing Gift Market data...",
  "Analyzing snowfall levels...",
  "Compiling seasonal shaders...",
  "Monitoring Global Cheer Index..."
];

const SystemConsole: React.FC = () => {
  const { state } = useNeural();
  const [logs, setLogs] = useState<Log[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  const addLog = (text: string, type: Log['type'] = 'info') => {
    const now = new Date();
    const timeString = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    
    setLogs(prev => {
      const newLogs = [...prev, { id: Date.now(), text, type, timestamp: timeString }];
      return newLogs.slice(-4); // Slimmer history for the HUD
    });
  };

  useEffect(() => {
    let timeoutIds: any[] = [];
    addLog("SnapAura Holiday OS v1.3.1", "system");
    timeoutIds.push(setTimeout(() => addLog("Neural Core: ONLINE", "success"), 400));
    timeoutIds.push(setTimeout(() => addLog("Mounting Seasonal Modules...", "info"), 800));
    return () => timeoutIds.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        const randomMsg = FLAVOR_TEXT[Math.floor(Math.random() * FLAVOR_TEXT.length)];
        addLog(randomMsg, "info");
      }
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full relative group px-2">
      {/* Docked HUD Container */}
      <div className="holiday-blur bg-[#0f2a1e]/40 border-t border-festive-gold/20 rounded-t-3xl overflow-hidden shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
        
        {/* Indicators Bar */}
        <div className="bg-black/20 px-4 py-2 flex justify-between items-center border-b border-white/5">
            <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-festive-emerald animate-pulse shadow-[0_0_5px_#00c853]"></div>
                    <span className="text-[8px] font-black text-festive-emerald uppercase tracking-widest">LIVE_SYS</span>
                </div>
                <div className="h-3 w-[1px] bg-white/10 mx-1"></div>
                <div className="flex gap-2 items-center text-[8px] font-mono text-gray-500">
                    <span className="flex items-center gap-1"><Cpu size={8}/> 12%</span>
                    <span className="flex items-center gap-1"><Database size={8}/> 4.2GB</span>
                </div>
            </div>
            <div className="flex gap-3 text-gray-600">
                <Wifi size={10} className="text-festive-gold/50" />
                <Zap size={10} className="animate-pulse text-festive-emerald" />
            </div>
        </div>

        {/* Console Log Area */}
        <div className="p-3 h-24 overflow-y-auto hide-scrollbar flex flex-col justify-end font-mono text-[9px] leading-tight relative">
            {/* Retro Matrix/Scanline Overlay */}
            <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:100%_3px] opacity-20"></div>
            
            {logs.map((log) => (
                <div key={log.id} className="flex gap-2 mb-1 animate-fade-in-up items-center">
                    <span className="text-gray-600/50">[{log.timestamp}]</span>
                    <span className={`
                        ${log.type === 'info' ? 'text-gray-400' : ''}
                        ${log.type === 'success' ? 'text-festive-emerald font-bold' : ''}
                        ${log.type === 'system' ? 'text-festive-gold font-black' : ''}
                    `}>
                        {log.type === 'system' && <span className="mr-1">root@core:</span>}
                        {log.text}
                    </span>
                </div>
            ))}
            <div ref={bottomRef} />
        </div>
      </div>
    </div>
  );
};

export default SystemConsole;
