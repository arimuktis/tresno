import { create } from 'zustand';

interface NetworkState {
  isOnline: boolean;
  isReconnecting: boolean;
  lastOnlineAt: number | null;
  lastOfflineAt: number | null;
  latencyMs: number | null;
  offlineQueueCount: number;

  // Actions
  setOnline: (online: boolean) => void;
  setReconnecting: (reconnecting: boolean) => void;
  incrementQueue: () => void;
  decrementQueue: () => void;
  clearQueue: () => void;
  checkConnection: () => Promise<boolean>;
}

export const useNetworkStore = create<NetworkState>((set, get) => ({
  isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
  isReconnecting: false,
  lastOnlineAt: Date.now(),
  lastOfflineAt: null,
  latencyMs: null,
  offlineQueueCount: 0,

  setOnline: (online) => {
    const wasOffline = !get().isOnline;
    set({
      isOnline: online,
      isReconnecting: false,
      lastOnlineAt: online ? Date.now() : get().lastOnlineAt,
      lastOfflineAt: !online ? Date.now() : get().lastOfflineAt,
    });

    if (wasOffline && online) {
      console.log('[NetworkStore] Koneksi internet kembali online. Menyinkronkan antrean...');
    }
  },

  setReconnecting: (reconnecting) => set({ isReconnecting: reconnecting }),

  incrementQueue: () => set((state) => ({ offlineQueueCount: state.offlineQueueCount + 1 })),
  decrementQueue: () =>
    set((state) => ({ offlineQueueCount: Math.max(0, state.offlineQueueCount - 1) })),
  clearQueue: () => set({ offlineQueueCount: 0 }),

  checkConnection: async () => {
    if (typeof window === 'undefined') return true;

    set({ isReconnecting: true });
    const startTime = Date.now();

    try {
      // Ping health check backend
      const host = window.location.hostname || 'localhost';
      const response = await fetch(`http://${host}:4000/health`, {
        method: 'GET',
        cache: 'no-cache',
        signal: AbortSignal.timeout(4000),
      });

      const latency = Date.now() - startTime;
      const online = response.ok;

      set({
        isOnline: online,
        isReconnecting: false,
        latencyMs: latency,
        lastOnlineAt: online ? Date.now() : get().lastOnlineAt,
      });

      return online;
    } catch {
      set({
        isOnline: false,
        isReconnecting: false,
        latencyMs: null,
        lastOfflineAt: Date.now(),
      });
      return false;
    }
  },
}));

// Global Network Event Listeners (Web & Hybrid)
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    useNetworkStore.getState().setOnline(true);
    useNetworkStore.getState().checkConnection();
  });

  window.addEventListener('offline', () => {
    useNetworkStore.getState().setOnline(false);
  });
}
