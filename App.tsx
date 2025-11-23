import React, { useState } from 'react';
import BottomNav from './components/BottomNav';
import Studio from './components/Studio';
import Editor from './components/Editor';
import Generator from './components/Generator';
import Chat from './components/Chat';
import ToastContainer from './components/Toast'; // New import
import { Tab } from './types';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.HOME);
  
  // Centralized image state. 
  // Upload in Home, move to Edit to modify it.
  const [currentImage, setCurrentImage] = useState<string | null>(null);

  return (
    <div className="fixed inset-0 w-full max-w-md mx-auto bg-gradient-to-b from-[#0f0f11] via-[#1a1a20] to-[#0f0f11] shadow-2xl shadow-black overflow-hidden flex flex-col">
      
      {/* Toast System */}
      <ToastContainer />

      {/* Background Decoration */}
      <div className="fixed top-[-20%] left-[-10%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] pointer-events-none opacity-30 z-0" />
      <div className="fixed bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-secondary/20 rounded-full blur-[120px] pointer-events-none opacity-30 z-0" />

      {/* Content Area - Flex 1 allows it to take remaining space and handle its own scroll */}
      <main className="relative z-10 flex-1 overflow-hidden">
        {activeTab === Tab.HOME && (
          <Studio image={currentImage} setImage={setCurrentImage} />
        )}
        
        {activeTab === Tab.EDIT && (
          <Editor image={currentImage} setImage={setCurrentImage} />
        )}

        {activeTab === Tab.GENERATE && (
          <Generator />
        )}

        {activeTab === Tab.CHAT && (
          <Chat />
        )}
      </main>

      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
};

export default App;