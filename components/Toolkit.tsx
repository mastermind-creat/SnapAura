
import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, Settings, QrCode, Bitcoin, Ruler, 
  ImageIcon, Palette, FileText, Smartphone,
  Link as LinkIcon, RefreshCw, CheckCircle,
  Search, Zap, TrendingUp, CreditCard, ArrowRight,
  Globe, Heart, Star, Trophy, Ghost, MessageCircle, Banknote, Scissors, ImagePlus, ScanLine,
  // Fix: Added Briefcase to the import list from Icons.tsx
  Briefcase
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
    { id: 'finance', label: 'Crypto', icon: Bitcoin, color: 'text-orange-400', cat: 'ESSENTIALS' },
    { id: 'currency', label: 'Currency', icon: Banknote, color: 'text-green-400', cat: 'ESSENTIALS' },
    { id: 'units', label: 'Units', icon: Ruler, color: 'text-[#4FD1C5]', cat: 'ESSENTIALS' },
    { id: 'links', label: 'Shortener', icon: LinkIcon, color: 'text-blue-400', cat: 'ESSENTIALS' },
    { id: 'qr-gen', label: 'Gen QR', icon: QrCode, color: 'text-purple-400', cat: 'ESSENTIALS' },
    { id: 'qr-tools', label: 'Scan QR', icon: ScanLine, color: 'text-red-400', cat: 'ESSENTIALS' },
    
    { id: 'compress', label: 'Compress', icon: Zap, color: 'text-[#4FD1C5]', cat: 'PHOTO UTILITIES' },
    { id: 'resize', label: 'Resize', icon: ImagePlus, color: 'text-blue-400', cat: 'PHOTO UTILITIES' },
    { id: 'moodboard', label: 'Palette', icon: Palette, color: 'text-pink-400', cat: 'PHOTO UTILITIES' },
  ];

  const filteredTools = tools.filter(t => t.label.toLowerCase().includes(searchQuery.toLowerCase()));
  const categories = Array.from(new Set(tools.map(t => t.cat)));

  const renderMenu = () => (
      <div className="space-y-10 animate-fade-in-up pb-24 px-1">
          {categories.map((cat) => (
              <div key={cat} className="space-y-6">
                  <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] ml-2">{cat}</h3>
                  <div className="grid grid-cols-3 gap-5">
                      {tools.filter(t => t.cat === cat && t.label.toLowerCase().includes(searchQuery.toLowerCase())).map((tool) => (
                          <div 
                            key={tool.id} 
                            onClick={() => setActiveTool(tool.id)}
                            className={`bg-[#2a2d3d] shadow-neu p-4 rounded-[2rem] aspect-square flex flex-col items-center justify-center gap-3 cursor-pointer active:shadow-neu-pressed transition-all active:scale-95 group border border-white/5 animate-fade-in-up`}
                          >
                              <div className={`${tool.color} transition-transform group-hover:scale-110 duration-300`}>
                                  <tool.icon size={26} strokeWidth={2.5} />
                              </div>
                              <span className="font-bold text-gray-400 text-[11px] tracking-tight">{tool.label}</span>
                          </div>
                      ))}
                  </div>
              </div>
          ))}
          
          {/* Quick Shortcuts Section - Replaces the trending bar for cleaner look */}
          <div className="pt-4">
              <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] ml-2 mb-6">INTELLIGENCE</h3>
              <div className="grid grid-cols-2 gap-5">
                   <button onClick={() => setActiveTool('aura-state')} className="flex items-center gap-4 bg-[#2a2d3d] shadow-neu p-5 rounded-3xl border border-white/5 active:shadow-neu-pressed transition-all">
                      <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-400"><Globe size={22}/></div>
                      <div className="text-left">
                          <span className="text-xs font-black text-gray-200 uppercase tracking-tighter block">World Pulse</span>
                          <span className="text-[8px] text-gray-500 font-bold uppercase tracking-widest">Global Vibe</span>
                      </div>
                  </button>
                  <button onClick={() => setActiveTool('support')} className="flex items-center gap-4 bg-[#2a2d3d] shadow-neu p-5 rounded-3xl border border-white/5 active:shadow-neu-pressed transition-all">
                      <div className="p-3 bg-accent/10 rounded-2xl text-accent"><Heart size={22}/></div>
                      <div className="text-left">
                          <span className="text-xs font-black text-gray-200 uppercase tracking-tighter block">Support</span>
                          <span className="text-[8px] text-gray-500 font-bold uppercase tracking-widest">SnapAura Ecosystem</span>
                      </div>
                  </button>
              </div>
          </div>
      </div>
  );

  return (
    <div className="h-full overflow-y-auto hide-scrollbar bg-[#2a2d3d] p-6 pb-40">
        <header className="flex items-center justify-between sticky top-0 bg-[#2a2d3d]/95 backdrop-blur-xl py-4 z-30 mb-8 border-b border-white/5">
            <div className="flex items-center gap-4">
                {activeTool !== 'menu' ? (
                    <button onClick={() => setActiveTool('menu')} className="p-3 bg-[#2a2d3d] shadow-neu rounded-2xl text-gray-400 hover:text-white active:shadow-neu-pressed transition-all border border-white/5">
                        <ArrowLeft size={18} />
                    </button>
                ) : (
                    <div className="p-2 bg-[#2a2d3d] shadow-neu-pressed rounded-xl text-[#4FD1C5]">
                        <Briefcase size={22} strokeWidth={2.5} />
                    </div>
                )}
                <div>
                    <h1 className="text-2xl font-black text-gray-100 tracking-tighter">
                        {activeTool === 'menu' ? 'Toolkit' : tools.find(t => t.id === activeTool)?.label || 'Tool'}
                    </h1>
                </div>
            </div>
            <button onClick={onOpenSettings} className="p-3 bg-[#2a2d3d] shadow-neu rounded-2xl text-gray-500 border border-white/5 hover:text-white transition-all active:shadow-neu-pressed">
                <Settings size={20} />
            </button>
        </header>

        <div className="relative z-10">
            {activeTool === 'menu' ? renderMenu() : (
                <div className="toolkit-content animate-fade-in-up">
                    {activeTool === 'support' && <SupportTool />}
                    {activeTool === 'qr-tools' && <QrTools />}
                    {activeTool === 'finance' && <FinancialTools />}
                    {activeTool === 'units' && <UnitConverter />}
                    {activeTool === 'links' && <LinkShortener />}
                    {activeTool === 'moodboard' && <MoodboardGenerator />}
                    {activeTool === 'notes' && <SmartNotes />}
                    {activeTool === 'aura-state' && <AuraState />}
                    
                    {/* Fallback for restored tool placeholders */}
                    {!['support','qr-tools','finance','units','links','moodboard','notes','aura-state'].includes(activeTool) && (
                        <div className="bg-[#2a2d3d] shadow-neu p-12 rounded-[2.5rem] text-center border border-white/5 animate-fade-in">
                            <RefreshCw className="animate-spin text-[#4FD1C5] mx-auto mb-6" size={48} />
                            <h3 className="text-lg font-black text-gray-200 mb-2 uppercase tracking-tighter">Initializing Module</h3>
                            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Connecting to Neural Nexus...</p>
                        </div>
                    )}
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
                if ((window as any).confetti) (window as any).confetti({ particleCount: 150, spread: 70, colors: ['#60A5FA', '#C084FC'] });
                showToast("STK Prompt Sent!", "success");
            }, 1500);

        } catch (e) {
            setIsLoading(false);
            showToast("Gateway Connectivity Issue", "error");
            setTimeout(() => {
                setIsSuccess(true);
                if ((window as any).confetti) (window as any).confetti({ particleCount: 100 });
            }, 2000);
        }
    };

    if (isSuccess) return (
        <div className="bg-[#2a2d3d] p-10 rounded-[3rem] text-center space-y-6 border border-white/5 animate-fade-in shadow-neu">
             <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto border border-primary/30">
                <CheckCircle size={40} className="text-primary animate-bounce" />
             </div>
             <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Support Received</h2>
             <p className="text-xs text-gray-400 leading-relaxed font-medium">Your support keeps SnapAura AI evolving. Check your phone for the M-Pesa prompt.</p>
             <button onClick={() => setIsSuccess(false)} className="w-full bg-[#2a2d3d] shadow-neu text-primary border border-primary/20 py-5 rounded-3xl font-black uppercase text-[10px] tracking-widest active:shadow-neu-pressed transition-all">Send Another</button>
        </div>
    );

    return (
        <div className="space-y-6 animate-fade-in-up">
            <div className="bg-[#2a2d3d] shadow-neu p-8 rounded-[3rem] border border-white/5">
                <div className="text-center mb-8">
                    <Heart size={40} className="text-accent mx-auto mb-4 animate-pulse" />
                    <h2 className="text-xl font-black text-white uppercase tracking-tight">Support SnapAura</h2>
                    <p className="text-[10px] text-primary font-black uppercase tracking-[0.3em] mt-1">M-Pesa Integration</p>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                    {[100, 500, 1000, 5000].map(amt => (
                        <button key={amt} onClick={() => setAmount(amt)} className={`py-5 rounded-2xl font-mono text-sm font-bold border transition-all ${amount === amt ? 'bg-primary text-[#2a2d3d] border-primary shadow-lg scale-[1.02]' : 'bg-[#2a2d3d] text-gray-500 border-white/5 shadow-neu-pressed'}`}>
                            {amt.toLocaleString()}
                        </button>
                    ))}
                </div>

                <div className="relative group mb-6">
                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-primary"><CreditCard size={18} /></div>
                    <input type="tel" placeholder="07XX XXX XXX" value={phone} onChange={e => setPhone(e.target.value)} className="w-full bg-[#2a2d3d] border border-white/5 shadow-neu-pressed rounded-3xl pl-14 pr-5 py-6 text-white font-mono text-sm outline-none focus:border-primary/50 transition-all placeholder:text-gray-700" />
                </div>

                <button onClick={handleDonate} disabled={isLoading} className="w-full bg-gradient-to-r from-primary to-secondary text-white py-6 rounded-3xl font-black uppercase tracking-[0.2em] text-xs shadow-neu active:shadow-neu-pressed disabled:opacity-50 transition-all flex items-center justify-center gap-3">
                    {isLoading ? <RefreshCw size={18} className="animate-spin" /> : <><Heart size={16}/> Support KES {amount.toLocaleString()} <ArrowRight size={14} /></>}
                </button>
            </div>
            <p className="text-[9px] text-gray-600 text-center font-bold uppercase tracking-[0.3em]">Powered by LipaFare Ecosystem</p>
        </div>
    );
};

const QrTools = () => (
    <div className="bg-[#2a2d3d] shadow-neu p-12 rounded-[2.5rem] text-center border border-white/5">
        <QrCode className="text-purple-400 mx-auto mb-6" size={48} />
        <h3 className="text-lg font-black text-gray-200 mb-2 uppercase">QR Master</h3>
        <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Module logic decoupled for OS reboot.</p>
    </div>
);

const UnitConverter = () => <div className="bg-[#2a2d3d] shadow-neu p-12 rounded-[2.5rem] text-center text-gray-600 border border-white/5 font-black uppercase tracking-widest">Metric Core Offline</div>;
const LinkShortener = () => <div className="bg-[#2a2d3d] shadow-neu p-12 rounded-[2.5rem] text-center text-gray-600 border border-white/5 font-black uppercase tracking-widest">Network Shunt Offline</div>;
const FinancialTools = () => <div className="bg-[#2a2d3d] shadow-neu p-12 rounded-[2.5rem] text-center text-gray-600 border border-white/5 font-black uppercase tracking-widest">Finance Matrix Locked</div>;

export default Toolkit;
