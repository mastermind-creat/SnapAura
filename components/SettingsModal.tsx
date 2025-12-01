
import React from 'react';
import { X, Key, WhatsApp, RotateCcw, ChevronRight, Smartphone, ShieldCheck } from './Icons';

interface SettingsModalProps {
  isVisible: boolean;
  onClose: () => void;
  onOpenApiKey: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isVisible, onClose, onOpenApiKey }) => {
  if (!isVisible) return null;

  const handleReset = () => {
      if(confirm("Are you sure you want to reset all app data? This will clear your API key and preferences.")) {
          localStorage.clear();
          window.location.reload();
      }
  };

  const menuItems = [
      {
          icon: Key,
          label: "API Configuration",
          desc: "Manage your Google Gemini API Key",
          action: onOpenApiKey,
          color: "text-blue-400",
          bg: "bg-blue-500/10"
      },
      {
          icon: WhatsApp,
          label: "Join Community",
          desc: "Get updates & support on WhatsApp",
          action: () => window.open("https://chat.whatsapp.com/H2IYoYinYdb4hFVeyBy405?mode=wwt", "_blank"),
          color: "text-green-400",
          bg: "bg-green-500/10"
      },
      {
          icon: RotateCcw,
          label: "Reset App Data",
          desc: "Clear cache and local storage",
          action: handleReset,
          color: "text-red-400",
          bg: "bg-red-500/10"
      }
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:p-6">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md animate-fade-in-up" onClick={onClose}></div>
      
      <div className="relative w-full max-w-sm bg-[#1a1a20] border-t sm:border border-white/10 sm:rounded-3xl rounded-t-3xl p-6 shadow-2xl animate-fade-in-up ring-1 ring-white/5 overflow-hidden">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white">Settings</h2>
            <button onClick={onClose} className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors">
                <X size={20} className="text-gray-400" />
            </button>
        </div>

        {/* Menu Items */}
        <div className="space-y-3">
            {menuItems.map((item, idx) => (
                <button 
                    key={idx}
                    onClick={() => { item.action(); }}
                    className="w-full glass-panel p-4 rounded-2xl flex items-center gap-4 hover:bg-white/5 transition-all active:scale-95 group text-left border border-white/5"
                >
                    <div className={`p-3 rounded-full ${item.bg} ${item.color}`}>
                        <item.icon size={20} />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-sm font-bold text-white group-hover:text-primary transition-colors">{item.label}</h3>
                        <p className="text-[10px] text-gray-500">{item.desc}</p>
                    </div>
                    <ChevronRight size={16} className="text-gray-600 group-hover:text-white transition-colors" />
                </button>
            ))}
        </div>

        {/* Info Footer */}
        <div className="mt-8 pt-6 border-t border-white/10 text-center space-y-4">
             <div className="flex justify-center gap-4 text-xs text-gray-500">
                 <span className="flex items-center gap-1"><Smartphone size={12}/> v1.0.0</span>
                 <span className="flex items-center gap-1"><ShieldCheck size={12}/> Secure</span>
             </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
