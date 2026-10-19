import { create } from 'zustand';

export interface DeepLinkRecord {
  id: string;
  url: string;
  path: string;
  params: Record<string, string>;
  source: 'notification' | 'external_url' | 'web_hash' | 'simulator' | 'initial_launch';
  timestamp: number;
  success: boolean;
  targetDescription: string;
}

interface DeepLinkState {
  history: DeepLinkRecord[];
  lastHandledUrl: string | null;
  isTesterModalOpen: boolean;
  
  // Actions
  recordDeepLink: (record: Omit<DeepLinkRecord, 'id' | 'timestamp'>) => void;
  openTesterModal: () => void;
  closeTesterModal: () => void;
  clearHistory: () => void;
}

export const useDeepLinkStore = create<DeepLinkState>((set, get) => ({
  history: [],
  lastHandledUrl: null,
  isTesterModalOpen: false,

  recordDeepLink: (record) => {
    const newRecord: DeepLinkRecord = {
      ...record,
      id: `dl_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: Date.now(),
    };
    set((state) => ({
      history: [newRecord, ...state.history.slice(0, 49)], // Keep last 50
      lastHandledUrl: record.url,
    }));
  },

  openTesterModal: () => set({ isTesterModalOpen: true }),
  closeTesterModal: () => set({ isTesterModalOpen: false }),
  clearHistory: () => set({ history: [] }),
}));
