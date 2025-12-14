
export enum Tab {
  HOME = 'HOME',
  EDIT = 'EDIT',
  GENERATE = 'GENERATE',
  CHAT = 'CHAT',
  TOOLKIT = 'TOOLKIT',
  PROFILE = 'PROFILE'
}

// --- ECOSYSTEM TYPES ---

export type AppIntent = 
  | { type: 'ANALYZE_IMAGE'; payload: string }
  | { type: 'GENERATE_CAPTION'; payload: { image: string; analysis: string } }
  | { type: 'SMART_EDIT'; payload: { image: string; prompt: string } }
  | { type: 'SEND_TO_CHAT'; payload: { text?: string; image?: string; context?: string } }
  | { type: 'SEND_TO_NOTES'; payload: { text: string; title?: string } }
  | { type: 'SOCIAL_GROWTH'; payload: { topic: string; context?: string } }
  | { type: 'NAVIGATE_TOOL'; payload: { toolId: string; context?: string } };

export interface GlobalContextState {
  activeImage: string | null;
  activeAnalysis: any | null;
  userProfile: UserProfile | null;
  recentActions: string[];
  clipboard: string | null;
}

export interface SmartAction {
  label: string;
  icon: any;
  intent: AppIntent;
  primary?: boolean;
}

// --- EXISTING TYPES ---

export interface CaptionCategory {
  category: string;
  captions: string[];
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export enum ImageSize {
  S_1K = '1K',
  S_2K = '2K',
  S_4K = '4K'
}

export interface GeneratedImage {
  url: string;
  prompt: string;
}

export interface UserProfile {
  name: string;
  username?: string; 
  email: string;
  bio?: string; 
  location?: string; 
  interests?: string[]; 
  hobbies?: string[]; // New
  skills?: string[]; // New
  joinDate: string;
  stats: {
    edits: number;
    generated: number;
    chats: number;
  }
}
