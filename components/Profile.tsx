
import React, { useState, useEffect } from 'react';
import { User, LogOut, Settings, Camera, ImageIcon, MessageCircle, Star, ShieldCheck, Zap, Activity } from './Icons';
import { UserProfile } from '../types';

interface ProfileProps {
  user: UserProfile | null;
  onLogout: () => void;
  onOpenSettings: () => void;
}

const Profile: React.FC<ProfileProps> = ({ user, onLogout, onOpenSettings }) => {
  const [avatar, setAvatar] = useState<string | null>(null);

  useEffect(() => {
      const loadAvatar = () => setAvatar(localStorage.getItem('SNAPAURA_AVATAR'));
      loadAvatar();
      window.addEventListener('avatar-update', loadAvatar);
      return () => window.removeEventListener('avatar-update', loadAvatar);
  }, []);

  if (!user) return null;

  return (
    <div className="h-full overflow-y-auto hide-scrollbar bg-[#292d3e] relative pb-24">
        {/* Header Background */}
        <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-[#1e212d] to-[#292d3e] z-0">
            <div className="absolute top-[-50%] left-0 right-0 h-full bg-primary/10 blur-[100px] rounded-full"></div>
        </div>

        <div className="relative z-10 p-6 space-y-8">
            {/* Top Bar */}
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-black text-gray-200 tracking-tight">Identity</h1>
                <button 
                    onClick={onOpenSettings}
                    className="w-10 h-10 rounded-full bg-[#292d3e]/50 backdrop-blur-md shadow-neu flex items-center justify-center text-gray-400 hover:text-white active:shadow-neu-pressed transition-all"
                >
                    <Settings size={20} />
                </button>
            </div>

            {/* Member Card */}
            <div className="relative w-full aspect-[1.7] rounded-3xl overflow-hidden shadow-2xl animate-fade-in-up group">
                {/* Glass Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/10 z-0"></div>
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-secondary/20 opacity-50 z-0"></div>
                
                {/* Shine Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-[200%] group-hover:animate-[shimmer_2s_infinite] z-10 pointer-events-none"></div>

                <div className="relative z-20 p-6 flex flex-col justify-between h-full">
                    <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-5 rounded bg-yellow-500/20 border border-yellow-500/50 flex items-center justify-center">
                                <div className="w-6 h-[1px] bg-yellow-500/50"></div>
                            </div>
                            <span className="text-[10px] font-mono text-white/50 uppercase tracking-widest">SnapAura ID</span>
                        </div>
                        <Zap size={20} className="text-white/80" />
                    </div>

                    <div className="flex items-center gap-5">
                        <div className="relative">
                            {/* Rotating Ring */}
                            <div className="absolute -inset-1 bg-gradient-to-r from-primary via-white to-secondary rounded-full animate-spin-slow opacity-70"></div>
                            <div className="w-16 h-16 rounded-full border-2 border-[#292d3e] relative z-10 overflow-hidden bg-[#292d3e]">
                                {avatar ? (
                                    <img src={avatar} className="w-full h-full object-cover" alt="Profile" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-[#1e212d] text-gray-500"><User size={24}/></div>
                                )}
                            </div>
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white leading-tight">{user.name}</h2>
                            <p className="text-xs text-white/60 font-medium">{user.email}</p>
                        </div>
                    </div>

                    <div className="flex justify-between items-end">
                        <div className="flex items-center gap-1.5 bg-black/20 backdrop-blur-md px-3 py-1 rounded-lg border border-white/5">
                            <ShieldCheck size={12} className="text-green-400" />
                            <span className="text-[10px] font-bold text-white uppercase tracking-wide">Pro Member</span>
                        </div>
                        <span className="text-[10px] font-mono text-white/40">{user.joinDate}</span>
                    </div>
                </div>
            </div>

            {/* Stats Dashboard */}
            <div className="space-y-4 animate-fade-in-up delay-100">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Activity</h3>
                <div className="grid grid-cols-3 gap-3">
                    {[
                        { label: 'Edits', val: user.stats.edits, icon: Camera, color: 'text-blue-400', bg: 'shadow-[0_0_15px_rgba(96,165,250,0.1)]' },
                        { label: 'Arts', val: user.stats.generated, icon: ImageIcon, color: 'text-pink-400', bg: 'shadow-[0_0_15px_rgba(236,72,153,0.1)]' },
                        { label: 'Chats', val: user.stats.chats, icon: MessageCircle, color: 'text-green-400', bg: 'shadow-[0_0_15px_rgba(74,222,128,0.1)]' },
                    ].map((stat, i) => (
                        <div key={i} className={`bg-[#292d3e] shadow-neu p-4 rounded-2xl flex flex-col items-center justify-center gap-2 border border-transparent hover:border-white/5 transition-all group ${stat.bg}`}>
                            <stat.icon size={20} className={`${stat.color} group-hover:scale-110 transition-transform`} />
                            <span className="text-xl font-black text-gray-200">{stat.val}</span>
                            <span className="text-[9px] text-gray-500 font-bold uppercase">{stat.label}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Menu Actions */}
            <div className="space-y-4 animate-fade-in-up delay-200">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Preferences</h3>
                
                <div className="bg-[#292d3e] shadow-neu p-1 rounded-2xl space-y-1">
                    <button className="w-full p-4 rounded-xl flex items-center justify-between group hover:bg-[#1e212d] transition-colors">
                        <div className="flex items-center gap-4">
                            <div className="w-8 h-8 rounded-full bg-[#292d3e] shadow-neu-pressed flex items-center justify-center text-yellow-400"><Star size={16} /></div>
                            <span className="text-sm font-bold text-gray-300">Subscription Plan</span>
                        </div>
                        <span className="text-[10px] font-bold text-gray-500 bg-[#1e212d] px-2 py-1 rounded">FREE TIER</span>
                    </button>
                    
                    <button onClick={onLogout} className="w-full p-4 rounded-xl flex items-center justify-between group hover:bg-red-500/5 transition-colors">
                        <div className="flex items-center gap-4">
                            <div className="w-8 h-8 rounded-full bg-[#292d3e] shadow-neu-pressed flex items-center justify-center text-red-400"><LogOut size={16} /></div>
                            <span className="text-sm font-bold text-gray-300 group-hover:text-red-400 transition-colors">Sign Out</span>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    </div>
  );
};

export default Profile;
