
import React, { useState, useEffect, useRef } from 'react';
import { useNeural } from './NeuralContext';
import { Activity, Wifi, Cpu, Database, Zap } from './Icons';

interface Log {
  id: number;
  text: string;
  type: 'info' | 'success' | 'warn' | 'system';
  timestamp: string;
}

const FLAVOR_TEXT = [
  "Optimizing Neural Engine...",
  "Calibrating visual weights...",
  "Syncing local database...",
  "Refreshing creator tools...",
  "Monitoring market uplink...",
  "Compiling image shaders...",
  "Securing P2P channels..."
];

const SystemConsole: React.FC = () => {
  const [logs, setLogs] = useState<Log[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  const addLog = (text: string, type: Log['type'] = 'info') => {
    const now = new Date();
    const timeString = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    
    setLogs(prev => {
      const newLogs = [...prev, { id: Date.now(), text, type, timestamp: timeString }];
      return newLogs.slice(-4); 
    });
  };

  useEffect(() => {
    let timeoutIds: any[] = [];
    addLog("SnapAura OS v1.3.1", "system");
    timeoutIds.push(setTimeout(() => addLog("Neural Core: ONLINE", "success"), 400));
    timeoutIds.push(setTimeout(() => addLog("Ready for input...", "info"), 800));
    return () => timeoutIds.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        const randomMsg = FLAVOR_TEXT[Math.floor(Math.random() * FLAVOR_TEXT.length)];
        addLog(randomMsg, "info");
      }
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full relative px-4">
      <div className="bg-dark-800/40 backdrop-blur-md border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
        <div className="bg-black/20 px-4 py-2 flex justify-between items-center border-b border-white/5">
            <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_5px_#60A5FA]"></div>
                    <span className="text-[8px] font-black text-primary uppercase tracking-widest">LIVE_CORE</span>
                </div>
                <div className="h-3 w-[1px] bg-white/10 mx-1"></div>
                <div className="flex gap-2 items-center text-[8px] font-mono text-gray-500">
                    <span className="flex items-center gap-1"><Cpu size={8}/> 8%</span>
                    <span className="flex items-center gap-1"><Database size={8}/> 1.2GB</span>
                </div>
            </div>
            <div className="flex gap-3 text-gray-600">
                <Wifi size={10} className="text-primary/50" />
                <Zap size={10} className="animate-pulse text-primary" />
            </div>
        </div>

        <div className="p-3 h-20 overflow-y-auto hide-scrollbar flex flex-col justify-end font-mono text-[9px] leading-tight relative">
            <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:100%_3px] opacity-20"></div>
            {logs.map((log) => (
                <div key={log.id} className="flex gap-2 mb-1 animate-fade-in-up items-center">
                    <span className="text-gray-600/50">[{log.timestamp}]</span>
                    <span className={`
                        ${log.type === 'info' ? 'text-gray-400' : ''}
                        ${log.type === 'success' ? 'text-green-400 font-bold' : ''}
                        ${log.type === 'system' ? 'text-primary font-black' : ''}
                    `}>
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
