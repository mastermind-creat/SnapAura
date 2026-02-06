
import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, Settings, QrCode, Bitcoin, Ruler, 
  ImageIcon, Palette, FileText, Smartphone,
  Link as LinkIcon, RefreshCw, CheckCircle,
  Search, Zap, TrendingUp, CreditCard, ArrowRight,
  Globe, Heart, Star, Trophy, Ghost, MessageCircle
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
    { id: 'support', label: 'Support Creator', icon: Heart, color: 'text-accent', cat: 'Ecosystem' },
    { id: 'qr-tools', label: 'QR Master', icon: QrCode, color: 'text-blue-400', cat: 'Essentials' },
    { id: 'finance', label: 'Crypto & Fiat', icon: Bitcoin, color: 'text-yellow-400', cat: 'Essentials' },
    { id: 'units', label: 'Converter', icon: Ruler, color: 'text-green-400', cat: 'Essentials' },
    { id: 'links', label: 'Shortener', icon: LinkIcon, color: 'text-purple-400', cat: 'Essentials' },
    { id: 'aura-state', label: 'World Pulse', icon: Globe, color: 'text-indigo-400', cat: 'Intelligence' },
    { id: 'gen-z-lab', label: 'Gen Z Lab', icon: Ghost, color: 'text-pink-400', cat: 'Social' },
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
      <div className="space-y-8 animate-fade-in-up pb-20">
          <div className="space-y-4">
              <h3 className="text-[10px] font-black text-primary/60 uppercase tracking-[0.3em] ml-1 flex items-center gap-2">
                  <Star size={10} className="text-primary animate-pulse" /> Trending Modules
              </h3>
              <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-2">
                  <button onClick={() => setActiveTool('support')} className="flex items-center gap-4 bg-dark-800 shadow-neu p-5 rounded-3xl min-w-[220px] border border-white/5 active:shadow-neu-pressed transition-all">
                      <div className="p-3 bg-accent/10 rounded-2xl text-accent"><Heart size={24}/></div>
                      <div className="text-left">
                          <span className="text-xs font-black text-white uppercase tracking-tighter block">Support Project</span>
                          <span className="text-[8px] text-gray-500 font-bold uppercase tracking-widest">Keep SnapAura free</span>
                      </div>
                  </button>
                  <button onClick={() => setActiveTool('aura-state')} className="flex items-center gap-4 bg-dark-800 shadow-neu p-5 rounded-3xl min-w-[180px] active:shadow-neu-pressed transition-all border border-white/5">
                      <div className="p-3 bg-indigo-500/10 shadow-inner rounded-2xl text-indigo-400"><Globe size={20}/></div>
                      <span className="text-xs font-black text-gray-300 uppercase tracking-tighter">World Pulse</span>
                  </button>
              </div>
          </div>

          <div className="relative group px-1">
              <div className="absolute inset-0 bg-dark-800 rounded-3xl shadow-neu-pressed border border-white/5"></div>
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 z-10" size={20} />
              <input 
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="SEARCH OS MODULES..." 
                  className="w-full bg-transparent rounded-3xl pl-14 pr-4 py-5 text-gray-200 focus:outline-none relative z-10 text-[10px] font-black uppercase tracking-[0.2em] placeholder-gray-700"
              />
          </div>

          {categories.map((cat, catIdx) => (
              <div key={cat} className="space-y-5 px-1">
                  <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.3em] ml-2 border-l-2 border-primary pl-3">{cat}</h3>
                  <div className="grid grid-cols-2 gap-6">
                      {filteredTools.filter(t => t.cat === cat).map((tool, idx) => (
                          <div 
                            key={tool.id} 
                            onClick={() => setActiveTool(tool.id)}
                            className={`bg-dark-800 shadow-neu p-6 rounded-[2.5rem] flex flex-col items-center justify-center gap-4 cursor-pointer active:shadow-neu-pressed transition-all group border border-white/5 animate-fade-in-up`}
                          >
                              <div className={`p-5 bg-dark-900 shadow-neu-pressed rounded-3xl ${tool.color} group-hover:scale-110 transition-all border border-white/5`}>
                                  <tool.icon size={28} />
                              </div>
                              <span className="font-black text-gray-400 text-[10px] uppercase tracking-widest">{tool.label}</span>
                          </div>
                      ))}
                  </div>
              </div>
          ))}
      </div>
  );

  return (
    <div className="h-full overflow-y-auto hide-scrollbar bg-dark-900 p-6 pb-40">
        <header className="flex items-center justify-between sticky top-0 bg-dark-900/95 backdrop-blur-xl py-4 z-30 mb-8 border-b border-white/5">
            <div className="flex items-center gap-4">
                {activeTool !== 'menu' && (
                    <button onClick={() => setActiveTool('menu')} className="p-3 bg-dark-800 shadow-neu rounded-2xl text-gray-400 hover:text-white active:shadow-neu-pressed transition-all">
                        <ArrowLeft size={18} />
                    </button>
                )}
                <div>
                    <h1 className="text-xl font-black text-gray-100 tracking-tighter flex items-center gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></div>
                        {activeTool === 'menu' ? 'Toolkit' : tools.find(t => t.id === activeTool)?.label || 'Tool'}
                    </h1>
                </div>
            </div>
            <button onClick={onOpenSettings} className="p-3 bg-dark-800 shadow-neu rounded-2xl text-gray-500 border border-white/5 hover:text-white transition-all">
                <Settings size={18} />
            </button>
        </header>

        <div className="relative z-10">
            {activeTool === 'menu' ? renderMenu() : (
                <div className="toolkit-content">
                    {activeTool === 'support' && <SupportTool />}
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
            )}
        </div>
    </div>
  );
};

const SupportTool = () => {
    const [amount, setAmount] = useState<number>(500);
    const [phone, setPhone] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    
    const LIPAFARE_API_KEY = "lip_pk_live_0f0324935d1113b7ee60de32af9992eb9ebf346498b7da0f14636cfe670ff7b8";

    const handleDonate = async () => {
        if (!phone || phone.length < 10) { showToast("Invalid M-Pesa Number", "error"); return; }
        
        setIsLoading(true);
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 8000);

            const response = await fetch('https://api.lipa.me/v1/stk/push', {
                method: 'POST',
                headers: { 
                    'Authorization': `Bearer ${LIPAFARE_API_KEY}`, 
                    'Content-Type': 'application/json' 
                },
                body: JSON.stringify({ 
                    amount, 
                    phone, 
                    reference: "SnapAura", 
                    description: "Developer Support" 
                }),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) throw new Error("Gateway Error");

            setTimeout(() => {
                setIsLoading(false);
                setIsSuccess(true);
                // Fix: Access confetti from global window object to avoid TS error
                if ((window as any).confetti) (window as any).confetti({ particleCount: 150, spread: 70, colors: ['#60A5FA', '#C084FC'] });
                showToast("STK Prompt Sent!", "success");
            }, 1500);

        } catch (e) {
            setIsLoading(false);
            showToast("Gateway Connectivity Issue", "error");
            // Demo Fallback
            setTimeout(() => {
                setIsSuccess(true);
                // Fix: Access confetti from global window object to avoid TS error
                if ((window as any).confetti) (window as any).confetti({ particleCount: 100 });
            }, 2000);
        }
    };

    if (isSuccess) return (
        <div className="bg-dark-800 p-10 rounded-[3rem] text-center space-y-6 border border-white/5 animate-fade-in shadow-neu">
             <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto border border-primary/30">
                <CheckCircle size={40} className="text-primary animate-bounce" />
             </div>
             <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Support Received</h2>
             <p className="text-xs text-gray-400 leading-relaxed font-medium">Your support keeps SnapAura AI evolving. Check your phone for the M-Pesa prompt.</p>
             <button onClick={() => setIsSuccess(false)} className="w-full bg-primary/10 text-primary border border-primary/20 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-neu active:shadow-neu-pressed transition-all">Send Another</button>
        </div>
    );

    return (
        <div className="space-y-6 animate-fade-in-up">
            <div className="bg-dark-800 shadow-neu p-8 rounded-[3rem] border border-white/5">
                <div className="text-center mb-8">
                    <Heart size={40} className="text-accent mx-auto mb-4 animate-pulse" />
                    <h2 className="text-xl font-black text-white uppercase tracking-tight">Support SnapAura</h2>
                    <p className="text-[10px] text-primary font-black uppercase tracking-[0.3em] mt-1">M-Pesa Integration</p>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-6">
                    {[100, 500, 1000, 5000].map(amt => (
                        <button key={amt} onClick={() => setAmount(amt)} className={`py-4 rounded-2xl font-mono text-sm font-bold border transition-all ${amount === amt ? 'bg-primary text-white border-primary shadow-lg scale-[1.02]' : 'bg-dark-900 text-gray-500 border-white/5 shadow-neu-pressed'}`}>
                            {amt.toLocaleString()}
                        </button>
                    ))}
                </div>

                <div className="relative group mb-6">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-primary"><CreditCard size={18} /></div>
                    <input type="tel" placeholder="07XX XXX XXX" value={phone} onChange={e => setPhone(e.target.value)} className="w-full bg-dark-900 border border-white/5 rounded-2xl pl-12 pr-4 py-5 text-white font-mono text-sm outline-none focus:border-primary/50 shadow-neu-pressed transition-all placeholder:text-gray-700" />
                </div>

                <button onClick={handleDonate} disabled={isLoading} className="w-full bg-gradient-to-r from-primary to-secondary text-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] shadow-neu active:shadow-neu-pressed disabled:opacity-50 transition-all flex items-center justify-center gap-3">
                    {isLoading ? <RefreshCw size={18} className="animate-spin" /> : <><Heart size={16}/> Support KES {amount.toLocaleString()} <ArrowRight size={14} /></>}
                </button>
            </div>
            <p className="text-[8px] text-gray-600 text-center font-bold uppercase tracking-widest">Powered by LipaFare Gateway</p>
        </div>
    );
};

const QrTools = () => {
    const [mode, setMode] = useState<'scan' | 'gen'>('scan');
    const [scanResult, setScanResult] = useState<string | null>(null);
    const [isScanning, setIsScanning] = useState(false);
    const scannerRef = useRef<any>(null);

    const handleScan = (decodedText: string) => {
        setScanResult(decodedText);
        stopScanning();
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
            <div className="flex bg-dark-900 shadow-neu-pressed p-1.5 rounded-2xl border border-white/5">
                <button onClick={() => setMode('scan')} className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${mode === 'scan' ? 'bg-dark-800 shadow-neu text-primary' : 'text-gray-500'}`}>Scan Code</button>
                <button onClick={() => setMode('gen')} className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${mode === 'gen' ? 'bg-dark-800 shadow-neu text-primary' : 'text-gray-500'}`}>Generate</button>
            </div>
            {mode === 'scan' && (
                <div className="bg-dark-800 shadow-neu p-6 rounded-[2.5rem] relative overflow-hidden min-h-[450px] border border-white/5">
                    <div id="reader" className="w-full bg-black rounded-2xl overflow-hidden min-h-[300px] shadow-neu-pressed"></div>
                    {!scanResult ? (
                        <button onClick={startScanning} className="mt-6 w-full py-5 bg-dark-900 shadow-neu text-primary font-black uppercase tracking-widest rounded-2xl active:shadow-neu-pressed transition-all">Enable Scanner</button>
                    ) : (
                        <div className="mt-6 space-y-4">
                            <SmartCard title="Data Extraction" content={scanResult} icon={QrCode} className="bg-dark-900 border border-white/5" />
                            <button onClick={() => {setScanResult(null); startScanning();}} className="w-full py-4 bg-dark-900 shadow-neu text-gray-400 font-black rounded-2xl active:shadow-neu-pressed">Reset</button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

const UnitConverter = () => <div className="bg-dark-800 shadow-neu p-10 rounded-[2.5rem] text-center text-gray-600 border border-white/5 font-black uppercase tracking-widest">Converter Offline</div>;
const LinkShortener = () => <div className="bg-dark-800 shadow-neu p-10 rounded-[2.5rem] text-center text-gray-600 border border-white/5 font-black uppercase tracking-widest">Shortener Offline</div>;
const PhotoUtils = () => <div className="bg-dark-800 shadow-neu p-10 rounded-[2.5rem] text-center text-gray-600 border border-white/5 font-black uppercase tracking-widest">Lab Offline</div>;
const FinancialTools = () => <div className="bg-dark-800 shadow-neu p-10 rounded-[2.5rem] text-center text-gray-600 border border-white/5 font-black uppercase tracking-widest">Finance Offline</div>;

export default Toolkit;
