
import React from 'react';
import { Tab } from '../types';
import { Camera, Sparkles, MessageCircle, ImageIcon, Briefcase } from './Icons';

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
    <div className="fixed bottom-0 left-0 right-0 z-50 glass-panel border-t border-white/5 pb-safe rounded-t-3xl">
      <div className="flex justify-around items-center p-4">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                if (navigator.vibrate) navigator.vibrate(10);
              }}
              className={`flex flex-col items-center space-y-1 transition-all duration-300 w-12 group ${
                isActive ? 'text-primary' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <div className={`transition-transform duration-300 ${isActive ? 'scale-110 -translate-y-1' : ''}`}>
                <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className={`text-[9px] font-black uppercase tracking-widest transition-opacity ${isActive ? 'opacity-100' : 'opacity-60'}`}>
                {item.label}
              </span>
              {isActive && (
                <div className="w-1 h-1 bg-primary rounded-full mt-0.5 animate-pulse"></div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNav;
