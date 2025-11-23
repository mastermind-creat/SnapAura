import React from 'react';
import { Tab } from '../types';
import { Camera, Sparkles, MessageCircle, ImageIcon } from './Icons';

interface BottomNavProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab }) => {
  const navItems = [
    { id: Tab.HOME, icon: Camera, label: 'Studio' },
    { id: Tab.EDIT, icon: Sparkles, label: 'Edit' },
    { id: Tab.GENERATE, icon: ImageIcon, label: 'Create' },
    { id: Tab.CHAT, icon: MessageCircle, label: 'Ask AI' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 glass-panel border-t border-white/10 pb-safe">
      <div className="flex justify-around items-center p-3">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center space-y-1 transition-colors duration-200 ${
              activeTab === item.id ? 'text-secondary' : 'text-gray-400 hover:text-white'
            }`}
          >
            <item.icon size={24} strokeWidth={activeTab === item.id ? 2.5 : 2} />
            <span className="text-[10px] font-medium">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default BottomNav;