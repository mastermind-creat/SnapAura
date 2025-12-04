
import React, { useState, useEffect } from 'react';
import { Key, Save, Eye, EyeOff, ShieldCheck, ExternalLink, Trash2, ClipboardPaste, X, RefreshCw } from './Icons';
import { Logo } from './Logo';
import { showToast } from './Toast';
import { validateApiKey } from '../services/geminiService';

interface ApiKeyModalProps {
  isVisible: boolean;
  onClose: () => void;
  canClose: boolean;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isVisible, onClose, canClose }) => {
  const [key, setKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [isValidating, setIsValidating] = useState(false);

  // Load existing key on mount if available
  useEffect(() => {
    const stored = localStorage.getItem('GEMINI_API_KEY');
    if (stored) setKey(stored);
  }, [isVisible]);

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setKey(text);
    } catch (err) {
      showToast("Failed to paste. Please type manually.", "error");
    }
  };

  const handleSave = async () => {
    if (!key.trim()) {
      showToast("Please enter an API key", "error");
      return;
    }

    if (!key.startsWith("AIza")) {
      showToast("Invalid Key format. Should start with 'AIza'", "error");
      return;
    }

    setIsValidating(true);
    
    try {
      // Perform real validation against Gemini API
      const isValid = await validateApiKey(key.trim());

      if (isValid) {
        localStorage.setItem('GEMINI_API_KEY', key.trim());
        showToast("API Key validated & connected!", "success");
        onClose();
      } else {
        showToast("Invalid API Key. Permission denied.", "error");
      }
    } catch (e) {
      showToast("Verification failed. Check your internet.", "error");
    } finally {
      setIsValidating(false);
    }
  };

  const handleDelete = () => {
    localStorage.removeItem('GEMINI_API_KEY');
    setKey('');
    showToast("API Key removed from device", "info");
  };

  const handleSkip = () => {
      showToast("AI features will be disabled.", "info");
      onClose();
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
      {/* Dimmed Background */}
      <div className="absolute inset-0 bg-[#292d3e]/95 backdrop-blur-sm animate-fade-in-up"></div>

      {/* Modal Content */}
      <div className="relative w-full max-w-sm bg-[#292d3e] rounded-3xl p-8 shadow-neu animate-fade-in-up max-h-[90vh] overflow-y-auto hide-scrollbar">
        
        {/* Close Button (Top Right) */}
        {canClose && (
            <button 
                onClick={onClose}
                className="absolute top-6 right-6 w-8 h-8 rounded-full bg-[#292d3e] shadow-neu flex items-center justify-center text-gray-500 hover:text-red-400 active:shadow-neu-pressed transition-all"
                title="Close"
            >
                <X size={16} />
            </button>
        )}

        {/* Header */}
        <div className="flex flex-col items-center text-center space-y-6 mb-8 relative z-10">
          <div className="w-24 h-24 rounded-full bg-[#292d3e] shadow-neu flex items-center justify-center">
            <Logo size={60} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-200">API Access</h2>
            <p className="text-xs text-gray-500 mt-2 font-medium uppercase tracking-wide">Connect Google Gemini</p>
          </div>
        </div>

        {/* Input Area */}
        <div className="space-y-6 relative z-10">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-500 uppercase ml-3 flex items-center gap-1">
               <Key size={10} /> Enter API Key
            </label>
            <div className="relative group">
              <input 
                type={showKey ? "text" : "password"} 
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full bg-[#292d3e] shadow-neu-pressed rounded-xl pl-4 pr-12 py-4 text-gray-300 placeholder-gray-600 focus:outline-none focus:text-primary transition-all font-mono text-sm"
              />
              
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                {key.length === 0 && (
                  <button 
                    onClick={handlePaste}
                    className="p-2 text-gray-500 hover:text-primary transition-colors"
                    title="Paste"
                  >
                    <ClipboardPaste size={18} />
                  </button>
                )}
                
                {key.length > 0 && (
                   <button 
                    onClick={() => setShowKey(!showKey)}
                    className="p-2 text-gray-500 hover:text-primary transition-colors"
                  >
                    {showKey ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Privacy Note */}
          <div className="flex gap-3 bg-[#292d3e] shadow-neu p-4 rounded-xl items-start">
             <ShieldCheck className="text-green-400 shrink-0 mt-0.5" size={16} />
             <p className="text-[10px] text-gray-400 leading-relaxed font-medium">
               Your key is stored <strong>locally on your device</strong>. It is never sent to our servers.
             </p>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 space-y-4">
             <button 
                onClick={handleSave}
                disabled={isValidating}
                className="w-full bg-[#292d3e] text-primary font-bold py-4 rounded-xl shadow-neu active:shadow-neu-pressed hover:text-secondary transition-all flex items-center justify-center gap-2"
             >
                {isValidating ? (
                  <><RefreshCw className="animate-spin" size={18} /> Verifying...</>
                ) : (
                  <><Save size={18} /> Save Connection</>
                )}
             </button>

             {/* Delete Option (only if key exists) */}
             {key && (
                 <button 
                   onClick={handleDelete}
                   className="w-full py-4 text-xs font-bold text-red-400 hover:text-red-300 flex items-center justify-center gap-2 bg-[#292d3e] shadow-neu active:shadow-neu-pressed rounded-xl transition-all"
                 >
                   <Trash2 size={14} /> Remove Key
                 </button>
             )}

             {/* Explicit Skip Option */}
             <button 
                onClick={handleSkip} 
                className="w-full text-[10px] font-bold uppercase tracking-wide text-gray-600 hover:text-gray-400 transition-colors py-2"
             >
                Continue without API Key
             </button>
          </div>

          {/* Helper Links */}
          <div className="pt-4 border-t border-[#292d3e] space-y-3 text-center">
            <a 
              href="https://aistudio.google.com/app/apikey" 
              target="_blank" 
              rel="noreferrer"
              className="flex items-center justify-center gap-1 text-[10px] text-gray-500 hover:text-primary transition-colors font-bold"
            >
              Get a key from Google AI Studio <ExternalLink size={10} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiKeyModal;
