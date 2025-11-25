import React, { useState, useRef, useEffect } from 'react';
import { Link, QrCode, Sparkles, ArrowLeft, Copy, RefreshCw, Briefcase, Wand2, Bitcoin, Banknote, TrendingUp, DollarSign, ArrowRight, Activity, AlertCircle, RefreshCcw, Info, Shield, Minimize, Maximize, Stamp, Smile, Grid, Calendar, Save, Archive, Film, Gamepad, ImagePlus, Scissors, Palette, Upload, ScanLine, CheckCircle, Settings, Ruler, ExternalLink } from './Icons';
import { generateSocialBio, getCryptoData, getCurrencyData } from '../services/geminiService';
import { showToast } from './Toast';

// Define tool types for better state management
type ToolType = 'menu' | 'shortener' | 'qr' | 'qr-scan' | 'bio' | 'crypto' | 'currency' | 'meta' | 'resize' | 'compress' | 'meme' | 'palette' | 'puzzle' | 'unit';

interface ToolkitProps {
  onOpenSettings: () => void;
}

const Toolkit: React.FC<ToolkitProps> = ({ onOpenSettings }) => {
  const [activeTool, setActiveTool] = useState<ToolType>('menu');
  const [isUploading, setIsUploading] = useState(false);

  // --- SOCIAL TOOLS STATE ---
  const [longUrl, setLongUrl] = useState('');
  const [shortUrl, setShortUrl] = useState('');
  const [isShortening, setIsShortening] = useState(false);
  const [qrText, setQrText] = useState('');
  const [qrUrl, setQrUrl] = useState('');
  const [bioInput, setBioInput] = useState('');
  const [bios, setBios] = useState<string[]>([]);
  const [isWritingBio, setIsWritingBio] = useState(false);
  const [scannedResult, setScannedResult] = useState<string | null>(null);

  // --- FINANCIAL TOOLS STATE ---
  const [selectedCoin, setSelectedCoin] = useState('Bitcoin (BTC)');
  const [cryptoResult, setCryptoResult] = useState<any>(null);
  const [financialResult, setFinancialResult] = useState<any>(null);
  const [isAnalyzingFinance, setIsAnalyzingFinance] = useState(false);
  const [amount, setAmount] = useState('1');
  const [fromCurr, setFromCurr] = useState('USD');
  const [toCurr, setToCurr] = useState('KES');

  // --- UNIT CONVERTER STATE ---
  const [unitCategory, setUnitCategory] = useState<'length' | 'mass' | 'temp'>('length');
  const [unitVal, setUnitVal] = useState('1');
  const [unitFrom, setUnitFrom] = useState('m');
  const [unitTo, setUnitTo] = useState('ft');
  const [unitResult, setUnitResult] = useState<string | null>(null);

  // --- PHOTO UTILS STATE ---
  const [utilImage, setUtilImage] = useState<string | null>(null);
  const [imageMeta, setImageMeta] = useState<any>(null);
  const utilFileInputRef = useRef<HTMLInputElement>(null);
  const qrFileInputRef = useRef<HTMLInputElement>(null); 
  
  // Palette
  const [extractedColors, setExtractedColors] = useState<string[]>([]);
  
  // Meme
  const [memeTop, setMemeTop] = useState('');
  const [memeBottom, setMemeBottom] = useState('');
  const [memeCanvasUrl, setMemeCanvasUrl] = useState<string | null>(null);

  // Puzzle
  const [puzzleTiles, setPuzzleTiles] = useState<number[]>([]);
  const [puzzleWin, setPuzzleWin] = useState(false);
  const [draggedTileIndex, setDraggedTileIndex] = useState<number | null>(null);

  const COINS = ["Bitcoin (BTC)", "Ethereum (ETH)", "Solana (SOL)", "Binance Coin (BNB)", "Ripple (XRP)", "Cardano (ADA)", "Dogecoin (DOGE)"];
  
  const CURRENCIES = [
    {code: 'USD', name: 'US Dollar', flag: '🇺🇸'}, 
    {code: 'EUR', name: 'Euro', flag: '🇪🇺'}, 
    {code: 'GBP', name: 'British Pound', flag: '🇬🇧'},
    {code: 'KES', name: 'Kenyan Shilling', flag: '🇰🇪'}, 
    {code: 'JPY', name: 'Japanese Yen', flag: '🇯🇵'},
    {code: 'CAD', name: 'Canadian Dollar', flag: '🇨🇦'},
    {code: 'AUD', name: 'Australian Dollar', flag: '🇦🇺'},
    {code: 'CHF', name: 'Swiss Franc', flag: '🇨🇭'},
    {code: 'CNY', name: 'Chinese Yuan', flag: '🇨🇳'},
    {code: 'INR', name: 'Indian Rupee', flag: '🇮🇳'},
    {code: 'NGN', name: 'Nigerian Naira', flag: '🇳🇬'},
    {code: 'ZAR', name: 'South African Rand', flag: '🇿🇦'},
    {code: 'AED', name: 'UAE Dirham', flag: '🇦🇪'}
  ];

  const PUZZLE_PRESETS = [
      { name: "Neon City", url: "https://images.unsplash.com/photo-1515630278258-407f66498911?w=500&h=500&fit=crop" },
      { name: "Nature", url: "https://images.unsplash.com/photo-1501854140884-074bf86ee91c?w=500&h=500&fit=crop" },
      { name: "Abstract", url: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=500&h=500&fit=crop" }
  ];

  // Helper: Load Image for Utils with Loading Effect
  const handleUtilImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          setIsUploading(true);
          // EXIF Logic
          if (activeTool === 'meta') {
            // @ts-ignore
            if (window.EXIF) {
                // @ts-ignore
                window.EXIF.getData(file, function() {
                    // @ts-ignore
                    const allTags = window.EXIF.getAllTags(this);
                    setImageMeta({
                        name: file.name,
                        type: file.type,
                        size: (file.size / 1024).toFixed(2) + ' KB',
                        dimensions: "Loading...",
                        ...allTags
                    });
                });
            } else {
                setImageMeta({ name: file.name, type: file.type, size: (file.size/1024).toFixed(2) + ' KB', note: "EXIF Lib not loaded" });
            }
          }

          const reader = new FileReader();
          reader.onloadend = () => {
              setUtilImage(reader.result as string);
              if (activeTool === 'palette') extractPalette(reader.result as string);
              if (activeTool === 'puzzle') initPuzzle();
              
              // Simulate a short processing delay for effect
              setTimeout(() => setIsUploading(false), 800);
          };
          reader.readAsDataURL(file);
      }
  };

  const handleQrFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setIsUploading(true);
      
      // @ts-ignore
      if (window.Html5Qrcode) {
          // @ts-ignore
          const html5QrCode = new Html5Qrcode("reader");
          html5QrCode.scanFile(file, true)
            .then((decodedText: string) => {
                setScannedResult(decodedText);
                setIsUploading(false);
                showToast("QR Code Scanned!", "success");
            })
            .catch((err: any) => {
                setIsUploading(false);
                showToast("No QR code found in image", "error");
                console.error(err);
            });
      }
  };

  const handlePresetSelect = (url: string) => {
      setIsUploading(true);
      setUtilImage(url);
      setTimeout(() => {
          setIsUploading(false);
          initPuzzle();
      }, 500);
  };

  // --- SOCIAL HANDLERS ---
  const handleShorten = async () => {
      if(!longUrl) return;
      setIsShortening(true);
      setTimeout(() => {
          setShortUrl(`snapaura.lnk/${Math.random().toString(36).substring(7)}`);
          setIsShortening(false);
          showToast("Link shortened!", "success");
      }, 1000);
  };

  const handleGenerateQR = () => {
      if(qrText) {
          setQrUrl(`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrText)}`);
          showToast("QR Code generated", "success");
      }
  };

  const handleGenerateBio = async () => {
      if(!bioInput) return;
      setIsWritingBio(true);
      try {
          const result = await generateSocialBio(bioInput);
          setBios(result.split('||').map(s => s.trim()).filter(s => s));
      } finally { setIsWritingBio(false); }
  };
  
  // Initialize Scanner (Camera)
  useEffect(() => {
    let html5QrCode: any;
    // Only start camera if active tool is qr-scan and no result yet
    if (activeTool === 'qr-scan' && !scannedResult) {
       // @ts-ignore
       if (window.Html5Qrcode) {
           // @ts-ignore
           html5QrCode = new Html5Qrcode("reader");
           const config = { fps: 10, qrbox: { width: 250, height: 250 } };
           
           html5QrCode.start({ facingMode: "environment" }, config, (decodedText: string) => {
               setScannedResult(decodedText);
               html5QrCode.stop().then(() => {
                   showToast("QR Code Scanned!", "success");
                   if (navigator.vibrate) navigator.vibrate(100);
               });
           }, (errorMessage: any) => {
               // ignore errors for scanning
           }).catch((err: any) => {
               console.log("Camera start failed (might use file upload)", err);
           });
       }
    }
    
    return () => {
        if (html5QrCode && html5QrCode.isScanning) {
            html5QrCode.stop().catch((err: any) => console.log(err));
        }
    }
  }, [activeTool, scannedResult]);

  // --- FINANCIAL HANDLERS ---
  const handleCryptoAnalysis = async () => {
      setIsAnalyzingFinance(true);
      setCryptoResult(null);
      try {
          const data = await getCryptoData(selectedCoin);
          setCryptoResult(data);
          showToast(`Data loaded for ${selectedCoin}`, "success");
      } catch (err) {
          showToast("Failed to fetch crypto data", "error");
      } finally { 
          setIsAnalyzingFinance(false); 
      }
  };
  
  const handleCurrencyConvert = async () => {
      setIsAnalyzingFinance(true);
      setFinancialResult(null);
       try {
          const data = await getCurrencyData(amount, fromCurr, toCurr);
          setFinancialResult(data);
      } catch(err) {
          showToast("Conversion failed", "error");
      } finally { 
          setIsAnalyzingFinance(false); 
      }
  };

  // --- UNIT CONVERTER HANDLER ---
  const handleUnitConvert = () => {
      const v = parseFloat(unitVal);
      if(isNaN(v)) return;
      
      let res = 0;
      // Simple strict conversions logic (demo purpose)
      // Length (base meter)
      const lenFactors: any = { m: 1, km: 1000, cm: 0.01, mm: 0.001, ft: 0.3048, mi: 1609.34, in: 0.0254, yd: 0.9144 };
      // Mass (base kg)
      const massFactors: any = { kg: 1, g: 0.001, mg: 0.000001, lb: 0.453592, oz: 0.0283495 };
      
      if(unitCategory === 'length') {
          const valInMeters = v * (lenFactors[unitFrom] || 1);
          res = valInMeters / (lenFactors[unitTo] || 1);
      } else if (unitCategory === 'mass') {
          const valInKg = v * (massFactors[unitFrom] || 1);
          res = valInKg / (massFactors[unitTo] || 1);
      } else if (unitCategory === 'temp') {
          // Temp is special
          let valInC = v;
          if(unitFrom === 'F') valInC = (v - 32) * 5/9;
          if(unitFrom === 'K') valInC = v - 273.15;
          
          if(unitTo === 'C') res = valInC;
          if(unitTo === 'F') res = (valInC * 9/5) + 32;
          if(unitTo === 'K') res = valInC + 273.15;
      }

      setUnitResult(res.toLocaleString(undefined, { maximumFractionDigits: 4 }));
      if (navigator.vibrate) navigator.vibrate(20);
  };

  // Update units when category changes
  useEffect(() => {
      setUnitResult(null);
      if(unitCategory === 'length') { setUnitFrom('m'); setUnitTo('ft'); }
      if(unitCategory === 'mass') { setUnitFrom('kg'); setUnitTo('lb'); }
      if(unitCategory === 'temp') { setUnitFrom('C'); setUnitTo('F'); }
  }, [unitCategory]);


  // --- PHOTO UTILS LOGIC ---
  const extractPalette = (imgSrc: string) => {
      const img = new Image();
      img.src = imgSrc;
      img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          canvas.width = 100; canvas.height = 100;
          if(!ctx) return;
          ctx.drawImage(img, 0, 0, 100, 100);
          const data = ctx.getImageData(0,0,100,100).data;
          const colors = [];
          for(let i=0; i<data.length; i+=400) { // Sample every 100th pixel
              colors.push(`rgb(${data[i]}, ${data[i+1]}, ${data[i+2]})`);
          }
          setExtractedColors([...new Set(colors)].slice(0, 6));
      }
  };

  const renderMeme = () => {
      if (!utilImage) return;
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.src = utilImage;
      img.onload = () => {
          canvas.width = img.width;
          canvas.height = img.height;
          if(!ctx) return;
          ctx.drawImage(img, 0, 0);
          ctx.font = `bold ${canvas.width/10}px Impact`;
          ctx.fillStyle = 'white';
          ctx.strokeStyle = 'black';
          ctx.lineWidth = canvas.width/100;
          ctx.textAlign = 'center';
          
          if(memeTop) {
              ctx.strokeText(memeTop.toUpperCase(), canvas.width/2, canvas.height*0.15);
              ctx.fillText(memeTop.toUpperCase(), canvas.width/2, canvas.height*0.15);
          }
          if(memeBottom) {
              ctx.strokeText(memeBottom.toUpperCase(), canvas.width/2, canvas.height*0.9);
              ctx.fillText(memeBottom.toUpperCase(), canvas.width/2, canvas.height*0.9);
          }
          setMemeCanvasUrl(canvas.toDataURL());
          showToast("Meme rendered!", "success");
      }
  };

  // --- PUZZLE LOGIC ---
  const initPuzzle = () => {
      setPuzzleTiles([...Array(9).keys()].sort(() => Math.random() - 0.5));
      setPuzzleWin(false);
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
      setDraggedTileIndex(index);
      e.dataTransfer.effectAllowed = "move";
      const img = new Image();
      img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
      e.dataTransfer.setDragImage(img, 0, 0);
  };

  const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
      e.preventDefault();
      if (draggedTileIndex === null) return;
      if (draggedTileIndex === targetIndex) return;

      const newTiles = [...puzzleTiles];
      const temp = newTiles[draggedTileIndex];
      newTiles[draggedTileIndex] = newTiles[targetIndex];
      newTiles[targetIndex] = temp;

      setPuzzleTiles(newTiles);
      setDraggedTileIndex(null);

      const isSorted = newTiles.every((val, i) => val === i);
      if (isSorted) {
          setPuzzleWin(true);
          showToast("Puzzle Solved!", "success");
          if (window.confetti) window.confetti();
      } else {
          if (navigator.vibrate) navigator.vibrate(20);
      }
  };

  const isUrl = (text: string) => {
      return /^(http|https):\/\/[^ "]+$/.test(text);
  };

  const renderMenu = () => (
    <div className="grid grid-cols-1 gap-6 animate-fade-in-up">
        {/* Section: Essentials */}
        <div>
            <h3 className="text-xs font-bold text-gray-500 uppercase mb-3 ml-2">Essentials</h3>
            <div className="grid grid-cols-3 gap-3">
                <MenuCard icon={Bitcoin} color="text-orange-400" bg="bg-orange-500/20" title="Crypto" onClick={() => setActiveTool('crypto')} />
                <MenuCard icon={Banknote} color="text-green-400" bg="bg-green-500/20" title="Currency" onClick={() => setActiveTool('currency')} />
                <MenuCard icon={Ruler} color="text-teal-400" bg="bg-teal-500/20" title="Units" onClick={() => setActiveTool('unit')} />
                <MenuCard icon={Link} color="text-blue-400" bg="bg-blue-500/20" title="Shortener" onClick={() => setActiveTool('shortener')} />
                <MenuCard icon={QrCode} color="text-purple-400" bg="bg-purple-500/20" title="Gen QR" onClick={() => setActiveTool('qr')} />
                <MenuCard icon={ScanLine} color="text-red-400" bg="bg-red-500/20" title="Scan QR" onClick={() => { setScannedResult(null); setActiveTool('qr-scan'); }} />
            </div>
        </div>

        {/* Section: Photo Utils */}
        <div>
            <h3 className="text-xs font-bold text-gray-500 uppercase mb-3 ml-2">Photo Utilities</h3>
            <div className="grid grid-cols-3 gap-3">
                <MenuCard icon={Info} color="text-yellow-400" bg="bg-yellow-500/20" title="Metadata" onClick={() => { setUtilImage(null); setActiveTool('meta'); }} />
                <MenuCard icon={Palette} color="text-pink-400" bg="bg-pink-500/20" title="Palette" onClick={() => { setUtilImage(null); setActiveTool('palette'); }} />
                <MenuCard icon={Smile} color="text-red-400" bg="bg-red-500/20" title="Meme" onClick={() => { setUtilImage(null); setActiveTool('meme'); }} />
                <MenuCard icon={Minimize} color="text-cyan-400" bg="bg-cyan-500/20" title="Compress" onClick={() => showToast("Coming Soon", "info")} />
                <MenuCard icon={Maximize} color="text-indigo-400" bg="bg-indigo-500/20" title="Resize" onClick={() => showToast("Coming Soon", "info")} />
                <MenuCard icon={Gamepad} color="text-white" bg="bg-white/10" title="Puzzle" onClick={() => { setUtilImage(null); setActiveTool('puzzle'); }} />
            </div>
        </div>
        
        {/* Section: Social */}
        <div>
            <h3 className="text-xs font-bold text-gray-500 uppercase mb-3 ml-2">Social Growth</h3>
            <div className="glass-panel p-4 rounded-xl flex items-center gap-4 cursor-pointer hover:bg-white/5 active:scale-95 transition-all" onClick={() => setActiveTool('bio')}>
                <div className="bg-pink-500/20 p-3 rounded-full text-pink-400"><Sparkles size={20} /></div>
                <div><h4 className="font-bold text-white">AI Bio Writer</h4><p className="text-xs text-gray-400">Perfect your profile</p></div>
                <ArrowRight className="ml-auto text-gray-500" size={16} />
            </div>
        </div>
    </div>
  );

  return (
    <div className="h-full overflow-y-auto hide-scrollbar p-4 pb-24 space-y-6">
      
      {/* Upload Loading Overlay */}
      {isUploading && (
          <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center animate-fade-in-up">
              <div className="relative mb-4">
                  <div className="absolute inset-0 bg-primary/50 blur-xl rounded-full animate-pulse"></div>
                  <RefreshCw className="animate-spin text-white relative z-10" size={48} />
              </div>
              <p className="text-white font-bold text-lg">Processing...</p>
              <p className="text-gray-400 text-sm">Please wait</p>
          </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-3 sticky top-0 bg-[#0f0f11]/80 backdrop-blur-md py-2 z-20">
        {activeTool !== 'menu' && (
            <button onClick={() => { setActiveTool('menu'); /* Stop scanner if running */ }} className="p-2 bg-white/5 rounded-full hover:bg-white/10 active:scale-90 transition-all">
                <ArrowLeft size={20} className="text-white" />
            </button>
        )}
        <h1 className="text-2xl font-bold bg-gradient-to-r from-teal-400 to-blue-500 bg-clip-text text-transparent flex items-center gap-2">
            <Briefcase className="text-teal-500" /> Toolkit
        </h1>
        <div className="ml-auto">
             <button 
                 onClick={onOpenSettings}
                 className="text-gray-300 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors active:scale-90"
                 title="Settings"
             >
                 <Settings size={20} />
             </button>
        </div>
      </div>

      {activeTool === 'menu' && renderMenu()}

      {/* --- QR SCANNER --- */}
      {activeTool === 'qr-scan' && (
          <div className="space-y-4 animate-fade-in-up">
              <div className="glass-panel p-4 rounded-xl text-center">
                  {!scannedResult ? (
                      <div className="space-y-4">
                          <div className="overflow-hidden rounded-lg relative min-h-[250px] bg-black/50 border-2 border-dashed border-white/10 flex items-center justify-center">
                              <div id="reader" className="w-full"></div>
                              <p className="absolute text-xs text-gray-400 pointer-events-none">Point camera or upload image</p>
                          </div>
                          <button 
                            onClick={() => qrFileInputRef.current?.click()}
                            className="w-full bg-white/5 hover:bg-white/10 py-3 rounded-xl border border-white/10 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95"
                          >
                              <ImagePlus size={16} /> Upload QR Image
                          </button>
                      </div>
                  ) : (
                      <div className="space-y-4">
                          <div className="bg-green-500/20 text-green-400 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto">
                              <CheckCircle size={32} />
                          </div>
                          <h3 className="text-xl font-bold text-white">Scan Successful!</h3>
                          
                          <div className="glass-panel p-4 rounded-xl text-left">
                              <p className="text-xs text-gray-500 font-bold uppercase mb-2">Content</p>
                              <div className="bg-black/30 p-3 rounded-lg border border-white/10 break-all text-sm text-white font-mono">
                                  {scannedResult}
                              </div>
                              
                              {isUrl(scannedResult) && (
                                  <a href={scannedResult} target="_blank" rel="noreferrer" className="mt-3 w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-all">
                                      <ExternalLink size={16} /> Open Link
                                  </a>
                              )}
                          </div>

                          <div className="flex gap-2">
                              <button onClick={() => {navigator.clipboard.writeText(scannedResult); showToast("Copied to clipboard", "success")}} className="flex-1 bg-white/10 py-3 rounded-xl font-bold hover:bg-white/20 flex items-center justify-center gap-2">
                                  <Copy size={16} /> Copy
                              </button>
                              <button onClick={() => { setScannedResult(null); window.location.reload(); }} className="flex-1 bg-white/5 text-gray-400 hover:text-white py-3 rounded-xl font-bold">
                                  Scan Again
                              </button>
                          </div>
                      </div>
                  )}
              </div>
          </div>
      )}

      {/* --- CRYPTO TOOL --- */}
      {activeTool === 'crypto' && (
          <div className="space-y-4 animate-fade-in-up">
              <div className="glass-panel p-4 rounded-xl space-y-4 border-t-4 border-orange-500">
                  <label className="text-xs font-bold text-gray-400 uppercase">Select Asset</label>
                  <select 
                    value={selectedCoin} 
                    onChange={e => setSelectedCoin(e.target.value)}
                    className="w-full bg-black/30 text-white p-3 rounded-xl border border-white/10 focus:border-orange-500 outline-none appearance-none"
                  >
                      {COINS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  
                  <button 
                    onClick={handleCryptoAnalysis} 
                    disabled={isAnalyzingFinance}
                    className="w-full bg-gradient-to-r from-orange-500 to-red-500 py-3 rounded-xl font-bold text-white shadow-lg shadow-orange-500/20 active:scale-95 transition-all flex justify-center items-center gap-2"
                  >
                      {isAnalyzingFinance ? <RefreshCw className="animate-spin" /> : <Activity />}
                      Analyze Market
                  </button>
              </div>

              {cryptoResult && (
                  <div className="glass-panel p-5 rounded-2xl animate-fade-in-up space-y-4">
                      <div className="flex justify-between items-end">
                          <div>
                              <p className="text-xs text-gray-400">Current Price</p>
                              <h2 className="text-3xl font-black text-white">{cryptoResult.price}</h2>
                          </div>
                          <div className={`px-3 py-1 rounded-lg text-sm font-bold ${cryptoResult.change?.includes('+') ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                              {cryptoResult.change}
                          </div>
                      </div>

                      {cryptoResult.trend && (
                        <div className="h-24 w-full flex items-end gap-1 border-b border-white/5 pb-2">
                            {cryptoResult.trend.map((val: number, i: number) => (
                                <div key={i} className="flex-1 bg-orange-500/50 hover:bg-orange-400 transition-all rounded-t-sm" style={{height: `${val}%`}}></div>
                            ))}
                        </div>
                      )}

                      <div className="flex items-center gap-4">
                          <div className={`flex-1 p-3 rounded-xl text-center font-black text-xl border ${
                              cryptoResult.signal === 'BUY' ? 'bg-green-500/20 border-green-500 text-green-400' : 
                              cryptoResult.signal === 'SELL' ? 'bg-red-500/20 border-red-500 text-red-400' : 'bg-gray-500/20 border-gray-500 text-gray-300'
                          }`}>
                              {cryptoResult.signal}
                          </div>
                          <p className="flex-[2] text-xs text-gray-300 leading-relaxed">{cryptoResult.analysis}</p>
                      </div>
                  </div>
              )}
          </div>
      )}

      {/* --- CURRENCY TOOL --- */}
      {activeTool === 'currency' && (
          <div className="space-y-4 animate-fade-in-up">
              <div className="glass-panel p-4 rounded-xl space-y-4 border-t-4 border-green-500">
                   <div className="flex flex-col gap-3">
                       <input 
                          type="number" 
                          value={amount} 
                          onChange={e => setAmount(e.target.value)} 
                          className="w-full bg-black/30 p-4 rounded-xl text-white font-bold text-xl text-center border border-white/10"
                          placeholder="Amount"
                       />
                       <div className="flex items-center gap-2">
                           <select value={fromCurr} onChange={e => setFromCurr(e.target.value)} className="flex-1 bg-black/30 p-3 rounded-xl text-white text-sm border border-white/10 appearance-none">
                               {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.flag} {c.code}</option>)}
                           </select>
                           <div className="bg-white/5 p-2 rounded-full text-gray-400"><ArrowRight size={16}/></div>
                           <select value={toCurr} onChange={e => setToCurr(e.target.value)} className="flex-1 bg-black/30 p-3 rounded-xl text-white text-sm border border-white/10 appearance-none">
                               {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.flag} {c.code}</option>)}
                           </select>
                       </div>
                   </div>
                   
                   <button 
                      onClick={handleCurrencyConvert}
                      disabled={isAnalyzingFinance}
                      className="w-full bg-gradient-to-r from-green-500 to-teal-500 py-3 rounded-xl font-bold text-white shadow-lg shadow-green-500/20 active:scale-95 transition-all flex justify-center items-center gap-2"
                   >
                       {isAnalyzingFinance ? <RefreshCw className="animate-spin" /> : <RefreshCcw />}
                       Convert Now
                   </button>
              </div>

              {financialResult && (
                  <div className="glass-panel p-6 rounded-2xl animate-fade-in-up text-center space-y-3 relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-4 opacity-10">
                          <Banknote size={100} />
                      </div>
                      <p className="text-xs text-gray-400 uppercase tracking-widest relative z-10">Conversion Result</p>
                      <h2 className="text-4xl font-black text-white relative z-10 tracking-tight">{financialResult.result}</h2>
                      <div className="inline-block bg-white/5 px-3 py-1 rounded-full text-xs text-green-300 border border-white/10 relative z-10">
                          {financialResult.rate}
                      </div>
                      <p className="text-xs text-gray-400 pt-2 border-t border-white/10 relative z-10">{financialResult.details}</p>
                  </div>
              )}
          </div>
      )}

      {/* --- UNIT CONVERTER TOOL --- */}
      {activeTool === 'unit' && (
          <div className="space-y-4 animate-fade-in-up">
              <div className="glass-panel p-4 rounded-xl space-y-4 border-t-4 border-teal-500">
                  {/* Category Selector */}
                  <div className="flex bg-white/5 p-1 rounded-lg">
                      {(['length', 'mass', 'temp'] as const).map(cat => (
                          <button 
                            key={cat} 
                            onClick={() => setUnitCategory(cat)}
                            className={`flex-1 py-2 text-xs font-bold uppercase rounded-md transition-all ${unitCategory === cat ? 'bg-teal-500 text-white shadow-md' : 'text-gray-400 hover:text-white'}`}
                          >
                              {cat}
                          </button>
                      ))}
                  </div>

                  <div className="flex flex-col gap-3">
                       <input 
                          type="number" 
                          value={unitVal} 
                          onChange={e => setUnitVal(e.target.value)} 
                          className="w-full bg-black/30 p-4 rounded-xl text-white font-bold text-xl text-center border border-white/10"
                          placeholder="Value"
                       />
                       
                       <div className="flex items-center gap-2">
                           {/* From Unit */}
                           <select value={unitFrom} onChange={e => setUnitFrom(e.target.value)} className="flex-1 bg-black/30 p-3 rounded-xl text-white text-sm border border-white/10 font-bold text-center">
                               {unitCategory === 'length' && ['m', 'km', 'cm', 'mm', 'ft', 'mi', 'in', 'yd'].map(u => <option key={u} value={u}>{u}</option>)}
                               {unitCategory === 'mass' && ['kg', 'g', 'mg', 'lb', 'oz'].map(u => <option key={u} value={u}>{u}</option>)}
                               {unitCategory === 'temp' && ['C', 'F', 'K'].map(u => <option key={u} value={u}>{u}</option>)}
                           </select>
                           
                           <div className="text-gray-500"><ArrowRight size={14}/></div>
                           
                           {/* To Unit */}
                           <select value={unitTo} onChange={e => setUnitTo(e.target.value)} className="flex-1 bg-black/30 p-3 rounded-xl text-white text-sm border border-white/10 font-bold text-center">
                               {unitCategory === 'length' && ['m', 'km', 'cm', 'mm', 'ft', 'mi', 'in', 'yd'].map(u => <option key={u} value={u}>{u}</option>)}
                               {unitCategory === 'mass' && ['kg', 'g', 'mg', 'lb', 'oz'].map(u => <option key={u} value={u}>{u}</option>)}
                               {unitCategory === 'temp' && ['C', 'F', 'K'].map(u => <option key={u} value={u}>{u}</option>)}
                           </select>
                       </div>
                  </div>

                  <button 
                      onClick={handleUnitConvert}
                      className="w-full bg-teal-500 hover:bg-teal-600 py-3 rounded-xl font-bold text-white shadow-lg active:scale-95 transition-all"
                  >
                      Convert
                  </button>
              </div>

              {unitResult && (
                   <div className="glass-panel p-6 rounded-2xl animate-fade-in-up text-center relative overflow-hidden">
                      <div className="absolute top-0 left-0 p-4 opacity-10">
                          <Ruler size={100} />
                      </div>
                      <p className="text-xs text-gray-400 uppercase tracking-widest relative z-10">Result</p>
                      <div className="flex items-center justify-center gap-2 mt-2">
                          <h2 className="text-4xl font-black text-white relative z-10">{unitResult}</h2>
                          <span className="text-xl font-bold text-teal-400 relative z-10">{unitTo}</span>
                      </div>
                   </div>
              )}
          </div>
      )}

      {/* --- MEME MAKER --- */}
      {activeTool === 'meme' && (
          <div className="space-y-4 animate-fade-in-up">
              {!utilImage ? (
                  <div onClick={() => utilFileInputRef.current?.click()} className="glass-panel h-48 rounded-2xl flex flex-col items-center justify-center border-dashed border-2 border-white/20 cursor-pointer hover:bg-white/5 transition-all active:scale-95">
                      <ImagePlus size={48} className="text-gray-500 mb-2"/>
                      <p className="text-sm font-bold text-gray-300">Tap to upload base image</p>
                  </div>
              ) : (
                  <div className="space-y-4">
                      <div className="glass-panel p-4 rounded-xl">
                          <img src={memeCanvasUrl || utilImage} className="w-full rounded-lg mb-4" alt="Meme Base" />
                          <div className="flex flex-col gap-2">
                              <input placeholder="TOP TEXT" value={memeTop} onChange={e => setMemeTop(e.target.value)} className="bg-black/30 p-3 rounded-lg text-white text-center font-bold border border-white/10 focus:border-red-500 outline-none" />
                              <input placeholder="BOTTOM TEXT" value={memeBottom} onChange={e => setMemeBottom(e.target.value)} className="bg-black/30 p-3 rounded-lg text-white text-center font-bold border border-white/10 focus:border-red-500 outline-none" />
                              <button onClick={renderMeme} className="bg-gradient-to-r from-red-500 to-pink-500 text-white p-3 rounded-xl font-bold mt-2 shadow-lg active:scale-95 transition-all">
                                  Render Meme
                              </button>
                          </div>
                      </div>
                      {memeCanvasUrl && (
                        <div className="flex justify-center">
                            <a href={memeCanvasUrl} download="snapaura-meme.png" className="bg-white text-black py-3 px-8 rounded-full font-bold shadow-xl hover:scale-105 transition-all flex items-center gap-2">
                                <DownloadIcon /> Download Meme
                            </a>
                        </div>
                      )}
                  </div>
              )}
          </div>
      )}

      {/* --- PALETTE EXTRACTOR --- */}
      {activeTool === 'palette' && (
          <div className="space-y-4 animate-fade-in-up">
               {!utilImage ? (
                   <div onClick={() => utilFileInputRef.current?.click()} className="glass-panel h-48 rounded-2xl flex flex-col items-center justify-center border-dashed border-2 border-white/20 cursor-pointer hover:bg-white/5 transition-all active:scale-95">
                      <Palette size={48} className="text-pink-400 mb-2"/>
                      <p className="text-sm font-bold text-gray-300">Tap to upload image</p>
                  </div>
               ) : (
                   <div>
                       <img src={utilImage} className="w-full h-48 object-cover rounded-xl mb-4 shadow-lg" alt="Palette Source" />
                       <div className="grid grid-cols-3 gap-3">
                           {extractedColors.map((col, i) => (
                               <div key={i} className="h-24 rounded-xl flex items-end p-2 relative group cursor-pointer shadow-lg" style={{backgroundColor: col}} onClick={() => {navigator.clipboard.writeText(col); showToast("Color copied!", "success")}}>
                                   <div className="bg-black/50 backdrop-blur-sm text-white px-2 py-1 rounded text-[10px] w-full text-center">
                                       {col}
                                   </div>
                               </div>
                           ))}
                       </div>
                   </div>
               )}
          </div>
      )}

      {/* --- METADATA VIEWER --- */}
      {activeTool === 'meta' && (
          <div className="space-y-4 animate-fade-in-up">
              {!utilImage ? (
                  <div onClick={() => utilFileInputRef.current?.click()} className="glass-panel h-48 rounded-2xl flex flex-col items-center justify-center border-dashed border-2 border-white/20 cursor-pointer hover:bg-white/5 transition-all active:scale-95">
                      <Info size={48} className="text-yellow-400 mb-2"/>
                      <p className="text-sm font-bold text-gray-300">Tap to inspect EXIF Data</p>
                  </div>
              ) : (
                  <div className="glass-panel p-4 rounded-xl space-y-2">
                      <h3 className="font-bold border-b border-white/10 pb-2 mb-2 flex items-center gap-2">
                          <Info size={16} className="text-yellow-400"/> Image Data
                      </h3>
                      {imageMeta ? Object.entries(imageMeta).map(([k,v]) => {
                          if (typeof v !== 'string' && typeof v !== 'number') return null;
                          return (
                            <div key={k} className="flex justify-between text-sm py-1 border-b border-white/5 last:border-0">
                                <span className="text-gray-400 capitalize">{k}</span>
                                <span className="text-white truncate max-w-[50%] font-mono">{String(v)}</span>
                            </div>
                          )
                      }) : <p className="text-gray-400 italic">Reading data...</p>}
                  </div>
              )}
          </div>
      )}

      {/* --- PUZZLE GAME (Drag & Drop Swap) --- */}
      {activeTool === 'puzzle' && (
          <div className="space-y-4 animate-fade-in-up">
               {!utilImage ? (
                   <div className="space-y-4">
                       <div onClick={() => utilFileInputRef.current?.click()} className="glass-panel h-40 rounded-2xl flex flex-col items-center justify-center border-dashed border-2 border-white/20 cursor-pointer hover:bg-white/5 transition-all active:scale-95">
                          <Gamepad size={40} className="text-white mb-2"/>
                          <p className="text-sm font-bold text-gray-300">Upload Your Own Image</p>
                      </div>
                      
                      <div className="flex items-center gap-2 px-1">
                          <div className="h-[1px] bg-white/10 flex-1"></div>
                          <span className="text-xs text-gray-500 uppercase font-bold">Or Pick a Vibe</span>
                          <div className="h-[1px] bg-white/10 flex-1"></div>
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                          {PUZZLE_PRESETS.map((p, i) => (
                              <button key={i} onClick={() => handlePresetSelect(p.url)} className="relative aspect-square rounded-xl overflow-hidden group border border-white/10 active:scale-95 transition-all">
                                  <img src={p.url} className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity" alt={p.name} />
                                  <div className="absolute inset-x-0 bottom-0 bg-black/60 py-1 text-[10px] text-white font-bold text-center backdrop-blur-sm">{p.name}</div>
                              </button>
                          ))}
                      </div>
                  </div>
               ) : (
                   <>
                    <p className="text-center text-xs text-gray-400 mb-2">Drag and drop tiles to swap them!</p>
                    <div className="border-4 border-white/10 rounded-xl overflow-hidden shadow-2xl mx-auto w-full max-w-[320px]">
                       <div className="grid grid-cols-3 gap-1 aspect-square bg-black p-1">
                           {puzzleTiles.map((tileIndex, i) => (
                               <div 
                                 key={i} 
                                 draggable
                                 onDragStart={(e) => handleDragStart(e, i)}
                                 onDragOver={handleDragOver}
                                 onDrop={(e) => handleDrop(e, i)}
                                 className={`relative overflow-hidden bg-gray-800 cursor-move transition-all ${draggedTileIndex === i ? 'opacity-50 scale-90' : 'opacity-100 hover:brightness-110'}`}
                               >
                                   <div 
                                     className="absolute w-[300%] h-[300%]"
                                     style={{
                                         backgroundImage: `url(${utilImage})`,
                                         backgroundSize: '100% 100%',
                                         left: `-${(tileIndex % 3) * 100}%`,
                                         top: `-${Math.floor(tileIndex / 3) * 100}%`
                                     }}
                                   />
                               </div>
                           ))}
                       </div>
                    </div>
                   </>
               )}
               {puzzleWin && (
                   <div className="p-6 bg-green-500/20 border border-green-500 rounded-2xl text-center animate-bounce shadow-lg shadow-green-500/20 backdrop-blur-md">
                       <p className="text-green-400 font-black text-2xl mb-1">🎉 Puzzle Solved! 🎉</p>
                       <p className="text-white text-sm opacity-80">You have a sharp eye!</p>
                       <button onClick={() => { setUtilImage(null); setPuzzleWin(false); }} className="mt-3 bg-white text-black px-4 py-2 rounded-full text-xs font-bold hover:scale-105 transition-transform">Play Again</button>
                   </div>
               )}
               {utilImage && !puzzleWin && (
                   <div className="flex justify-center">
                        <button onClick={() => setUtilImage(null)} className="text-xs text-red-400 font-bold border border-red-500/30 px-3 py-1.5 rounded-full hover:bg-red-500/10">Quit Puzzle</button>
                   </div>
               )}
          </div>
      )}

      {/* --- SHORTENER --- */}
      {activeTool === 'shortener' && (
         <div className="glass-panel p-6 rounded-2xl space-y-4 animate-fade-in-up border-t-4 border-blue-500">
             <input value={longUrl} onChange={e => setLongUrl(e.target.value)} placeholder="Paste long URL here..." className="w-full bg-black/30 p-4 rounded-xl border border-white/10 text-white" />
             <button onClick={handleShorten} className="w-full bg-blue-500 hover:bg-blue-600 py-3 rounded-xl font-bold text-white shadow-lg active:scale-95 transition-all">
                 {isShortening ? <RefreshCw className="animate-spin inline mr-2"/> : <Link className="inline mr-2"/>} Shorten Link
             </button>
             {shortUrl && (
                 <div className="bg-white/10 p-4 rounded-xl flex justify-between items-center cursor-pointer hover:bg-white/20" onClick={() => {navigator.clipboard.writeText(shortUrl); showToast("Copied!", "success")}}>
                     <span className="font-mono text-blue-300">{shortUrl}</span>
                     <Copy size={16} />
                 </div>
             )}
         </div>
      )}
      
      {/* --- BIO WRITER --- */}
      {activeTool === 'bio' && (
        <div className="glass-panel p-6 rounded-2xl space-y-4 animate-fade-in-up border-t-4 border-pink-500">
            <textarea value={bioInput} onChange={e => setBioInput(e.target.value)} placeholder="Describe yourself (e.g. Photographer, Coffee Lover, Tech Enthusiast)..." className="w-full bg-black/30 p-4 rounded-xl h-32 border border-white/10 text-white resize-none" />
            <button onClick={handleGenerateBio} className="w-full bg-pink-500 hover:bg-pink-600 py-3 rounded-xl font-bold text-white shadow-lg active:scale-95 transition-all">
                {isWritingBio ? <RefreshCw className="animate-spin inline mr-2"/> : <Sparkles className="inline mr-2"/>} Generate Bios
            </button>
            <div className="space-y-3">
                {bios.map((b,i) => (
                    <div key={i} className="bg-white/5 p-4 rounded-xl text-sm relative group cursor-pointer hover:bg-white/10 transition-all border border-white/5" onClick={() => {navigator.clipboard.writeText(b); showToast("Copied Bio", "success")}}>
                        <p>{b}</p>
                        <Copy size={14} className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400" />
                    </div>
                ))}
            </div>
        </div>
      )}
      
      {/* --- QR GEN --- */}
      {activeTool === 'qr' && (
          <div className="glass-panel p-6 rounded-2xl space-y-4 animate-fade-in-up border-t-4 border-purple-500">
              <input value={qrText} onChange={e => setQrText(e.target.value)} placeholder="Enter text or URL..." className="w-full bg-black/30 p-4 rounded-xl border border-white/10 text-white" />
              <button onClick={handleGenerateQR} className="w-full bg-purple-500 hover:bg-purple-600 py-3 rounded-xl font-bold text-white shadow-lg active:scale-95 transition-all">
                  Generate QR
              </button>
              {qrUrl && (
                  <div className="bg-white p-4 rounded-xl shadow-inner flex justify-center">
                      <img src={qrUrl} className="w-64 h-64 rounded-lg" alt="QR Code" />
                  </div>
              )}
          </div>
      )}

       {/* Hidden Upload for Util Tools */}
       <input type="file" ref={utilFileInputRef} onChange={handleUtilImageUpload} className="hidden" accept="image/*" />
       {/* Hidden Upload for QR Scanner */}
       <input type="file" ref={qrFileInputRef} onChange={handleQrFileUpload} className="hidden" accept="image/*" />
    </div>
  );
};

const MenuCard = ({icon: Icon, color, bg, title, onClick}: any) => (
    <div onClick={onClick} className="glass-panel p-4 rounded-2xl flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-white/10 transition-all active:scale-95 text-center aspect-square border border-white/5 shadow-lg group">
        <div className={`${bg} p-4 rounded-full ${color} group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(0,0,0,0.3)]`}>
            <Icon size={28} strokeWidth={2.5} />
        </div>
        <span className="text-sm font-bold text-gray-200 group-hover:text-white">{title}</span>
    </div>
);

// Simple Download Icon Component
const DownloadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
);

export default Toolkit;