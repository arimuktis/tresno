import { create } from 'zustand';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
  duration: number;
  action?: {
    label: string;
    onPress: () => void;
  };
}

interface ToastState {
  toasts: ToastItem[];
  show: (
    message: string,
    type?: ToastType,
    options?: { duration?: number; action?: { label: string; onPress: () => void } }
  ) => string;
  success: (message: string, duration?: number) => string;
  error: (message: string, duration?: number) => string;
  warning: (message: string, duration?: number) => string;
  info: (message: string, duration?: number) => string;
  hide: (id: string) => void;
  clear: () => void;
}

export const useToastStore = create<ToastState>((set, get) => ({
  toasts: [],

  show: (message, type = 'info', options) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const duration = options?.duration ?? 3500;

    const newToast: ToastItem = {
      id,
      message,
      type,
      duration,
      action: options?.action,
    };

    set((state) => ({
      toasts: [...state.toasts.slice(-2), newToast],
    }));

    if (duration > 0) {
      setTimeout(() => {
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        }));
      }, duration);
    }

    return id;
  },

  success: (message, duration) => get().show(message, 'success', { duration }),
  error: (message, duration) => get().show(message, 'error', { duration }),
  warning: (message, duration) => get().show(message, 'warning', { duration }),
  info: (message, duration) => get().show(message, 'info', { duration }),

  hide: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),

  clear: () => set({ toasts: [] }),
}));

// Export shortcut helper
export const toast = {
  show: (msg: string, type?: ToastType) => useToastStore.getState().show(msg, type),
  success: (msg: string, dur?: number) => useToastStore.getState().success(msg, dur),
  error: (msg: string, dur?: number) => useToastStore.getState().error(msg, dur),
  warning: (msg: string, dur?: number) => useToastStore.getState().warning(msg, dur),
  info: (msg: string, dur?: number) => useToastStore.getState().info(msg, dur),
  hide: (id: string) => useToastStore.getState().hide(id),
};
