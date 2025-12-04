
import React, { useState, useEffect } from 'react';
import { User, LogOut, Settings, Camera, ImageIcon, MessageCircle, Star, ShieldCheck } from './Icons';
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
    <div className="h-full overflow-y-auto hide-scrollbar p-4 pb-24 relative bg-[#292d3e]">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-200">My Profile</h1>
            <button 
                onClick={onOpenSettings}
                className="text-gray-400 hover:text-white p-3 rounded-full bg-[#292d3e] shadow-neu active:shadow-neu-pressed transition-all"
            >
                <Settings size={20} />
            </button>
        </div>

        {/* User Card */}
        <div className="bg-[#292d3e] shadow-neu p-6 rounded-3xl relative overflow-hidden mb-6 animate-fade-in-up">
            <div className="flex flex-col items-center text-center relative z-10">
                <div className="w-24 h-24 rounded-full bg-[#292d3e] shadow-neu p-1 mb-4 flex items-center justify-center">
                    <div className="w-full h-full rounded-full bg-[#292d3e] shadow-neu-pressed flex items-center justify-center overflow-hidden">
                        {avatar ? (
                            <img src={avatar} className="w-full h-full object-cover" alt="Profile" />
                        ) : (
                            <User size={40} className="text-gray-400" />
                        )}
                    </div>
                </div>
                <h2 className="text-2xl font-bold text-gray-200 mb-1">{user.name}</h2>
                <p className="text-sm text-gray-500 mb-4">{user.email}</p>
                
                <div className="flex items-center gap-2 bg-[#292d3e] shadow-neu-pressed px-4 py-1.5 rounded-full">
                    <ShieldCheck size={12} className="text-green-400" />
                    <span className="text-xs font-bold text-gray-400">Pro Member</span>
                </div>
            </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4 mb-6 animate-fade-in-up" style={{animationDelay: '0.1s'}}>
            <div className="bg-[#292d3e] shadow-neu p-4 rounded-2xl flex flex-col items-center justify-center gap-2">
                <div className="text-blue-400 mb-1"><Camera size={20} /></div>
                <span className="text-xl font-black text-gray-200">{user.stats.edits}</span>
                <span className="text-[10px] text-gray-500 uppercase font-bold">Edits</span>
            </div>
            <div className="bg-[#292d3e] shadow-neu p-4 rounded-2xl flex flex-col items-center justify-center gap-2">
                <div className="text-pink-400 mb-1"><ImageIcon size={20} /></div>
                <span className="text-xl font-black text-gray-200">{user.stats.generated}</span>
                <span className="text-[10px] text-gray-500 uppercase font-bold">Arts</span>
            </div>
            <div className="bg-[#292d3e] shadow-neu p-4 rounded-2xl flex flex-col items-center justify-center gap-2">
                <div className="text-green-400 mb-1"><MessageCircle size={20} /></div>
                <span className="text-xl font-black text-gray-200">{user.stats.chats}</span>
                <span className="text-[10px] text-gray-500 uppercase font-bold">Chats</span>
            </div>
        </div>

        {/* Menu Actions */}
        <div className="space-y-4 animate-fade-in-up" style={{animationDelay: '0.2s'}}>
            <h3 className="text-xs font-bold text-gray-500 uppercase ml-2 mb-1">Account</h3>
            
            <button className="w-full bg-[#292d3e] shadow-neu p-5 rounded-2xl flex items-center justify-between group active:shadow-neu-pressed transition-all">
                <div className="flex items-center gap-4">
                    <div className="text-yellow-400"><Star size={20} /></div>
                    <span className="text-sm font-bold text-gray-300">Subscription Plan</span>
                </div>
                <span className="text-xs text-gray-500 font-bold bg-[#292d3e] shadow-neu-pressed px-3 py-1 rounded-full">Free Tier</span>
            </button>

            <button 
                onClick={onLogout}
                className="w-full bg-[#292d3e] shadow-neu p-5 rounded-2xl flex items-center justify-between group active:shadow-neu-pressed transition-all"
            >
                <div className="flex items-center gap-4">
                    <div className="text-red-400"><LogOut size={20} /></div>
                    <span className="text-sm font-bold text-gray-300 group-hover:text-red-400 transition-colors">Log Out</span>
                </div>
            </button>
        </div>
        
        <div className="mt-8 text-center">
            <p className="text-xs text-gray-600 font-medium">Member since {user.joinDate}</p>
        </div>
    </div>
  );
};

export default Profile;
