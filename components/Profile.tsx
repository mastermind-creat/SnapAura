
import React, { useState, useEffect, useRef } from 'react';
import { User, LogOut, Settings, Camera, ImageIcon, MessageCircle, Star, ShieldCheck, Zap, Activity, Edit2, Save, X, Hash, MapPin, Globe, Sparkles, Plus } from './Icons';
import { UserProfile } from '../types';
import { useNeural } from './NeuralContext';
import { generateSocialContent } from '../services/geminiService';
import { showToast } from './Toast';

interface ProfileProps {
  user: UserProfile | null;
  onLogout: () => void;
  onOpenSettings: () => void;
}

const Profile: React.FC<ProfileProps> = ({ user, onLogout, onOpenSettings }) => {
  const { updateState } = useNeural();
  const [avatar, setAvatar] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isGeneratingBio, setIsGeneratingBio] = useState(false);

  // Form State
  const [formData, setFormData] = useState<UserProfile | null>(null);
  const [newTag, setNewTag] = useState('');

  useEffect(() => {
      const loadAvatar = () => setAvatar(localStorage.getItem('SNAPAURA_AVATAR'));
      loadAvatar();
      window.addEventListener('avatar-update', loadAvatar);
      
      if (user) {
          setFormData({
              ...user,
              username: user.username || user.email.split('@')[0],
              bio: user.bio || "Digital Creator using SnapAura OS",
              interests: user.interests || ['Photography', 'AI Art'],
              location: user.location || 'Global'
          });
      }

      return () => window.removeEventListener('avatar-update', loadAvatar);
  }, [user]);

  const handleSave = () => {
      if (formData) {
          updateState({ userProfile: formData });
          localStorage.setItem('SNAPAURA_PROFILE', JSON.stringify(formData));
          // Also sync username specifically for P2P backward compatibility
          if(formData.username) localStorage.setItem('SNAPAURA_USERNAME', formData.username);
          
          setIsEditing(false);
          showToast("Profile Updated Successfully", "success");
      }
  };

  const handleGenerateBio = async () => {
      if (!formData) return;
      setIsGeneratingBio(true);
      try {
          // Use the keywords to generate a bio
          const keywords = [...(formData.interests || []), formData.username].join(', ');
          const promptTopic = `A cool, aesthetic bio for a creator interested in: ${keywords}`;
          const res = await generateSocialContent(promptTopic, 'idea'); 
          // Note: utilizing the 'idea' type returns structured markdown, let's use a simpler prompt specifically for bio
          // Or better, let's assume generateSocialContent is flexible enough or we parse it.
          // Actually, let's use the explicit generateSocialBio tool we made earlier if available, or just reuse social content.
          // Let's use a direct call for best results:
          const bioRes = await generateSocialContent(promptTopic, 'reply', "Short, punchy bio"); 
          
          // Clean up result (sometimes it gives multiple options separated by ||)
          const cleanBio = bioRes.split('||')[0].replace(/[*"]/g, '').trim();
          
          setFormData(prev => prev ? ({ ...prev, bio: cleanBio }) : null);
          showToast("Bio Generated!", "success");
      } catch (e) {
          showToast("AI Bio Gen Failed", "error");
      } finally {
          setIsGeneratingBio(false);
      }
  };

  const addTag = () => {
      if (newTag.trim() && formData) {
          setFormData({
              ...formData,
              interests: [...(formData.interests || []), newTag.trim()]
          });
          setNewTag('');
      }
  };

  const removeTag = (tagToRemove: string) => {
      if (formData) {
          setFormData({
              ...formData,
              interests: (formData.interests || []).filter(t => t !== tagToRemove)
          });
      }
  };

  if (!formData) return null;

  return (
    <div className="h-full overflow-y-auto hide-scrollbar bg-[#292d3e] relative pb-24">
        {/* Header Background */}
        <div className="absolute top-0 left-0 right-0 h-72 bg-gradient-to-b from-[#1e212d] to-[#292d3e] z-0">
            <div className="absolute top-[-50%] left-0 right-0 h-full bg-primary/10 blur-[100px] rounded-full"></div>
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
        </div>

        <div className="relative z-10 p-6 space-y-6">
            {/* Top Bar */}
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-black text-gray-200 tracking-tight">Identity Hub</h1>
                <div className="flex gap-3">
                    {isEditing ? (
                        <>
                            <button onClick={() => setIsEditing(false)} className="w-10 h-10 rounded-full bg-[#292d3e] shadow-neu flex items-center justify-center text-red-400 active:shadow-neu-pressed">
                                <X size={18} />
                            </button>
                            <button onClick={handleSave} className="w-10 h-10 rounded-full bg-[#292d3e] shadow-neu flex items-center justify-center text-green-400 active:shadow-neu-pressed">
                                <Save size={18} />
                            </button>
                        </>
                    ) : (
                        <button onClick={() => setIsEditing(true)} className="w-10 h-10 rounded-full bg-[#292d3e]/50 backdrop-blur-md shadow-neu flex items-center justify-center text-blue-400 hover:text-white active:shadow-neu-pressed transition-all">
                            <Edit2 size={18} />
                        </button>
                    )}
                    <button onClick={onOpenSettings} className="w-10 h-10 rounded-full bg-[#292d3e]/50 backdrop-blur-md shadow-neu flex items-center justify-center text-gray-400 hover:text-white active:shadow-neu-pressed transition-all">
                        <Settings size={20} />
                    </button>
                </div>
            </div>

            {/* Member Card */}
            <div className="relative w-full rounded-3xl overflow-hidden shadow-2xl animate-fade-in-up group bg-[#292d3e] border border-white/5">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 opacity-50 z-0"></div>
                
                <div className="relative z-20 p-6 flex flex-col items-center text-center">
                    <div className="relative mb-4">
                        <div className="absolute -inset-2 bg-gradient-to-r from-primary via-white to-secondary rounded-full animate-spin-slow opacity-30"></div>
                        <div className="w-24 h-24 rounded-full border-4 border-[#292d3e] relative z-10 overflow-hidden bg-[#1e212d] shadow-lg">
                            {avatar ? (
                                <img src={avatar} className="w-full h-full object-cover" alt="Profile" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-500"><User size={32}/></div>
                            )}
                        </div>
                        {!isEditing && (
                            <div className="absolute bottom-0 right-0 bg-green-500 w-6 h-6 rounded-full border-4 border-[#292d3e] z-20" title="Online"></div>
                        )}
                    </div>

                    {isEditing ? (
                        <div className="w-full space-y-4 animate-fade-in-up">
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Display Name</label>
                                <input 
                                    value={formData.name} 
                                    onChange={e => setFormData({...formData, name: e.target.value})}
                                    className="w-full bg-[#1e212d] border border-white/10 rounded-xl px-4 py-2 text-center text-white font-bold outline-none focus:border-primary/50"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Username (@)</label>
                                <input 
                                    value={formData.username} 
                                    onChange={e => setFormData({...formData, username: e.target.value})}
                                    className="w-full bg-[#1e212d] border border-white/10 rounded-xl px-4 py-2 text-center text-blue-400 font-mono text-sm outline-none focus:border-blue-400/50"
                                />
                            </div>
                        </div>
                    ) : (
                        <>
                            <h2 className="text-2xl font-black text-white leading-tight">{formData.name}</h2>
                            <p className="text-sm text-blue-400 font-mono font-medium mb-2">@{formData.username}</p>
                            <div className="flex items-center gap-2 text-xs text-gray-400 bg-[#1e212d]/50 px-3 py-1 rounded-full">
                                <MapPin size={12} /> {formData.location}
                            </div>
                        </>
                    )}
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-3 border-t border-white/5 bg-[#1e212d]/30 backdrop-blur-md">
                    <div className="p-4 text-center border-r border-white/5">
                        <span className="block text-lg font-black text-white">{formData.stats.edits}</span>
                        <span className="text-[9px] text-gray-500 uppercase font-bold">Edits</span>
                    </div>
                    <div className="p-4 text-center border-r border-white/5">
                        <span className="block text-lg font-black text-white">{formData.stats.generated}</span>
                        <span className="text-[9px] text-gray-500 uppercase font-bold">Arts</span>
                    </div>
                    <div className="p-4 text-center">
                        <span className="block text-lg font-black text-white">{formData.stats.chats}</span>
                        <span className="text-[9px] text-gray-500 uppercase font-bold">Chats</span>
                    </div>
                </div>
            </div>

            {/* Bio Section */}
            <div className="space-y-3 animate-fade-in-up delay-100">
                <div className="flex justify-between items-center px-1">
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">About</h3>
                    {isEditing && (
                        <button 
                            onClick={handleGenerateBio} 
                            disabled={isGeneratingBio}
                            className="flex items-center gap-1 text-[10px] bg-gradient-to-r from-primary to-secondary text-white px-3 py-1 rounded-full font-bold shadow-lg active:scale-95 transition-transform"
                        >
                            {isGeneratingBio ? <Activity className="animate-spin" size={10} /> : <Sparkles size={10} />}
                            Auto-Gen
                        </button>
                    )}
                </div>
                
                {isEditing ? (
                    <div className="relative">
                        <textarea 
                            value={formData.bio}
                            onChange={e => setFormData({...formData, bio: e.target.value})}
                            className="w-full bg-[#292d3e] shadow-neu-pressed rounded-2xl p-4 text-sm text-gray-300 outline-none resize-none min-h-[100px] border border-transparent focus:border-white/5 transition-all"
                            placeholder="Tell us about yourself..."
                        />
                        {isGeneratingBio && (
                            <div className="absolute inset-0 bg-[#292d3e]/80 backdrop-blur-sm flex items-center justify-center rounded-2xl">
                                <span className="text-xs font-bold text-primary animate-pulse">Consulting Neural Core...</span>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="bg-[#292d3e] shadow-neu p-5 rounded-2xl">
                        <p className="text-sm text-gray-300 leading-relaxed font-medium">"{formData.bio}"</p>
                    </div>
                )}
            </div>

            {/* Interests Section */}
            <div className="space-y-3 animate-fade-in-up delay-200">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest px-1">Interests & Vibe</h3>
                
                <div className="bg-[#292d3e] shadow-neu p-5 rounded-2xl min-h-[80px]">
                    <div className="flex flex-wrap gap-2">
                        {formData.interests?.map((tag, i) => (
                            <span key={i} className="px-3 py-1.5 bg-[#1e212d] border border-white/5 rounded-lg text-xs font-bold text-gray-300 flex items-center gap-2 group">
                                <Hash size={10} className="text-gray-500"/> {tag}
                                {isEditing && (
                                    <button onClick={() => removeTag(tag)} className="text-gray-500 hover:text-red-400">
                                        <X size={12}/>
                                    </button>
                                )}
                            </span>
                        ))}
                        
                        {isEditing && (
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-[#1e212d] border border-dashed border-white/20 rounded-lg">
                                <Plus size={12} className="text-gray-500"/>
                                <input 
                                    value={newTag}
                                    onChange={e => setNewTag(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && addTag()}
                                    placeholder="Add tag..."
                                    className="bg-transparent w-20 text-xs text-white outline-none placeholder-gray-600"
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Additional Info (Location, etc) */}
            {isEditing && (
                <div className="space-y-3 animate-fade-in-up delay-300">
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest px-1">Details</h3>
                    <div className="bg-[#292d3e] shadow-neu p-4 rounded-2xl space-y-4">
                        <div className="flex items-center gap-3">
                            <MapPin size={18} className="text-gray-500"/>
                            <input 
                                value={formData.location}
                                onChange={e => setFormData({...formData, location: e.target.value})}
                                placeholder="Location (City, Country)"
                                className="flex-1 bg-transparent border-b border-white/10 py-2 text-sm text-white outline-none focus:border-primary"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Menu Actions */}
            <div className="space-y-2 pt-4">
                <button className="w-full p-4 rounded-xl flex items-center justify-between group hover:bg-[#1e212d] transition-colors bg-[#292d3e] shadow-neu">
                    <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-full bg-[#292d3e] shadow-neu-pressed flex items-center justify-center text-yellow-400"><Star size={16} /></div>
                        <span className="text-sm font-bold text-gray-300">Subscription Plan</span>
                    </div>
                    <span className="text-[10px] font-bold text-gray-500 bg-[#1e212d] px-2 py-1 rounded">FREE TIER</span>
                </button>
                
                <button onClick={onLogout} className="w-full p-4 rounded-xl flex items-center justify-between group hover:bg-red-500/5 transition-colors bg-[#292d3e] shadow-neu">
                    <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-full bg-[#292d3e] shadow-neu-pressed flex items-center justify-center text-red-400"><LogOut size={16} /></div>
                        <span className="text-sm font-bold text-gray-300 group-hover:text-red-400 transition-colors">Sign Out</span>
                    </div>
                </button>
            </div>
        </div>
    </div>
  );
};

export default Profile;
