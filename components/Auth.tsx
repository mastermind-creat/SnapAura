import React, { useState } from 'react';
import { Logo } from './Logo';
import { Globe, Facebook, Twitter, ArrowRight, CheckCircle, RefreshCw, ShieldCheck } from './Icons';
import { showToast } from './Toast';

interface AuthProps {
  onLogin: () => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
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
        showToast(isLogin ? "Welcome back!" : "Account created successfully!", "success");
        onLogin();
    }, 1500);
  };

  const handleSocialLogin = (provider: string) => {
     showToast(`Connecting with ${provider}...`, "info");
     setTimeout(() => {
         onLogin();
     }, 1000);
  };

  return (
    <div className="h-full relative overflow-hidden bg-[#0f0f11]">
       {/* Fixed Background Elements */}
       <div className="absolute inset-0 pointer-events-none z-0">
           <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-primary/20 rounded-full blur-[100px] animate-pulse-slow"></div>
           <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-secondary/20 rounded-full blur-[100px] animate-pulse-slow delay-1000"></div>
       </div>

       {/* Scrollable Container */}
       <div className="absolute inset-0 overflow-y-auto hide-scrollbar z-10">
           <div className="min-h-full flex flex-col items-center justify-center p-6 py-12">
               
               <div className="glass-panel w-full max-w-sm p-8 rounded-3xl border border-white/20 shadow-2xl relative animate-fade-in-up my-auto">
                   
                   {/* Header */}
                   <div className="text-center mb-8">
                       <div className="inline-block p-4 bg-white/5 rounded-2xl mb-4 border border-white/10 shadow-inner">
                           <Logo size={48} />
                       </div>
                       <h1 className="text-2xl font-black text-white mb-2">
                           {isLogin ? 'Welcome Back' : 'Join SnapAura'}
                       </h1>
                       <p className="text-sm text-gray-400">
                           {isLogin ? 'Enter your credentials to access your studio.' : 'Start your creative journey today.'}
                       </p>
                   </div>

                   {/* Form */}
                   <form onSubmit={handleSubmit} className="space-y-4">
                       <div className="space-y-4">
                           <input 
                              type="email" 
                              placeholder="Email Address" 
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-primary focus:outline-none transition-colors"
                           />
                           <input 
                              type="password" 
                              placeholder="Password" 
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-primary focus:outline-none transition-colors"
                           />
                       </div>

                       {/* Manual Verification Checkbox */}
                       <div className={`flex justify-center py-2 transition-transform ${shake ? 'animate-[shake_0.5s_ease-in-out]' : ''}`}>
                           <style>{`
                             @keyframes shake {
                               0%, 100% { transform: translateX(0); }
                               25% { transform: translateX(-5px); }
                               75% { transform: translateX(5px); }
                             }
                           `}</style>
                           <div 
                             onClick={() => setIsVerified(!isVerified)}
                             className={`w-full p-4 rounded-xl border cursor-pointer flex items-center justify-between gap-3 transition-all select-none ${
                                isVerified 
                                ? "bg-green-500/10 border-green-500 shadow-[0_0_10px_rgba(34,197,94,0.3)]" 
                                : shake 
                                    ? "bg-red-500/10 border-red-500" 
                                    : "bg-black/30 border-white/10 hover:bg-white/5"
                             }`}
                           >
                               <div className="flex items-center gap-3">
                                   <div className={`w-6 h-6 rounded-md border flex items-center justify-center transition-colors ${
                                       isVerified ? "bg-green-500 border-green-500" : shake ? "border-red-500" : "border-gray-500"
                                   }`}>
                                       {isVerified && <CheckCircle size={16} className="text-white" />}
                                   </div>
                                   <span className={`text-sm font-medium ${isVerified ? "text-green-400" : shake ? "text-red-400" : "text-gray-400"}`}>
                                       Verify I am human
                                   </span>
                               </div>
                               <ShieldCheck size={18} className={isVerified ? "text-green-500" : shake ? "text-red-500" : "text-gray-600"} />
                           </div>
                       </div>

                       <button 
                          type="submit" 
                          disabled={loading}
                          className="w-full bg-gradient-to-r from-primary to-secondary text-white font-bold py-3 rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                       >
                           {loading ? <RefreshCw className="animate-spin" /> : (isLogin ? 'Sign In' : 'Create Account')}
                           {!loading && <ArrowRight size={18} />}
                       </button>
                   </form>

                   {/* Social Login */}
                   <div className="mt-8">
                       <div className="relative mb-6">
                           <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
                           <div className="relative flex justify-center text-xs uppercase"><span className="bg-[#1a1a20] px-2 text-gray-500 font-bold">Or continue with</span></div>
                       </div>
                       
                       <div className="grid grid-cols-3 gap-3">
                           <button onClick={() => handleSocialLogin('Google')} className="bg-white/5 hover:bg-white/10 border border-white/10 p-3 rounded-xl flex justify-center items-center transition-all hover:-translate-y-1">
                               <Globe size={20} className="text-white" />
                           </button>
                           <button onClick={() => handleSocialLogin('Twitter')} className="bg-white/5 hover:bg-white/10 border border-white/10 p-3 rounded-xl flex justify-center items-center transition-all hover:-translate-y-1">
                               <Twitter size={20} className="text-blue-400" />
                           </button>
                           <button onClick={() => handleSocialLogin('Facebook')} className="bg-white/5 hover:bg-white/10 border border-white/10 p-3 rounded-xl flex justify-center items-center transition-all hover:-translate-y-1">
                               <Facebook size={20} className="text-blue-600" />
                           </button>
                       </div>
                   </div>

                   {/* Toggle */}
                   <div className="mt-6 text-center pt-4 border-t border-white/10">
                       <p className="text-sm text-gray-400">
                           {isLogin ? "Don't have an account? " : "Already have an account? "}
                           <button onClick={() => setIsLogin(!isLogin)} className="text-white font-bold hover:underline ml-1">
                               {isLogin ? 'Sign Up' : 'Log In'}
                           </button>
                       </p>
                   </div>
               </div>
               
               {/* Footer Spacer for mobile scrolling */}
               <div className="h-8"></div>
           </div>
       </div>
    </div>
  );
};

export default Auth;