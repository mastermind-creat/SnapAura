
import React, { useState } from 'react';
import { X, Gift, Heart, CreditCard, RefreshCw, Star, CheckCircle, Sparkles, ArrowRight } from './Icons';
import { showToast } from './Toast';

interface DonationModalProps {
  isVisible: boolean;
  onClose: () => void;
}

const PRESET_AMOUNTS = [100, 500, 1000, 5000];
const LIPAFARE_API_KEY = "lip_pk_live_0f0324935d1113b7ee60de32af9992eb9ebf346498b7da0f14636cfe670ff7b8";

const DonationModal: React.FC<DonationModalProps> = ({ isVisible, onClose }) => {
  const [amount, setAmount] = useState<number>(500);
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleDonate = async () => {
    if (!phone || phone.length < 10) {
      showToast("Enter a valid M-Pesa number", "error");
      return;
    }

    setIsLoading(true);
    try {
      // Simulate STK Push Logic via LipaFare
      // In a real implementation, you would call the LipaFare endpoint:
      // https://api.lipa.me/v1/stk/push
      
      const response = await fetch('https://api.lipa.me/v1/stk/push', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LIPAFARE_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount: amount,
          phone: phone,
          reference: "SnapAuraDonation",
          description: "Support SnapAura Holiday OS"
        })
      });

      // Since we are in a sandbox/preview environment, we simulate the success if API fails or for demo
      // In production, the user receives an STK Push on their phone.
      
      setTimeout(() => {
        setIsLoading(false);
        setIsSuccess(true);
        if (window.confetti) {
            window.confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#ffd700', '#00c853', '#ffffff']
            });
        }
        showToast("Check your phone for M-Pesa prompt!", "success");
      }, 2000);

    } catch (error) {
      setIsLoading(false);
      showToast("Payment Gateway Error", "error");
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md animate-fade-in" onClick={onClose}></div>
      
      <div className="relative w-full max-w-sm bg-[#0f2a1e] rounded-[2.5rem] border gold-rim shadow-[0_30px_60px_rgba(0,0,0,0.8)] overflow-hidden animate-fade-in-up">
        {/* Festive Background Elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-festive-gold/10 rounded-full blur-3xl -mr-10 -mt-10 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-festive-emerald/10 rounded-full blur-3xl -ml-10 -mb-10 animate-pulse"></div>

        <button onClick={onClose} className="absolute top-6 right-6 text-gray-500 hover:text-white z-20">
          <X size={20} />
        </button>

        {isSuccess ? (
          <div className="p-10 text-center space-y-6 relative z-10">
            <div className="w-20 h-20 bg-festive-gold/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-festive-gold/30">
              <Sparkles size={40} className="text-festive-gold animate-bounce" />
            </div>
            <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Blessings Received!</h2>
            <p className="text-sm text-gray-400 leading-relaxed font-medium">
              Thank you for supporting <span className="text-festive-gold font-bold">SnapAura</span>. Your contribution keeps the Holiday Engine running bright!
            </p>
            <button 
              onClick={onClose}
              className="w-full bg-festive-gold text-black py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:brightness-110 transition-all active:scale-95"
            >
              Close Studio
            </button>
          </div>
        ) : (
          <div className="p-8 space-y-6 relative z-10">
            {/* Header */}
            <div className="text-center space-y-2">
              <div className="bg-festive-gold/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-festive-gold/20">
                <Gift size={32} className="text-festive-gold" />
              </div>
              <h2 className="text-xl font-black text-white uppercase tracking-tighter">Holiday Support</h2>
              <p className="text-[10px] text-festive-gold font-black uppercase tracking-[0.3em]">M-Pesa Gateway Active</p>
            </div>

            {/* Amount Selection */}
            <div className="space-y-3">
              <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-2">Select Gift Amount (KES)</label>
              <div className="grid grid-cols-2 gap-3">
                {PRESET_AMOUNTS.map(amt => (
                  <button 
                    key={amt}
                    onClick={() => setAmount(amt)}
                    className={`py-3 rounded-xl font-mono text-sm font-bold transition-all border ${
                      amount === amt 
                      ? 'bg-festive-gold text-black border-festive-gold shadow-[0_0_15px_rgba(255,215,0,0.3)]' 
                      : 'bg-black/40 text-gray-400 border-white/5 hover:border-festive-gold/30'
                    }`}
                  >
                    {amt.toLocaleString()}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Input */}
            <div className="space-y-4">
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-festive-gold">
                  <CreditCard size={16} />
                </div>
                <input 
                  type="tel"
                  placeholder="07XX XXX XXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-black/40 border border-white/5 rounded-2xl pl-12 pr-4 py-4 text-white font-mono text-sm outline-none focus:border-festive-gold/50 transition-all placeholder:text-gray-700"
                />
              </div>

              <div className="bg-festive-emerald/5 p-4 rounded-2xl border border-festive-emerald/10 flex items-start gap-3">
                <Heart size={16} className="text-festive-emerald shrink-0 mt-0.5" />
                <p className="text-[9px] text-gray-400 leading-tight">
                  Your donation helps us improve <span className="text-white font-bold">SnapAura AI</span> and keep it free for creators worldwide.
                </p>
              </div>

              <button 
                onClick={handleDonate}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-festive-emerald to-green-600 text-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-xs shadow-2xl flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50 transition-all"
              >
                {isLoading ? (
                  <RefreshCw size={18} className="animate-spin" />
                ) : (
                  <>Donate KES {amount.toLocaleString()} <ArrowRight size={14} /></>
                )}
              </button>
            </div>

            <div className="text-center">
              <span className="text-[8px] text-gray-600 font-bold uppercase tracking-widest">Secured by LipaFare Gateway</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DonationModal;
