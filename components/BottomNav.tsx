
import React from 'react';
import { Tab } from '../types';
import { Camera, Sparkles, MessageCircle, ImageIcon, Briefcase, ChevronDown } from './Icons';

interface BottomNavProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab }) => {
  const navItems = [
    { id: Tab.HOME, icon: Camera, label: 'Studio' },
    { id: Tab.EDIT, icon: Sparkles, label: 'Magic' },
    { id: Tab.GENERATE, icon: ImageIcon, label: 'Art' },
    { id: Tab.CHAT, icon: MessageCircle, label: 'Nexus' },
    { id: Tab.TOOLKIT, icon: Briefcase, label: 'Tools' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex flex-col items-center pb-safe pointer-events-none">
      {/* Visual Indicator of Scroll/OS feel */}
      <div className="mb-4 text-gray-600 opacity-30 animate-pulse">
        <ChevronDown size={28} />
      </div>
      
      <div className="w-full px-8 pb-8 pointer-events-auto">
          <div className="glass-panel border border-white/10 rounded-[2.8rem] shadow-[0_20px_50px_rgba(0,0,0,0.6)] px-4 py-2 flex justify-around items-center">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    if (navigator.vibrate) navigator.vibrate(15);
                  }}
                  className={`flex flex-col items-center justify-center transition-all duration-300 w-16 h-16 rounded-[1.8rem] relative ${
                    isActive ? 'bg-dark-900/50 shadow-neu-pressed text-primary border border-white/5' : 'text-gray-500 hover:text-gray-300'
                  }`}
                >
                  <item.icon size={24} strokeWidth={isActive ? 2.5 : 2} className={`transition-transform duration-500 ${isActive ? 'scale-110' : 'hover:scale-110'}`} />
                  {isActive && (
                    <div className="absolute -bottom-1.5 w-1.5 h-1.5 bg-primary rounded-full shadow-[0_0_10px_#4FD1C5]"></div>
                  )}
                </button>
              );
            })}
          </div>
      </div>
    </div>
  );
};

export default BottomNav;
