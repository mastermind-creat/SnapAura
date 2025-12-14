
import React, { useState, useEffect, useRef } from 'react';
import { useNeural } from './NeuralContext';
import { Activity, Wifi, Cpu, Database, Globe } from './Icons';

interface Log {
  id: number;
  text: string;
  type: 'info' | 'success' | 'warn' | 'system';
  timestamp: string;
}

const FLAVOR_TEXT = [
  "Calibrating neural weights...",
  "Optimizing VRAM usage...",
  "Pinging satellite uplink...",
  "Refreshing crypto market data...",
  "Analyzing ambient light levels...",
  "Syncing user preferences...",
  "Checking integrity of local storage...",
  "Compiling shader cache...",
  "Establishing secure P2P handshake...",
  "Flushing temporary buffers...",
  "Monitoring global aura state..."
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
      return newLogs.slice(-6); // Keep only last 6 logs to prevent clutter
    });
  };

  // Initial Boot & Greeting
  useEffect(() => {
    let timeoutIds: any[] = [];

    // Boot Sequence
    addLog("SnapAura OS v1.3.0 initialized", "system");
    
    timeoutIds.push(setTimeout(() => addLog("Neural Engine: ONLINE", "success"), 400));
    timeoutIds.push(setTimeout(() => addLog("Mounting File System...", "info"), 800));

    // Smart Greeting
    timeoutIds.push(setTimeout(() => {
        const hour = new Date().getHours();
        let greeting = "Greetings";
        if (hour < 12) greeting = "Good Morning";
        else if (hour < 18) greeting = "Good Afternoon";
        else greeting = "Good Evening";

        const name = state.userProfile?.username || state.userProfile?.name || "User";
        addLog(`${greeting}, ${name}. Ready for input.`, "success");
    }, 1500));

    return () => timeoutIds.forEach(clearTimeout);
  }, []); // Run once on mount

  // Random Background Activity
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.6) { // 40% chance to log something every interval
        const randomMsg = FLAVOR_TEXT[Math.floor(Math.random() * FLAVOR_TEXT.length)];
        addLog(randomMsg, "info");
      }
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  // Monitor Global State Changes (Make it reactive)
  useEffect(() => {
      if (state.activeTab) {
          addLog(`Context switched to: ${state.activeTab}`, 'system');
      }
  }, [state.activeTab]);

  return (
    <div className="w-full max-w-sm mx-auto mt-8 relative group">
      {/* Glass Container */}
      <div className="bg-[#0f0f11]/80 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden shadow-2xl relative">
        
        {/* Header Bar */}
        <div className="bg-[#1a1c29] px-3 py-1 flex justify-between items-center border-b border-white/5">
            <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-[9px] font-mono text-gray-400 uppercase tracking-widest">SYS_LOG</span>
            </div>
            <div className="flex gap-2 text-gray-600">
                <Wifi size={10} />
                <Cpu size={10} />
                <Database size={10} />
            </div>
        </div>

        {/* Log Window */}
        <div className="p-3 h-32 overflow-y-auto hide-scrollbar flex flex-col justify-end font-mono text-[10px] leading-relaxed relative">
            {/* Scanline Effect */}
            <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-10 bg-[length:100%_2px,3px_100%]"></div>
            
            {logs.map((log) => (
                <div key={log.id} className="flex gap-2 animate-fade-in-up">
                    <span className="text-gray-600 select-none">[{log.timestamp}]</span>
                    <span className={`
                        ${log.type === 'info' ? 'text-blue-300' : ''}
                        ${log.type === 'success' ? 'text-green-400 font-bold' : ''}
                        ${log.type === 'warn' ? 'text-yellow-400' : ''}
                        ${log.type === 'system' ? 'text-purple-400 italic' : ''}
                    `}>
                        {log.type === 'system' && <span className="mr-1">root@core:</span>}
                        {log.type === 'success' && <span className="mr-1">✓</span>}
                        {log.text}
                    </span>
                </div>
            ))}
            <div ref={bottomRef} />
        </div>
      </div>

      {/* Decorative Connectors */}
      <div className="absolute -left-1 top-1/2 w-2 h-8 border-l border-t border-b border-white/20 rounded-l opacity-50"></div>
      <div className="absolute -right-1 top-1/2 w-2 h-8 border-r border-t border-b border-white/20 rounded-r opacity-50"></div>
    </div>
  );
};

export default SystemConsole;
