
import React, { useState, useEffect } from 'react';
import { User, LogOut, Settings, Save, X, Hash, MapPin, Edit2, Sparkles, Plus, BookOpen, PenTool, Activity, CheckCircle, Trash2, Download, QrCode, Shield, Zap, LogIn } from './Icons';
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
      showToast("Generating Golden ID...", "info");

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const W = 600;
      const H = 360;
      canvas.width = W;
      canvas.height = H;

      // 1. Background (Luxurious Dark)
      const grad = ctx.createLinearGradient(0, 0, W, H);
      grad.addColorStop(0, '#1a1a1a');
      grad.addColorStop(1, '#000000');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);

      // 2. Golden Accents (Borders)
      const goldGrad = ctx.createLinearGradient(0, 0, W, 0);
      goldGrad.addColorStop(0, '#BF953F');
      goldGrad.addColorStop(0.3, '#FCF6BA'); // Shine
      goldGrad.addColorStop(0.6, '#B38728');
      goldGrad.addColorStop(1, '#FBF5B7');
      
      ctx.strokeStyle = goldGrad;
      ctx.lineWidth = 4;
      ctx.strokeRect(20, 20, W-40, H-40); 
      
      // Corners
      ctx.fillStyle = goldGrad;
      const cornerSize = 50;
      ctx.fillRect(20, 20, cornerSize, 6); 
      ctx.fillRect(20, 20, 6, cornerSize);
      ctx.fillRect(W-20-cornerSize, H-26, cornerSize, 6);
      ctx.fillRect(W-26, H-20-cornerSize, 6, cornerSize);

      // 3. Avatar
      if (avatar) {
          const img = new Image();
          img.src = avatar;
          await new Promise(r => img.onload = r);
          
          ctx.save();
          ctx.beginPath();
          ctx.arc(100, 100, 55, 0, Math.PI * 2);
          ctx.closePath();
          ctx.clip();
          ctx.drawImage(img, 45, 45, 110, 110);
          ctx.restore();
          
          // Golden Ring
          ctx.beginPath();
          ctx.arc(100, 100, 58, 0, Math.PI * 2);
          ctx.strokeStyle = goldGrad;
          ctx.lineWidth = 4;
          ctx.stroke();
      }

      // 4. Text Info
      ctx.font = 'bold 32px "Courier New", monospace';
      ctx.fillStyle = '#fff';
      ctx.shadowColor = "rgba(255, 215, 0, 0.5)";
      ctx.shadowBlur = 10;
      ctx.fillText(formData.name.toUpperCase(), 180, 85);
      ctx.shadowBlur = 0;

      ctx.font = '22px "Courier New", monospace';
      ctx.fillStyle = '#FCD34D'; // Amber-300
      ctx.fillText(`@${formData.username}`, 180, 120);

      ctx.font = '14px sans-serif';
      ctx.fillStyle = '#ccc';
      ctx.fillText(formData.bio?.substring(0, 55) + '...' || '', 180, 155);

      // 5. Stats
      const statY = 230;
      ctx.fillStyle = '#111';
      ctx.fillRect(40, statY, W-80, 70);
      ctx.strokeStyle = '#333';
      ctx.strokeRect(40, statY, W-80, 70);

      const drawStat = (label: string, val: number, x: number) => {
          ctx.font = 'bold 12px sans-serif';
          ctx.fillStyle = '#888';
          ctx.fillText(label, x, statY + 25);
          
          ctx.font = 'bold 30px monospace';
          ctx.fillStyle = '#fff'; // White text
          ctx.fillText(val.toString(), x, statY + 58);
      };

      drawStat('EDITS', formData.stats.edits, 80);
      drawStat('GENERATED', formData.stats.generated, 250);
      drawStat('CHATS', formData.stats.chats, 450);

      // 6. QR Code Placeholder
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=snapaura:${formData.username}&color=ffd700&bgcolor=1a1a1a`;
      const qrImg = new Image();
      qrImg.crossOrigin = "Anonymous";
      qrImg.src = qrUrl;
      try {
          await new Promise((r, j) => { qrImg.onload = r; qrImg.onerror = j; });
          ctx.drawImage(qrImg, W - 110, 40, 70, 70);
      } catch(e) {
          ctx.fillStyle = '#FCD34D';
          ctx.fillRect(W - 110, 40, 70, 70);
      }

      // 7. Footer
      ctx.font = '10px sans-serif';
      ctx.fillStyle = '#666';
      ctx.fillText("SNAPAURA GOLD MEMBER • VERIFIED IDENTITY", 40, H-15);

      // Download
      const link = document.createElement('a');
      link.download = `snapaura-gold-id-${formData.username}.png`;
      link.href = canvas.toDataURL();
      link.click();
      setIsDownloading(false);
      showToast("Golden ID Downloaded", "success");
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
            <div className="absolute top-[-50%] left-0 right-0 h-full bg-yellow-500/10 blur-[100px] rounded-full animate-pulse-slow"></div>
            <div className="absolute inset-0 bg-[linear-gradient(rgba(252,211,77,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(252,211,77,0.05)_1px,transparent_1px)] bg-[size:40px_40px] opacity-30 transform perspective-500 rotateX-60"></div>
        </div>

        <div className="relative z-10 p-6 space-y-6">
            {/* Toolbar */}
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-black text-gray-200 tracking-tight flex items-center gap-2">
                    <Shield size={24} className="text-yellow-400"/> Identity Core
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

            {/* GOLDEN FUTURISTIC ID CARD */}
            <div className="relative w-full aspect-[1.7/1] rounded-3xl overflow-hidden shadow-[0_0_40px_rgba(252,211,77,0.15)] group animate-fade-in-up border border-yellow-500/20 bg-[#1e212d]">
                {/* Card Background */}
                <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_50%_50%,rgba(30,33,45,1)_0%,rgba(10,10,12,1)_100%)]"></div>
                <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 mix-blend-overlay"></div>
                
                {/* Golden Border */}
                <div className="absolute inset-4 border-2 border-yellow-500/30 rounded-2xl z-10 flex flex-col justify-between p-4">
                    <div className="flex justify-between items-start">
                        <div className="flex gap-4 items-center">
                            {/* Avatar with Golden Ring */}
                            <div className="relative">
                                <div className="absolute -inset-1 bg-gradient-to-tr from-yellow-400 to-orange-500 rounded-full animate-spin-slow blur-sm opacity-70"></div>
                                <div className="w-16 h-16 rounded-full border-2 border-[#1e212d] relative z-10 overflow-hidden bg-black">
                                    {avatar ? (
                                        <img src={avatar} className="w-full h-full object-cover" alt="Profile" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-500"><User size={24}/></div>
                                    )}
                                </div>
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 tracking-widest">{formData.name.toUpperCase()}</h2>
                                <p className="text-[10px] text-yellow-400 font-mono tracking-widest">@{formData.username}</p>
                            </div>
                        </div>
                        <QrCode className="text-yellow-500/30" size={40} />
                    </div>

                    <div className="flex justify-between items-end">
                        <div className="space-y-1">
                            <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Clearance Level</p>
                            <div className="flex items-center gap-1 text-yellow-400 font-mono text-xs">
                                <Shield size={10} fill="currentColor"/> GOLD MEMBER
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">ID Hash</p>
                            <p className="text-[10px] text-gray-400 font-mono">#{Date.now().toString().slice(-6)}</p>
                        </div>
                    </div>
                </div>

                {/* Golden Sheen Animation */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-yellow-200/10 to-transparent w-full h-full animate-shimmer pointer-events-none z-20" style={{backgroundSize: '200% 100%'}}></div>
            </div>

            {/* Actions Row */}
            <div className="flex gap-3 animate-fade-in-up delay-100">
                <button 
                    onClick={downloadIdCard} 
                    disabled={isDownloading}
                    className="flex-1 py-3 bg-[#292d3e] shadow-neu rounded-xl text-yellow-400 font-bold text-xs flex items-center justify-center gap-2 active:shadow-neu-pressed transition-all hover:text-yellow-300"
                >
                    {isDownloading ? <Activity className="animate-spin"/> : <Download size={16} />} Save ID Card
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
