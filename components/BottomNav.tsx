
import React from 'react';
import { Tab } from '../types';
import { Camera, Sparkles, MessageCircle, ImageIcon, Briefcase, ChevronDown, ChevronUp } from './Icons';

interface BottomNavProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  isVisible: boolean;
  onToggle: () => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab, isVisible, onToggle }) => {
  const navItems = [
    { id: Tab.HOME, icon: Camera, label: 'Studio' },
    { id: Tab.EDIT, icon: Sparkles, label: 'Edit' },
    { id: Tab.GENERATE, icon: ImageIcon, label: 'Create' },
    { id: Tab.CHAT, icon: MessageCircle, label: 'Chat' },
    { id: Tab.TOOLKIT, icon: Briefcase, label: 'Tools' },
  ];

  return (
    <>
        {/* Main Navbar Container */}
        <div 
            className={`fixed bottom-6 left-4 right-4 z-[100] transition-transform duration-500 cubic-bezier(0.4, 0, 0.2, 1) ${
                isVisible ? 'translate-y-0' : 'translate-y-[250%]'
            }`}
        >
          <div className="bg-[#292d3e] shadow-neu rounded-2xl flex justify-around items-center px-2 py-3 relative border border-white/5">
            
            {/* Collapse Trigger (Chevron Down) - Positioned slightly above */}
            <button 
                onClick={(e) => { e.stopPropagation(); onToggle(); }}
                className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-10 flex items-center justify-center group"
                aria-label="Hide Navigation"
            >
                <div className="bg-[#292d3e] shadow-neu rounded-full p-1.5 text-gray-500 group-hover:text-white border border-white/5 active:scale-90 transition-transform active:shadow-neu-pressed">
                    <ChevronDown size={16} />
                </div>
            </button>

            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`group relative flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all duration-300 ${
                      isActive ? 'shadow-neu-pressed text-primary scale-95' : 'text-gray-500 hover:text-gray-300'
                  }`}
                >
                  <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                  {isActive && <div className="w-1 h-1 rounded-full bg-primary mt-1 shadow-[0_0_5px_currentColor]"></div>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Restore Trigger (Chevron Up) - Only interactive when navbar is hidden */}
        <div 
            className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[90] transition-all duration-500 ${
                !isVisible 
                ? 'opacity-100 translate-y-0 pointer-events-auto' 
                : 'opacity-0 translate-y-10 pointer-events-none'
            }`}
        >
             <button 
                onClick={(e) => { e.stopPropagation(); onToggle(); }} 
                className="w-14 h-14 bg-[#292d3e]/90 backdrop-blur-xl shadow-[0_0_30px_rgba(0,0,0,0.5)] text-gray-400 rounded-full flex items-center justify-center hover:text-white border border-white/10 active:scale-90 transition-all hover:shadow-glow group"
                aria-label="Show Navigation"
            >
                <div className="group-hover:-translate-y-1 transition-transform duration-300">
                    <ChevronUp size={28} />
                </div>
            </button>
        </div>
    </>
  );
};

export default BottomNav;
