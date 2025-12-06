
import React, { useState } from 'react';
import BottomNav from './components/BottomNav';
import Studio from './components/Studio';
import Editor from './components/Editor';
import Generator from './components/Generator';
import Chat from './components/Chat';
import Toolkit from './components/Toolkit';
import ToastContainer from './components/Toast';
import SettingsModal from './components/SettingsModal';
import Profile from './components/Profile';
import Auth from './components/Auth';
import { Tab, UserProfile } from './types';
import { useNeural } from './components/NeuralContext';

const App: React.FC = () => {
  const { activeTab, setActiveTab, updateState } = useNeural();
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isNavVisible, setIsNavVisible] = useState(true);

  const handleLogin = (u: UserProfile) => {
      setUser(u);
      setIsAuthenticated(true);
      setShowAuthModal(false);
      updateState({ userProfile: u });
  };

  return (
    <div className="fixed inset-0 w-full max-w-md mx-auto bg-[#292d3e] shadow-2xl overflow-hidden flex flex-col">
      <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute inset-0 alive-bg opacity-80"></div>
      </div>

      <ToastContainer />
      <SettingsModal isVisible={showSettings} onClose={() => setShowSettings(false)} onOpenApiKey={() => {}} />
      {showAuthModal && <Auth onLogin={handleLogin} onClose={() => setShowAuthModal(false)} />}

      <main className="relative z-10 flex-1 overflow-hidden">
        {activeTab === Tab.HOME && <Studio image={currentImage} setImage={setCurrentImage} onOpenSettings={() => setShowSettings(true)} onUserClick={() => !isAuthenticated ? setShowAuthModal(true) : setActiveTab(Tab.PROFILE)} setActiveTab={setActiveTab} isAuthenticated={isAuthenticated} />}
        {activeTab === Tab.EDIT && <Editor image={currentImage} setImage={setCurrentImage} onOpenSettings={() => setShowSettings(true)} />}
        {activeTab === Tab.GENERATE && <Generator onOpenSettings={() => setShowSettings(true)} />}
        {activeTab === Tab.CHAT && <Chat onOpenSettings={() => setShowSettings(true)} />}
        {activeTab === Tab.TOOLKIT && <Toolkit onOpenSettings={() => setShowSettings(true)} />}
        {activeTab === Tab.PROFILE && <Profile user={user} onLogout={() => {setIsAuthenticated(false); setUser(null);}} onOpenSettings={() => setShowSettings(true)} />}
      </main>

      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} isVisible={isNavVisible} onToggle={() => setIsNavVisible(!isNavVisible)} />
    </div>
  );
};

export default App;
