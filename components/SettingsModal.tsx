
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
          desc: "Manage Gemini API Key",
          action: onOpenApiKey,
          iconColor: "text-blue-400"
      },
      {
          icon: WhatsApp,
          label: "Join Community",
          desc: "Support & Updates",
          action: () => window.open("https://chat.whatsapp.com/H2IYoYinYdb4hFVeyBy405?mode=wwt", "_blank"),
          iconColor: "text-green-400"
      },
      {
          icon: RotateCcw,
          label: "Reset App Data",
          desc: "Clear local storage",
          action: handleReset,
          iconColor: "text-red-400"
      }
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:p-6">
      <div className="absolute inset-0 bg-[#292d3e]/90 backdrop-blur-sm animate-fade-in-up" onClick={onClose}></div>
      
      <div className="relative w-full max-w-sm bg-[#292d3e] sm:rounded-3xl rounded-t-3xl p-6 shadow-neu animate-fade-in-up overflow-hidden border-t border-white/5 sm:border-0">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-bold text-gray-200">Settings</h2>
            <button 
                onClick={onClose} 
                className="w-10 h-10 rounded-full bg-[#292d3e] shadow-neu flex items-center justify-center text-gray-400 active:shadow-neu-pressed transition-all hover:text-red-400"
            >
                <X size={18} />
            </button>
        </div>

        {/* Menu Items */}
        <div className="space-y-5">
            {menuItems.map((item, idx) => (
                <button 
                    key={idx}
                    onClick={() => { item.action(); }}
                    className="w-full bg-[#292d3e] shadow-neu p-4 rounded-2xl flex items-center gap-4 transition-all active:shadow-neu-pressed group text-left"
                >
                    <div className={`w-12 h-12 rounded-full bg-[#292d3e] shadow-neu-pressed flex items-center justify-center ${item.iconColor}`}>
                        <item.icon size={22} />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-sm font-bold text-gray-200 group-hover:text-primary transition-colors">{item.label}</h3>
                        <p className="text-[10px] text-gray-500 font-medium">{item.desc}</p>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-[#292d3e] shadow-neu flex items-center justify-center text-gray-500 group-hover:text-primary group-active:shadow-neu-pressed">
                        <ChevronRight size={14} />
                    </div>
                </button>
            ))}
        </div>

        {/* Info Footer */}
        <div className="mt-10 pt-6 text-center space-y-4">
             <div className="flex justify-center gap-4 text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                 <span className="flex items-center gap-1"><Smartphone size={12}/> v1.0.0</span>
                 <span className="flex items-center gap-1"><ShieldCheck size={12}/> Secure</span>
             </div>
             <p className="text-[10px] text-gray-600">SnapAura AI Studio</p>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
