
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
import { Tab, UserProfile } from './types';
import { Smartphone, Download } from './components/Icons';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.HOME);
  const [currentImage, setCurrentImage] = useState<string | null>(null);

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

  // Check for API Key on mount
  useEffect(() => {
    const checkApiKey = () => {
      // 1. Check LocalStorage
      const localKey = localStorage.getItem('GEMINI_API_KEY');
      // 2. Check Env (fallback, though in browser strictly rely on local or injected env)
      const envKey = (typeof process !== 'undefined' && process.env) ? process.env.API_KEY : null;

      if ((!localKey || localKey.trim() === '') && (!envKey || envKey.trim() === '')) {
        setIsKeyRequired(true);
        setShowKeyModal(true);
      }
    };
    checkApiKey();
  }, []);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  // Check for Join Link
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('join')) {
      setActiveTab(Tab.CHAT);
    }
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
    <div className="fixed inset-0 w-full max-w-md mx-auto bg-gradient-to-b from-[#0f0f11] via-[#1a1a20] to-[#0f0f11] shadow-2xl shadow-black overflow-hidden flex flex-col">
      
      {/* Toast System */}
      <ToastContainer />
      
      {/* Settings Modal (Global) */}
      <SettingsModal 
        isVisible={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        onOpenApiKey={() => {
            setIsKeyRequired(false);
            setShowSettingsModal(false); // Close settings
            setShowKeyModal(true); // Open key modal
        }}
      />

      {/* API Key Modal */}
      <ApiKeyModal 
        isVisible={showKeyModal} 
        onClose={() => setShowKeyModal(false)}
        canClose={!isKeyRequired} 
      />

      {/* Auth Modal (Overlay) */}
      {showAuthModal && (
          <Auth 
            onLogin={handleLogin} 
            onClose={() => setShowAuthModal(false)} 
          />
      )}

      {/* Background Decoration */}
      <div className="fixed top-[-20%] left-[-10%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] pointer-events-none opacity-30 z-0" />
      <div className="fixed bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-secondary/20 rounded-full blur-[120px] pointer-events-none opacity-30 z-0" />

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 overflow-hidden">
            <>
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
                        user={user} 
                        onLogout={handleLogout}
                        onOpenSettings={handleOpenSettings}
                    />
                )}
            </>
      </main>

      {/* Install Banner & Nav */}
        <>
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
        </>
    </div>
  );
};

export default App;
