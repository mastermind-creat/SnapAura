
import React, { useState, useEffect } from 'react';
import { User, LogOut, Settings, Save, X, Hash, BookOpen, PenTool, Plus, CheckCircle, Trash2, Download, QrCode, Shield, LogIn, Wifi, CreditCard, Edit2, Activity, Sparkles } from './Icons';
import { UserProfile } from '../types';
import { useNeural } from './NeuralContext';
import { generateSocialContent } from '../services/geminiService';
import { showToast } from './Toast';

interface ProfileProps {
  onOpenSettings: () => void;
  onLogin: () => void;
  onLogout: () => void;
}

const Profile: React.FC<ProfileProps> = ({ onOpenSettings, onLogin, onLogout }) => {
  const { state, updateState } = useNeural();
  const [avatar, setAvatar] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isGeneratingBio, setIsGeneratingBio] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // Form State
  const [formData, setFormData] = useState<UserProfile | null>(null);
  
  // Tag Inputs
  const [newInterest, setNewInterest] = useState('');
  const [newHobby, setNewHobby] = useState('');
  const [newSkill, setNewSkill] = useState('');

  // Initial Load from Global State
  useEffect(() => {
      const loadAvatar = () => setAvatar(localStorage.getItem('SNAPAURA_AVATAR'));
      loadAvatar();
      window.addEventListener('avatar-update', loadAvatar);
      
      if (state.userProfile) {
          setFormData({
              ...state.userProfile,
              username: state.userProfile.username || state.userProfile.email.split('@')[0],
              bio: state.userProfile.bio || "Digital Creator using SnapAura OS",
              interests: state.userProfile.interests || [],
              hobbies: state.userProfile.hobbies || [],
              skills: state.userProfile.skills || [],
              location: state.userProfile.location || 'Global'
          });
      }

      return () => window.removeEventListener('avatar-update', loadAvatar);
  }, [state.userProfile]);

  const handleSave = () => {
      if (formData) {
          updateState({ userProfile: formData });
          localStorage.setItem('SNAPAURA_PROFILE', JSON.stringify(formData));
          if(formData.username) localStorage.setItem('SNAPAURA_USERNAME', formData.username);
          setIsEditing(false);
          showToast("Profile Saved!", "success");
      }
  };

  const handleGenerateBio = async () => {
      if (!formData) return;
      setIsGeneratingBio(true);
      try {
          const keywords = [
              ...(formData.interests || []), 
              ...(formData.hobbies || []),
              ...(formData.skills || [])
          ].join(', ');
          
          const promptTopic = `A cool, aesthetic bio for a creator who likes: ${keywords}. Username: ${formData.username}`;
          const bioRes = await generateSocialContent(promptTopic, 'bio'); 
          const cleanBio = bioRes.split('||')[0].replace(/[*"]/g, '').trim();
          
          setFormData(prev => prev ? ({ ...prev, bio: cleanBio }) : null);
          showToast("Bio Generated!", "success");
      } catch (e) {
          showToast("AI Bio Gen Failed", "error");
      } finally {
          setIsGeneratingBio(false);
      }
  };

  const downloadIdCard = async () => {
      if (!formData) return;
      setIsDownloading(true);
      showToast("Minting Card...", "info");

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const W = 856; // Standard credit card ratio
      const H = 540;
      canvas.width = W;
      canvas.height = H;

      // 1. Background (Matte Black Metal Texture)
      const grad = ctx.createLinearGradient(0, 0, W, H);
      grad.addColorStop(0, '#1a1c29');
      grad.addColorStop(1, '#0f0f11');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);

      // Noise texture simulation
      for (let i = 0; i < 5000; i++) {
          ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.05})`;
          ctx.fillRect(Math.random() * W, Math.random() * H, 2, 2);
      }

      // 2. Chip
      const chipX = 120;
      const chipY = 200;
      // Gold gradient for chip
      const goldGrad = ctx.createLinearGradient(chipX, chipY, chipX + 90, chipY + 70);
      goldGrad.addColorStop(0, '#FCD34D');
      goldGrad.addColorStop(1, '#B45309');
      
      ctx.fillStyle = goldGrad;
      ctx.beginPath();
      ctx.roundRect(chipX, chipY, 90, 70, 10);
      ctx.fill();
      
      // Chip details
      ctx.strokeStyle = 'rgba(0,0,0,0.3)';
      ctx.lineWidth = 2;
      ctx.strokeRect(chipX + 15, chipY + 20, 60, 30);
      ctx.moveTo(chipX, chipY + 35); ctx.lineTo(chipX + 25, chipY + 35);
      ctx.moveTo(chipX + 90, chipY + 35); ctx.lineTo(chipX + 65, chipY + 35);
      ctx.stroke();

      // 3. Contactless Symbol
      ctx.strokeStyle = 'rgba(255,255,255,0.5)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(W - 80, 80, 10, -Math.PI/2, Math.PI/2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(W - 80, 80, 20, -Math.PI/2, Math.PI/2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(W - 80, 80, 30, -Math.PI/2, Math.PI/2);
      ctx.stroke();

      // 4. Bank Logo (SnapAura)
      ctx.font = 'bold italic 36px "Inter", sans-serif';
      ctx.fillStyle = '#fff';
      ctx.fillText("SnapAura", W - 220, 80);
      ctx.font = '12px "Inter", sans-serif';
      ctx.fillStyle = '#00f3ff';
      ctx.fillText("INFINITE MEMBER", W - 220, 100);

      // 5. Card Number (Embossed Effect)
      ctx.font = '36px "Courier New", monospace';
      const cardNumber = `4242  9000  ${Date.now().toString().slice(0, 4)}  ${Date.now().toString().slice(-4)}`;
      
      // Shadow
      ctx.fillStyle = 'rgba(0,0,0,0.8)';
      ctx.fillText(cardNumber, 80, 340);
      // Highlight
      ctx.fillStyle = '#e2e8f0';
      ctx.fillText(cardNumber, 78, 338);

      // 6. Validity
      ctx.font = '10px sans-serif';
      ctx.fillStyle = '#aaa';
      ctx.fillText("VALID THRU", 400, 380);
      ctx.font = '18px monospace';
      ctx.fillStyle = '#fff';
      ctx.fillText("12/30", 400, 405);

      // 7. Card Holder Name (Embossed)
      const name = formData.name.toUpperCase();
      ctx.font = '28px "Courier New", monospace';
      ctx.fillStyle = 'rgba(0,0,0,0.8)';
      ctx.fillText(name, 80, 450);
      ctx.fillStyle = '#e2e8f0';
      ctx.fillText(name, 78, 448);

      // 8. Avatar (Holographic Sticker style)
      if (avatar) {
          const img = new Image();
          img.src = avatar;
          await new Promise(r => img.onload = r);
          
          const avSize = 120;
          const avX = W - 160;
          const avY = H - 160;

          ctx.save();
          ctx.beginPath();
          ctx.roundRect(avX, avY, avSize, avSize, 10);
          ctx.clip();
          ctx.filter = 'grayscale(100%) contrast(120%)';
          ctx.drawImage(img, avX, avY, avSize, avSize);
          ctx.restore();
          
          // Holo overlay
          const holo = ctx.createLinearGradient(avX, avY, avX + avSize, avY + avSize);
          holo.addColorStop(0, 'rgba(0, 243, 255, 0.2)');
          holo.addColorStop(0.5, 'rgba(255, 0, 153, 0.2)');
          holo.addColorStop(1, 'rgba(255, 255, 255, 0.1)');
          ctx.fillStyle = holo;
          ctx.fillRect(avX, avY, avSize, avSize);
      }

      // Download
      const link = document.createElement('a');
      link.download = `snapaura-card-${formData.username}.png`;
      link.href = canvas.toDataURL();
      link.click();
      setIsDownloading(false);
      showToast("Card Minted Successfully", "success");
  };

  const addTag = (type: 'interests' | 'hobbies' | 'skills', value: string, setter: (v: string) => void) => {
      if (!value.trim() || !formData) return;
      const newTags = value.split(',').map(t => t.trim()).filter(t => t.length > 0);
      setFormData(prev => {
          if (!prev) return null;
          const currentTags = prev[type] || [];
          const updatedTags = [...currentTags, ...newTags.filter(t => !currentTags.includes(t))];
          return { ...prev, [type]: updatedTags };
      });
      setter('');
  };

  const removeTag = (type: 'interests' | 'hobbies' | 'skills', tagToRemove: string) => {
      if (formData) {
          setFormData({
              ...formData,
              [type]: (formData[type] || []).filter(t => t !== tagToRemove)
          });
      }
  };

  if (!formData) return <div className="p-8 text-center text-gray-500">Loading Profile...</div>;

  return (
    <div className="h-full overflow-y-auto hide-scrollbar bg-[#292d3e] relative pb-24">
        {/* Cinematic Header Background */}
        <div className="absolute top-0 left-0 right-0 h-80 bg-gradient-to-b from-[#0f0f11] via-[#1e212d] to-[#292d3e] z-0 overflow-hidden">
            <div className="absolute top-[-50%] left-0 right-0 h-full bg-blue-500/10 blur-[100px] rounded-full animate-pulse-slow"></div>
            <div className="absolute inset-0 bg-[linear-gradient(rgba(0,243,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,243,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px] opacity-30 transform perspective-500 rotateX-60"></div>
        </div>

        <div className="relative z-10 p-6 space-y-6">
            {/* Toolbar */}
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-black text-gray-200 tracking-tight flex items-center gap-2">
                    <Shield size={24} className="text-blue-400"/> Identity Core
                </h1>
                <div className="flex gap-3">
                    {/* Action Bar */}
                    <button onClick={onLogin} className="w-10 h-10 rounded-full bg-[#292d3e] shadow-neu flex items-center justify-center text-green-400 active:shadow-neu-pressed transition-all" title="Login">
                        <LogIn size={18} />
                    </button>
                    <button onClick={onLogout} className="w-10 h-10 rounded-full bg-[#292d3e] shadow-neu flex items-center justify-center text-red-400 active:shadow-neu-pressed transition-all" title="Logout">
                        <LogOut size={18} />
                    </button>
                    
                    {isEditing ? (
                        <>
                            <button onClick={() => setIsEditing(false)} className="w-10 h-10 rounded-full bg-[#292d3e] shadow-neu flex items-center justify-center text-gray-400 active:shadow-neu-pressed transition-all">
                                <X size={18} />
                            </button>
                            <button onClick={handleSave} className="w-10 h-10 rounded-full bg-[#292d3e] shadow-neu flex items-center justify-center text-green-400 active:shadow-neu-pressed transition-all">
                                <Save size={18} />
                            </button>
                        </>
                    ) : (
                        <button onClick={() => setIsEditing(true)} className="w-10 h-10 rounded-full bg-[#292d3e]/80 backdrop-blur-md shadow-neu flex items-center justify-center text-blue-400 hover:text-white active:shadow-neu-pressed transition-all">
                            <Edit2 size={18} />
                        </button>
                    )}
                    <button onClick={onOpenSettings} className="w-10 h-10 rounded-full bg-[#292d3e]/80 backdrop-blur-md shadow-neu flex items-center justify-center text-gray-400 hover:text-white active:shadow-neu-pressed transition-all">
                        <Settings size={20} />
                    </button>
                </div>
            </div>

            {/* FUTURISTIC CREDIT CARD ID */}
            <div className="relative w-full aspect-video rounded-3xl overflow-hidden shadow-2xl group animate-fade-in-up border border-white/10 bg-[#1a1c29]">
                {/* Matte Texture & Lighting */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#2a2d3d] to-[#0f0f11]"></div>
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20"></div>
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/20 blur-3xl rounded-full"></div>
                <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-black/50 to-transparent"></div>

                {/* Card Content */}
                <div className="absolute inset-6 flex flex-col justify-between z-10">
                    {/* Top Row: Chip & NFC */}
                    <div className="flex justify-between items-start">
                        <div className="w-14 h-10 bg-gradient-to-br from-yellow-300 to-yellow-600 rounded-lg shadow-sm border border-yellow-700/50 flex items-center justify-center relative overflow-hidden">
                            {/* Chip Lines */}
                            <div className="absolute inset-0 border border-black/20 m-2 rounded"></div>
                            <div className="w-full h-[1px] bg-black/20 absolute top-1/2"></div>
                            <div className="h-full w-[1px] bg-black/20 absolute left-1/3"></div>
                            <div className="h-full w-[1px] bg-black/20 absolute right-1/3"></div>
                        </div>
                        <div className="flex flex-col items-end">
                            <Wifi className="text-gray-400/50 rotate-90" size={24} />
                            <span className="text-white font-black italic tracking-tighter text-lg mt-1">SnapAura</span>
                        </div>
                    </div>

                    {/* Middle: Number */}
                    <div className="mt-4">
                        <div className="flex items-center gap-4">
                            <span className="font-mono text-2xl text-gray-300 tracking-widest drop-shadow-md" style={{textShadow: '1px 1px 0 rgba(0,0,0,0.8)'}}>
                                4242 9000 {Date.now().toString().slice(0,4)} {Date.now().toString().slice(-4)}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 mt-2 ml-1">
                            <span className="text-[8px] text-gray-500 uppercase font-bold">Valid<br/>Thru</span>
                            <span className="font-mono text-sm text-gray-300">12/30</span>
                        </div>
                    </div>

                    {/* Bottom: Name & Avatar */}
                    <div className="flex justify-between items-end">
                        <div className="font-mono text-lg text-gray-300 uppercase tracking-widest drop-shadow-md" style={{textShadow: '1px 1px 0 rgba(0,0,0,0.8)'}}>
                            {formData.name}
                        </div>
                        <div className="w-12 h-12 rounded-lg bg-black/50 border border-white/10 overflow-hidden shadow-inner relative">
                             {avatar ? (
                                 <img src={avatar} className="w-full h-full object-cover grayscale opacity-80" alt="Chip" />
                             ) : (
                                 <User className="text-gray-600 m-auto mt-2" size={24}/>
                             )}
                             {/* Hologram Overlay */}
                             <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent animate-shimmer"></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Actions Row */}
            <div className="flex gap-3 animate-fade-in-up delay-100">
                <button 
                    onClick={downloadIdCard} 
                    disabled={isDownloading}
                    className="flex-1 py-3 bg-[#292d3e] shadow-neu rounded-xl text-blue-400 font-bold text-xs flex items-center justify-center gap-2 active:shadow-neu-pressed transition-all hover:text-blue-300"
                >
                    {isDownloading ? <Activity className="animate-spin"/> : <CreditCard size={16} />} Mint Card to Photos
                </button>
            </div>

            {/* Editing Inputs or View Mode */}
            {isEditing ? (
                <div className="space-y-4 animate-fade-in-up">
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-500 uppercase ml-2">Display Name</label>
                        <input 
                            value={formData.name} 
                            onChange={e => setFormData({...formData, name: e.target.value})}
                            className="w-full bg-[#292d3e] shadow-neu-pressed rounded-xl p-4 text-gray-200 text-sm outline-none"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-500 uppercase ml-2">Username</label>
                        <input 
                            value={formData.username} 
                            onChange={e => setFormData({...formData, username: e.target.value})}
                            className="w-full bg-[#292d3e] shadow-neu-pressed rounded-xl p-4 text-blue-400 font-mono text-sm outline-none"
                        />
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between px-2">
                            <label className="text-[10px] font-bold text-gray-500 uppercase">Bio</label>
                            <button onClick={handleGenerateBio} className="text-[10px] text-primary font-bold flex items-center gap-1">
                                {isGeneratingBio ? <Activity className="animate-spin" size={10}/> : <Sparkles size={10}/>} Auto-Write
                            </button>
                        </div>
                        <textarea 
                            value={formData.bio}
                            onChange={e => setFormData({...formData, bio: e.target.value})}
                            className="w-full bg-[#292d3e] shadow-neu-pressed rounded-xl p-4 text-gray-300 text-sm outline-none h-24 resize-none"
                        />
                    </div>
                </div>
            ) : (
                // Stats Grid
                <div className="grid grid-cols-3 gap-3 animate-fade-in-up delay-200">
                    <div className="bg-[#292d3e] shadow-neu p-4 rounded-2xl text-center">
                        <div className="text-2xl font-black text-white mb-1">{formData.stats.edits}</div>
                        <div className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Edits</div>
                    </div>
                    <div className="bg-[#292d3e] shadow-neu p-4 rounded-2xl text-center">
                        <div className="text-2xl font-black text-white mb-1">{formData.stats.generated}</div>
                        <div className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Arts</div>
                    </div>
                    <div className="bg-[#292d3e] shadow-neu p-4 rounded-2xl text-center">
                        <div className="text-2xl font-black text-white mb-1">{formData.stats.chats}</div>
                        <div className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Chats</div>
                    </div>
                </div>
            )}

            {/* Expanded Tag Sections */}
            {[{ title: 'Interests', field: 'interests', val: newInterest, set: setNewInterest, icon: Hash },
              { title: 'Hobbies', field: 'hobbies', val: newHobby, set: setNewHobby, icon: BookOpen },
              { title: 'Skills', field: 'skills', val: newSkill, set: setNewSkill, icon: PenTool }]
              .map((section, idx) => (
                <div key={section.title} className="space-y-3 animate-fade-in-up" style={{ animationDelay: `${(idx + 3) * 100}ms` }}>
                    <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-2 flex items-center gap-2">
                        <section.icon size={12}/> {section.title}
                    </h3>
                    <div className="bg-[#292d3e] shadow-neu p-4 rounded-2xl min-h-[60px]">
                        <div className="flex flex-wrap gap-2">
                            {(formData[section.field as keyof UserProfile] as string[])?.map((tag, i) => (
                                <span key={i} className="px-3 py-1.5 bg-[#1e212d] rounded-lg text-[10px] font-bold text-gray-300 flex items-center gap-2 border border-white/5">
                                    {tag}
                                    {isEditing && (
                                        <button onClick={() => removeTag(section.field as any, tag)} className="text-gray-500 hover:text-red-400">
                                            <X size={10}/>
                                        </button>
                                    )}
                                </span>
                            ))}
                            {isEditing && (
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-[#1e212d] border border-dashed border-white/20 rounded-lg flex-1 min-w-[100px]">
                                    <Plus size={10} className="text-gray-500"/>
                                    <input 
                                        value={section.val}
                                        onChange={e => section.set(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && addTag(section.field as any, section.val, section.set)}
                                        placeholder="Add tag..."
                                        className="bg-transparent w-full text-[10px] text-white outline-none placeholder-gray-600"
                                    />
                                    <button onClick={() => addTag(section.field as any, section.val, section.set)} className="text-primary">
                                        <CheckCircle size={12}/>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    </div>
  );
};

export default Profile;
