
import React, { useState, useEffect } from 'react';
import { X, Key, WhatsApp, RotateCcw, ChevronRight, Smartphone, ShieldCheck, RefreshCw, Zap, Power, Server, Activity, AlertCircle, Trash2, FileText, MessageCircle, Heart } from './Icons';
import { showToast } from './Toast';
import { useNeural } from './NeuralContext';

interface SettingsModalProps {
  isVisible: boolean;
  onClose: () => void;
  onOpenApiKey: () => void;
  onOpenDonation: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isVisible, onClose, onOpenApiKey, onOpenDonation }) => {
  const { resetSystem } = useNeural();
  
  // Animation States
  const [isRebooting, setIsRebooting] = useState(false);
  const [rebootMsg, setRebootMsg] = useState('');
  const [rebootSub, setRebootSub] = useState('');
  
  // Reset Confirmation States
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [storageStats, setStorageStats] = useState<any>(null);

  // Analyze storage for the warning screen
  useEffect(() => {
      if (isVisible) {
          const stats = {
              chats: 0,
              notes: 0,
              hasKey: false,
              hasProfile: false,
              hasAvatar: false
          };
          
          try {
              const chats = JSON.parse(localStorage.getItem('SNAPAURA_SAVED_SESSIONS') || '[]');
              stats.chats = Array.isArray(chats) ? chats.length : 0;
              
              const notes = JSON.parse(localStorage.getItem('SNAPAURA_NOTES') || '[]');
              stats.notes = Array.isArray(notes) ? notes.length : 0;
              
              stats.hasKey = !!localStorage.getItem('GEMINI_API_KEY');
              stats.hasProfile = !!localStorage.getItem('SNAPAURA_PROFILE');
              stats.hasAvatar = !!localStorage.getItem('SNAPAURA_AVATAR');
          } catch (e) {}
          
          setStorageStats(stats);
      }
  }, [isVisible]);

  // SAFE REBOOT
  const handleSoftRefresh = () => {
      setRebootMsg("SYSTEM REBOOT");
      setRebootSub("Reloading Core Modules...");
      setIsRebooting(true);
      if (navigator.vibrate) navigator.vibrate([50, 100, 50]);
      
      setTimeout(() => setRebootSub("Syncing Neural Context..."), 1000);
      setTimeout(() => setRebootSub("Re-mounting UI..."), 2000);
      
      setTimeout(() => {
          resetSystem(false);
          setIsRebooting(false);
          onClose();
          showToast("System Refreshed Successfully", "success");
      }, 3000);
  };

  const confirmFactoryReset = () => {
      setShowResetConfirm(false);
      setRebootMsg("FACTORY RESET");
      setRebootSub("Purging Local Database...");
      setIsRebooting(true);
      if (navigator.vibrate) navigator.vibrate([100, 50, 100, 50, 500]);

      setTimeout(() => {
          resetSystem(true);
          setIsRebooting(false);
          onClose();
          showToast("Device Wiped. Welcome to SnapAura.", "info");
      }, 3000);
  };

  if (isRebooting) {
      return (
        <div className="fixed inset-0 z-[999] bg-[#050505] flex flex-col items-center justify-center overflow-hidden cursor-wait">
            <div className="absolute inset-0 z-0 opacity-30">
                <div className="absolute inset-0 bg-[linear-gradient(rgba(0,243,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(0,243,255,0.1)_1px,transparent_1px)] bg-[size:40px_40px] [transform:perspective(500px)_rotateX(60deg)] animate-[gridMove_2s_linear_infinite]"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent"></div>
            </div>
            <div className="relative z-10 scale-150 mb-12">
                <div className="absolute inset-[-20px] rounded-full border-2 border-transparent border-t-cyan-500 border-b-cyan-500/30 animate-[spin_3s_linear_infinite]"></div>
                <div className="absolute inset-[-10px] rounded-full border-2 border-transparent border-l-purple-500 border-r-purple-500/30 animate-[spin_2s_linear_infinite_reverse]"></div>
                <div className="w-16 h-16 bg-[#1a1c29] rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(0,243,255,0.4)] relative">
                    <div className="absolute inset-0 rounded-full bg-cyan-400/20 animate-ping"></div>
                    <Power size={24} className="text-white animate-pulse" />
                </div>
            </div>
            <div className="z-10 text-center space-y-2">
                <h2 className="text-3xl font-black text-white tracking-[0.2em] animate-pulse glitch-text">{rebootMsg}</h2>
                <p className="text-xs font-mono text-cyan-400 uppercase tracking-widest opacity-80">[{rebootSub}]</p>
            </div>
            <div className="mt-8 w-64 h-1 bg-gray-900 rounded-full overflow-hidden relative z-10 border border-white/10">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400 to-transparent w-1/2 animate-[laserX_1.5s_linear_infinite]"></div>
            </div>
        </div>
      );
  }

  if (!isVisible) return null;

  if (showResetConfirm) {
      return (
        <div className="fixed inset-0 z-[130] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/90 backdrop-blur-xl animate-fade-in-up" onClick={() => setShowResetConfirm(false)}></div>
            <div className="relative w-full max-w-sm bg-[#1a1c29] rounded-3xl p-6 shadow-2xl border border-red-500/30 animate-fade-in-up overflow-hidden">
                <div className="flex flex-col items-center text-center mb-6">
                    <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4 animate-pulse">
                        <AlertCircle size={32} className="text-red-500" />
                    </div>
                    <h2 className="text-xl font-black text-white uppercase tracking-wider">Destruction Protocol</h2>
                    <p className="text-xs text-red-400 font-bold mt-2">All local data will be permanently erased.</p>
                </div>
                <div className="space-y-3 mb-8 bg-[#0f0f11] p-4 rounded-xl border border-white/5">
                    <div className="flex items-center justify-between text-sm text-gray-300">
                        <span className="flex items-center gap-2"><Key size={14} className="text-gray-500"/> API Credentials</span>
                        <span className={storageStats?.hasKey ? "text-red-400 font-bold" : "text-gray-600"}>{storageStats?.hasKey ? "DELETED" : "Empty"}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-300">
                        <span className="flex items-center gap-2"><Smartphone size={14} className="text-gray-500"/> User Profile</span>
                        <span className={storageStats?.hasProfile ? "text-red-400 font-bold" : "text-gray-600"}>{storageStats?.hasProfile ? "DELETED" : "Empty"}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-300">
                        <span className="flex items-center gap-2"><MessageCircle size={14} className="text-gray-500"/> Chat History</span>
                        <span className={storageStats?.chats > 0 ? "text-red-400 font-bold" : "text-gray-600"}>{storageStats?.chats} Sessions</span>
                    </div>
                </div>
                <div className="space-y-3">
                    <button onClick={confirmFactoryReset} className="w-full bg-red-500 hover:bg-red-600 text-white font-black py-4 rounded-xl shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2">
                        <Trash2 size={18} /> CONFIRM ERASE
                    </button>
                    <button onClick={() => setShowResetConfirm(false)} className="w-full bg-[#292d3e] hover:bg-[#35394b] text-gray-300 font-bold py-3 rounded-xl transition-all">Cancel</button>
                </div>
            </div>
        </div>
      );
  }

  const sections = [
      {
          title: "General",
          items: [
            {
                icon: Heart,
                label: "Support Holiday OS",
                desc: "Donate to keep SnapAura free",
                action: () => { onClose(); onOpenDonation(); },
                color: "text-festive-gold",
                bg: "bg-festive-gold/10"
            },
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
                label: "System Reboot",
                desc: "Restart UI & Clear Cache",
                action: handleSoftRefresh,
                color: "text-purple-400",
                bg: "bg-purple-400/10"
            },
            {
                icon: RotateCcw,
                label: "Factory Reset",
                desc: "Wipe all data & Start fresh",
                action: () => setShowResetConfirm(true),
                color: "text-red-400",
                bg: "bg-red-400/10"
            }
          ]
      }
  ];

  return (
    <div className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center sm:p-6">
      <div className="absolute inset-0 bg-[#1a1c29]/90 backdrop-blur-md animate-fade-in-up" onClick={onClose}></div>
      <div className="relative w-full max-w-sm bg-[#292d3e] sm:rounded-3xl rounded-t-3xl p-0 shadow-2xl animate-fade-in-up overflow-hidden border border-white/5 ring-1 ring-white/5">
        <div className="relative bg-[#1e212d] p-6 pb-8 overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
            <div className="relative z-10 flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-black text-gray-200 tracking-tight">Settings</h2>
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1 flex items-center gap-1"><Zap size={12} className="text-yellow-400"/> System Control</p>
                </div>
                <button onClick={onClose} className="w-10 h-10 rounded-full bg-[#292d3e] shadow-neu flex items-center justify-center text-gray-400 active:shadow-neu-pressed transition-all hover:text-white"><X size={18} /></button>
            </div>
        </div>
        <div className="p-6 space-y-8 max-h-[70vh] overflow-y-auto hide-scrollbar bg-[#292d3e] -mt-4 rounded-t-3xl relative z-20">
            {sections.map((section, idx) => (
                <div key={idx} className="space-y-3">
                    <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">{section.title}</h3>
                    <div className="space-y-3">
                        {section.items.map((item, itemIdx) => (
                            <button key={itemIdx} onClick={item.action} className="w-full bg-[#292d3e] shadow-neu p-3 rounded-2xl flex items-center gap-4 transition-all active:shadow-neu-pressed group border border-transparent hover:border-white/5 relative overflow-hidden">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${item.color} ${item.bg} shadow-inner`}><item.icon size={22} strokeWidth={2.5} /></div>
                                <div className="flex-1 text-left">
                                    <h3 className="text-sm font-bold text-gray-200 group-hover:text-white transition-colors">{item.label}</h3>
                                    <p className="text-[10px] text-gray-500 font-medium">{item.desc}</p>
                                </div>
                                <div className="text-gray-600 group-hover:translate-x-1 transition-transform"><ChevronRight size={16} /></div>
                            </button>
                        ))}
                    </div>
                </div>
            ))}
            <div className="pt-4 pb-2 text-center">
                 <div className="inline-flex items-center gap-3 bg-[#1e212d] rounded-full px-4 py-2 border border-white/5 shadow-inner">
                     <Smartphone size={14} className="text-gray-500"/><span className="text-[10px] text-gray-400 font-mono font-bold">v1.3.0 • SnapAura OS</span><div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                 </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
