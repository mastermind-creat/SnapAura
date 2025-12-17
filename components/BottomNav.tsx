
import React, { useState } from 'react';
import { Tab } from '../types';
import { Camera, Sparkles, MessageCircle, ImageIcon, Briefcase, Star, ChevronRight } from './Icons';

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
            origin: { x: 0.9, y: 0.5 },
            colors: ['#ffd700', '#d42426', '#ffffff', '#00c853'],
            ticks: 200,
            gravity: 1.2,
            shapes: ['circle']
        });
    }

    setTimeout(() => setClickedTab(null), 600);
  };

  const SantaHat = () => (
    <div className="absolute -top-1 -left-2 z-30 pointer-events-none transform -rotate-45 animate-bounce">
        <svg width="18" height="14" viewBox="0 0 24 20" fill="none">
            <path d="M21 18C21 19.1 20.1 20 19 20H5C3.9 20 3 19.1 3 18V17C3 15.9 3.9 15 5 15H19C20.1 15 21 15.9 21 17V18Z" fill="white" />
            <path d="M12 2C8 2 4 8 4 15H20C20 8 16 2 12 2Z" fill="#d42426" />
            <circle cx="12" cy="3" r="3" fill="white" />
        </svg>
    </div>
  );

  return (
    <>
        {/* The Holiday Vertical Rail (Right Side) */}
        <div 
            className={`fixed right-4 top-1/2 -translate-y-1/2 z-[100] transition-all duration-700 ease-[cubic-bezier(0.175,0.885,0.32,1.275)] ${
                isVisible ? 'translate-x-0 opacity-100 scale-100' : 'translate-x-32 opacity-0 scale-90 pointer-events-none'
            }`}
        >
          <div className="holiday-blur bg-[#0f2a1e]/90 rounded-full flex flex-col justify-around items-center py-6 px-3 relative gold-rim border border-white/5 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.8)] overflow-hidden min-h-[400px]">
            
            {/* Vertical Micro-LEDs */}
            <div className="absolute top-0 bottom-0 left-0 flex flex-col justify-between py-10">
                {[...Array(8)].map((_, i) => (
                    <div 
                        key={i} 
                        className={`w-1 h-1 rounded-full animate-light-pulse shadow-[0_0_8px_currentColor] ml-0.5`}
                        style={{ 
                            color: i % 3 === 0 ? '#d42426' : i % 3 === 1 ? '#ffd700' : '#00c853',
                            animationDelay: `${i * 0.2}s`
                        }}
                    ></div>
                ))}
            </div>

            {/* Internal Snowflake Drift */}
            <div className="absolute inset-0 pointer-events-none opacity-20">
                 {[...Array(6)].map((_, i) => (
                     <div 
                        key={i} 
                        className="absolute w-1 h-1 bg-white rounded-full animate-snow-drift"
                        style={{ 
                            top: `${(i * 15)}%`, 
                            left: `${Math.random() * 80}%`,
                            animationDuration: `${6 + Math.random() * 4}s`
                        }}
                     ></div>
                 ))}
            </div>
            
            {/* Collapse Trigger (Side) */}
            <button 
                onClick={(e) => { e.stopPropagation(); onToggle(); }}
                className="absolute top-1/2 -left-3 -translate-y-1/2 group"
            >
                <div className="bg-[#1a3d2e] rounded-full p-1 text-festive-gold/40 group-hover:text-festive-gold border border-white/5 shadow-lg transition-all active:scale-75">
                    <ChevronRight size={14} className="rotate-180" />
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
                      isActive ? 'scale-110 -translate-x-1.5' : 'opacity-50 hover:opacity-100 hover:scale-105'
                  } ${isJingling ? 'animate-jingle' : ''}`}
                >
                  {/* Holographic Santa Hat */}
                  {isActive && <SantaHat />}

                  {/* Icon Pad Glow */}
                  {isActive && (
                      <div className="absolute inset-0 bg-white/5 blur-xl rounded-full animate-pulse-slow"></div>
                  )}

                  {/* Icon */}
                  <div className={`relative z-20 transition-transform duration-300 ${isActive ? 'drop-shadow-[0_0_12px_currentColor]' : ''} ${item.color}`}>
                    <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                  </div>

                  {/* Label (Side Tooltip style or hidden) */}
                  <span className={`absolute right-full mr-4 bg-black/80 text-white text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded border border-white/10 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap`}>
                    {item.label}
                  </span>

                  {/* Gold Beam Indicator */}
                  {isActive && (
                      <div className="absolute -right-3 h-5 w-0.5 bg-gradient-to-b from-transparent via-festive-gold to-transparent shadow-[0_0_10px_#ffd700]"></div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Restore Star - Floating in corner */}
        <div 
            className={`fixed bottom-8 right-8 z-[90] transition-all duration-1000 ${
                !isVisible 
                ? 'opacity-100 translate-x-0 pointer-events-auto scale-100' 
                : 'opacity-0 translate-x-20 pointer-events-none scale-50'
            }`}
        >
             <button 
                onClick={(e) => { e.stopPropagation(); onToggle(); }} 
                className="w-16 h-16 bg-[#0f2a1e] text-festive-gold rounded-full flex items-center justify-center border border-festive-gold/30 shadow-[0_0_40px_rgba(255,215,0,0.4)] active:scale-90 transition-all group overflow-hidden animate-star-pulse"
            >
                <div className="absolute inset-0 bg-gradient-to-tr from-festive-gold/20 to-transparent animate-spin-slow"></div>
                <Star size={36} fill="currentColor" />
            </button>
        </div>
    </>
  );
};

export default BottomNav;
