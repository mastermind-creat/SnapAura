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
    { id: Tab.EDIT, icon: Sparkles, label: 'Edit' },
    { id: Tab.GENERATE, icon: ImageIcon, label: 'Create' },
    { id: Tab.CHAT, icon: MessageCircle, label: 'Chat' },
    { id: Tab.TOOLKIT, icon: Briefcase, label: 'Tools' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      {/* Premium Glass Container */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-xl border-t border-white/10"></div>
      
      {/* Glow Effect Top Border */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-50"></div>

      <div className="relative flex justify-around items-center px-2 py-3 pb-safe">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className="group relative flex flex-col items-center justify-center w-14 h-12"
            >
              {/* Active Glow Behind Icon */}
              {isActive && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-secondary/30 rounded-full blur-md"></div>
              )}
              
              <div className={`transition-all duration-300 ${isActive ? 'text-white scale-110 drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]' : 'text-gray-500 group-hover:text-gray-300'}`}>
                <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              
              <span className={`text-[9px] font-medium tracking-wide mt-1 transition-all duration-300 ${isActive ? 'text-secondary translate-y-0 opacity-100' : 'text-gray-500 translate-y-1 opacity-0'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNav;