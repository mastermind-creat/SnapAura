
import React from 'react';
import { User, LogOut, Settings, Camera, ImageIcon, MessageCircle, Star, ShieldCheck } from './Icons';
import { UserProfile } from '../types';

interface ProfileProps {
  user: UserProfile | null;
  onLogout: () => void;
  onOpenSettings: () => void;
}

const Profile: React.FC<ProfileProps> = ({ user, onLogout, onOpenSettings }) => {
  if (!user) return null;

  return (
    <div className="h-full overflow-y-auto hide-scrollbar p-4 pb-24 relative">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-white">My Profile</h1>
            <button 
                onClick={onOpenSettings}
                className="text-gray-300 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors active:scale-90"
            >
                <Settings size={20} />
            </button>
        </div>

        {/* User Card */}
        <div className="glass-panel p-6 rounded-3xl relative overflow-hidden mb-6 animate-fade-in-up">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-[50px] -translate-y-1/2 translate-x-1/2"></div>
            
            <div className="flex flex-col items-center text-center relative z-10">
                <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-primary to-secondary p-[2px] mb-4 shadow-xl">
                    <div className="w-full h-full rounded-full bg-[#1a1a20] flex items-center justify-center overflow-hidden">
                        <User size={40} className="text-gray-400" />
                    </div>
                </div>
                <h2 className="text-2xl font-bold text-white mb-1">{user.name}</h2>
                <p className="text-sm text-gray-400 mb-4">{user.email}</p>
                
                <div className="flex items-center gap-2 bg-white/5 px-3 py-1 rounded-full border border-white/5">
                    <ShieldCheck size={12} className="text-green-400" />
                    <span className="text-xs font-medium text-gray-300">Pro Member</span>
                </div>
            </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3 mb-6 animate-fade-in-up" style={{animationDelay: '0.1s'}}>
            <div className="glass-panel p-3 rounded-2xl flex flex-col items-center justify-center gap-2 py-4">
                <div className="bg-blue-500/20 p-2 rounded-full text-blue-400"><Camera size={18} /></div>
                <span className="text-lg font-black text-white">{user.stats.edits}</span>
                <span className="text-[10px] text-gray-500 uppercase font-bold">Edits</span>
            </div>
            <div className="glass-panel p-3 rounded-2xl flex flex-col items-center justify-center gap-2 py-4">
                <div className="bg-pink-500/20 p-2 rounded-full text-pink-400"><ImageIcon size={18} /></div>
                <span className="text-lg font-black text-white">{user.stats.generated}</span>
                <span className="text-[10px] text-gray-500 uppercase font-bold">Arts</span>
            </div>
            <div className="glass-panel p-3 rounded-2xl flex flex-col items-center justify-center gap-2 py-4">
                <div className="bg-green-500/20 p-2 rounded-full text-green-400"><MessageCircle size={18} /></div>
                <span className="text-lg font-black text-white">{user.stats.chats}</span>
                <span className="text-[10px] text-gray-500 uppercase font-bold">Chats</span>
            </div>
        </div>

        {/* Menu Actions */}
        <div className="space-y-3 animate-fade-in-up" style={{animationDelay: '0.2s'}}>
            <h3 className="text-xs font-bold text-gray-500 uppercase ml-2 mb-1">Account</h3>
            
            <button className="w-full glass-panel p-4 rounded-xl flex items-center justify-between group active:scale-95 transition-all">
                <div className="flex items-center gap-3">
                    <div className="bg-yellow-500/10 p-2 rounded-lg text-yellow-400"><Star size={18} /></div>
                    <span className="text-sm font-bold text-white">Subscription Plan</span>
                </div>
                <span className="text-xs text-gray-400">Free Tier</span>
            </button>

            <button 
                onClick={onLogout}
                className="w-full glass-panel p-4 rounded-xl flex items-center justify-between group active:scale-95 transition-all hover:bg-red-500/10 border-red-500/20"
            >
                <div className="flex items-center gap-3">
                    <div className="bg-red-500/10 p-2 rounded-lg text-red-400"><LogOut size={18} /></div>
                    <span className="text-sm font-bold text-white group-hover:text-red-400 transition-colors">Log Out</span>
                </div>
            </button>
        </div>
        
        <div className="mt-8 text-center">
            <p className="text-xs text-gray-600">Member since {user.joinDate}</p>
        </div>
    </div>
  );
};

export default Profile;
