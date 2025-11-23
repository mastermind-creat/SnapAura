import React, { useState } from 'react';
import { Link, QrCode, Sparkles, ArrowLeft, Copy, RefreshCw, Briefcase, Wand2 } from './Icons';
import { generateSocialBio } from '../services/geminiService';
import { showToast } from './Toast';

const Toolkit: React.FC = () => {
  const [activeTool, setActiveTool] = useState<'menu' | 'shortener' | 'qr' | 'bio'>('menu');

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

  const handleCopy = (text: string) => {
      navigator.clipboard.writeText(text);
      showToast("Copied!", "success");
  };

  const renderMenu = () => (
    <div className="grid grid-cols-1 gap-4 animate-fade-in-up">
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