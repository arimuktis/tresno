import { create } from 'zustand';
import {
  NotificationPayload,
  IncomingCallRequestPayload,
  IncomingCallResponsePayload,
} from '@tresno/shared';
import { soundService } from '../../../shared/services/soundService';
import { socketService } from '../../../shared/services/socketService';

interface NotificationState {
  notifications: NotificationPayload[];
  unreadCount: number;
  activeBanner: NotificationPayload | null;
  incomingCall: IncomingCallRequestPayload | null;
  soundEnabled: boolean;

  // Actions
  receiveNotification: (payload: NotificationPayload) => void;
  receiveIncomingCall: (payload: IncomingCallRequestPayload) => void;
  acceptIncomingCall: () => IncomingCallRequestPayload | null;
  declineIncomingCall: (reason?: 'user_declined' | 'busy' | 'timeout') => void;
  dismissBanner: () => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
  setSoundEnabled: (enabled: boolean) => void;
  toggleSound: () => void;
}

let bannerTimer: any = null;

const INITIAL_NOTIFICATIONS: NotificationPayload[] = [
  {
    id: 'notif_welcome',
    type: 'system_promo',
    title: 'Selamat Datang di Tresno!',
    body: 'Nikmati video call real-time dengan host favorit dan dapatkan bonus koin harian.',
    timestamp: Date.now() - 3600000,
    read: true,
  },
  {
    id: 'notif_promo_1',
    type: 'system_promo',
    title: 'Diskon 50% Top-Up QRIS',
    body: 'Dapatkan 300 koin + 100 bonus hanya Rp 50.000 hari ini saja.',
    timestamp: Date.now() - 1800000,
    read: false,
  },
];

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: INITIAL_NOTIFICATIONS,
  unreadCount: 1,
  activeBanner: null,
  incomingCall: null,
  soundEnabled: true,

  receiveNotification: (payload) => {
    // 1. Play sound
    if (get().soundEnabled) {
      switch (payload.type) {
        case 'chat_message':
          soundService.playMessageChime();
          break;
        case 'gift_received':
        case 'wallet_topup':
          soundService.playGiftChime();
          break;
        case 'match_found':
          soundService.playMatchFoundChime();
          break;
        case 'system_promo':
        default:
          soundService.playPromoChime();
          break;
      }
    }

    // 2. Add to store
    set((state) => {
      // Deduplicate if already exists
      const exists = state.notifications.some((n) => n.id === payload.id);
      const updatedList = exists
        ? state.notifications.map((n) => (n.id === payload.id ? payload : n))
        : [payload, ...state.notifications];

      return {
        notifications: updatedList,
        unreadCount: exists ? state.unreadCount : state.unreadCount + 1,
        activeBanner: payload,
      };
    });

    // 3. Auto dismiss floating banner after 4.5s
    if (bannerTimer) clearTimeout(bannerTimer);
    bannerTimer = setTimeout(() => {
      set({ activeBanner: null });
    }, 4500);
  },

  receiveIncomingCall: (payload) => {
    // Start pleasant ringtone loop
    if (get().soundEnabled) {
      soundService.playIncomingCallRingtone();
    }
    set({ incomingCall: payload });
  },

  acceptIncomingCall: () => {
    soundService.stopIncomingCallRingtone();
    const call = get().incomingCall;
    if (call) {
      socketService.send('RESPOND_INCOMING_CALL', {
        callId: call.callId,
        channelId: call.channelId,
        accepted: true,
      });
      set({ incomingCall: null });
      return call;
    }
    return null;
  },

  declineIncomingCall: (reason = 'user_declined') => {
    soundService.stopIncomingCallRingtone();
    const call = get().incomingCall;
    if (call) {
      socketService.send('RESPOND_INCOMING_CALL', {
        callId: call.callId,
        channelId: call.channelId,
        accepted: false,
        reason,
      });
      set({ incomingCall: null });
    }
  },

  dismissBanner: () => {
    if (bannerTimer) clearTimeout(bannerTimer);
    set({ activeBanner: null });
  },

  markAsRead: (id) => {
    set((state) => {
      let newlyRead = false;
      const updated = state.notifications.map((n) => {
        if (n.id === id && !n.read) {
          newlyRead = true;
          return { ...n, read: true };
        }
        return n;
      });
      return {
        notifications: updated,
        unreadCount: newlyRead ? Math.max(0, state.unreadCount - 1) : state.unreadCount,
      };
    });
  },

  markAllAsRead: () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    }));
  },

  clearAll: () => {
    set({
      notifications: [],
      unreadCount: 0,
      activeBanner: null,
    });
  },

  setSoundEnabled: (enabled) => {
    soundService.setSoundEnabled(enabled);
    set({ soundEnabled: enabled });
  },

  toggleSound: () => {
    const next = !get().soundEnabled;
    soundService.setSoundEnabled(next);
    set({ soundEnabled: next });
  },
}));
