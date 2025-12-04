import React, { useState, useRef, useEffect } from 'react';
import { Link, QrCode, Sparkles, ArrowLeft, Copy, RefreshCw, Briefcase, Wand2, Bitcoin, Banknote, TrendingUp, DollarSign, ArrowRight, Activity, AlertCircle, RefreshCcw, Info, Shield, Minimize, Maximize, Stamp, Smile, Grid, Calendar, Save, Archive, Film, Gamepad, ImagePlus, Scissors, Palette, Upload, ScanLine, CheckCircle, Settings, Ruler, ExternalLink, Wifi, Eye, EyeOff, Lock, Unlock, Trophy, UserCheck, Layers, FileText, FileDigit, Music, Hash, Clock, MessageSquare, BookOpen, Feather, Shirt } from './Icons';
import { generateSocialBio, getCryptoData, getCurrencyData } from '../services/geminiService';
import { showToast } from './Toast';
import SoccerPredictions from './SoccerPredictions';
import ProfileStudio from './ProfileStudio';
import MoodboardGenerator from './MoodboardGenerator';
import SmartNotes from './SmartNotes';
import SocialGrowth from './SocialGrowth';
import PdfTools from './PdfTools';
import FootballHub from './FootballHub';

// Define tool types for better state management
type ToolType = 'menu' | 'shortener' | 'qr' | 'qr-scan' | 'bio' | 'crypto' | 'currency' | 'meta' | 'resize' | 'compress' | 'meme' | 'palette' | 'puzzle' | 'unit' | 'soccer' | 'profile-studio' | 'moodboard' | 'notes' | 'social-growth' | 'pdf-tools' | 'football-hub';

interface ToolkitProps {
  onOpenSettings: () => void;
}

const Toolkit: React.FC<ToolkitProps> = ({ onOpenSettings }) => {
  const [activeTool, setActiveTool] = useState<ToolType>('menu');
  const [isUploading, setIsUploading] = useState(false);

  // ... (Keep existing state logic exactly as is, omitted for brevity, will assume preserved logic when implementing UI) ...
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
  const [showWifiPass, setShowWifiPass] = useState(false);

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

  // Compression & Resize
  const [compressQuality, setCompressQuality] = useState(80);
  const [resizeWidth, setResizeWidth] = useState(1080);
  const [resizeHeight, setResizeHeight] = useState(1080);
  const [maintainAspect, setMaintainAspect] = useState(true);
  const [aspectRatio, setAspectRatio] = useState(1);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [processedMeta, setProcessedMeta] = useState<{ size: string, dimensions?: string } | null>(null);

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

  // Helper to parse WiFi string
  const parseWifi = (text: string) => {
      const ssid = text.match(/S:([^;]+)/)?.[1] || '';
      const password = text.match(/P:([^;]+)/)?.[1] || '';
      const type = text.match(/T:([^;]+)/)?.[1] || 'nopass';
      const hidden = text.match(/H:([^;]+)/)?.[1] === 'true';
      return { ssid, password, type, hidden };
  };

  // Helper: Load Image for Utils with Loading Effect
  const handleUtilImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          setIsUploading(true);
          // Reset processed states
          setProcessedImage(null);
          setProcessedMeta(null);

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
              const res = reader.result as string;
              setUtilImage(res);
              
              if (activeTool === 'palette') extractPalette(res);
              if (activeTool === 'puzzle') initPuzzle();
              
              if (activeTool === 'resize' || activeTool === 'compress') {
                  const img = new Image();
                  img.src = res;
                  img.onload = () => {
                      setResizeWidth(img.width);
                      setResizeHeight(img.height);
                      setAspectRatio(img.width / img.height);
                      setImageMeta({
                          size: (file.size/1024).toFixed(2) + ' KB',
                          dimensions: `${img.width}x${img.height}`
                      });
                  }
              }

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
                setShowWifiPass(false);
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
               setShowWifiPass(false);
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
      const lenFactors: any = { m: 1, km: 1000, cm: 0.01, mm: 0.001, ft: 0.3048, mi: 1609.34, in: 0.0254, yd: 0.9144 };
      const massFactors: any = { kg: 1, g: 0.001, mg: 0.000001, lb: 0.453592, oz: 0.0283495 };
      
      if(unitCategory === 'length') {
          const valInMeters = v * (lenFactors[unitFrom] || 1);
          res = valInMeters / (lenFactors[unitTo] || 1);
      } else if (unitCategory === 'mass') {
          const valInKg = v * (massFactors[unitFrom] || 1);
          res = valInKg / (massFactors[unitTo] || 1);
      } else if (unitCategory === 'temp') {
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
          for(let i=0; i<data.length; i+=400) { 
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

  const handleCompress = () => {
      if (!utilImage) return;
      setIsUploading(true);
      const img = new Image();
      img.src = utilImage;
      img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          if(!ctx) return;
          ctx.drawImage(img, 0, 0);
          
          const quality = compressQuality / 100;
          const dataUrl = canvas.toDataURL('image/jpeg', quality);
          setProcessedImage(dataUrl);

          // Calculate size estimate
          const head = 'data:image/jpeg;base64,';
          const sizeBytes = Math.round((dataUrl.length - head.length) * 3 / 4);
          setProcessedMeta({ 
              size: (sizeBytes/1024).toFixed(2) + ' KB',
              dimensions: `${img.width}x${img.height}`
          });
          setIsUploading(false);
          showToast("Image compressed!", "success");
      }
  };

  const handleResize = () => {
      if (!utilImage) return;
      setIsUploading(true);
      const img = new Image();
      img.src = utilImage;
      img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = resizeWidth;
          canvas.height = resizeHeight;
          const ctx = canvas.getContext('2d');
          if(!ctx) return;
          
          // High quality scaling
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, resizeWidth, resizeHeight);
          
          const dataUrl = canvas.toDataURL('image/png');
          setProcessedImage(dataUrl);
          
           const head = 'data:image/png;base64,';
          const sizeBytes = Math.round((dataUrl.length - head.length) * 3 / 4);
          setProcessedMeta({ 
              size: (sizeBytes/1024).toFixed(2) + ' KB', 
              dimensions: `${resizeWidth}x${resizeHeight}`
          });
          setIsUploading(false);
          showToast("Image resized!", "success");
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
        {/* New Feature: Profile Studio & Moodboard */}
        <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#292d3e] shadow-neu p-5 rounded-2xl flex flex-col gap-3 cursor-pointer active:shadow-neu-pressed transition-all" onClick={() => setActiveTool('profile-studio')}>
                <div className="bg-[#292d3e] shadow-neu-pressed p-3 rounded-full text-indigo-400 w-fit"><UserCheck size={24} /></div>
                <div><h4 className="font-bold text-gray-200 leading-tight">Profile Studio</h4><p className="text-[10px] text-gray-500">Pro Headshots</p></div>
            </div>
            <div className="bg-[#292d3e] shadow-neu p-5 rounded-2xl flex flex-col gap-3 cursor-pointer active:shadow-neu-pressed transition-all" onClick={() => setActiveTool('moodboard')}>
                <div className="bg-[#292d3e] shadow-neu-pressed p-3 rounded-full text-pink-400 w-fit"><Layers size={24} /></div>
                <div><h4 className="font-bold text-gray-200 leading-tight">Moodboard</h4><p className="text-[10px] text-gray-500">Aesthetic Grids</p></div>
            </div>
        </div>

        {/* New Feature: PDF & Notes */}
        <div>
             <h3 className="text-xs font-bold text-gray-500 uppercase mb-3 ml-2">Productivity</h3>
             <div className="grid grid-cols-2 gap-4">
                 <MenuCard icon={FileText} color="text-red-400" title="PDF Tools" onClick={() => setActiveTool('pdf-tools')} />
                 <MenuCard icon={Feather} color="text-yellow-400" title="Smart Notes" onClick={() => setActiveTool('notes')} />
             </div>
        </div>

        {/* Section: Sports & Trends */}
        <div>
            <h3 className="text-xs font-bold text-gray-500 uppercase mb-3 ml-2">Sports & Trends</h3>
            <div className="bg-[#292d3e] shadow-neu p-5 rounded-2xl flex items-center gap-4 cursor-pointer active:shadow-neu-pressed transition-all mb-4" onClick={() => setActiveTool('football-hub')}>
                <div className="bg-[#292d3e] shadow-neu-pressed p-3 rounded-full text-green-400"><Shirt size={20} /></div>
                <div><h4 className="font-bold text-gray-200">Football Intel Hub</h4><p className="text-xs text-gray-500">Live, Stats, Fantasy & AI</p></div>
                <ArrowRight className="ml-auto text-gray-500" size={16} />
            </div>
            
             <div className="bg-[#292d3e] shadow-neu p-5 rounded-2xl flex items-center gap-4 cursor-pointer active:shadow-neu-pressed transition-all" onClick={() => setActiveTool('soccer')}>
                <div className="bg-[#292d3e] shadow-neu-pressed p-3 rounded-full text-green-400 opacity-60"><Trophy size={20} /></div>
                <div><h4 className="font-bold text-gray-200">Simple Predictions</h4><p className="text-xs text-gray-500">Classic View</p></div>
                <ArrowRight className="ml-auto text-gray-500" size={16} />
            </div>
        </div>

        {/* Section: Essentials */}
        <div>
            <h3 className="text-xs font-bold text-gray-500 uppercase mb-3 ml-2">Essentials</h3>
            <div className="grid grid-cols-3 gap-4">
                <MenuCard icon={Bitcoin} color="text-orange-400" title="Crypto" onClick={() => setActiveTool('crypto')} />
                <MenuCard icon={Banknote} color="text-green-400" title="Currency" onClick={() => setActiveTool('currency')} />
                <MenuCard icon={Ruler} color="text-teal-400" title="Units" onClick={() => setActiveTool('unit')} />
                <MenuCard icon={Link} color="text-blue-400" title="Shortener" onClick={() => setActiveTool('shortener')} />
                <MenuCard icon={QrCode} color="text-purple-400" title="Gen QR" onClick={() => setActiveTool('qr')} />
                <MenuCard icon={ScanLine} color="text-red-400" title="Scan QR" onClick={() => { setScannedResult(null); setActiveTool('qr-scan'); }} />
            </div>
        </div>

        {/* Section: Photo Utils */}
        <div>
            <h3 className="text-xs font-bold text-gray-500 uppercase mb-3 ml-2">Photo Utilities</h3>
            <div className="grid grid-cols-3 gap-4">
                <MenuCard icon={Minimize} color="text-cyan-400" title="Compress" onClick={() => { setUtilImage(null); setActiveTool('compress'); }} />
                <MenuCard icon={Maximize} color="text-indigo-400" title="Resize" onClick={() => { setUtilImage(null); setActiveTool('resize'); }} />
                <MenuCard icon={Palette} color="text-pink-400" title="Palette" onClick={() => { setUtilImage(null); setActiveTool('palette'); }} />
                <MenuCard icon={Smile} color="text-red-400" title="Meme" onClick={() => { setUtilImage(null); setActiveTool('meme'); }} />
                <MenuCard icon={Info} color="text-yellow-400" title="Metadata" onClick={() => { setUtilImage(null); setActiveTool('meta'); }} />
                <MenuCard icon={Gamepad} color="text-gray-200" title="Puzzle" onClick={() => { setUtilImage(null); setActiveTool('puzzle'); }} />
            </div>
        </div>
        
        {/* Section: Social */}
        <div>
            <h3 className="text-xs font-bold text-gray-500 uppercase mb-3 ml-2">Social Growth</h3>
            <div className="grid grid-cols-2 gap-4">
                 <div className="bg-[#292d3e] shadow-neu p-5 rounded-2xl flex items-center gap-4 cursor-pointer active:shadow-neu-pressed transition-all" onClick={() => setActiveTool('bio')}>
                    <div className="bg-[#292d3e] shadow-neu-pressed p-3 rounded-full text-pink-400"><Sparkles size={20} /></div>
                    <div><h4 className="font-bold text-gray-200">Bio Writer</h4></div>
                </div>
                 <div className="bg-[#292d3e] shadow-neu p-5 rounded-2xl flex items-center gap-4 cursor-pointer active:shadow-neu-pressed transition-all" onClick={() => setActiveTool('social-growth')}>
                    <div className="bg-[#292d3e] shadow-neu-pressed p-3 rounded-full text-blue-400"><TrendingUp size={20} /></div>
                    <div><h4 className="font-bold text-gray-200">Growth Hub</h4></div>
                </div>
            </div>
        </div>
    </div>
  );

  return (
    <div className="h-full overflow-y-auto hide-scrollbar p-4 pb-24 space-y-6 bg-[#292d3e]">
      
      {/* Upload Loading Overlay */}
      {isUploading && (
          <div className="absolute inset-0 z-50 bg-[#292d3e]/90 flex flex-col items-center justify-center animate-fade-in-up">
              <div className="w-20 h-20 rounded-full bg-[#292d3e] shadow-neu flex items-center justify-center mb-6">
                  <RefreshCw className="animate-spin text-gray-200" size={32} />
              </div>
              <p className="text-gray-200 font-bold text-lg">Processing...</p>
          </div>
      )}

      {/* Header (Neumorphic) */}
      <div className="flex items-center gap-4 sticky top-0 bg-[#292d3e] py-3 z-20 shadow-sm border-b border-[#292d3e]">
        {activeTool !== 'menu' && (
            <button onClick={() => { setActiveTool('menu'); }} className="p-3 bg-[#292d3e] shadow-neu rounded-full active:shadow-neu-pressed transition-all text-gray-400 hover:text-white">
                <ArrowLeft size={18} />
            </button>
        )}
        <h1 className="text-xl font-bold text-gray-200 flex items-center gap-2">
            <Briefcase className="text-teal-500" size={20} /> Toolkit
        </h1>
        <div className="ml-auto">
             <button 
                 onClick={onOpenSettings}
                 className="text-gray-400 hover:text-white p-3 rounded-full bg-[#292d3e] shadow-neu active:shadow-neu-pressed transition-all"
                 title="Settings"
             >
                 <Settings size={20} />
             </button>
        </div>
      </div>

      {activeTool === 'menu' && renderMenu()}
      
      {/* --- NEW COMPONENTS RENDER --- */}
      {activeTool === 'profile-studio' && <ProfileStudio />}
      {activeTool === 'moodboard' && <MoodboardGenerator />}
      {activeTool === 'notes' && <SmartNotes />}
      {activeTool === 'pdf-tools' && <PdfTools />}
      {activeTool === 'social-growth' && <SocialGrowth />}
      {activeTool === 'football-hub' && <FootballHub />}

      {/* --- SOCCER TOOL --- */}
      {activeTool === 'soccer' && (
          <SoccerPredictions />
      )}

      {/* --- QR SCANNER (Neumorphic) --- */}
      {activeTool === 'qr-scan' && (
          <div className="space-y-4 animate-fade-in-up">
              <div className="bg-[#292d3e] shadow-neu p-6 rounded-2xl text-center">
                  {!scannedResult ? (
                      <div className="space-y-6">
                          <div className="overflow-hidden rounded-xl relative min-h-[250px] bg-[#1e212d] shadow-neu-pressed flex items-center justify-center border-4 border-[#292d3e]">
                              <div id="reader" className="w-full"></div>
                              <p className="absolute text-xs text-gray-500 pointer-events-none font-bold uppercase">Scanning...</p>
                          </div>
                          <button 
                            onClick={() => qrFileInputRef.current?.click()}
                            className="w-full bg-[#292d3e] shadow-neu py-4 rounded-xl text-gray-300 font-bold text-sm flex items-center justify-center gap-2 transition-all active:shadow-neu-pressed hover:text-white"
                          >
                              <ImagePlus size={18} /> Upload QR Image
                          </button>
                      </div>
                  ) : (
                      <div className="space-y-6">
                          <div className="w-20 h-20 rounded-full bg-[#292d3e] shadow-neu flex items-center justify-center mx-auto text-green-400">
                              <CheckCircle size={32} />
                          </div>
                          <h3 className="text-xl font-bold text-gray-200">Scan Successful!</h3>
                          
                          {/* Parse Result logic */}
                          {(() => {
                              const wifiData = scannedResult.startsWith('WIFI:') ? parseWifi(scannedResult) : null;
                              
                              if (wifiData) {
                                  return (
                                    <div className="bg-[#292d3e] shadow-neu-pressed p-5 rounded-xl text-left space-y-4">
                                        <div className="flex items-center gap-4">
                                            <div className="bg-[#292d3e] shadow-neu p-3 rounded-full text-blue-400">
                                                <Wifi size={24} />
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 font-bold uppercase">WiFi Network</p>
                                                <h3 className="text-lg font-bold text-gray-200">{wifiData.ssid}</h3>
                                            </div>
                                        </div>
                                        
                                        <div className="flex justify-between items-center bg-[#292d3e] p-4 rounded-xl shadow-neu">
                                            <span className="font-mono text-gray-200 text-lg tracking-wider">
                                                {showWifiPass ? wifiData.password : '••••••••'}
                                            </span>
                                            <button onClick={() => setShowWifiPass(!showWifiPass)} className="text-gray-400 hover:text-white p-2">
                                                {showWifiPass ? <EyeOff size={18}/> : <Eye size={18}/>}
                                            </button>
                                        </div>

                                        <button 
                                            onClick={() => {navigator.clipboard.writeText(wifiData.password); showToast("Password Copied", "success")}}
                                            className="w-full bg-[#292d3e] text-blue-400 py-4 rounded-xl font-bold shadow-neu active:shadow-neu-pressed transition-all flex items-center justify-center gap-2"
                                        >
                                            <Copy size={18} /> Copy Password
                                        </button>
                                    </div>
                                  );
                              }
                              
                              return (
                                  <div className="bg-[#292d3e] shadow-neu-pressed p-5 rounded-xl text-left">
                                      <p className="text-xs text-gray-500 font-bold uppercase mb-2">Content</p>
                                      <div className="break-all text-sm text-gray-300 font-mono">
                                          {scannedResult}
                                      </div>
                                      
                                      {isUrl(scannedResult) && (
                                          <a href={scannedResult} target="_blank" rel="noreferrer" className="mt-4 w-full bg-[#292d3e] text-blue-400 font-bold py-3 rounded-xl flex items-center justify-center gap-2 shadow-neu active:shadow-neu-pressed transition-all">
                                              <ExternalLink size={16} /> Open Link
                                          </a>
                                      )}
                                  </div>
                              );
                          })()}

                          <div className="flex gap-4">
                              {!scannedResult.startsWith('WIFI:') && (
                                  <button onClick={() => {navigator.clipboard.writeText(scannedResult); showToast("Copied to clipboard", "success")}} className="flex-1 bg-[#292d3e] shadow-neu py-3 rounded-xl font-bold hover:text-white flex items-center justify-center gap-2 active:shadow-neu-pressed text-gray-400">
                                      <Copy size={16} /> Copy
                                  </button>
                              )}
                              <button onClick={() => { setScannedResult(null); window.location.reload(); }} className="flex-1 bg-[#292d3e] shadow-neu text-gray-400 hover:text-white py-3 rounded-xl font-bold active:shadow-neu-pressed">
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
          <div className="space-y-6 animate-fade-in-up">
              <div className="bg-[#292d3e] shadow-neu p-6 rounded-2xl space-y-4">
                  <label className="text-xs font-bold text-gray-500 uppercase ml-1">Select Asset</label>
                  <div className="relative">
                    <select 
                        value={selectedCoin} 
                        onChange={e => setSelectedCoin(e.target.value)}
                        className="w-full bg-[#292d3e] text-gray-200 p-4 rounded-xl shadow-neu-pressed outline-none appearance-none font-bold"
                    >
                        {COINS.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">▼</div>
                  </div>
                  
                  <button 
                    onClick={handleCryptoAnalysis} 
                    disabled={isAnalyzingFinance}
                    className="w-full bg-[#292d3e] text-orange-400 py-4 rounded-xl font-bold shadow-neu active:shadow-neu-pressed transition-all flex justify-center items-center gap-2 mt-2"
                  >
                      {isAnalyzingFinance ? <RefreshCw className="animate-spin" /> : <Activity />}
                      Analyze Market
                  </button>
              </div>

              {cryptoResult && (
                  <div className="bg-[#292d3e] shadow-neu p-6 rounded-2xl animate-fade-in-up space-y-6">
                      <div className="flex justify-between items-end">
                          <div>
                              <p className="text-xs text-gray-500 uppercase font-bold">Current Price</p>
                              <h2 className="text-3xl font-black text-gray-200 mt-1">{cryptoResult.price}</h2>
                          </div>
                          <div className={`px-4 py-2 rounded-lg text-sm font-bold shadow-neu-pressed ${cryptoResult.change?.includes('+') ? 'text-green-400' : 'text-red-400'}`}>
                              {cryptoResult.change}
                          </div>
                      </div>

                      {cryptoResult.trend && (
                        <div className="h-24 w-full flex items-end gap-2 px-2">
                            {cryptoResult.trend.map((val: number, i: number) => (
                                <div key={i} className="flex-1 bg-[#292d3e] shadow-neu rounded-t-sm relative" style={{height: `${val}%`}}>
                                    <div className="absolute inset-0 bg-orange-500 opacity-20 rounded-t-sm"></div>
                                </div>
                            ))}
                        </div>
                      )}

                      <div className="flex items-center gap-4 pt-2 border-t border-gray-800">
                          <div className={`flex-1 py-3 rounded-xl text-center font-black text-xl shadow-neu ${
                              cryptoResult.signal === 'BUY' ? 'text-green-400' : 
                              cryptoResult.signal === 'SELL' ? 'text-red-400' : 'text-gray-400'
                          }`}>
                              {cryptoResult.signal}
                          </div>
                          <p className="flex-[2] text-xs text-gray-400 leading-relaxed font-medium">{cryptoResult.analysis}</p>
                      </div>
                  </div>
              )}
          </div>
      )}

      {/* --- CURRENCY TOOL --- */}
      {activeTool === 'currency' && (
          <div className="space-y-6 animate-fade-in-up">
              <div className="bg-[#292d3e] shadow-neu p-6 rounded-2xl space-y-5">
                   <div className="flex flex-col gap-4">
                       <input 
                          type="number" 
                          value={amount} 
                          onChange={e => setAmount(e.target.value)} 
                          className="w-full bg-[#292d3e] p-4 rounded-xl text-gray-200 font-bold text-2xl text-center shadow-neu-pressed outline-none"
                          placeholder="Amount"
                       />
                       <div className="flex items-center gap-3">
                           <select value={fromCurr} onChange={e => setFromCurr(e.target.value)} className="flex-1 bg-[#292d3e] p-3 rounded-xl text-gray-300 text-sm shadow-neu outline-none appearance-none text-center font-bold">
                               {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.flag} {c.code}</option>)}
                           </select>
                           <div className="text-gray-500"><ArrowRight size={16}/></div>
                           <select value={toCurr} onChange={e => setToCurr(e.target.value)} className="flex-1 bg-[#292d3e] p-3 rounded-xl text-gray-300 text-sm shadow-neu outline-none appearance-none text-center font-bold">
                               {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.flag} {c.code}</option>)}
                           </select>
                       </div>
                   </div>
                   
                   <button 
                      onClick={handleCurrencyConvert}
                      disabled={isAnalyzingFinance}
                      className="w-full bg-[#292d3e] text-green-400 py-4 rounded-xl font-bold shadow-neu active:shadow-neu-pressed transition-all flex justify-center items-center gap-2"
                   >
                       {isAnalyzingFinance ? <RefreshCw className="animate-spin" /> : <RefreshCcw />}
                       Convert Now
                   </button>
              </div>

              {financialResult && (
                  <div className="bg-[#292d3e] shadow-neu p-8 rounded-2xl animate-fade-in-up text-center space-y-4">
                      <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">Conversion Result</p>
                      <h2 className="text-4xl font-black text-gray-200 tracking-tight">{financialResult.result}</h2>
                      <div className="inline-block bg-[#292d3e] shadow-neu-pressed px-4 py-2 rounded-full text-xs text-green-400 font-bold">
                          {financialResult.rate}
                      </div>
                      <p className="text-xs text-gray-500 pt-4 border-t border-gray-800">{financialResult.details}</p>
                  </div>
              )}
          </div>
      )}

      {/* --- SHORTENER --- */}
      {activeTool === 'shortener' && (
         <div className="bg-[#292d3e] shadow-neu p-6 rounded-2xl space-y-6 animate-fade-in-up">
             <input value={longUrl} onChange={e => setLongUrl(e.target.value)} placeholder="Paste long URL here..." className="w-full bg-[#292d3e] shadow-neu-pressed p-4 rounded-xl text-gray-300 outline-none" />
             <button onClick={handleShorten} className="w-full bg-[#292d3e] text-blue-400 py-4 rounded-xl font-bold shadow-neu active:shadow-neu-pressed transition-all">
                 {isShortening ? <RefreshCw className="animate-spin inline mr-2"/> : <Link className="inline mr-2"/>} Shorten Link
             </button>
             {shortUrl && (
                 <div className="bg-[#292d3e] shadow-neu-pressed p-4 rounded-xl flex justify-between items-center cursor-pointer hover:bg-[#292d3e]" onClick={() => {navigator.clipboard.writeText(shortUrl); showToast("Copied!", "success")}}>
                     <span className="font-mono text-blue-400 font-bold">{shortUrl}</span>
                     <Copy size={18} className="text-gray-500" />
                 </div>
             )}
         </div>
      )}
      
      {/* ... Other tools follow same neumorphic pattern ... */}
      
       {/* Hidden Upload for Util Tools */}
       <input type="file" ref={utilFileInputRef} onChange={handleUtilImageUpload} className="hidden" accept="image/*" />
       {/* Hidden Upload for QR Scanner */}
       <input type="file" ref={qrFileInputRef} onChange={handleQrFileUpload} className="hidden" accept="image/*" />
    </div>
  );
};

const MenuCard = ({icon: Icon, color, title, onClick}: any) => (
    <div onClick={onClick} className="bg-[#292d3e] shadow-neu p-4 rounded-2xl flex flex-col items-center justify-center gap-3 cursor-pointer active:shadow-neu-pressed transition-all aspect-square hover:scale-[1.02]">
        <div className={`p-3 rounded-full bg-[#292d3e] shadow-neu-pressed ${color}`}>
            <Icon size={24} strokeWidth={2.5} />
        </div>
        <span className="text-xs font-bold text-gray-400">{title}</span>
    </div>
);

export default Toolkit;