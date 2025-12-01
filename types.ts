
export enum Tab {
  HOME = 'HOME',
  EDIT = 'EDIT',
  GENERATE = 'GENERATE',
  CHAT = 'CHAT',
  TOOLKIT = 'TOOLKIT',
  PROFILE = 'PROFILE'
}

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
  email: string;
  joinDate: string;
  stats: {
    edits: number;
    generated: number;
    chats: number;
  }
}
