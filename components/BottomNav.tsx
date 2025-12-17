
import React, { useState } from 'react';
import { Tab } from '../types';
import { Camera, Sparkles, MessageCircle, ImageIcon, Briefcase, Star, ChevronUp } from './Icons';

interface BottomNavProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  isVisible: boolean;
  onToggle: () => void;
}

declare const confetti: any;

const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab, isVisible, onToggle }) => {
  const [clickedTab, setClickedTab] = useState<Tab | null>(null);

  const navItems = [
    { id: Tab.HOME, icon: Camera, label: 'Studio', color: 'text-festive-gold' },
    { id: Tab.EDIT, icon: Sparkles, label: 'Magic', color: 'text-festive-crimson' },
    { id: Tab.GENERATE, icon: ImageIcon, label: 'Art', color: 'text-festive-emerald' },
    { id: Tab.CHAT, icon: MessageCircle, label: 'Nexus', color: 'text-blue-400' },
    { id: Tab.TOOLKIT, icon: Briefcase, label: 'Tools', color: 'text-orange-400' },
  ];

  const handleTabClick = (id: Tab) => {
    if (activeTab === id) return;
    setActiveTab(id);
    setClickedTab(id);
    
    if (navigator.vibrate) navigator.vibrate(15);
    
    if (typeof confetti !== 'undefined') {
        confetti({
            particleCount: 20,
            spread: 50,
            origin: { y: 0.95 },
            colors: ['#ffd700', '#d42426', '#ffffff', '#00c853'],
            ticks: 200,
            gravity: 1.2,
            shapes: ['circle']
        });
    }

    setTimeout(() => setClickedTab(null), 600);
  };

  const SantaHat = () => (
    <div className="absolute -top-3.5 -right-2 z-30 pointer-events-none transform -rotate-12 animate-bounce">
        <svg width="20" height="16" viewBox="0 0 24 20" fill="none">
            <path d="M21 18C21 19.1 20.1 20 19 20H5C3.9 20 3 19.1 3 18V17C3 15.9 3.9 15 5 15H19C20.1 15 21 15.9 21 17V18Z" fill="white" />
            <path d="M12 2C8 2 4 8 4 15H20C20 8 16 2 12 2Z" fill="#d42426" />
            <circle cx="12" cy="3" r="3" fill="white" />
        </svg>
    </div>
  );

  return (
    <>
        {/* The Holiday Dock (Bottom Positioned, Hidden by Default) */}
        <div 
            className={`fixed bottom-6 left-4 right-4 z-[100] transition-all duration-700 ease-[cubic-bezier(0.175,0.885,0.32,1.275)] ${
                isVisible ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-32 opacity-0 scale-90 pointer-events-none'
            }`}
        >
          <div className="holiday-blur bg-[#0f2a1e]/95 rounded-[2.5rem] flex justify-around items-center px-3 py-4 relative gold-rim border border-white/10 shadow-[0_25px_50px_-12px_rgba(0,0,0,1)] overflow-hidden">
            
            {/* Micro-LED Light String */}
            <div className="absolute top-0 left-0 right-0 flex justify-between px-6">
                {[...Array(12)].map((_, i) => (
                    <div 
                        key={i} 
                        className={`w-1 h-1 rounded-full animate-light-pulse shadow-[0_0_8px_currentColor]`}
                        style={{ 
                            color: i % 3 === 0 ? '#d42426' : i % 3 === 1 ? '#ffd700' : '#00c853',
                            animationDelay: `${i * 0.2}s`
                        }}
                    ></div>
                ))}
            </div>

            {/* Collapse Trigger */}
            <button 
                onClick={(e) => { e.stopPropagation(); onToggle(); }}
                className="absolute -top-3 left-1/2 -translate-x-1/2 group"
            >
                <div className="bg-[#1a3d2e] rounded-full p-1 text-festive-gold/40 group-hover:text-festive-gold border border-white/5 shadow-lg transition-all active:scale-75">
                    <ChevronUp size={14} className="rotate-180" />
                </div>
            </button>

            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              const isJingling = clickedTab === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  className={`group relative flex flex-col items-center justify-center w-14 h-14 rounded-2xl transition-all duration-500 ${
                      isActive ? 'scale-110 -translate-y-2.5' : 'opacity-50 hover:opacity-100 hover:scale-105'
                  } ${isJingling ? 'animate-jingle' : ''}`}
                >
                  {isActive && <SantaHat />}
                  {isActive && <div className="absolute inset-0 bg-white/5 blur-xl rounded-full"></div>}

                  <div className={`relative z-20 transition-transform duration-300 ${isActive ? 'drop-shadow-[0_0_12px_currentColor]' : ''} ${item.color}`}>
                    <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                  </div>

                  <span className={`text-[8px] font-black uppercase tracking-[0.1em] mt-2 transition-all duration-300 ${isActive ? 'text-white opacity-100' : 'text-gray-500 opacity-0 scale-50'}`}>
                    {item.label}
                  </span>

                  {isActive && (
                      <div className="absolute -bottom-3 w-5 h-0.5 bg-gradient-to-r from-transparent via-festive-gold to-transparent shadow-[0_0_10px_#ffd700]"></div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* The Trigger - North Star Handle */}
        <div 
            className={`fixed bottom-4 left-1/2 -translate-x-1/2 z-[90] transition-all duration-1000 ${
                !isVisible 
                ? 'opacity-100 translate-y-0 pointer-events-auto scale-100' 
                : 'opacity-0 translate-y-20 pointer-events-none scale-50'
            }`}
        >
             <button 
                onClick={(e) => { e.stopPropagation(); onToggle(); }} 
                className="w-12 h-12 bg-[#0f2a1e] text-festive-gold rounded-full flex items-center justify-center border border-festive-gold/30 shadow-[0_0_20px_rgba(255,215,0,0.3)] active:scale-90 transition-all group animate-star-pulse"
            >
                <div className="absolute inset-0 bg-gradient-to-tr from-festive-gold/10 to-transparent animate-spin-slow"></div>
                <Star size={24} fill="currentColor" />
            </button>
        </div>
    </>
  );
};

export default BottomNav;
