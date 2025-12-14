
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
      <div className="space-y-8 animate-fade-in-up pb-20">
          {/* Quick Shortcuts */}
          <div className="space-y-3">
              <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1 flex items-center gap-1">
                  <Star size={10} className="text-yellow-400" /> Favorites
              </h3>
              <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2">
                  <button onClick={() => setActiveTool('qr-tools')} className="flex items-center gap-3 bg-[#292d3e] shadow-neu p-4 rounded-2xl min-w-[140px] active:shadow-neu-pressed transition-all">
                      <div className="p-2 bg-[#292d3e] shadow-neu-pressed rounded-full text-blue-400"><QrCode size={18}/></div>
                      <span className="text-xs font-bold text-gray-300">Scan QR</span>
                  </button>
                  <button onClick={() => setActiveTool('aura-state')} className="flex items-center gap-3 bg-[#292d3e] shadow-neu p-4 rounded-2xl min-w-[140px] active:shadow-neu-pressed transition-all">
                      <div className="p-2 bg-[#292d3e] shadow-neu-pressed rounded-full text-indigo-400"><Globe size={18}/></div>
                      <span className="text-xs font-bold text-gray-300">AuraState</span>
                  </button>
                  <button onClick={() => setActiveTool('gen-z-lab')} className="flex items-center gap-3 bg-[#292d3e] shadow-neu p-4 rounded-2xl min-w-[140px] active:shadow-neu-pressed transition-all">
                      <div className="p-2 bg-[#292d3e] shadow-neu-pressed rounded-full text-pink-400"><Ghost size={18}/></div>
                      <span className="text-xs font-bold text-gray-300">Vibe Check</span>
                  </button>
              </div>
          </div>

          {/* Search */}
          <div className="relative group">
              <div className="absolute inset-0 bg-[#292d3e] rounded-2xl shadow-neu-pressed pointer-events-none"></div>
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 z-10" size={18} />
              <input 
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search tools..." 
                  className="w-full bg-transparent rounded-2xl pl-12 pr-4 py-4 text-gray-200 focus:outline-none relative z-10 text-sm font-bold placeholder-gray-600"
              />
          </div>

          {/* Grid */}
          {categories.map((cat, catIdx) => (
              <div key={cat} className="space-y-3">
                  <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1 border-l-2 border-primary pl-2">{cat}</h3>
                  <div className="grid grid-cols-2 gap-4">
                      {filteredTools.filter(t => t.cat === cat).map((tool, idx) => (
                          <div 
                            key={tool.id} 
                            onClick={() => setActiveTool(tool.id)}
                            className={`bg-[#292d3e] shadow-neu p-5 rounded-2xl flex flex-col items-center justify-center gap-3 cursor-pointer active:shadow-neu-pressed transition-all active:scale-95 group relative overflow-hidden animate-fade-in-up`}
                            style={{ animationDelay: `${(catIdx * 100) + (idx * 50)}ms` }}
                          >
                              {/* Hover Glow */}
                              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                              
                              <div className={`p-4 bg-[#292d3e] shadow-neu-pressed rounded-full ${tool.color} group-hover:scale-110 transition-transform relative z-10`}>
                                  <tool.icon size={24} />
                              </div>
                              <span className="font-bold text-gray-300 text-sm relative z-10">{tool.label}</span>
                          </div>
                      ))}
                  </div>
              </div>
          ))}
      </div>
  );

  return (
    <div className="h-full overflow-y-auto hide-scrollbar bg-[#292d3e] p-4 pb-24 relative">
        {/* Cinematic Background */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(0,243,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,243,255,0.03)_1px,transparent_1px)] bg-[size:60px_60px] opacity-20 transform perspective-500 rotateX-60 animate-grid-move"></div>
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[100px] animate-pulse-slow"></div>
            <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-secondary/10 rounded-full blur-[80px] animate-pulse-slow delay-500"></div>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between sticky top-0 bg-[#292d3e]/95 backdrop-blur-md py-3 z-30 mb-4 border-b border-white/5">
            <div className="flex items-center gap-3">
                {activeTool !== 'menu' && (
                    <button onClick={() => setActiveTool('menu')} className="p-2.5 bg-[#292d3e] shadow-neu rounded-xl text-gray-400 hover:text-white active:shadow-neu-pressed transition-all">
                        <ArrowLeft size={18} />
                    </button>
                )}
                <h1 className="text-xl font-black text-gray-200 tracking-tight flex items-center gap-2">
                    {activeTool === 'menu' ? 'Toolkit OS' : tools.find(t => t.id === activeTool)?.label || 'Tool'}
                </h1>
            </div>
            <button onClick={onOpenSettings} className="p-2.5 bg-[#292d3e] shadow-neu rounded-xl text-gray-400 active:shadow-neu-pressed">
                <Settings size={18} />
            </button>
        </div>

        <div className="relative z-10">
            {activeTool === 'menu' && renderMenu()}
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
  );
};

// ... Sub-components (QrTools, FinancialTools, etc.) ...

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

    const generateQr = () => {
        if(!genText) return;
        const url = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(genText)}`;
        setQrCode(url);
    };

    const handleScan = (decodedText: string) => {
        setScanResult(decodedText);
        stopScanning();

        if (decodedText.startsWith('WIFI:')) {
            setScanType('wifi');
            const ssid = decodedText.match(/S:([^;]+)/)?.[1];
            const password = decodedText.match(/P:([^;]+)/)?.[1];
            const type = decodedText.match(/T:([^;]+)/)?.[1];
            setWifiData({ ssid, password, type });
        } else if (decodedText.startsWith('http')) {
            setScanType('url');
        } else {
            setScanType('text');
        }
        showToast("Code detected!", "success");
    };

    const startScanning = () => {
        if (isScanning) return;
        setIsScanning(true);
        setScanResult(null);
        setWifiData(null);
        
        setTimeout(() => {
            const html5QrCode = new Html5Qrcode("reader");
            scannerRef.current = html5QrCode;
            const config = { fps: 10, qrbox: { width: 250, height: 250 } };
            
            html5QrCode.start({ facingMode: "environment" }, config, handleScan, () => {})
                .catch((err: any) => { setIsScanning(false); showToast("Camera error", "error"); });
        }, 100);
    };

    const stopScanning = () => {
        if (scannerRef.current?.isScanning) {
            scannerRef.current.stop().then(() => { scannerRef.current.clear(); setIsScanning(false); }).catch(()=>{});
        } else { setIsScanning(false); }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        try {
            const html5QrCode = new Html5Qrcode("reader");
            const result = await html5QrCode.scanFile(file, true);
            handleScan(result);
        } catch (err) { showToast("No QR code found", "error"); }
    };

    useEffect(() => {
        if (mode === 'scan' && !scanResult) startScanning();
        return () => stopScanning();
    }, [mode]);

    return (
        <div className="space-y-6 animate-fade-in-up">
            <div className="flex bg-[#292d3e] shadow-neu-pressed p-1 rounded-xl">
                <button onClick={() => setMode('scan')} className={`flex-1 py-3 text-xs font-bold rounded-lg transition-all ${mode === 'scan' ? 'bg-[#292d3e] shadow-neu text-blue-400' : 'text-gray-500'}`}>Scan</button>
                <button onClick={() => setMode('gen')} className={`flex-1 py-3 text-xs font-bold rounded-lg transition-all ${mode === 'gen' ? 'bg-[#292d3e] shadow-neu text-blue-400' : 'text-gray-500'}`}>Generate</button>
            </div>

            {mode === 'scan' && (
                <div className="bg-[#292d3e] shadow-neu p-4 rounded-2xl relative overflow-hidden min-h-[400px] flex flex-col">
                    <div id="reader" className="w-full bg-black rounded-xl overflow-hidden min-h-[300px]"></div>
                    {isScanning && <div className="absolute inset-0 pointer-events-none border-2 border-blue-400/50 rounded-2xl z-10 m-4"><div className="w-full h-0.5 bg-red-500 animate-[laserY_2s_infinite_alternate] shadow-[0_0_15px_red] relative top-1/2"></div></div>}
                    {!isScanning && !scanResult && <button onClick={startScanning} className="mt-4 w-full py-3 bg-[#292d3e] shadow-neu text-blue-400 font-bold rounded-xl">Start Camera</button>}
                    
                    {scanResult && (
                        <div className="mt-4 space-y-4">
                            <SmartCard title={scanType === 'url' ? "Link Found" : "Scanned Data"} content={wifiData ? `WiFi: ${wifiData.ssid}` : scanResult} icon={QrCode} />
                            {scanType === 'url' && <a href={scanResult} target="_blank" className="w-full py-3 bg-[#292d3e] shadow-neu text-green-400 font-bold rounded-xl flex justify-center items-center gap-2"><ExternalLink size={16}/> Open Link</a>}
                            <button onClick={() => {setScanResult(null); startScanning();}} className="w-full py-3 bg-[#292d3e] shadow-neu text-gray-400 font-bold rounded-xl"><RefreshCw size={16}/> Scan Again</button>
                        </div>
                    )}
                    <button onClick={() => fileRef.current?.click()} className="mt-4 w-full py-3 bg-[#292d3e] shadow-neu text-gray-400 font-bold rounded-xl"><ImagePlus size={16}/> Scan Image</button>
                </div>
            )}
            
            {mode === 'gen' && (
                <div className="bg-[#292d3e] shadow-neu p-6 rounded-2xl space-y-6">
                    <input value={genText} onChange={e => setGenText(e.target.value)} placeholder="Enter text..." className="w-full bg-[#292d3e] shadow-neu-pressed rounded-xl p-4 text-gray-200 outline-none"/>
                    <button onClick={generateQr} className="w-full bg-[#292d3e] shadow-neu text-blue-400 py-4 rounded-xl font-bold">Generate</button>
                    {qrCode && <div className="p-4 bg-white rounded-xl mx-auto w-fit"><img src={qrCode} className="w-48 h-48"/></div>}
                </div>
            )}
            <input type="file" ref={fileRef} onChange={handleFileUpload} className="hidden" accept="image/*"/>
        </div>
    );
};

const CRYPTO_LIST = [
    "Bitcoin (BTC)", "Ethereum (ETH)", "Solana (SOL)", "Cardano (ADA)", 
    "Ripple (XRP)", "Polkadot (DOT)", "Dogecoin (DOGE)", "Shiba Inu (SHIB)",
    "Litecoin (LTC)", "Avalanche (AVAX)", "Chainlink (LINK)", "Polygon (MATIC)",
    "Binance Coin (BNB)", "Uniswap (UNI)", "Stellar (XLM)", "Cosmos (ATOM)",
    "Monero (XMR)", "Ethereum Classic (ETC)", "Bitcoin Cash (BCH)", "Filecoin (FIL)"
];

const FIAT_LIST = [
    "USD", "EUR", "GBP", "JPY", "CNY", "INR", "KES", "NGN", "ZAR", 
    "CAD", "AUD", "CHF", "SGD", "AED", "SAR", "GHS", "UGX", "TZS",
    "BRL", "RUB", "MXN", "KRW", "TRY", "SEK", "NOK", "DKK"
];

const FinancialTools = () => {
    const [tab, setTab] = useState<'overview'|'analyze'|'currency'>('overview');
    const [coin, setCoin] = useState('Bitcoin (BTC)');
    const [cryptoData, setCryptoData] = useState<any>(null);
    const [marketOverview, setMarketOverview] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [amount, setAmount] = useState('100');
    const [fromCur, setFromCur] = useState('USD');
    const [toCur, setToCur] = useState('KES');
    const [res, setRes] = useState<any>(null);

    const fetchCrypto = async () => {
        setLoading(true);
        try { setCryptoData(await getCryptoData(coin)); } catch(e) {} finally { setLoading(false); }
    };
    
    const fetchOverview = async () => {
        setLoading(true);
        try { setMarketOverview(await getCryptoMarketOverview()); } catch(e) {} finally { setLoading(false); }
    };

    const fetchCurrency = async () => {
        setLoading(true);
        try { setRes(await getCurrencyData(amount, fromCur, toCur)); } catch(e) {} finally { setLoading(false); }
    };

    useEffect(() => {
        if(tab === 'overview' && marketOverview.length === 0) fetchOverview();
    }, [tab]);

    return (
        <div className="space-y-6 animate-fade-in-up">
            <div className="flex bg-[#292d3e] shadow-neu-pressed p-1 rounded-xl overflow-x-auto hide-scrollbar">
                <button onClick={() => setTab('overview')} className={`flex-1 py-3 px-4 whitespace-nowrap text-xs font-bold rounded-lg transition-all ${tab === 'overview' ? 'bg-[#292d3e] shadow-neu text-blue-400' : 'text-gray-500'}`}>Overview</button>
                <button onClick={() => setTab('analyze')} className={`flex-1 py-3 px-4 whitespace-nowrap text-xs font-bold rounded-lg transition-all ${tab === 'analyze' ? 'bg-[#292d3e] shadow-neu text-yellow-400' : 'text-gray-500'}`}>Analysis</button>
                <button onClick={() => setTab('currency')} className={`flex-1 py-3 px-4 whitespace-nowrap text-xs font-bold rounded-lg transition-all ${tab === 'currency' ? 'bg-[#292d3e] shadow-neu text-green-400' : 'text-gray-500'}`}>Currency</button>
            </div>

            {tab === 'overview' && (
                <div className="space-y-4">
                    <div className="flex justify-between items-center px-2">
                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Top Performers</h3>
                        <button onClick={fetchOverview} className="p-2 bg-[#292d3e] shadow-neu rounded-lg text-gray-400 active:shadow-neu-pressed">
                            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
                        </button>
                    </div>
                    {loading && marketOverview.length === 0 ? (
                        <div className="p-8 text-center text-gray-500 bg-[#292d3e] shadow-neu rounded-2xl">Loading Market Data...</div>
                    ) : (
                        <div className="bg-[#292d3e] shadow-neu rounded-2xl overflow-hidden">
                            <div className="grid grid-cols-4 bg-[#1e212d] p-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                                <div className="col-span-1">Asset</div>
                                <div className="col-span-1 text-right">Price</div>
                                <div className="col-span-1 text-right">24h</div>
                                <div className="col-span-1 text-center">Signal</div>
                            </div>
                            <div className="divide-y divide-white/5">
                                {marketOverview.map((item, i) => (
                                    <div key={i} className="grid grid-cols-4 p-4 items-center hover:bg-white/5 transition-colors">
                                        <div className="col-span-1">
                                            <div className="font-bold text-gray-200 text-sm">{item.symbol}</div>
                                            <div className="text-[9px] text-gray-500 truncate">{item.name}</div>
                                        </div>
                                        <div className="col-span-1 text-right text-xs font-mono text-gray-300">{item.price}</div>
                                        <div className={`col-span-1 text-right text-xs font-bold ${item.change?.includes('+') ? 'text-green-400' : 'text-red-400'}`}>
                                            {item.change}
                                        </div>
                                        <div className="col-span-1 flex justify-center">
                                            <span className={`text-[9px] font-black px-2 py-1 rounded-md ${
                                                item.signal?.includes('BUY') ? 'bg-green-400/10 text-green-400' : 
                                                item.signal?.includes('SELL') ? 'bg-red-400/10 text-red-400' : 'bg-gray-500/10 text-gray-400'
                                            }`}>
                                                {item.signal}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {tab === 'analyze' && (
                <div className="bg-[#292d3e] shadow-neu p-6 rounded-2xl space-y-4">
                    <div className="relative">
                        <select value={coin} onChange={e => setCoin(e.target.value)} className="w-full bg-[#292d3e] shadow-neu-pressed p-4 rounded-xl text-gray-200 outline-none appearance-none">
                            {CRYPTO_LIST.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">▼</div>
                    </div>

                    <button onClick={fetchCrypto} disabled={loading} className="w-full bg-[#292d3e] shadow-neu text-yellow-400 py-4 rounded-xl font-bold active:shadow-neu-pressed transition-all">
                        {loading ? <RefreshCw className="animate-spin" /> : 'Analyze Deeply'}
                    </button>

                    {cryptoData && (
                        <div className="space-y-4 pt-4 border-t border-white/5">
                            <div className="flex justify-between items-end">
                                <div>
                                    <div className="text-2xl font-black text-gray-200">{cryptoData.price}</div>
                                    <div className={`text-sm font-bold ${cryptoData.change?.includes('-') ? 'text-red-400' : 'text-green-400'}`}>
                                        {cryptoData.change}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-[10px] text-gray-500 uppercase font-bold">Signal</div>
                                    <div className={`text-sm font-black uppercase ${
                                        cryptoData.signal?.includes('BUY') ? 'text-green-400' : 
                                        cryptoData.signal?.includes('SELL') ? 'text-red-400' : 'text-gray-400'
                                    }`}>{cryptoData.signal}</div>
                                </div>
                            </div>
                            
                            <SmartCard title="Technical Analysis" content={
                                <div className="space-y-2">
                                    <p className="text-gray-400">{cryptoData.analysis}</p>
                                    {cryptoData.technical && (
                                        <div className="grid grid-cols-2 gap-2 mt-3">
                                            <div className="bg-[#1e212d] p-2 rounded-lg text-xs text-gray-400">RSI: <span className="text-white font-bold">{cryptoData.technical.rsi}</span></div>
                                            <div className="bg-[#1e212d] p-2 rounded-lg text-xs text-gray-400">MACD: <span className="text-white font-bold">{cryptoData.technical.macd}</span></div>
                                            <div className="bg-[#1e212d] p-2 rounded-lg text-xs text-gray-400">Supp: <span className="text-green-400 font-bold">{cryptoData.technical.support}</span></div>
                                            <div className="bg-[#1e212d] p-2 rounded-lg text-xs text-gray-400">Res: <span className="text-red-400 font-bold">{cryptoData.technical.resistance}</span></div>
                                        </div>
                                    )}
                                </div>
                            } icon={Activity} />
                        </div>
                    )}
                </div>
            )}

            {tab === 'currency' && (
                <div className="bg-[#292d3e] shadow-neu p-6 rounded-2xl space-y-4">
                    <div className="flex gap-2">
                        <input value={amount} onChange={e => setAmount(e.target.value)} className="flex-1 bg-[#292d3e] shadow-neu-pressed p-4 rounded-xl text-gray-200 outline-none" placeholder="Amount"/>
                        <div className="relative w-24">
                            <select value={fromCur} onChange={e => setFromCur(e.target.value)} className="w-full h-full bg-[#292d3e] shadow-neu-pressed pl-3 pr-6 rounded-xl text-gray-200 outline-none appearance-none font-bold text-sm">
                                {FIAT_LIST.map(c => <option key={c}>{c}</option>)}
                            </select>
                            <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500 text-[10px]">▼</div>
                        </div>
                    </div>
                    
                    <div className="relative">
                        <select value={toCur} onChange={e => setToCur(e.target.value)} className="w-full bg-[#292d3e] shadow-neu-pressed p-4 rounded-xl text-gray-200 outline-none appearance-none font-bold">
                             {FIAT_LIST.map(c => <option key={c}>{c}</option>)}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">▼</div>
                    </div>

                    <button onClick={fetchCurrency} disabled={loading} className="w-full bg-[#292d3e] shadow-neu text-green-400 py-4 rounded-xl font-bold active:shadow-neu-pressed transition-all">
                        {loading ? <RefreshCw className="animate-spin" /> : 'Convert Now'}
                    </button>
                    {res && <SmartCard title={res.result} subtitle={res.rate} content="" icon={DollarSign} />}
                </div>
            )}
        </div>
    );
};

const UnitConverter = () => (
    <div className="bg-[#292d3e] shadow-neu p-6 rounded-2xl text-center text-gray-500">Unit Converter Placeholder</div>
);
const LinkShortener = () => (
    <div className="bg-[#292d3e] shadow-neu p-6 rounded-2xl text-center text-gray-500">Link Shortener Placeholder</div>
);
const PhotoUtils = () => (
    <div className="bg-[#292d3e] shadow-neu p-6 rounded-2xl text-center text-gray-500">Photo Utilities Placeholder</div>
);

export default Toolkit;
