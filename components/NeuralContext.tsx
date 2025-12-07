
import React, { createContext, useContext, useState, useEffect } from 'react';
import { GlobalContextState, AppIntent, UserProfile, Tab } from '../types';
import { showToast } from './Toast';

interface NeuralContextType {
  state: GlobalContextState;
  dispatchIntent: (intent: AppIntent) => void;
  updateState: (updates: Partial<GlobalContextState>) => void;
  incrementStat: (type: 'edits' | 'generated' | 'chats') => void;
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
}

const NeuralContext = createContext<NeuralContextType | undefined>(undefined);

export const NeuralProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.HOME);
  const [state, setState] = useState<GlobalContextState>({
    activeImage: null,
    activeAnalysis: null,
    userProfile: null,
    recentActions: [],
    clipboard: null
  });

  // Load Persistence on Mount
  useEffect(() => {
      try {
          const storedProfile = localStorage.getItem('SNAPAURA_PROFILE');
          const storedActions = localStorage.getItem('SNAPAURA_ACTIONS');
          
          let profile = storedProfile ? JSON.parse(storedProfile) : null;
          
          // Create Default Local User if none exists
          if (!profile) {
              profile = {
                  name: "Local User",
                  email: "user@local.device",
                  joinDate: new Date().toLocaleDateString(),
                  stats: { edits: 0, generated: 0, chats: 0 },
                  username: "user_" + Math.floor(Math.random() * 1000),
                  bio: "Ready to create.",
                  interests: [],
                  hobbies: [],
                  skills: []
              };
              localStorage.setItem('SNAPAURA_PROFILE', JSON.stringify(profile));
          }

          setState(prev => ({
              ...prev,
              userProfile: profile,
              recentActions: storedActions ? JSON.parse(storedActions) : []
          }));
      } catch (e) {
          console.error("Failed to load neural state", e);
      }
  }, []);

  // Save Persistence on Change
  useEffect(() => {
      if (state.userProfile) {
          localStorage.setItem('SNAPAURA_PROFILE', JSON.stringify(state.userProfile));
      }
  }, [state.userProfile]);

  useEffect(() => {
      localStorage.setItem('SNAPAURA_ACTIONS', JSON.stringify(state.recentActions));
  }, [state.recentActions]);

  const updateState = (updates: Partial<GlobalContextState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  // Helper to increment stats and auto-save
  const incrementStat = (type: 'edits' | 'generated' | 'chats') => {
      setState(prev => {
          if (!prev.userProfile) return prev;
          const updatedProfile = {
              ...prev.userProfile,
              stats: {
                  ...prev.userProfile.stats,
                  [type]: (prev.userProfile.stats[type] || 0) + 1
              }
          };
          return { ...prev, userProfile: updatedProfile };
      });
  };

  // THE INTENT ENGINE: Routes actions between tools
  const dispatchIntent = (intent: AppIntent) => {
    console.log("Processing Intent:", intent.type);
    
    // Log action
    updateState({ recentActions: [intent.type, ...state.recentActions].slice(0, 10) });

    switch (intent.type) {
      case 'ANALYZE_IMAGE':
        updateState({ activeImage: intent.payload });
        break;

      case 'SEND_TO_CHAT':
        if (intent.payload.image) updateState({ activeImage: intent.payload.image });
        incrementStat('chats'); 
        setActiveTab(Tab.CHAT);
        setTimeout(() => {
            window.dispatchEvent(new CustomEvent('neural-chat-intent', { detail: intent.payload }));
        }, 100);
        showToast("Context sent to AI Assistant", "success");
        break;

      case 'SEND_TO_NOTES':
        setActiveTab(Tab.TOOLKIT);
        localStorage.setItem('NEURAL_NOTE_DRAFT', JSON.stringify(intent.payload));
        window.dispatchEvent(new CustomEvent('neural-tool-select', { detail: 'notes' }));
        showToast("Draft created in Smart Notes", "success");
        break;

      case 'SOCIAL_GROWTH':
        setActiveTab(Tab.TOOLKIT);
        localStorage.setItem('NEURAL_SOCIAL_TOPIC', intent.payload.topic);
        window.dispatchEvent(new CustomEvent('neural-tool-select', { detail: 'social-growth' }));
        break;
        
      case 'SMART_EDIT':
        updateState({ activeImage: intent.payload.image });
        setActiveTab(Tab.EDIT);
        showToast("Opened in Editor", "success");
        break;
        
      case 'GENERATE_CAPTION':
        break;
    }
  };

  return (
    <NeuralContext.Provider value={{ state, dispatchIntent, updateState, incrementStat, activeTab, setActiveTab }}>
      {children}
    </NeuralContext.Provider>
  );
};

export const useNeural = () => {
  const context = useContext(NeuralContext);
  if (!context) throw new Error("useNeural must be used within a NeuralProvider");
  return context;
};
