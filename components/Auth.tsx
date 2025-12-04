
import React, { useState } from 'react';
import { Logo } from './Logo';
import { Globe, Facebook, Twitter, ArrowRight, CheckCircle, RefreshCw, ShieldCheck, X, User, Lock } from './Icons';
import { showToast } from './Toast';

interface AuthProps {
  onLogin: (userData: any) => void;
  onClose: () => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin, onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [shake, setShake] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
        showToast("Please fill in all fields", "error");
        return;
    }
    
    // Check manual verification
    if (!isVerified) {
        setShake(true);
        setTimeout(() => setShake(false), 500);
        showToast("Please verify you are human", "error");
        return;
    }

    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
        setLoading(false);
        const mockUser = {
            name: email.split('@')[0],
            email: email,
            joinDate: new Date().toLocaleDateString(),
            stats: { edits: 12, generated: 5, chats: 24 }
        };
        showToast(isLogin ? "Welcome back!" : "Account created successfully!", "success");
        onLogin(mockUser);
    }, 1500);
  };

  const handleSocialLogin = (provider: string) => {
     showToast(`Connecting with ${provider}...`, "info");
     setTimeout(() => {
         const mockUser = {
            name: "Snap User",
            email: `user@${provider.toLowerCase()}.com`,
            joinDate: new Date().toLocaleDateString(),
            stats: { edits: 0, generated: 0, chats: 0 }
        };
         onLogin(mockUser);
     }, 1000);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-[#292d3e] overflow-hidden animate-fade-in-up flex flex-col items-center justify-center">
       
       {/* Background Aesthetics */}
       <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
           <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-gradient-to-br from-transparent via-white/5 to-transparent opacity-20 animate-spin-slow"></div>
       </div>
       
       {/* Close Button */}
       <button 
           onClick={onClose}
           className="absolute top-6 right-6 z-50 w-10 h-10 rounded-full bg-[#292d3e] shadow-neu flex items-center justify-center text-gray-400 hover:text-red-400 active:shadow-neu-pressed transition-all"
       >
           <X size={20} />
       </button>

       {/* Main Card */}
       <div className="w-full max-w-sm px-6 relative z-10">
           <div className="bg-[#292d3e] shadow-neu rounded-3xl p-8 relative">
               
               {/* Header */}
               <div className="flex flex-col items-center text-center mb-8">
                   <div className="w-24 h-24 rounded-full bg-[#292d3e] shadow-neu flex items-center justify-center mb-6">
                       <Logo size={50} />
                   </div>
                   <h1 className="text-2xl font-black text-gray-200 tracking-tight">
                       {isLogin ? 'Welcome Back' : 'Join SnapAura'}
                   </h1>
                   <p className="text-xs text-gray-500 mt-2 font-medium uppercase tracking-wide">
                       {isLogin ? 'Sign in to your studio' : 'Create your creative account'}
                   </p>
               </div>

               {/* Form */}
               <form onSubmit={handleSubmit} className="space-y-5">
                   <div className="space-y-4">
                       <div className="relative group">
                           <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                               <User size={18} />
                           </div>
                           <input 
                              type="email" 
                              placeholder="Email Address" 
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              className="w-full bg-[#292d3e] shadow-neu-pressed rounded-xl pl-12 pr-4 py-4 text-gray-300 placeholder-gray-500 focus:outline-none focus:text-primary transition-all text-sm font-medium"
                           />
                       </div>
                       <div className="relative group">
                           <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                               <Lock size={18} />
                           </div>
                           <input 
                              type="password" 
                              placeholder="Password" 
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              className="w-full bg-[#292d3e] shadow-neu-pressed rounded-xl pl-12 pr-4 py-4 text-gray-300 placeholder-gray-500 focus:outline-none focus:text-primary transition-all text-sm font-medium"
                           />
                       </div>
                   </div>

                   {/* Manual Verification Checkbox */}
                   <div className={`transition-transform duration-300 ${shake ? 'translate-x-[-5px]' : ''}`}>
                       <button
                         type="button" 
                         onClick={() => setIsVerified(!isVerified)}
                         className={`w-full p-3 rounded-xl flex items-center justify-between gap-3 transition-all select-none group ${
                            isVerified 
                            ? "bg-[#292d3e] shadow-neu-pressed" 
                            : "bg-[#292d3e] shadow-neu hover:scale-[1.01]"
                         }`}
                       >
                           <div className="flex items-center gap-3">
                               <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${
                                   isVerified ? "bg-green-400 text-[#292d3e] shadow-none" : "bg-[#292d3e] shadow-neu-pressed"
                               }`}>
                                   {isVerified && <CheckCircle size={14} strokeWidth={3} />}
                               </div>
                               <span className={`text-xs font-bold uppercase tracking-wider ${isVerified ? "text-green-400" : shake ? "text-red-400" : "text-gray-500 group-hover:text-gray-400"}`}>
                                   I am human
                               </span>
                           </div>
                           <ShieldCheck size={16} className={isVerified ? "text-green-400" : "text-gray-600"} />
                       </button>
                   </div>

                   <button 
                      type="submit" 
                      disabled={loading}
                      className="w-full bg-[#292d3e] text-primary font-bold py-4 rounded-xl shadow-neu active:shadow-neu-pressed hover:text-secondary transition-all flex items-center justify-center gap-2"
                   >
                       {loading ? <RefreshCw className="animate-spin" /> : (isLogin ? 'Sign In' : 'Create Account')}
                       {!loading && <ArrowRight size={18} />}
                   </button>
               </form>

               {/* Social Login */}
               <div className="mt-8">
                   <div className="flex items-center gap-4 mb-6">
                       <div className="h-px bg-[#1e212d] flex-1 shadow-[0_1px_0_rgba(255,255,255,0.05)]"></div>
                       <span className="text-[10px] text-gray-500 font-bold uppercase">Or Connect With</span>
                       <div className="h-px bg-[#1e212d] flex-1 shadow-[0_1px_0_rgba(255,255,255,0.05)]"></div>
                   </div>
                   
                   <div className="grid grid-cols-3 gap-4">
                       <button onClick={() => handleSocialLogin('Google')} className="bg-[#292d3e] shadow-neu p-3 rounded-xl flex justify-center items-center transition-all active:shadow-neu-pressed hover:scale-105 text-gray-400 hover:text-white">
                           <Globe size={20} />
                       </button>
                       <button onClick={() => handleSocialLogin('Twitter')} className="bg-[#292d3e] shadow-neu p-3 rounded-xl flex justify-center items-center transition-all active:shadow-neu-pressed hover:scale-105 text-blue-400">
                           <Twitter size={20} />
                       </button>
                       <button onClick={() => handleSocialLogin('Facebook')} className="bg-[#292d3e] shadow-neu p-3 rounded-xl flex justify-center items-center transition-all active:shadow-neu-pressed hover:scale-105 text-blue-600">
                           <Facebook size={20} />
                       </button>
                   </div>
               </div>

               {/* Toggle */}
               <div className="mt-8 text-center">
                   <button 
                    onClick={() => setIsLogin(!isLogin)} 
                    className="text-xs text-gray-500 font-bold uppercase tracking-wider hover:text-primary transition-colors"
                   >
                       {isLogin ? "Create new account" : "Log in to existing account"}
                   </button>
               </div>
           </div>
       </div>
    </div>
  );
};

export default Auth;
