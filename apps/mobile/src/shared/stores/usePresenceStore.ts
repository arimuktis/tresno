import { create } from 'zustand';
import { UserPresenceStatus } from '@tresno/shared';
import { supabaseRealtimeService, PresenceUserInfo } from '../services/supabaseRealtimeService';

export interface UserPresence {
  userId: string;
  nickname: string;
  avatarUrl?: string;
  isHost: boolean;
  status: UserPresenceStatus; // 'available' (ijo) | 'busy' (merah pink) | 'offline' (abu-abu)
  currentCallChannelId?: string;
  lastUpdated: number;
}

interface PresenceState {
  presences: Record<string, UserPresence>;
  myStatus: UserPresenceStatus;

  // Query helpers
  getStatus: (userId?: string) => UserPresenceStatus;
  getStatusColor: (status: UserPresenceStatus) => string;
  getStatusLabel: (status: UserPresenceStatus) => string;
  getStatusBadgeVariant: (status: UserPresenceStatus) => 'success' | 'danger' | 'neutral';

  // State actions
  setMyStatus: (status: UserPresenceStatus) => void;
  setUserStatus: (userId: string, status: UserPresenceStatus, channelId?: string) => void;
  syncFromRealtime: (users: PresenceUserInfo[]) => void;
  simulateToggleHostStatus: (hostId: string) => void;

  // Counts
  getAvailableCount: () => number;
  getBusyCount: () => number;
  getOfflineCount: () => number;
}

// Initial known presence data with realistic initial states
const INITIAL_PRESENCES: Record<string, UserPresence> = {
  // Dewi Lestari: Online & Available (Ijo #00D26A)
  anchor_1: {
    userId: 'anchor_1',
    nickname: 'Dewi Lestari',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300',
    isHost: true,
    status: 'available',
    lastUpdated: Date.now(),
  },
  anchor_dewi: {
    userId: 'anchor_dewi',
    nickname: 'Dewi Lestari',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300',
    isHost: true,
    status: 'available',
    lastUpdated: Date.now(),
  },

  // Bella Putri: Busy / Sedang Call (Merah Pink #FF2E63)
  anchor_2: {
    userId: 'anchor_2',
    nickname: 'Bella Putri',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300',
    isHost: true,
    status: 'busy',
    currentCallChannelId: 'call_channel_bella_active',
    lastUpdated: Date.now(),
  },
  anchor_bella: {
    userId: 'anchor_bella',
    nickname: 'Bella Putri',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300',
    isHost: true,
    status: 'busy',
    currentCallChannelId: 'call_channel_bella_active',
    lastUpdated: Date.now(),
  },

  // Siti Rahma: Offline (Abu-abu #94A3B8)
  anchor_3: {
    userId: 'anchor_3',
    nickname: 'Siti Rahma',
    avatarUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=300',
    isHost: true,
    status: 'offline',
    lastUpdated: Date.now() - 7200000,
  },
  anchor_siti: {
    userId: 'anchor_siti',
    nickname: 'Siti Rahma',
    avatarUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=300',
    isHost: true,
    status: 'offline',
    lastUpdated: Date.now() - 7200000,
  },

  // Nadia Safitri: Online & Available (Ijo #00D26A)
  anchor_4: {
    userId: 'anchor_4',
    nickname: 'Nadia Safitri',
    avatarUrl: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=300',
    isHost: true,
    status: 'available',
    lastUpdated: Date.now(),
  },
  anchor_nadia: {
    userId: 'anchor_nadia',
    nickname: 'Nadia Safitri',
    avatarUrl: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=300',
    isHost: true,
    status: 'available',
    lastUpdated: Date.now(),
  },
};

// Local broadcast channel for multi-tab live sync
let presenceBroadcast: BroadcastChannel | null = null;
if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  try {
    presenceBroadcast = new BroadcastChannel('tresno_presence_sync');
  } catch (_) {}
}

export const usePresenceStore = create<PresenceState>((set, get) => {
  // Listen for broadcast messages across tabs
  if (presenceBroadcast) {
    presenceBroadcast.onmessage = (event) => {
      const { type, payload } = event.data || {};
      if (type === 'USER_STATUS_CHANGE') {
        set((state) => {
          const existing = state.presences[payload.userId] || {
            userId: payload.userId,
            nickname: payload.nickname || 'User',
            isHost: false,
            lastUpdated: Date.now(),
          };
          return {
            presences: {
              ...state.presences,
              [payload.userId]: {
                ...existing,
                status: payload.status,
                currentCallChannelId: payload.channelId,
                lastUpdated: Date.now(),
              },
            },
          };
        });
      }
    };
  }

  return {
    presences: INITIAL_PRESENCES,
    myStatus: 'available',

    getStatus: (userId?: string): UserPresenceStatus => {
      if (!userId) return 'offline';
      const record = get().presences[userId];
      if (record) return record.status;
      return 'offline';
    },

    getStatusColor: (status: UserPresenceStatus): string => {
      switch (status) {
        case 'available':
          return '#00D26A'; // Hijau: Online & Available
        case 'busy':
          return '#FF2E63'; // Merah Pink: Busy Sedang Call
        case 'offline':
        default:
          return '#94A3B8'; // Abu-abu: Offline
      }
    },

    getStatusLabel: (status: UserPresenceStatus): string => {
      switch (status) {
        case 'available':
          return 'Online & Siap';
        case 'busy':
          return 'Sedang Panggilan';
        case 'offline':
        default:
          return 'Offline';
      }
    },

    getStatusBadgeVariant: (status: UserPresenceStatus): 'success' | 'danger' | 'neutral' => {
      switch (status) {
        case 'available':
          return 'success';
        case 'busy':
          return 'danger';
        case 'offline':
        default:
          return 'neutral';
      }
    },

    setMyStatus: (status: UserPresenceStatus) => {
      set({ myStatus: status });
      // Broadcast via Supabase Realtime service if connected
      supabaseRealtimeService.broadcastMyPresence(status);

      if (presenceBroadcast) {
        presenceBroadcast.postMessage({
          type: 'USER_STATUS_CHANGE',
          payload: { userId: 'me', status },
        });
      }
    },

    setUserStatus: (userId: string, status: UserPresenceStatus, channelId?: string) => {
      set((state) => {
        const existing = state.presences[userId] || {
          userId,
          nickname: 'User',
          isHost: false,
          lastUpdated: Date.now(),
        };

        const updated: UserPresence = {
          ...existing,
          status,
          currentCallChannelId: channelId,
          lastUpdated: Date.now(),
        };

        const newPresences = {
          ...state.presences,
          [userId]: updated,
        };

        // Also update alias if this is anchor_1 <-> anchor_dewi
        if (userId === 'anchor_1') newPresences['anchor_dewi'] = { ...updated, userId: 'anchor_dewi' };
        if (userId === 'anchor_dewi') newPresences['anchor_1'] = { ...updated, userId: 'anchor_1' };
        if (userId === 'anchor_2') newPresences['anchor_bella'] = { ...updated, userId: 'anchor_bella' };
        if (userId === 'anchor_bella') newPresences['anchor_2'] = { ...updated, userId: 'anchor_2' };
        if (userId === 'anchor_3') newPresences['anchor_siti'] = { ...updated, userId: 'anchor_siti' };
        if (userId === 'anchor_siti') newPresences['anchor_3'] = { ...updated, userId: 'anchor_3' };
        if (userId === 'anchor_4') newPresences['anchor_nadia'] = { ...updated, userId: 'anchor_nadia' };
        if (userId === 'anchor_nadia') newPresences['anchor_4'] = { ...updated, userId: 'anchor_4' };

        return { presences: newPresences };
      });

      // Broadcast update across tabs
      if (presenceBroadcast) {
        presenceBroadcast.postMessage({
          type: 'USER_STATUS_CHANGE',
          payload: { userId, status, channelId },
        });
      }
    },

    syncFromRealtime: (users: PresenceUserInfo[]) => {
      set((state) => {
        const updated = { ...state.presences };
        users.forEach((u) => {
          updated[u.userId] = {
            userId: u.userId,
            nickname: u.nickname,
            avatarUrl: u.avatarUrl,
            isHost: u.isHost,
            status: u.status,
            lastUpdated: Date.now(),
          };
        });
        return { presences: updated };
      });
    },

    simulateToggleHostStatus: (hostId: string) => {
      const current = get().getStatus(hostId);
      // Toggle cycle: available (ijo) -> busy (merah pink) -> offline (abu-abu) -> available
      let nextStatus: UserPresenceStatus = 'available';
      if (current === 'available') {
        nextStatus = 'busy';
      } else if (current === 'busy') {
        nextStatus = 'offline';
      } else {
        nextStatus = 'available';
      }
      get().setUserStatus(hostId, nextStatus, nextStatus === 'busy' ? `call_${Date.now()}` : undefined);
    },

    getAvailableCount: () => {
      const presences = Object.values(get().presences);
      return presences.filter((p) => p.status === 'available' && p.isHost).length;
    },

    getBusyCount: () => {
      const presences = Object.values(get().presences);
      return presences.filter((p) => p.status === 'busy' && p.isHost).length;
    },

    getOfflineCount: () => {
      const presences = Object.values(get().presences);
      return presences.filter((p) => p.status === 'offline' && p.isHost).length;
    },
  };
});
