
import React, { useState, useEffect } from 'react';
import { X, Key, RotateCcw, ChevronRight, Smartphone, RefreshCw, Zap, Power, AlertCircle, Trash2, Heart } from './Icons';
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
  
  const [isRebooting, setIsRebooting] = useState(false);
  const [rebootMsg, setRebootMsg] = useState('');
  const [rebootSub, setRebootSub] = useState('');
  
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [storageStats, setStorageStats] = useState<any>(null);

  useEffect(() => {
      if (isVisible) {
          const stats = { chats: 0, notes: 0, hasKey: !!localStorage.getItem('GEMINI_API_KEY') };
          try {
              const chats = JSON.parse(localStorage.getItem('SNAPAURA_SAVED_SESSIONS') || '[]');
              stats.chats = Array.isArray(chats) ? chats.length : 0;
              const notes = JSON.parse(localStorage.getItem('SNAPAURA_NOTES') || '[]');
              stats.notes = Array.isArray(notes) ? notes.length : 0;
          } catch (e) {}
          setStorageStats(stats);
      }
  }, [isVisible]);

  const handleSoftRefresh = () => {
      setRebootMsg("SYSTEM REBOOT");
      setRebootSub("Reloading Core Modules...");
      setIsRebooting(true);
      setTimeout(() => {
          resetSystem(false);
          setIsRebooting(false);
          onClose();
          showToast("System Refreshed", "success");
      }, 2000);
  };

  const confirmFactoryReset = () => {
      setShowResetConfirm(false);
      setRebootMsg("FACTORY RESET");
      setRebootSub("Wiping Local Data...");
      setIsRebooting(true);
      setTimeout(() => {
          resetSystem(true);
          setIsRebooting(false);
          onClose();
          showToast("System Wiped", "info");
      }, 2500);
  };

  if (isRebooting) {
      return (
        <div className="fixed inset-0 z-[999] bg-dark-900 flex flex-col items-center justify-center overflow-hidden">
            <div className="w-16 h-16 bg-dark-700 rounded-full flex items-center justify-center shadow-neu relative mb-8">
                <Power size={24} className="text-primary animate-pulse" />
            </div>
            <h2 className="text-2xl font-black text-white tracking-widest animate-pulse">{rebootMsg}</h2>
            <p className="text-[10px] font-mono text-primary uppercase tracking-[0.3em] mt-4">[{rebootSub}]</p>
        </div>
      );
  }

  if (!isVisible) return null;

  if (showResetConfirm) {
      return (
        <div className="fixed inset-0 z-[130] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/90 backdrop-blur-xl animate-fade-in" onClick={() => setShowResetConfirm(false)}></div>
            <div className="relative w-full max-w-sm bg-dark-800 rounded-3xl p-8 shadow-2xl border border-red-500/20 animate-fade-in-up">
                <div className="flex flex-col items-center text-center mb-6">
                    <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4">
                        <AlertCircle size={32} className="text-red-500" />
                    </div>
                    <h2 className="text-xl font-black text-white uppercase tracking-wider">Format Device?</h2>
                    <p className="text-xs text-gray-500 mt-2">All sessions, notes, and keys will be purged.</p>
                </div>
                <div className="space-y-3 mb-8 bg-dark-900 p-4 rounded-xl shadow-neu-pressed">
                    <div className="flex items-center justify-between text-[10px] font-black uppercase text-gray-500">
                        <span>API Keys</span>
                        <span className={storageStats?.hasKey ? "text-red-400" : ""}>{storageStats?.hasKey ? "ACTIVE" : "EMPTY"}</span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] font-black uppercase text-gray-500">
                        <span>Database</span>
                        <span className="text-white">{storageStats?.chats + storageStats?.notes} Objects</span>
                    </div>
                </div>
                <div className="space-y-3">
                    <button onClick={confirmFactoryReset} className="w-full bg-red-500 text-white font-black py-4 rounded-xl shadow-lg active:scale-95 transition-all">CONFIRM FORMAT</button>
                    <button onClick={() => setShowResetConfirm(false)} className="w-full py-4 text-gray-500 font-bold">Cancel</button>
                </div>
            </div>
        </div>
      );
  }

  const sections = [
      {
          title: "Premium",
          items: [
            { icon: Heart, label: "Support Creator", desc: "Keep SnapAura free for all", action: () => { onClose(); onOpenDonation(); }, color: "text-accent", bg: "bg-accent/10" },
            { icon: Key, label: "API Configuration", desc: "Manage Gemini Credentials", action: onOpenApiKey, color: "text-primary", bg: "bg-primary/10" }
          ]
      },
      {
          title: "System",
          items: [
            { icon: RefreshCw, label: "System Refresh", desc: "Restart UI & Modules", action: handleSoftRefresh, color: "text-purple-400", bg: "bg-purple-400/10" },
            { icon: RotateCcw, label: "Factory Reset", desc: "Wipe all local records", action: () => setShowResetConfirm(true), color: "text-red-400", bg: "bg-red-400/10" }
          ]
      }
  ];

  return (
    <div className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md animate-fade-in" onClick={onClose}></div>
      <div className="relative w-full max-w-sm bg-dark-800 sm:rounded-3xl rounded-t-3xl shadow-2xl animate-fade-in-up overflow-hidden border border-white/5">
        <div className="bg-dark-700 p-6 flex justify-between items-center border-b border-white/5">
            <div>
                <h2 className="text-2xl font-black text-white tracking-tight">Settings</h2>
                <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mt-1 flex items-center gap-1"><Zap size={12} className="text-primary"/> OS Management</p>
            </div>
            <button onClick={onClose} className="w-10 h-10 rounded-full bg-dark-800 shadow-neu flex items-center justify-center text-gray-400 active:shadow-neu-pressed hover:text-white transition-all"><X size={18} /></button>
        </div>
        <div className="p-6 space-y-8 bg-dark-800 max-h-[70vh] overflow-y-auto hide-scrollbar">
            {sections.map((section, idx) => (
                <div key={idx} className="space-y-3">
                    <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">{section.title}</h3>
                    <div className="space-y-3">
                        {section.items.map((item, itemIdx) => (
                            <button key={itemIdx} onClick={item.action} className="w-full bg-dark-800 shadow-neu p-4 rounded-2xl flex items-center gap-4 transition-all active:shadow-neu-pressed group">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${item.color} ${item.bg}`}><item.icon size={22} strokeWidth={2.5} /></div>
                                <div className="flex-1 text-left">
                                    <h3 className="text-sm font-bold text-gray-200 group-hover:text-white">{item.label}</h3>
                                    <p className="text-[10px] text-gray-500 font-medium">{item.desc}</p>
                                </div>
                                <ChevronRight size={16} className="text-gray-700 group-hover:translate-x-1 transition-transform" />
                            </button>
                        ))}
                    </div>
                </div>
            ))}
            <div className="pt-4 pb-2 text-center">
                 <div className="inline-flex items-center gap-2 bg-dark-900 rounded-full px-4 py-2 border border-white/5 shadow-neu-pressed">
                     <Smartphone size={14} className="text-gray-500"/><span className="text-[10px] text-gray-500 font-black">SnapAura OS v1.3.1</span>
                 </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
