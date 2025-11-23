import React, { useState, useEffect } from 'react';
import BottomNav from './components/BottomNav';
import Studio from './components/Studio';
import Editor from './components/Editor';
import Generator from './components/Generator';
import Chat from './components/Chat';
import Toolkit from './components/Toolkit';
import ToastContainer from './components/Toast';
import { Tab } from './types';
import { Smartphone, Download } from './components/Icons';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.HOME);
  
  // Centralized image state. 
  // Upload in Home, move to Edit to modify it.
  const [currentImage, setCurrentImage] = useState<string | null>(null);

  // PWA Install State
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult: any) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the install prompt');
        }
        setDeferredPrompt(null);
        setShowInstallBanner(false);
      });
    }
  };

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

        {activeTab === Tab.TOOLKIT && (
          <Toolkit />
        )}
      </main>

      {/* PWA Install Banner */}
      {showInstallBanner && (
        <div className="absolute bottom-[80px] left-4 right-4 z-50 animate-fade-in-up">
           <div className="glass-panel p-4 rounded-2xl flex items-center justify-between border-t border-white/20 bg-black/80 backdrop-blur-xl shadow-2xl">
              <div className="flex items-center gap-3">
                 <div className="bg-white/10 p-2 rounded-xl">
                    <Smartphone size={24} className="text-white" />
                 </div>
                 <div>
                    <h3 className="text-sm font-bold text-white">Install SnapAura</h3>
                    <p className="text-xs text-gray-400">Add to home screen for full experience</p>
                 </div>
              </div>
              <button 
                onClick={handleInstallClick}
                className="bg-white text-black px-4 py-2 rounded-full text-xs font-bold shadow-lg hover:scale-105 transition-transform flex items-center gap-1"
              >
                 <Download size={14} /> Install
              </button>
              <button onClick={() => setShowInstallBanner(false)} className="absolute -top-2 -right-2 bg-black/50 rounded-full p-1 text-white"><span className="sr-only">Close</span>&times;</button>
           </div>
        </div>
      )}

      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
};

export default App;