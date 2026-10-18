import { create } from 'zustand';
import { toast } from '../../../shared/stores/useToastStore';

export interface ParticipantSummary {
  id: string;
  nickname: string;
  avatarUrl: string;
  gender: string;
  level?: number;
  isHost?: boolean;
  coinsBalance?: number;
}

export interface ActiveCallItem {
  channelId: string;
  caller: ParticipantSummary;
  callee: ParticipantSummary;
  startTime: number;
  durationSeconds: number;
  currentInterval: number;
  coinsSpent: number;
  status: 'active' | 'infiltrated' | 'terminated';
  riskFlags: string[];
}

export interface InfiltratedSessionData {
  channelId: string;
  ghostUid: number;
  ghostToken: string;
  caller: ParticipantSummary;
  callee: ParticipantSummary;
  startTime: number;
  durationSeconds: number;
  coinsSpent: number;
  riskFlags: string[];
}

export interface ChatMessageItem {
  id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: string;
  createdAt: number;
  isSystemWarning?: boolean;
  isFlagged?: boolean;
  gift?: {
    name: string;
    coins: number;
  };
}

export interface ChatroomSummaryItem {
  chatId: string;
  participants: ParticipantSummary[];
  messageCount: number;
  lastMessage?: ChatMessageItem;
  isFrozen: boolean;
  lastActivity: number;
  riskScore: number;
  riskReason?: string;
}

interface SurveillanceState {
  activeCalls: ActiveCallItem[];
  chatrooms: ChatroomSummaryItem[];
  infiltratedSession: InfiltratedSessionData | null;
  selectedChatroom: { summary: ChatroomSummaryItem; messages: ChatMessageItem[] } | null;
  isLoading: boolean;
  isAdminAudioListening: boolean;

  // Actions
  fetchActiveCalls: () => Promise<void>;
  infiltrateCall: (channelId: string) => Promise<boolean>;
  terminateCall: (channelId: string, reason: string) => Promise<boolean>;
  sendCallWarning: (channelId: string, warningText: string) => Promise<boolean>;
  leaveInfiltration: () => void;
  toggleAdminAudioListening: () => void;

  fetchChatrooms: () => Promise<void>;
  inspectChatroom: (chatId: string) => Promise<void>;
  closeChatInspection: () => void;
  injectChatWarning: (chatId: string, warningText: string) => Promise<boolean>;
  toggleFreezeChatroom: (chatId: string, freeze: boolean) => Promise<boolean>;
}

const SERVER_BASE = 'http://localhost:4000';

export const useSurveillanceStore = create<SurveillanceState>((set, get) => ({
  activeCalls: [],
  chatrooms: [],
  infiltratedSession: null,
  selectedChatroom: null,
  isLoading: false,
  isAdminAudioListening: true,

  fetchActiveCalls: async () => {
    try {
      const res = await fetch(`${SERVER_BASE}/api/admin/surveillance/calls`);
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        set({ activeCalls: json.data });
      }
    } catch (err) {
      console.warn('[SurveillanceStore] fetchActiveCalls fallback:', err);
    }
  },

  infiltrateCall: async (channelId: string) => {
    set({ isLoading: true });
    try {
      const res = await fetch(`${SERVER_BASE}/api/admin/surveillance/calls/${channelId}/infiltrate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminId: 'admin_owner_root' }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        set({ infiltratedSession: json.data, isLoading: false });
        toast.success(`Berhasil menyusup ke panggilan ${channelId} (Ghost Mode).`);
        return true;
      } else {
        toast.error(json.message || 'Gagal menyusup ke panggilan.');
        set({ isLoading: false });
        return false;
      }
    } catch (err: any) {
      toast.error('Gagal terhubung ke server pengawasan.');
      set({ isLoading: false });
      return false;
    }
  },

  terminateCall: async (channelId: string, reason: string) => {
    try {
      const res = await fetch(`${SERVER_BASE}/api/admin/surveillance/calls/${channelId}/terminate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminId: 'admin_owner_root', reason }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success(`Panggilan ${channelId} berhasil diputus paksa.`);
        set((state) => ({
          activeCalls: state.activeCalls.filter((c) => c.channelId !== channelId),
          infiltratedSession: state.infiltratedSession?.channelId === channelId ? null : state.infiltratedSession,
        }));
        return true;
      } else {
        toast.error(json.message || 'Gagal memutus panggilan.');
        return false;
      }
    } catch {
      toast.error('Gagal menghubungi server pengawasan.');
      return false;
    }
  },

  sendCallWarning: async (channelId: string, warningText: string) => {
    try {
      const res = await fetch(`${SERVER_BASE}/api/admin/surveillance/calls/${channelId}/warn`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminId: 'admin_owner_root', warningText }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success('Peringatan darurat berhasil ditampilkan ke layar kedua peserta.');
        return true;
      }
      return false;
    } catch {
      toast.error('Gagal mengirim peringatan.');
      return false;
    }
  },

  leaveInfiltration: () => {
    set({ infiltratedSession: null });
    toast.info('Keluar dari mode penyusupan panggilan.');
  },

  toggleAdminAudioListening: () => {
    set((state) => {
      const next = !state.isAdminAudioListening;
      toast.info(next ? 'Audio monitor aktif (Anda mendengar panggilan)' : 'Audio monitor dibisukan');
      return { isAdminAudioListening: next };
    });
  },

  fetchChatrooms: async () => {
    try {
      const res = await fetch(`${SERVER_BASE}/api/admin/surveillance/chatrooms`);
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        set({ chatrooms: json.data });
      }
    } catch (err) {
      console.warn('[SurveillanceStore] fetchChatrooms fallback:', err);
    }
  },

  inspectChatroom: async (chatId: string) => {
    set({ isLoading: true });
    try {
      const [roomsRes, msgsRes] = await Promise.all([
        fetch(`${SERVER_BASE}/api/admin/surveillance/chatrooms`),
        fetch(`${SERVER_BASE}/api/admin/surveillance/chatrooms/${chatId}/messages`),
      ]);
      const roomsJson = await roomsRes.json();
      const msgsJson = await msgsRes.json();

      const summary = (roomsJson.data || []).find((r: any) => r.chatId === chatId) || {
        chatId,
        participants: [],
        messageCount: 0,
        isFrozen: false,
        lastActivity: Date.now(),
        riskScore: 0,
      };

      set({
        selectedChatroom: {
          summary,
          messages: msgsJson.data || [],
        },
        isLoading: false,
      });
      toast.info(`Menyadap chatroom ${chatId} secara rahasia.`);
    } catch {
      toast.error('Gagal membuka penyadapan chatroom.');
      set({ isLoading: false });
    }
  },

  closeChatInspection: () => {
    set({ selectedChatroom: null });
  },

  injectChatWarning: async (chatId: string, warningText: string) => {
    try {
      const res = await fetch(`${SERVER_BASE}/api/admin/surveillance/chatrooms/${chatId}/warning`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminId: 'admin_owner_root', warningText }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        toast.success('Peringatan resmi admin berhasil disuntikkan ke chatroom.');
        // Update local messages
        set((state) => {
          if (state.selectedChatroom && state.selectedChatroom.summary.chatId === chatId) {
            return {
              selectedChatroom: {
                ...state.selectedChatroom,
                messages: [...state.selectedChatroom.messages, json.data],
              },
            };
          }
          return {};
        });
        return true;
      }
      return false;
    } catch {
      toast.error('Gagal menyuntikkan peringatan admin.');
      return false;
    }
  },

  toggleFreezeChatroom: async (chatId: string, freeze: boolean) => {
    try {
      const res = await fetch(`${SERVER_BASE}/api/admin/surveillance/chatrooms/${chatId}/freeze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminId: 'admin_owner_root', freeze }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success(freeze ? 'Chatroom berhasil dibekukan.' : 'Pembekuan chatroom dicabut.');
        set((state) => {
          const updatedChatrooms = state.chatrooms.map((c) =>
            c.chatId === chatId ? { ...c, isFrozen: freeze } : c
          );
          const updatedSelected =
            state.selectedChatroom && state.selectedChatroom.summary.chatId === chatId
              ? {
                  ...state.selectedChatroom,
                  summary: { ...state.selectedChatroom.summary, isFrozen: freeze },
                }
              : state.selectedChatroom;
          return { chatrooms: updatedChatrooms, selectedChatroom: updatedSelected };
        });
        return true;
      }
      return false;
    } catch {
      toast.error('Gagal mengubah status pembekuan chatroom.');
      return false;
    }
  },
}));
