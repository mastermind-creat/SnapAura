import React, { useState } from 'react';
import { Link, QrCode, Sparkles, ArrowLeft, Copy, RefreshCw, Briefcase, Wand2, Bitcoin, Banknote, TrendingUp, DollarSign, ArrowRight, Activity, AlertCircle } from './Icons';
import { generateSocialBio, getFinancialAnalysis } from '../services/geminiService';
import { showToast } from './Toast';

const Toolkit: React.FC = () => {
  const [activeTool, setActiveTool] = useState<'menu' | 'shortener' | 'qr' | 'bio' | 'crypto' | 'currency'>('menu');

  // Shortener State
  const [longUrl, setLongUrl] = useState('');
  const [shortUrl, setShortUrl] = useState('');
  const [isShortening, setIsShortening] = useState(false);

  // QR State
  const [qrText, setQrText] = useState('');
  const [qrUrl, setQrUrl] = useState('');

  // Bio State
  const [bioInput, setBioInput] = useState('');
  const [bios, setBios] = useState<string[]>([]);
  const [isWritingBio, setIsWritingBio] = useState(false);

  // Financial Tools State
  // Crypto
  const [selectedCoin, setSelectedCoin] = useState('Bitcoin (BTC)');
  const [cryptoResult, setCryptoResult] = useState<{
      price: string;
      trend: number[];
      signal: 'BUY' | 'SELL' | 'HOLD';
      details: string;
      sources: any[];
  } | null>(null);

  // Currency
  const [financialResult, setFinancialResult] = useState<{text: string, sources: any[]} | null>(null);
  const [isAnalyzingFinance, setIsAnalyzingFinance] = useState(false);
  
  // Specific inputs for Currency
  const [amount, setAmount] = useState('100');
  const [fromCurr, setFromCurr] = useState('USD');
  const [toCurr, setToCurr] = useState('KES');

  const COINS = [
    "Bitcoin (BTC)",
    "Ethereum (ETH)",
    "Solana (SOL)",
    "Binance Coin (BNB)",
    "Ripple (XRP)",
    "Cardano (ADA)",
    "Dogecoin (DOGE)",
    "Polkadot (DOT)",
    "Shiba Inu (SHIB)",
    "Polygon (MATIC)",
    "Litecoin (LTC)",
    "Chainlink (LINK)"
  ];

  const handleShorten = async () => {
    if (!longUrl) return;
    setIsShortening(true);
    try {
        // Try TinyURL API
        const res = await fetch(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(longUrl)}`);
        if (res.ok) {
            const text = await res.text();
            setShortUrl(text);
            showToast("Link shortened!", "success");
        } else {
            throw new Error("Failed");
        }
    } catch (e) {
        // Fallback for demo
        const mock = `snapaura.lnk/${Math.random().toString(36).substring(7)}`;
        setShortUrl(mock);
        showToast("Network blocked. Generated demo link.", "info");
    } finally {
        setIsShortening(false);
    }
  };

  const handleGenerateQR = () => {
      if(!qrText) return;
      setQrUrl(`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrText)}`);
      showToast("QR Code generated!", "success");
  };

  const handleGenerateBio = async () => {
      if(!bioInput) return;
      setIsWritingBio(true);
      try {
          const result = await generateSocialBio(bioInput);
          const split = result.split('||').map(s => s.trim()).filter(s => s);
          setBios(split);
          showToast("Bios generated!", "success");
      } catch(e) {
          showToast("Failed to write bio.", "error");
      } finally {
          setIsWritingBio(false);
      }
  };

  const handleCryptoAnalysis = async () => {
      if(!selectedCoin) return;
      setIsAnalyzingFinance(true);
      setCryptoResult(null);
      try {
          const prompt = `
            Analyze the current market for ${selectedCoin}. 
            1. Find the current price in USD.
            2. Find the 7-day price trend. Estimate 7 data points (numbers only) representing the price over the last 7 days.
            3. Analyze technical sentiment (RSI, MACD, News) and give a strict 'BUY', 'SELL', or 'HOLD' signal.
            4. Provide a detailed summary of why.

            Format your response exactly like this:
            PRICE: $12345.67
            TREND: 12000, 12100, 11900, 12200, 12300, 12400, 12345
            SIGNAL: BUY
            DETAILS: [Your detailed analysis paragraph here]
          `;

          const rawResult = await getFinancialAnalysis(prompt);
          
          // Parse Response
          const text = rawResult.text;
          const priceMatch = text.match(/PRICE:\s*(.+)/i);
          const trendMatch = text.match(/TREND:\s*([\d\s,.]+)/i);
          const signalMatch = text.match(/SIGNAL:\s*(BUY|SELL|HOLD)/i);
          const detailsMatch = text.match(/DETAILS:\s*([\s\S]*)/i);

          const price = priceMatch ? priceMatch[1].trim() : "Unknown";
          // Parse trend string "1, 2, 3" into number array
          const trendStr = trendMatch ? trendMatch[1] : "";
          const trend = trendStr.split(',').map(n => parseFloat(n.trim())).filter(n => !isNaN(n));
          const signal = signalMatch ? (signalMatch[1].toUpperCase() as any) : 'HOLD';
          const details = detailsMatch ? detailsMatch[1].trim() : text; // Fallback to full text if parse fails

          setCryptoResult({
              price,
              trend: trend.length > 0 ? trend : [0,0,0,0,0,0,0],
              signal,
              details,
              sources: rawResult.sources
          });

          showToast("Market analysis complete!", "success");
      } catch (e) {
          console.error(e);
          showToast("Failed to fetch market data.", "error");
      } finally {
          setIsAnalyzingFinance(false);
      }
  };

  const handleCurrencyConvert = async () => {
      if(!amount || !fromCurr || !toCurr) return;
      setIsAnalyzingFinance(true);
      setFinancialResult(null);
      try {
          const result = await getFinancialAnalysis(`Convert ${amount} ${fromCurr} to ${toCurr}. Provide the exact current exchange rate and the total value. Also briefly mention if ${fromCurr} is getting stronger or weaker.`);
          setFinancialResult(result);
          showToast("Conversion complete!", "success");
      } catch (e) {
          showToast("Failed to convert.", "error");
      } finally {
          setIsAnalyzingFinance(false);
      }
  };

  const handleCopy = (text: string) => {
      navigator.clipboard.writeText(text);
      showToast("Copied!", "success");
  };

  // Simple SVG Line Chart Component
  const SimpleChart = ({ data, color }: { data: number[], color: string }) => {
      if (data.length < 2) return null;
      
      const max = Math.max(...data);
      const min = Math.min(...data);
      const range = max - min || 1;
      const height = 60;
      const width = 280;
      
      // Calculate points
      const points = data.map((val, i) => {
          const x = (i / (data.length - 1)) * width;
          const y = height - ((val - min) / range) * height;
          return `${x},${y}`;
      }).join(' ');

      return (
          <svg width="100%" height={height + 20} viewBox={`0 0 ${width} ${height + 20}`} className="overflow-visible">
             <defs>
                <linearGradient id={`grad-${color}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity="0.4" />
                    <stop offset="100%" stopColor={color} stopOpacity="0" />
                </linearGradient>
             </defs>
             {/* Area under curve */}
             <path 
                d={`M 0,${height} ${points.split(' ').map((p,i) => i===0 ? `L ${p}` : `L ${p}`).join(' ')} L ${width},${height} Z`} 
                fill={`url(#grad-${color})`} 
             />
             {/* Line */}
             <polyline 
                points={points} 
                fill="none" 
                stroke={color} 
                strokeWidth="3" 
                strokeLinecap="round" 
                strokeLinejoin="round"
             />
             {/* Points */}
             {data.map((val, i) => {
                  const x = (i / (data.length - 1)) * width;
                  const y = height - ((val - min) / range) * height;
                  return <circle key={i} cx={x} cy={y} r="3" fill="white" stroke={color} strokeWidth="2" />;
             })}
          </svg>
      );
  };

  const renderMenu = () => (
    <div className="grid grid-cols-1 gap-4 animate-fade-in-up">
        {/* Row 1: Crypto & Currency */}
        <div className="grid grid-cols-2 gap-4">
             <div 
                onClick={() => { setCryptoResult(null); setActiveTool('crypto'); }}
                className="glass-panel p-4 rounded-2xl flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-white/10 transition-colors group active:scale-95 text-center h-40"
            >
                <div className="bg-orange-500/20 p-4 rounded-full text-orange-400 group-hover:bg-orange-500 group-hover:text-white transition-colors">
                    <Bitcoin size={28} />
                </div>
                <div>
                    <h3 className="font-bold text-sm">Crypto Watch</h3>
                </div>
            </div>

            <div 
                onClick={() => { setFinancialResult(null); setActiveTool('currency'); }}
                className="glass-panel p-4 rounded-2xl flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-white/10 transition-colors group active:scale-95 text-center h-40"
            >
                <div className="bg-green-500/20 p-4 rounded-full text-green-400 group-hover:bg-green-500 group-hover:text-white transition-colors">
                    <Banknote size={28} />
                </div>
                <div>
                    <h3 className="font-bold text-sm">Currency Exch</h3>
                </div>
            </div>
        </div>

        {/* Row 2: Standard Tools */}
        <div 
            onClick={() => setActiveTool('shortener')}
            className="glass-panel p-6 rounded-2xl flex items-center gap-4 cursor-pointer hover:bg-white/10 transition-colors group active:scale-95"
        >
            <div className="bg-blue-500/20 p-4 rounded-full text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                <Link size={24} />
            </div>
            <div>
                <h3 className="font-bold text-lg">Link Shortener</h3>
                <p className="text-gray-400 text-sm">Make long URLs tiny & shareable</p>
            </div>
        </div>

        <div 
            onClick={() => setActiveTool('qr')}
            className="glass-panel p-6 rounded-2xl flex items-center gap-4 cursor-pointer hover:bg-white/10 transition-colors group active:scale-95"
        >
            <div className="bg-purple-500/20 p-4 rounded-full text-purple-400 group-hover:bg-purple-500 group-hover:text-white transition-colors">
                <QrCode size={24} />
            </div>
            <div>
                <h3 className="font-bold text-lg">QR Generator</h3>
                <p className="text-gray-400 text-sm">Create codes for websites or text</p>
            </div>
        </div>

        <div 
            onClick={() => setActiveTool('bio')}
            className="glass-panel p-6 rounded-2xl flex items-center gap-4 cursor-pointer hover:bg-white/10 transition-colors group active:scale-95"
        >
            <div className="bg-pink-500/20 p-4 rounded-full text-pink-400 group-hover:bg-pink-500 group-hover:text-white transition-colors">
                <Sparkles size={24} />
            </div>
            <div>
                <h3 className="font-bold text-lg">AI Bio Writer</h3>
                <p className="text-gray-400 text-sm">Get the perfect profile bio</p>
            </div>
        </div>
    </div>
  );

  return (
    <div className="h-full overflow-y-auto hide-scrollbar p-4 pb-24 space-y-6">
      <div className="flex items-center gap-3">
        {activeTool !== 'menu' && (
            <button 
                onClick={() => setActiveTool('menu')}
                className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors"
            >
                <ArrowLeft size={20} />
            </button>
        )}
        <h1 className="text-2xl font-bold bg-gradient-to-r from-teal-400 to-blue-500 bg-clip-text text-transparent flex items-center gap-2">
            <Briefcase className="text-white" /> Toolkit
        </h1>
      </div>

      {activeTool === 'menu' && renderMenu()}

      {/* --- CRYPTO TOOL --- */}
      {activeTool === 'crypto' && (
          <div className="space-y-4 animate-fade-in-up">
              <div className="glass-panel p-6 rounded-2xl">
                  <div className="flex items-center gap-2 mb-4">
                      <TrendingUp className="text-orange-400" size={24} />
                      <h2 className="text-lg font-bold">Crypto Market</h2>
                  </div>
                  <div className="flex flex-col gap-2 mb-4">
                      <label className="text-xs font-bold uppercase text-gray-400">Select Asset</label>
                      <select 
                        value={selectedCoin}
                        onChange={(e) => setSelectedCoin(e.target.value)}
                        className="bg-black/30 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-orange-500 transition-colors appearance-none cursor-pointer hover:bg-white/5"
                      >
                          {COINS.map(c => <option key={c} value={c} className="bg-gray-900 text-white">{c}</option>)}
                      </select>
                  </div>
                  <button 
                    onClick={handleCryptoAnalysis}
                    disabled={!selectedCoin || isAnalyzingFinance}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl font-bold flex justify-center items-center gap-2 active:scale-95 transition-all"
                  >
                    {isAnalyzingFinance ? <RefreshCw className="animate-spin" /> : <Activity />} Analyze Trends
                  </button>
              </div>

              {cryptoResult && (
                  <div className="space-y-4 animate-fade-in-up">
                      {/* Price Card */}
                      <div className="glass-panel p-6 rounded-2xl border-l-4 border-orange-500 relative overflow-hidden">
                          <div className="flex justify-between items-start mb-2">
                              <div>
                                  <p className="text-sm text-gray-400">Current Price</p>
                                  <h1 className="text-3xl font-black text-white tracking-tight">{cryptoResult.price}</h1>
                              </div>
                              <div className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                                  cryptoResult.signal === 'BUY' ? 'bg-green-500/20 text-green-400 border border-green-500/50' : 
                                  cryptoResult.signal === 'SELL' ? 'bg-red-500/20 text-red-400 border border-red-500/50' : 
                                  'bg-gray-500/20 text-gray-400 border border-gray-500/50'
                              }`}>
                                  {cryptoResult.signal} Signal
                              </div>
                          </div>
                          
                          {/* Graph Area */}
                          <div className="mt-6 mb-2">
                              <p className="text-xs text-gray-500 mb-2">7-Day Trend</p>
                              <SimpleChart 
                                data={cryptoResult.trend} 
                                color={cryptoResult.signal === 'BUY' ? '#4ade80' : cryptoResult.signal === 'SELL' ? '#f87171' : '#9ca3af'} 
                              />
                          </div>
                      </div>

                      {/* Analysis Details */}
                      <div className="glass-panel p-5 rounded-2xl border border-white/10">
                           <h3 className="text-sm font-bold text-gray-300 mb-2 flex items-center gap-2">
                               <AlertCircle size={14} /> Analyst Summary
                           </h3>
                           <p className="text-sm leading-relaxed text-gray-300 whitespace-pre-line">
                               {cryptoResult.details}
                           </p>
                      </div>

                      {/* Sources */}
                      {cryptoResult.sources.length > 0 && (
                          <div className="flex flex-col gap-2 pl-2">
                              <span className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Market Data Sources</span>
                              {cryptoResult.sources.map((source: any, i: number) => (
                                  <a key={i} href={source.uri} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-400 hover:underline truncate block">
                                      {source.title || source.uri}
                                  </a>
                              ))}
                          </div>
                      )}
                  </div>
              )}
          </div>
      )}

      {/* --- CURRENCY TOOL --- */}
      {activeTool === 'currency' && (
          <div className="glass-panel p-6 rounded-2xl space-y-4 animate-fade-in-up">
               <div className="flex items-center gap-2 mb-2">
                  <Banknote className="text-green-400" size={24} />
                  <h2 className="text-lg font-bold">Real-time Exchange</h2>
              </div>
              
              <div className="flex gap-2">
                  <div className="flex-1">
                     <label className="text-xs font-bold uppercase text-gray-400 block mb-1">Amount</label>
                     <input 
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-green-500 transition-colors"
                     />
                  </div>
              </div>

              <div className="flex items-center gap-2">
                  <div className="flex-1">
                      <label className="text-xs font-bold uppercase text-gray-400 block mb-1">From</label>
                      <input 
                        value={fromCurr}
                        onChange={(e) => setFromCurr(e.target.value.toUpperCase())}
                        className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-green-500 transition-colors uppercase"
                        maxLength={3}
                     />
                  </div>
                  <div className="pt-5 text-gray-400">
                      <ArrowRight size={20} />
                  </div>
                  <div className="flex-1">
                      <label className="text-xs font-bold uppercase text-gray-400 block mb-1">To</label>
                      <input 
                        value={toCurr}
                        onChange={(e) => setToCurr(e.target.value.toUpperCase())}
                        className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-green-500 transition-colors uppercase"
                        maxLength={3}
                     />
                  </div>
              </div>

              <button 
                onClick={handleCurrencyConvert}
                disabled={!amount || !fromCurr || !toCurr || isAnalyzingFinance}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-bold flex justify-center items-center gap-2 active:scale-95 transition-all"
              >
                 {isAnalyzingFinance ? <RefreshCw className="animate-spin" /> : <DollarSign />} Convert
              </button>

              {financialResult && (
                  <div className="mt-4 space-y-4">
                      <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                           <p className="text-sm leading-relaxed text-gray-200 whitespace-pre-line">{financialResult.text}</p>
                      </div>
                      {financialResult.sources.length > 0 && (
                          <div className="flex flex-col gap-2">
                              <span className="text-xs text-gray-500 uppercase font-bold">Data Sources</span>
                              {financialResult.sources.map((source: any, i: number) => (
                                  <a key={i} href={source.uri} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-400 hover:underline truncate block">
                                      {source.title || source.uri}
                                  </a>
                              ))}
                          </div>
                      )}
                  </div>
              )}
          </div>
      )}

      {activeTool === 'shortener' && (
          <div className="glass-panel p-6 rounded-2xl space-y-4 animate-fade-in-up">
              <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold uppercase text-gray-400">Paste Long URL</label>
                  <input 
                    value={longUrl}
                    onChange={(e) => setLongUrl(e.target.value)}
                    placeholder="https://very-long-website.com/..."
                    className="bg-black/30 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                  />
              </div>
              <button 
                onClick={handleShorten}
                disabled={!longUrl || isShortening}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-xl font-bold flex justify-center items-center gap-2 active:scale-95 transition-all"
              >
                 {isShortening ? <RefreshCw className="animate-spin" /> : <Link />} Shorten Link
              </button>

              {shortUrl && (
                  <div className="mt-6 bg-white/5 p-4 rounded-xl border border-white/10 flex items-center justify-between">
                      <span className="text-green-400 font-mono text-sm truncate mr-4">{shortUrl}</span>
                      <button onClick={() => handleCopy(shortUrl)} className="p-2 hover:bg-white/10 rounded-lg text-white">
                          <Copy size={18} />
                      </button>
                  </div>
              )}
          </div>
      )}

      {activeTool === 'qr' && (
          <div className="glass-panel p-6 rounded-2xl space-y-4 animate-fade-in-up">
              <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold uppercase text-gray-400">Content</label>
                  <input 
                    value={qrText}
                    onChange={(e) => setQrText(e.target.value)}
                    placeholder="Website URL or Text..."
                    className="bg-black/30 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
                  />
              </div>
              <button 
                onClick={handleGenerateQR}
                disabled={!qrText}
                className="w-full bg-purple-500 hover:bg-purple-600 text-white py-3 rounded-xl font-bold flex justify-center items-center gap-2 active:scale-95 transition-all"
              >
                 <QrCode /> Generate QR
              </button>

              {qrUrl && (
                  <div className="mt-6 flex flex-col items-center gap-4">
                      <div className="p-4 bg-white rounded-xl">
                          <img src={qrUrl} alt="QR Code" className="w-48 h-48" />
                      </div>
                      <a href={qrUrl} download="snapaura-qr.png" className="text-sm text-gray-400 hover:text-white underline">
                          Download Image
                      </a>
                  </div>
              )}
          </div>
      )}

      {activeTool === 'bio' && (
          <div className="glass-panel p-6 rounded-2xl space-y-4 animate-fade-in-up">
              <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold uppercase text-gray-400">About You</label>
                  <textarea 
                    value={bioInput}
                    onChange={(e) => setBioInput(e.target.value)}
                    placeholder="E.g., Photographer, loves coffee, minimalist, travel addict..."
                    className="bg-black/30 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-pink-500 transition-colors h-24 resize-none"
                  />
              </div>
              <button 
                onClick={handleGenerateBio}
                disabled={!bioInput || isWritingBio}
                className="w-full bg-pink-500 hover:bg-pink-600 text-white py-3 rounded-xl font-bold flex justify-center items-center gap-2 active:scale-95 transition-all"
              >
                 {isWritingBio ? <RefreshCw className="animate-spin" /> : <Wand2 />} Write My Bio
              </button>

              <div className="space-y-3 mt-4">
                  {bios.map((bio, i) => (
                      <div key={i} className="bg-white/5 p-4 rounded-xl border border-white/10 relative group hover:bg-white/10 transition-colors">
                          <p className="text-sm leading-relaxed pr-8">"{bio}"</p>
                          <button 
                            onClick={() => handleCopy(bio)}
                            className="absolute top-2 right-2 p-2 text-gray-400 hover:text-white"
                          >
                              <Copy size={16} />
                          </button>
                      </div>
                  ))}
              </div>
          </div>
      )}
    </div>
  );
};

export default Toolkit;