
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
import { Smartphone, Download, X, Star } from './components/Icons';
import { useNeural } from './components/NeuralContext';

const App: React.FC = () => {
  const { activeTab, setActiveTab, updateState, state, refreshKey } = useNeural();
  const [currentImage, setCurrentImage] = useState<string | null>(null);

  // Navbar Visibility State - Hidden by default as requested
  const [isNavVisible, setIsNavVisible] = useState(false);

  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Modal States
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [isKeyRequired, setIsKeyRequired] = useState(false);

  // PWA Install State
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);

  // Sync Neural State with App State
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
      // Only show banner if we aren't already in standalone mode
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
      deferredPrompt.userChoice.then((choiceResult: any) => {
        setDeferredPrompt(null);
        setShowInstallBanner(false);
      });
    }
  };

  const handleOpenSettings = () => {
      setShowSettingsModal(true);
  };

  const handleUserIconClick = () => {
      if (isAuthenticated) {
          setActiveTab(Tab.PROFILE);
      } else {
          setShowAuthModal(true);
      }
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
      
      {/* Festive Dynamic Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-b from-[#0f2a1e] via-[#0a0b10] to-[#000000] opacity-80"></div>
          <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-festive-gold/5 rounded-full blur-[100px] animate-drift"></div>
          <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-festive-crimson/5 rounded-full blur-[100px] animate-aurora"></div>
      </div>

      {/* Toast System */}
      <ToastContainer />
      
      {/* Settings Modal */}
      <SettingsModal 
        isVisible={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        onOpenApiKey={() => {
            setIsKeyRequired(false);
            setShowSettingsModal(false);
            setShowKeyModal(true);
        }}
      />

      {/* API Key Modal */}
      <ApiKeyModal 
        isVisible={showKeyModal} 
        onClose={() => setShowKeyModal(false)}
        canClose={!isKeyRequired} 
      />

      {/* Auth Modal */}
      {showAuthModal && (
          <Auth 
            onLogin={handleLogin} 
            onClose={() => setShowAuthModal(false)} 
          />
      )}

      {/* NEURAL NEXUS OMNIBAR */}
      <OmniBar />

      {/* TOP RIGHT NATIVE INSTALL PROMPT */}
      {showInstallBanner && (
          <div className="absolute top-20 right-4 z-[150] animate-fade-in-up w-64">
              <div className="holiday-blur bg-[#0f2a1e]/90 p-4 rounded-2xl border gold-rim shadow-[0_15px_35px_rgba(0,0,0,0.5)] flex flex-col gap-3 relative overflow-hidden">
                  <div className="absolute -top-6 -left-6 w-16 h-16 bg-festive-gold/10 rounded-full blur-xl animate-pulse"></div>
                  
                  <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                          <div className="bg-festive-gold/20 p-2 rounded-xl border border-festive-gold/30">
                              <Star size={18} className="text-festive-gold" />
                          </div>
                          <div>
                              <h3 className="text-xs font-black text-white uppercase tracking-tighter">Native Mode</h3>
                              <p className="text-[9px] text-festive-gold/70 font-bold uppercase tracking-widest">SnapAura OS</p>
                          </div>
                      </div>
                      <button onClick={() => setShowInstallBanner(false)} className="text-gray-500 hover:text-white transition-colors">
                          <X size={14} />
                      </button>
                  </div>

                  <p className="text-[10px] text-gray-300 font-medium leading-tight">
                      Install <span className="text-white font-bold">SnapAura</span> as a native app for a browser-free experience.
                  </p>

                  <button 
                      onClick={handleInstallClick}
                      className="w-full bg-gradient-to-r from-festive-gold to-orange-500 text-black py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                      <Download size={12} strokeWidth={3} /> Install Native
                  </button>
              </div>
          </div>
      )}

      {/* Main Content Area - Full height since nav is hidden by default */}
      <main className="relative z-10 flex-1 overflow-hidden">
          {activeTab === Tab.HOME && (
            <Studio 
              image={currentImage} 
              setImage={setCurrentImage} 
              onOpenSettings={handleOpenSettings}
              onUserClick={handleUserIconClick}
              setActiveTab={setActiveTab}
              isAuthenticated={isAuthenticated}
            />
          )}
          
          {activeTab === Tab.EDIT && (
            <Editor 
              image={currentImage} 
              setImage={setCurrentImage} 
              onOpenSettings={handleOpenSettings}
            />
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
              <Profile 
                  onLogin={() => setShowAuthModal(true)}
                  onLogout={handleLogout}
                  onOpenSettings={handleOpenSettings}
              />
          )}
      </main>

      {/* Bottom Nav Controller */}
      <BottomNav 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isVisible={isNavVisible}
        onToggle={() => setIsNavVisible(!isNavVisible)}
      />
    </div>
  );
};

export default App;
