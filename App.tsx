
import React, { useState, useEffect } from 'react';
import BottomNav from './components/BottomNav';
import Studio from './components/Studio';
import Editor from './components/Editor';
import Generator from './components/Generator';
import Chat from './components/Chat';
import Toolkit from './components/Toolkit';
import ToastContainer from './components/Toast';
import ApiKeyModal from './components/ApiKeyModal';
import SettingsModal from './components/SettingsModal';
import Profile from './components/Profile';
import Auth from './components/Auth';
import OmniBar from './components/OmniBar'; 
import { Tab, UserProfile } from './types';
import { Download, X, Star } from './components/Icons';
import { useNeural } from './components/NeuralContext';

const App: React.FC = () => {
  const { activeTab, setActiveTab, updateState, state, refreshKey, dispatchIntent } = useNeural();
  const [currentImage, setCurrentImage] = useState<string | null>(null);

  // Modal States
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [isKeyRequired, setIsKeyRequired] = useState(false);

  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // PWA Install State
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);

  // Sync Neural State
  useEffect(() => {
      setCurrentImage(state.activeImage);
  }, [state.activeImage]);

  // Check for API Key on mount
  useEffect(() => {
    const checkApiKey = () => {
      const localKey = localStorage.getItem('GEMINI_API_KEY');
      const envKey = (typeof process !== 'undefined' && process.env) ? process.env.API_KEY : null;
      if ((!localKey || localKey.trim() === '') && (!envKey || envKey.trim() === '')) {
        setIsKeyRequired(true);
        setShowKeyModal(true);
      } else {
        setIsKeyRequired(false);
        setShowKeyModal(false);
      }
    };
    checkApiKey();
  }, [refreshKey]);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      if (!window.matchMedia('(display-mode: standalone)').matches) {
          setTimeout(() => setShowInstallBanner(true), 4000);
      }
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then(() => {
        setDeferredPrompt(null);
        setShowInstallBanner(false);
      });
    }
  };

  const handleOpenSettings = () => setShowSettingsModal(true);
  
  const handleOpenDonation = () => {
      dispatchIntent({ type: 'NAVIGATE_TOOL', payload: { toolId: 'support' } });
  };

  const handleUserIconClick = () => {
      if (isAuthenticated) setActiveTab(Tab.PROFILE);
      else setShowAuthModal(true);
  };

  const handleLogin = (userData: UserProfile) => {
      setUser(userData);
      setIsAuthenticated(true);
      setShowAuthModal(false);
  };

  const handleLogout = () => {
      setUser(null);
      setIsAuthenticated(false);
      setActiveTab(Tab.HOME);
      setShowSettingsModal(false);
  };

  return (
    <div key={refreshKey} className="fixed inset-0 w-full max-w-md mx-auto bg-[#0a0b10] shadow-2xl shadow-black overflow-hidden flex flex-col">
      
      {/* Dynamic Background FX */}
      <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-blue-900/10 via-transparent to-purple-900/10 animate-pulse-slow"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] animate-float"></div>
      </div>

      <ToastContainer />
      <OmniBar onOpenDonation={handleOpenDonation} />

      {/* TOP RIGHT NATIVE INSTALL PROMPT */}
      {showInstallBanner && (
          <div className="absolute top-20 right-4 z-[150] animate-fade-in-up w-64">
              <div className="glass-panel bg-dark-800/90 p-4 rounded-2xl shadow-xl flex flex-col gap-3 relative overflow-hidden border border-white/10">
                  <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                          <div className="bg-primary/20 p-2 rounded-xl border border-primary/30">
                              <Star size={18} className="text-primary" />
                          </div>
                          <div>
                              <h3 className="text-xs font-black text-white uppercase tracking-tighter">Native Mode</h3>
                              <p className="text-[9px] text-primary/70 font-bold uppercase tracking-widest">SnapAura OS</p>
                          </div>
                      </div>
                      <button onClick={() => setShowInstallBanner(false)} className="text-gray-500 hover:text-white transition-colors">
                          <X size={14} />
                      </button>
                  </div>
                  <button 
                      onClick={handleInstallClick}
                      className="w-full bg-gradient-to-r from-primary to-secondary text-white py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                      <Download size={12} strokeWidth={3} /> Install Native
                  </button>
              </div>
          </div>
      )}

      <main className="relative z-10 flex-1 overflow-hidden">
          {activeTab === Tab.HOME && (
            <Studio 
              image={currentImage} 
              setImage={setCurrentImage} 
              onOpenSettings={handleOpenSettings}
              onOpenDonation={handleOpenDonation}
              onUserClick={handleUserIconClick}
              setActiveTab={setActiveTab}
              isAuthenticated={isAuthenticated}
            />
          )}
          
          {activeTab === Tab.EDIT && (
            <Editor image={currentImage} setImage={setCurrentImage} onOpenSettings={handleOpenSettings} />
          )}

          {activeTab === Tab.GENERATE && (
            <Generator onOpenSettings={handleOpenSettings} />
          )}

          {activeTab === Tab.CHAT && (
            <Chat onOpenSettings={handleOpenSettings} />
          )}

          {activeTab === Tab.TOOLKIT && (
            <Toolkit onOpenSettings={handleOpenSettings} />
          )}

          {activeTab === Tab.PROFILE && (
              <Profile onLogin={() => setShowAuthModal(true)} onLogout={handleLogout} onOpenSettings={handleOpenSettings} />
          )}
      </main>

      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Modals */}
      <SettingsModal 
        isVisible={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        onOpenDonation={handleOpenDonation}
        onOpenApiKey={() => { setIsKeyRequired(false); setShowSettingsModal(false); setShowKeyModal(true); }}
      />

      <ApiKeyModal 
        isVisible={showKeyModal} 
        onClose={() => setShowKeyModal(false)}
        canClose={!isKeyRequired} 
      />

      {showAuthModal && (
          <Auth onLogin={handleLogin} onClose={() => setShowAuthModal(false)} />
      )}
    </div>
  );
};

export default App;
