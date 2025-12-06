
import React, { useState, useEffect, useRef } from 'react';
import { 
  Briefcase, ArrowLeft, Settings, QrCode, Bitcoin, Ruler, 
  ImageIcon, Scissors, Palette, FileText, Smartphone,
  Link as LinkIcon, RefreshCw, Copy, CheckCircle, ExternalLink,
  Wifi, Search, Download, Upload, Zap, Lock, Unlock, TrendingUp, DollarSign,
  Activity, Star, Eye, EyeOff, ImagePlus
} from './Icons';
import SocialGrowth from './SocialGrowth';
import SmartNotes from './SmartNotes';
import ProfileStudio from './ProfileStudio';
import MoodboardGenerator from './MoodboardGenerator';
import PdfTools from './PdfTools';
import FootballHub from './FootballHub';
import { getCryptoData, getCurrencyData } from '../services/geminiService';
import { showToast } from './Toast';
import SmartCard from './SmartCard';

// Access global libraries
declare const Html5Qrcode: any;

const Toolkit: React.FC<any> = ({ onOpenSettings }) => {
  const [activeTool, setActiveTool] = useState<string>('menu');
  const [searchQuery, setSearchQuery] = useState('');

  // Listen for Neural Intents (Automation)
  useEffect(() => {
      const handler = (e: CustomEvent) => {
          setActiveTool(e.detail);
      };
      window.addEventListener('neural-tool-select', handler as EventListener);
      return () => window.removeEventListener('neural-tool-select', handler as EventListener);
  }, []);

  const tools = [
    { id: 'qr-tools', label: 'QR Master', icon: QrCode, color: 'text-blue-400', cat: 'Essentials' },
    { id: 'finance', label: 'Crypto & Fiat', icon: Bitcoin, color: 'text-yellow-400', cat: 'Essentials' },
    { id: 'units', label: 'Converter', icon: Ruler, color: 'text-green-400', cat: 'Essentials' },
    { id: 'links', label: 'Link Shortener', icon: LinkIcon, color: 'text-purple-400', cat: 'Essentials' },
    
    { id: 'notes', label: 'Smart Notes', icon: FileText, color: 'text-yellow-400', cat: 'Intelligence' },
    { id: 'social-growth', label: 'Social Growth', icon: TrendingUp, color: 'text-blue-400', cat: 'Intelligence' },
    { id: 'football-hub', label: 'Football Intel', icon: Zap, color: 'text-green-400', cat: 'Intelligence' },
    
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
                  <button onClick={() => setActiveTool('finance')} className="flex items-center gap-3 bg-[#292d3e] shadow-neu p-4 rounded-2xl min-w-[140px] active:shadow-neu-pressed transition-all">
                      <div className="p-2 bg-[#292d3e] shadow-neu-pressed rounded-full text-yellow-400"><Bitcoin size={18}/></div>
                      <span className="text-xs font-bold text-gray-300">Market</span>
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
        {/* Background FX */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
            <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-primary/5 rounded-full blur-[80px] animate-pulse-slow"></div>
            <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-secondary/5 rounded-full blur-[80px] animate-pulse-slow delay-500"></div>
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
            {activeTool === 'pdf-tools' && <PdfTools />}
        </div>
    </div>
  );
};

const QrTools = () => {
    const [mode, setMode] = useState<'scan' | 'gen'>('scan');
    const [genText, setGenText] = useState('');
    const [qrCode, setQrCode] = useState('');
    const [scanResult, setScanResult] = useState<string | null>(null);
    const [scanType, setScanType] = useState<'url'|'text'|'wifi'|null>(null);
    const [wifiData, setWifiData] = useState<any>(null);
    const [isScanning, setIsScanning] = useState(false);
    const [showWifiPass, setShowWifiPass] = useState(false);
    
    const scannerRef = useRef<any>(null);
    const fileRef = useRef<HTMLInputElement>(null);

    const generateQr = () => {
        if(!genText) return;
        const url = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(genText)}`;
        setQrCode(url);
    };

    const handleScan = (decodedText: string) => {
        setScanResult(decodedText);
        stopScanning(); // Auto stop on success

        if (decodedText.startsWith('WIFI:')) {
            setScanType('wifi');
            // Parse WIFI:S:SSID;T:WPA;P:Password;;
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
        
        // Small delay to let UI render the #reader div
        setTimeout(() => {
            const html5QrCode = new Html5Qrcode("reader");
            scannerRef.current = html5QrCode;
            const config = { fps: 10, qrbox: { width: 250, height: 250 } };
            
            html5QrCode.start(
                { facingMode: "environment" }, 
                config, 
                handleScan,
                (error: any) => { /* ignore frame errors */ }
            ).catch((err: any) => {
                console.error(err);
                setIsScanning(false);
                showToast("Camera access failed", "error");
            });
        }, 100);
    };

    const stopScanning = () => {
        if (scannerRef.current && scannerRef.current.isScanning) {
            scannerRef.current.stop().then(() => {
                scannerRef.current.clear();
                setIsScanning(false);
            }).catch((e: any) => console.error(e));
        } else {
            setIsScanning(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        
        try {
            const html5QrCode = new Html5Qrcode("reader"); // Re-use reader ID even if hidden
            const result = await html5QrCode.scanFile(file, true);
            handleScan(result);
        } catch (err) {
            showToast("No QR code found in image", "error");
        }
    };

    useEffect(() => {
        return () => {
            if (scannerRef.current?.isScanning) {
                scannerRef.current.stop().catch((e:any)=>{});
            }
        };
    }, []);

    return (
        <div className="space-y-6 animate-fade-in-up">
            <div className="flex bg-[#292d3e] shadow-neu-pressed p-1 rounded-xl">
                <button onClick={() => setMode('scan')} className={`flex-1 py-3 text-xs font-bold rounded-lg transition-all ${mode === 'scan' ? 'bg-[#292d3e] shadow-neu text-blue-400' : 'text-gray-500'}`}>Scan</button>
                <button onClick={() => setMode('gen')} className={`flex-1 py-3 text-xs font-bold rounded-lg transition-all ${mode === 'gen' ? 'bg-[#292d3e] shadow-neu text-blue-400' : 'text-gray-500'}`}>Generate</button>
            </div>

            {mode === 'scan' && (
                <div className="bg-[#292d3e] shadow-neu p-4 rounded-2xl relative overflow-hidden min-h-[400px] flex flex-col">
                    
                    {/* Camera Feed Area */}
                    <div className={`relative rounded-xl overflow-hidden shadow-neu-pressed bg-black flex-1 flex items-center justify-center`}>
                        <div id="reader" className="w-full h-full"></div>
                        
                        {!isScanning && !scanResult && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-[#292d3e] z-10">
                                <QrCode size={48} className="text-gray-500 opacity-20" />
                                <div className="flex flex-col gap-3 w-full px-8">
                                    <button onClick={startScanning} className="w-full py-4 bg-[#292d3e] shadow-neu text-blue-400 font-bold rounded-xl active:shadow-neu-pressed flex items-center justify-center gap-2">
                                        <QrCode size={18}/> Start Camera
                                    </button>
                                    <button onClick={() => fileRef.current?.click()} className="w-full py-4 bg-[#292d3e] shadow-neu text-gray-400 font-bold rounded-xl active:shadow-neu-pressed flex items-center justify-center gap-2">
                                        <ImagePlus size={18}/> Scan Image
                                    </button>
                                </div>
                            </div>
                        )}

                        {isScanning && (
                            <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center z-20">
                                <div className="w-64 h-64 border-2 border-blue-400/50 rounded-3xl relative">
                                    <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-blue-400 rounded-tl-xl -mt-1 -ml-1"></div>
                                    <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-blue-400 rounded-tr-xl -mt-1 -mr-1"></div>
                                    <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-blue-400 rounded-bl-xl -mb-1 -ml-1"></div>
                                    <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-blue-400 rounded-br-xl -mb-1 -mr-1"></div>
                                    <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-red-500 shadow-[0_0_20px_red] animate-[laserY_2s_infinite_alternate] opacity-80"></div>
                                </div>
                                <div className="absolute bottom-4 left-0 right-0 text-center">
                                    <button onClick={stopScanning} className="pointer-events-auto bg-red-500/20 text-red-400 backdrop-blur-md border border-red-500/30 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-red-500/30 transition-colors">
                                        Stop Scanning
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Result Area */}
                    {scanResult && (
                        <div className="mt-6 space-y-4 animate-fade-in-up">
                            {scanType === 'wifi' && wifiData ? (
                                <div className="bg-[#292d3e] shadow-neu rounded-2xl p-5 border border-blue-400/20">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="p-3 bg-blue-400/10 rounded-full text-blue-400"><Wifi size={24} /></div>
                                        <div>
                                            <h3 className="font-bold text-gray-200">WiFi Network</h3>
                                            <p className="text-xs text-gray-500">Connect to {wifiData.ssid}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-3">
                                        <div className="bg-[#292d3e] shadow-neu-pressed p-3 rounded-xl flex justify-between items-center">
                                            <span className="text-xs text-gray-500 font-bold">Network</span>
                                            <span className="text-sm font-bold text-white">{wifiData.ssid}</span>
                                        </div>
                                        <div className="bg-[#292d3e] shadow-neu-pressed p-3 rounded-xl flex justify-between items-center">
                                            <span className="text-xs text-gray-500 font-bold">Password</span>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-bold text-white font-mono">
                                                    {showWifiPass ? wifiData.password : '••••••••'}
                                                </span>
                                                <button onClick={() => setShowWifiPass(!showWifiPass)} className="text-gray-500 hover:text-white">
                                                    {showWifiPass ? <EyeOff size={14}/> : <Eye size={14}/>}
                                                </button>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => {navigator.clipboard.writeText(wifiData.password); showToast("Password Copied", "success")}}
                                            className="w-full py-3 bg-[#292d3e] shadow-neu rounded-xl text-blue-400 font-bold text-xs flex items-center justify-center gap-2 active:shadow-neu-pressed"
                                        >
                                            <Copy size={14}/> Copy Password
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <SmartCard 
                                    title={scanType === 'url' ? "Website Link" : "Scanned Content"}
                                    content={scanResult}
                                    icon={scanType === 'url' ? ExternalLink : FileText}
                                />
                            )}

                            {scanType === 'url' && (
                                <a href={scanResult} target="_blank" rel="noreferrer" className="w-full py-4 bg-[#292d3e] shadow-neu rounded-xl text-blue-400 font-bold flex items-center justify-center gap-2 active:shadow-neu-pressed transition-all">
                                    <ExternalLink size={18} /> Visit Link
                                </a>
                            )}
                            
                            <button onClick={() => {setScanResult(null); startScanning();}} className="w-full py-4 bg-[#292d3e] shadow-neu rounded-xl text-gray-400 font-bold active:shadow-neu-pressed transition-all">
                                <RefreshCw size={16} className="inline mr-2"/> Scan Another
                            </button>
                        </div>
                    )}
                </div>
            )}

            {mode === 'gen' && (
                <div className="bg-[#292d3e] shadow-neu p-6 rounded-2xl space-y-6">
                    <input 
                        value={genText}
                        onChange={e => setGenText(e.target.value)}
                        placeholder="Enter text or URL..."
                        className="w-full bg-[#292d3e] shadow-neu-pressed rounded-xl p-4 text-gray-200 text-sm outline-none"
                    />
                    <button onClick={generateQr} className="w-full bg-[#292d3e] shadow-neu text-blue-400 py-4 rounded-xl font-bold active:shadow-neu-pressed">Create QR Code</button>
                    {qrCode && (
                        <div className="flex flex-col items-center gap-4">
                            <div className="p-4 bg-white rounded-xl shadow-neu">
                                <img src={qrCode} alt="QR" className="w-48 h-48" />
                            </div>
                            <a href={qrCode} download="snapaura-qr.png" className="text-xs text-gray-500 font-bold hover:text-white flex items-center gap-1"><Download size={12}/> Download PNG</a>
                        </div>
                    )}
                </div>
            )}
            <input type="file" ref={fileRef} onChange={handleFileUpload} className="hidden" accept="image/*" />
        </div>
    );
};

const FinancialTools = () => {
    const [tab, setTab] = useState<'crypto'|'currency'>('crypto');
    const [coin, setCoin] = useState('Bitcoin (BTC)');
    const [cryptoData, setCryptoData] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    // Currency State
    const [amount, setAmount] = useState('100');
    const [fromCur, setFromCur] = useState('USD');
    const [toCur, setToCur] = useState('KES');
    const [currencyResult, setCurrencyResult] = useState<any>(null);

    const fetchCrypto = async () => {
        setLoading(true);
        try { setCryptoData(await getCryptoData(coin)); }
        catch(e) { showToast("Error fetching crypto", "error"); }
        finally { setLoading(false); }
    };

    const fetchCurrency = async () => {
        setLoading(true);
        try { setCurrencyResult(await getCurrencyData(amount, fromCur, toCur)); }
        catch(e) { showToast("Error converting", "error"); }
        finally { setLoading(false); }
    };

    return (
        <div className="space-y-6 animate-fade-in-up">
            <div className="flex bg-[#292d3e] shadow-neu-pressed p-1 rounded-xl">
                <button onClick={() => setTab('crypto')} className={`flex-1 py-3 text-xs font-bold rounded-lg transition-all ${tab === 'crypto' ? 'bg-[#292d3e] shadow-neu text-yellow-400' : 'text-gray-500'}`}>Crypto</button>
                <button onClick={() => setTab('currency')} className={`flex-1 py-3 text-xs font-bold rounded-lg transition-all ${tab === 'currency' ? 'bg-[#292d3e] shadow-neu text-green-400' : 'text-gray-500'}`}>Currency</button>
            </div>

            {tab === 'crypto' && (
                <div className="bg-[#292d3e] shadow-neu p-6 rounded-2xl space-y-4">
                    <select value={coin} onChange={e => setCoin(e.target.value)} className="w-full bg-[#292d3e] shadow-neu-pressed p-4 rounded-xl text-gray-200 outline-none text-sm font-bold appearance-none">
                        <option>Bitcoin (BTC)</option>
                        <option>Ethereum (ETH)</option>
                        <option>Solana (SOL)</option>
                        <option>Cardano (ADA)</option>
                    </select>
                    <button onClick={fetchCrypto} disabled={loading} className="w-full bg-[#292d3e] shadow-neu text-yellow-400 py-4 rounded-xl font-bold active:shadow-neu-pressed flex items-center justify-center gap-2">
                        {loading ? <RefreshCw className="animate-spin"/> : 'Analyze Market'}
                    </button>
                    {cryptoData && (
                        <SmartCard 
                            title={cryptoData.price}
                            subtitle={cryptoData.signal}
                            icon={Activity}
                            content={
                                <div className="space-y-2">
                                    <div className={`text-sm font-bold ${cryptoData.change.includes('+') ? 'text-green-400' : 'text-red-400'}`}>{cryptoData.change} (24h)</div>
                                    <p className="text-gray-400">{cryptoData.analysis}</p>
                                </div>
                            }
                        />
                    )}
                </div>
            )}

            {tab === 'currency' && (
                <div className="bg-[#292d3e] shadow-neu p-6 rounded-2xl space-y-4">
                    <div className="flex gap-2">
                        <input value={amount} onChange={e => setAmount(e.target.value)} className="flex-1 bg-[#292d3e] shadow-neu-pressed p-4 rounded-xl text-gray-200 outline-none text-sm" placeholder="100"/>
                        <select value={fromCur} onChange={e => setFromCur(e.target.value)} className="w-24 bg-[#292d3e] shadow-neu-pressed p-4 rounded-xl text-gray-200 text-sm font-bold outline-none"><option>USD</option><option>EUR</option><option>GBP</option><option>KES</option></select>
                    </div>
                    <div className="flex justify-center"><RefreshCw size={16} className="text-gray-500"/></div>
                    <select value={toCur} onChange={e => setToCur(e.target.value)} className="w-full bg-[#292d3e] shadow-neu-pressed p-4 rounded-xl text-gray-200 outline-none text-sm font-bold"><option>KES</option><option>USD</option><option>EUR</option><option>GBP</option><option>NGN</option><option>ZAR</option></select>
                    
                    <button onClick={fetchCurrency} disabled={loading} className="w-full bg-[#292d3e] shadow-neu text-green-400 py-4 rounded-xl font-bold active:shadow-neu-pressed flex items-center justify-center gap-2">
                        {loading ? <RefreshCw className="animate-spin"/> : 'Convert'}
                    </button>
                    {currencyResult && (
                        <SmartCard 
                            title={currencyResult.result}
                            subtitle={currencyResult.rate}
                            icon={DollarSign}
                            content=""
                        />
                    )}
                </div>
            )}
        </div>
    );
};

const UnitConverter = () => {
    const [cat, setCat] = useState('length');
    const [val, setVal] = useState('');
    const [res, setRes] = useState('');

    const convert = () => {
        const n = parseFloat(val);
        if(isNaN(n)) return;
        if (cat === 'length') setRes(`${(n * 3.28084).toFixed(2)} ft`); // m to ft
        if (cat === 'mass') setRes(`${(n * 2.20462).toFixed(2)} lbs`); // kg to lbs
        if (cat === 'temp') setRes(`${((n * 9/5) + 32).toFixed(1)} °F`); // C to F
    };

    return (
        <div className="bg-[#292d3e] shadow-neu p-6 rounded-2xl space-y-6 animate-fade-in-up">
            <div className="flex justify-between px-2">
                {['length', 'mass', 'temp'].map(c => (
                    <button key={c} onClick={() => {setCat(c); setVal(''); setRes('');}} className={`text-xs font-bold uppercase ${cat === c ? 'text-green-400' : 'text-gray-500'}`}>{c}</button>
                ))}
            </div>
            <div className="space-y-4">
                <input value={val} onChange={e => setVal(e.target.value)} type="number" placeholder={cat === 'length' ? 'Meters' : cat === 'mass' ? 'Kilograms' : 'Celsius'} className="w-full bg-[#292d3e] shadow-neu-pressed rounded-xl p-4 text-gray-200 outline-none"/>
                <button onClick={convert} className="w-full bg-[#292d3e] shadow-neu text-gray-200 py-3 rounded-xl font-bold active:shadow-neu-pressed">Convert</button>
                {res && (
                    <div className="bg-[#292d3e] shadow-neu p-4 rounded-xl text-center">
                        <span className="text-2xl font-black text-green-400">{res}</span>
                    </div>
                )}
            </div>
        </div>
    );
};

const LinkShortener = () => {
    const [url, setUrl] = useState('');
    const [short, setShort] = useState('');
    const shorten = async () => {
        if(!url) return;
        try {
            const res = await fetch(`https://tinyurl.com/api-create.php?url=${url}`);
            const text = await res.text();
            setShort(text);
        } catch(e) { showToast("Failed to shorten", "error"); }
    };
    return (
        <div className="bg-[#292d3e] shadow-neu p-6 rounded-2xl space-y-6 animate-fade-in-up">
            <input value={url} onChange={e => setUrl(e.target.value)} placeholder="Paste long URL..." className="w-full bg-[#292d3e] shadow-neu-pressed rounded-xl p-4 text-gray-200 outline-none text-sm"/>
            <button onClick={shorten} className="w-full bg-[#292d3e] shadow-neu text-purple-400 py-3 rounded-xl font-bold active:shadow-neu-pressed">Shorten Link</button>
            {short && <SmartCard title="Shortened Link" content={short} icon={LinkIcon} />}
        </div>
    );
};

const PhotoUtils = () => {
    const [mode, setMode] = useState('compress');
    const [file, setFile] = useState<File|null>(null);
    const [preview, setPreview] = useState<string|null>(null);
    const [processed, setProcessed] = useState<string|null>(null);
    const [stat, setStat] = useState('');
    const fileRef = useRef<HTMLInputElement>(null);

    // Resize state
    const [width, setWidth] = useState(1080);
    const [quality, setQuality] = useState(80);

    const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0];
        if(f) {
            setFile(f);
            setPreview(URL.createObjectURL(f));
            setProcessed(null);
            setStat(`Original: ${(f.size/1024).toFixed(1)} KB`);
        }
    };

    const process = () => {
        if(!file || !preview) return;
        const img = new Image();
        img.src = preview;
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            let w = img.width;
            let h = img.height;

            if (mode === 'resize') {
                const aspect = h / w;
                w = width;
                h = w * aspect;
            }

            canvas.width = w;
            canvas.height = h;
            ctx?.drawImage(img, 0, 0, w, h);

            const q = mode === 'compress' ? quality/100 : 0.9;
            const data = canvas.toDataURL('image/jpeg', q);
            setProcessed(data);
            
            // Calculate size reduction
            const head = 'data:image/jpeg;base64,';
            const size = Math.round((data.length - head.length)*3/4) / 1024;
            setStat(prev => `${prev} -> New: ${size.toFixed(1)} KB`);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in-up">
            <div className="flex bg-[#292d3e] shadow-neu-pressed p-1 rounded-xl overflow-x-auto hide-scrollbar">
                {['compress', 'resize', 'meme'].map(m => (
                    <button key={m} onClick={() => {setMode(m); setProcessed(null);}} className={`px-4 py-2 rounded-lg text-xs font-bold uppercase whitespace-nowrap ${mode === m ? 'bg-[#292d3e] shadow-neu text-red-400' : 'text-gray-500'}`}>{m}</button>
                ))}
            </div>

            <div className="bg-[#292d3e] shadow-neu p-6 rounded-2xl space-y-4">
                {!file ? (
                    <button onClick={() => fileRef.current?.click()} className="w-full py-10 bg-[#292d3e] shadow-neu rounded-xl active:shadow-neu-pressed flex flex-col items-center text-gray-400 gap-2">
                        <Upload size={24}/> <span className="font-bold">Select Image</span>
                    </button>
                ) : (
                    <>
                        <img src={processed || preview!} className="w-full h-48 object-contain rounded-xl bg-[#1e212d]" alt="Preview"/>
                        <p className="text-center text-xs font-bold text-gray-500">{stat}</p>
                        
                        {mode === 'compress' && (
                             <div className="space-y-2">
                                 <label className="text-xs font-bold text-gray-500">Quality: {quality}%</label>
                                 <input type="range" min="10" max="90" value={quality} onChange={e => setQuality(parseInt(e.target.value))} className="w-full"/>
                             </div>
                        )}
                        {mode === 'resize' && (
                             <div className="space-y-2">
                                 <label className="text-xs font-bold text-gray-500">Width: {width}px</label>
                                 <input type="number" value={width} onChange={e => setWidth(parseInt(e.target.value))} className="w-full bg-[#292d3e] shadow-neu-pressed p-3 rounded-xl text-white outline-none"/>
                             </div>
                        )}
                        
                        <div className="flex gap-3">
                            <button onClick={process} className="flex-1 bg-[#292d3e] shadow-neu text-red-400 py-3 rounded-xl font-bold active:shadow-neu-pressed">Process</button>
                            {processed && (
                                <a href={processed} download="processed.jpg" className="flex-1 bg-[#292d3e] shadow-neu text-green-400 py-3 rounded-xl font-bold active:shadow-neu-pressed flex items-center justify-center gap-2">
                                    <Download size={16}/> Save
                                </a>
                            )}
                            <button onClick={() => {setFile(null); setProcessed(null);}} className="p-3 bg-[#292d3e] shadow-neu rounded-xl text-gray-400"><RefreshCw/></button>
                        </div>
                    </>
                )}
            </div>
            <input type="file" ref={fileRef} onChange={handleUpload} className="hidden"/>
        </div>
    );
};

export default Toolkit;
