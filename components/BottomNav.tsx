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
    <div className="fixed bottom-6 left-4 right-4 z-50">
      <div className="bg-[#292d3e] shadow-neu rounded-2xl flex justify-around items-center px-2 py-3">
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
              {isActive && <div className="w-1 h-1 rounded-full bg-primary mt-1"></div>}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNav;