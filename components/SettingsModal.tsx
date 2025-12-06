
import React from 'react';
import { X, Key, WhatsApp, RotateCcw, ChevronRight, Smartphone, ShieldCheck, RefreshCw, Zap, Power, Server } from './Icons';
import { showToast } from './Toast';

interface SettingsModalProps {
  isVisible: boolean;
  onClose: () => void;
  onOpenApiKey: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isVisible, onClose, onOpenApiKey }) => {
  if (!isVisible) return null;

  const handleSoftRefresh = () => {
      showToast("Refreshing System...", "info");
      setTimeout(() => window.location.reload(), 800);
  };

  const handleReset = () => {
      if(confirm("Are you sure you want to reset all app data? This will clear your API key, chat history, and preferences.")) {
          localStorage.clear();
          handleSoftRefresh();
      }
  };

  const sections = [
      {
          title: "General",
          items: [
            {
                icon: Key,
                label: "AI Configuration",
                desc: "Manage Gemini API Key",
                action: onOpenApiKey,
                color: "text-blue-400",
                bg: "bg-blue-400/10"
            },
            {
                icon: WhatsApp,
                label: "Join Community",
                desc: "Support & Updates",
                action: () => window.open("https://chat.whatsapp.com/H2IYoYinYdb4hFVeyBy405?mode=wwt", "_blank"),
                color: "text-green-400",
                bg: "bg-green-400/10"
            }
          ]
      },
      {
          title: "System",
          items: [
            {
                icon: RefreshCw,
                label: "Quick Refresh",
                desc: "Reload app resources",
                action: handleSoftRefresh,
                color: "text-purple-400",
                bg: "bg-purple-400/10"
            },
            {
                icon: RotateCcw,
                label: "Reset Data",
                desc: "Clear storage & cache",
                action: handleReset,
                color: "text-red-400",
                bg: "bg-red-400/10"
            }
          ]
      }
  ];

  return (
    <div className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center sm:p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-[#1a1c29]/90 backdrop-blur-md animate-fade-in-up" 
        onClick={onClose}
      ></div>
      
      {/* Modal Card */}
      <div className="relative w-full max-w-sm bg-[#292d3e] sm:rounded-3xl rounded-t-3xl p-0 shadow-2xl animate-fade-in-up overflow-hidden border border-white/5 ring-1 ring-white/5">
        
        {/* Cinematic Header */}
        <div className="relative bg-[#1e212d] p-6 pb-8 overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
            <div className="relative z-10 flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-black text-gray-200 tracking-tight">Settings</h2>
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1 flex items-center gap-1">
                        <Zap size={12} className="text-yellow-400"/> System Control
                    </p>
                </div>
                <button 
                    onClick={onClose} 
                    className="w-10 h-10 rounded-full bg-[#292d3e] shadow-neu flex items-center justify-center text-gray-400 active:shadow-neu-pressed transition-all hover:text-white"
                >
                    <X size={18} />
                </button>
            </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-8 max-h-[70vh] overflow-y-auto hide-scrollbar bg-[#292d3e] -mt-4 rounded-t-3xl relative z-20">
            {sections.map((section, idx) => (
                <div key={idx} className="space-y-3">
                    <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">{section.title}</h3>
                    <div className="space-y-3">
                        {section.items.map((item, itemIdx) => (
                            <button 
                                key={itemIdx}
                                onClick={item.action}
                                className="w-full bg-[#292d3e] shadow-neu p-3 rounded-2xl flex items-center gap-4 transition-all active:shadow-neu-pressed group border border-transparent hover:border-white/5 relative overflow-hidden"
                            >
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${item.color} ${item.bg} shadow-inner`}>
                                    <item.icon size={22} strokeWidth={2.5} />
                                </div>
                                <div className="flex-1 text-left">
                                    <h3 className="text-sm font-bold text-gray-200 group-hover:text-white transition-colors">{item.label}</h3>
                                    <p className="text-[10px] text-gray-500 font-medium">{item.desc}</p>
                                </div>
                                <div className="text-gray-600 group-hover:translate-x-1 transition-transform">
                                    <ChevronRight size={16} />
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            ))}

            {/* Footer Info */}
            <div className="pt-4 pb-2 text-center">
                 <div className="inline-flex items-center gap-3 bg-[#1e212d] rounded-full px-4 py-2 border border-white/5 shadow-inner">
                     <Smartphone size={14} className="text-gray-500"/>
                     <span className="text-[10px] text-gray-400 font-mono font-bold">v1.2.0 • SnapAura OS</span>
                     <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                 </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
