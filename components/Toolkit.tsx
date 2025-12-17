
import React, { useState, useEffect, useRef } from 'react';
import { 
  Briefcase, ArrowLeft, Settings, QrCode, Bitcoin, Ruler, 
  ImageIcon, Scissors, Palette, FileText, Smartphone,
  Link as LinkIcon, RefreshCw, Copy, CheckCircle, ExternalLink,
  Wifi, Search, Download, Upload, Zap, Lock, Unlock, TrendingUp, DollarSign,
  Activity, Star, Eye, EyeOff, ImagePlus, Wand2, MessageCircle, BarChart, TrendingDown, Trophy,
  Ghost, Flame, Gem, Globe
} from './Icons';
import SocialGrowth from './SocialGrowth';
import SmartNotes from './SmartNotes';
import ProfileStudio from './ProfileStudio';
import MoodboardGenerator from './MoodboardGenerator';
import PdfTools from './PdfTools';
import FootballHub from './FootballHub';
import LeagueCentral from './LeagueCentral';
import GenZLab from './GenZLab';
import AuraState from './AuraState';
import { getCryptoData, getCurrencyData, getCryptoMarketOverview } from '../services/geminiService';
import { showToast } from './Toast';
import SmartCard from './SmartCard';
import { useNeural } from './NeuralContext';

declare const Html5Qrcode: any;

const Toolkit: React.FC<any> = ({ onOpenSettings }) => {
  const [activeTool, setActiveTool] = useState<string>('menu');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
      const handler = (e: CustomEvent) => setActiveTool(e.detail);
      window.addEventListener('neural-tool-select', handler as EventListener);
      return () => window.removeEventListener('neural-tool-select', handler as EventListener);
  }, []);

  const tools = [
    { id: 'qr-tools', label: 'QR Master', icon: QrCode, color: 'text-blue-400', cat: 'Essentials' },
    { id: 'finance', label: 'Crypto & Fiat', icon: Bitcoin, color: 'text-yellow-400', cat: 'Essentials' },
    { id: 'units', label: 'Converter', icon: Ruler, color: 'text-green-400', cat: 'Essentials' },
    { id: 'links', label: 'Link Shortener', icon: LinkIcon, color: 'text-purple-400', cat: 'Essentials' },
    
    { id: 'aura-state', label: 'World Pulse', icon: Globe, color: 'text-indigo-400', cat: 'Intelligence' },
    { id: 'gen-z-lab', label: 'Gen Z Lab', icon: Ghost, color: 'text-pink-400', cat: 'Vibes' },
    { id: 'social-growth', label: 'Social Growth', icon: TrendingUp, color: 'text-blue-400', cat: 'Intelligence' },
    { id: 'notes', label: 'Smart Notes', icon: FileText, color: 'text-yellow-400', cat: 'Intelligence' },
    
    { id: 'football-hub', label: 'Football Intel', icon: Zap, color: 'text-green-400', cat: 'Sports' },
    { id: 'league-central', label: 'League Center', icon: Trophy, color: 'text-orange-400', cat: 'Sports' },
    
    { id: 'profile-studio', label: 'Profile Studio', icon: Smartphone, color: 'text-indigo-400', cat: 'Creative' },
    { id: 'moodboard', label: 'Moodboard', icon: Palette, color: 'text-pink-400', cat: 'Creative' },
    { id: 'photo-utils', label: 'Photo Lab', icon: ImageIcon, color: 'text-red-400', cat: 'Creative' },
    { id: 'pdf-tools', label: 'PDF Tools', icon: FileText, color: 'text-red-400', cat: 'Creative' },
  ];

  const filteredTools = tools.filter(t => t.label.toLowerCase().includes(searchQuery.toLowerCase()));
  const categories = Array.from(new Set(filteredTools.map(t => t.cat)));

  const renderMenu = () => (
      <div className="space-y-8 animate-fade-in-up pb-20 pr-4">
          {/* Quick Shortcuts */}
          <div className="space-y-3">
              <h3 className="text-[10px] font-black text-festive-gold/60 uppercase tracking-[0.3em] ml-1 flex items-center gap-2">
                  <Star size={10} className="text-festive-gold animate-pulse" /> Top Systems
              </h3>
              <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-2">
                  <button onClick={() => setActiveTool('qr-tools')} className="flex items-center gap-3 bg-[#0a0b10] shadow-[8px_8px_16px_#050508,-8px_-8px_16px_#12141c] p-5 rounded-3xl min-w-[160px] active:shadow-inner transition-all border border-white/5">
                      <div className="p-3 bg-[#0a0b10] shadow-inner rounded-2xl text-blue-400"><QrCode size={20}/></div>
                      <span className="text-xs font-black text-gray-300 uppercase tracking-tighter">Scan QR</span>
                  </button>
                  <button onClick={() => setActiveTool('aura-state')} className="flex items-center gap-3 bg-[#0a0b10] shadow-[8px_8px_16px_#050508,-8px_-8px_16px_#12141c] p-5 rounded-3xl min-w-[160px] active:shadow-inner transition-all border border-white/5">
                      <div className="p-3 bg-[#0a0b10] shadow-inner rounded-2xl text-indigo-400"><Globe size={20}/></div>
                      <span className="text-xs font-black text-gray-300 uppercase tracking-tighter">AuraState</span>
                  </button>
                  <button onClick={() => setActiveTool('gen-z-lab')} className="flex items-center gap-3 bg-[#0a0b10] shadow-[8px_8px_16px_#050508,-8px_-8px_16px_#12141c] p-5 rounded-3xl min-w-[160px] active:shadow-inner transition-all border border-white/5">
                      <div className="p-3 bg-[#0a0b10] shadow-inner rounded-2xl text-pink-400"><Ghost size={20}/></div>
                      <span className="text-xs font-black text-gray-300 uppercase tracking-tighter">Rizz Lab</span>
                  </button>
              </div>
          </div>

          {/* Search */}
          <div className="relative group">
              <div className="absolute inset-0 bg-[#0a0b10] rounded-3xl shadow-inner border border-white/5"></div>
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 z-10" size={20} />
              <input 
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="SEARCH MODULES..." 
                  className="w-full bg-transparent rounded-3xl pl-14 pr-4 py-5 text-gray-200 focus:outline-none relative z-10 text-[10px] font-black uppercase tracking-[0.2em] placeholder-gray-700"
              />
          </div>

          {/* Grid */}
          {categories.map((cat, catIdx) => (
              <div key={cat} className="space-y-4">
                  <h3 className="text-[10px] font-black text-festive-emerald uppercase tracking-[0.3em] ml-2 border-l-2 border-festive-emerald pl-3">{cat}</h3>
                  <div className="grid grid-cols-2 gap-5">
                      {filteredTools.filter(t => t.cat === cat).map((tool, idx) => (
                          <div 
                            key={tool.id} 
                            onClick={() => setActiveTool(tool.id)}
                            className={`bg-[#0a0b10] shadow-[8px_8px_16px_#050508,-8px_-8px_16px_#12141c] p-6 rounded-[2.5rem] flex flex-col items-center justify-center gap-4 cursor-pointer active:shadow-inner transition-all active:scale-95 group relative border border-white/5 animate-fade-in-up overflow-hidden`}
                            style={{ animationDelay: `${(catIdx * 100) + (idx * 50)}ms` }}
                          >
                              <div className={`p-5 bg-[#0a0b10] shadow-inner rounded-3xl ${tool.color} group-hover:scale-110 transition-all relative z-10 border border-white/5`}>
                                  <tool.icon size={28} />
                              </div>
                              <span className="font-black text-gray-300 text-[10px] uppercase tracking-widest relative z-10">{tool.label}</span>
                          </div>
                      ))}
                  </div>
              </div>
          ))}
      </div>
  );

  return (
    <div className="h-full overflow-y-auto hide-scrollbar bg-[#0a0b10] p-6 pb-40 relative pr-20">
        {/* Cinematic Background */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 opacity-40">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,215,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,215,0,0.03)_1px,transparent_1px)] bg-[size:60px:60px] transform perspective-500 rotateX-60 animate-grid-move"></div>
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-festive-gold/5 rounded-full blur-[120px] animate-pulse-slow"></div>
        </div>

        {/* Header */}
        <header className="flex items-center justify-between sticky top-0 bg-[#0a0b10]/90 backdrop-blur-xl py-4 z-30 mb-8 border-b border-white/5">
            <div className="flex items-center gap-4">
                {activeTool !== 'menu' && (
                    <button onClick={() => setActiveTool('menu')} className="p-3 bg-[#0a0b10] shadow-[4px_4px_8px_#050508,-4px_-4px_8px_#12141c] rounded-2xl text-gray-400 hover:text-white active:shadow-inner transition-all border border-white/5">
                        <ArrowLeft size={18} />
                    </button>
                )}
                <div>
                    <h1 className="text-xl font-black text-gray-100 tracking-tighter flex items-center gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-festive-gold animate-pulse"></div>
                        {activeTool === 'menu' ? 'Toolkit' : tools.find(t => t.id === activeTool)?.label || 'Tool'}
                    </h1>
                </div>
            </div>
            <button onClick={onOpenSettings} className="p-3 bg-[#0a0b10] shadow-[4px_4px_8px_#050508,-4px_-4px_8px_#12141c] rounded-2xl text-gray-500 border border-white/5">
                <Settings size={18} />
            </button>
        </header>

        <div className="relative z-10">
            {activeTool === 'menu' && renderMenu()}
            <div className="toolkit-content">
                {activeTool === 'qr-tools' && <QrTools />}
                {activeTool === 'finance' && <FinancialTools />}
                {activeTool === 'units' && <UnitConverter />}
                {activeTool === 'links' && <LinkShortener />}
                {activeTool === 'photo-utils' && <PhotoUtils />}
                {activeTool === 'notes' && <SmartNotes />}
                {activeTool === 'social-growth' && <SocialGrowth />}
                {activeTool === 'profile-studio' && <ProfileStudio />}
                {activeTool === 'moodboard' && <MoodboardGenerator />}
                {activeTool === 'football-hub' && <FootballHub />}
                {activeTool === 'league-central' && <LeagueCentral />}
                {activeTool === 'pdf-tools' && <PdfTools />}
                {activeTool === 'gen-z-lab' && <GenZLab />}
                {activeTool === 'aura-state' && <AuraState />}
            </div>
        </div>
    </div>
  );
};

// Internal Sub-components updated with Neumorphic styles
const QrTools = () => {
    const [mode, setMode] = useState<'scan' | 'gen'>('scan');
    const [genText, setGenText] = useState('');
    const [qrCode, setQrCode] = useState('');
    const [scanResult, setScanResult] = useState<string | null>(null);
    const [scanType, setScanType] = useState<'url'|'text'|'wifi'|null>(null);
    const [wifiData, setWifiData] = useState<any>(null);
    const [isScanning, setIsScanning] = useState(false);
    
    const scannerRef = useRef<any>(null);
    const fileRef = useRef<HTMLInputElement>(null);

    const handleScan = (decodedText: string) => {
        setScanResult(decodedText);
        stopScanning();
        if (decodedText.startsWith('WIFI:')) setScanType('wifi');
        else if (decodedText.startsWith('http')) setScanType('url');
        else setScanType('text');
        showToast("Code detected!", "success");
    };

    const startScanning = () => {
        if (isScanning) return;
        setIsScanning(true);
        setTimeout(() => {
            const html5QrCode = new Html5Qrcode("reader");
            scannerRef.current = html5QrCode;
            html5QrCode.start({ facingMode: "environment" }, { fps: 10, qrbox: 250 }, handleScan, () => {})
                .catch(() => setIsScanning(false));
        }, 100);
    };

    const stopScanning = () => {
        if (scannerRef.current?.isScanning) scannerRef.current.stop().then(() => setIsScanning(false));
        else setIsScanning(false);
    };

    return (
        <div className="space-y-8 animate-fade-in-up">
            <div className="flex bg-[#0a0b10] shadow-inner p-1.5 rounded-2xl border border-white/5">
                <button onClick={() => setMode('scan')} className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${mode === 'scan' ? 'bg-[#0a0b10] shadow-[4px_4px_8px_#050508,-4px_-4px_8px_#12141c] text-blue-400' : 'text-gray-500'}`}>Scan</button>
                <button onClick={() => setMode('gen')} className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${mode === 'gen' ? 'bg-[#0a0b10] shadow-[4px_4px_8px_#050508,-4px_-4px_8px_#12141c] text-blue-400' : 'text-gray-500'}`}>Generate</button>
            </div>

            {mode === 'scan' && (
                <div className="bg-[#0a0b10] shadow-[8px_8px_16px_#050508,-8px_-8px_16px_#12141c] p-6 rounded-[2.5rem] relative overflow-hidden min-h-[450px] border border-white/5">
                    <div id="reader" className="w-full bg-black rounded-3xl overflow-hidden min-h-[300px] shadow-inner"></div>
                    {!scanResult && <button onClick={startScanning} className="mt-6 w-full py-5 bg-[#0a0b10] shadow-[4px_4px_8px_#050508,-4px_-4px_8px_#12141c] text-blue-400 font-black uppercase tracking-widest rounded-2xl active:shadow-inner transition-all">Start Camera</button>}
                    {scanResult && (
                        <div className="mt-6 space-y-4">
                            <SmartCard title="Data Extract" content={scanResult} icon={QrCode} className="shadow-inner bg-[#0a0b10] border border-white/5" />
                            <button onClick={() => {setScanResult(null); startScanning();}} className="w-full py-4 bg-[#0a0b10] shadow-[4px_4px_8px_#050508,-4px_-4px_8px_#12141c] text-gray-400 font-black rounded-2xl">Reset</button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

const UnitConverter = () => (
    <div className="bg-[#0a0b10] shadow-[8px_8px_16px_#050508,-8px_-8px_16px_#12141c] p-10 rounded-[2.5rem] text-center text-gray-600 border border-white/5 font-black uppercase tracking-widest">Converter Core Offline</div>
);
const LinkShortener = () => (
    <div className="bg-[#0a0b10] shadow-[8px_8px_16px_#050508,-8px_-8px_16px_#12141c] p-10 rounded-[2.5rem] text-center text-gray-600 border border-white/5 font-black uppercase tracking-widest">Link Shunt Offline</div>
);
const PhotoUtils = () => (
    <div className="bg-[#0a0b10] shadow-[8px_8px_16px_#050508,-8px_-8px_16px_#12141c] p-10 rounded-[2.5rem] text-center text-gray-600 border border-white/5 font-black uppercase tracking-widest">Photo Lab Locked</div>
);
const FinancialTools = () => (
    <div className="bg-[#0a0b10] shadow-[8px_8px_16px_#050508,-8px_-8px_16px_#12141c] p-10 rounded-[2.5rem] text-center text-gray-600 border border-white/5 font-black uppercase tracking-widest">Finance Matrix Encrypted</div>
);

export default Toolkit;
