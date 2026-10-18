import { create } from 'zustand';
import { soundService } from '../../../shared/services/soundService';
import { toast } from '../../../shared/stores/useToastStore';

interface WalletState {
  coinBalance: number;
  pointsBalance: number;
  diamondBalance: number; // Backward compatibility alias
  chatCoupons: number; // Kupon Chat Gratis ala Tigo
  matchCoupons: number; // Kupon Matchmaking Gratis (20 Detik Pertama Gratis)
  hasClaimedStarterPack: boolean; // Status klaim Paket Perdana Gentleman VIP Rp 9.900
  isStarterPackModalOpen: boolean;
  isTopupModalVisible: boolean;

  setCoins: (amount: number) => void;
  deductCoins: (amount: number) => void;
  addCoins: (amount: number) => void;

  setPoints: (amount: number) => void;
  addPoints: (amount: number) => void;
  deductPoints: (amount: number) => void;

  setChatCoupons: (amount: number) => void;
  addChatCoupons: (amount: number) => void;
  useChatCoupon: () => boolean;

  setMatchCoupons: (amount: number) => void;
  addMatchCoupons: (amount: number) => void;
  useMatchCoupon: () => boolean;

  openStarterPackModal: () => void;
  closeStarterPackModal: () => void;
  buyStarterPack: () => void;

  setDiamonds: (amount: number) => void; // Backward compatibility
  openTopupModal: () => void;
  closeTopupModal: () => void;
}

export const MIN_HOST_CASHOUT_POINTS = 2000; // Standar Tigo: minimal 2000 points ($20 USD / ~Rp 200.000)

const STORAGE_COINS_KEY = 'tresno_wallet_coins';
const STORAGE_POINTS_KEY = 'tresno_wallet_points';
const STORAGE_COUPONS_KEY = 'tresno_wallet_coupons';
const STORAGE_MATCH_COUPONS_KEY = 'tresno_wallet_match_coupons';
const STORAGE_STARTER_PACK_KEY = 'tresno_claimed_starter_pack';

const getInitialCoins = (): number => {
  if (typeof window !== 'undefined' && window.localStorage) {
    const val = window.localStorage.getItem(STORAGE_COINS_KEY);
    if (val !== null) {
      const parsed = parseInt(val, 10);
      if (!isNaN(parsed)) return parsed;
    }
  }
  return 50; // Welcome bonus
};

const getInitialPoints = (): number => {
  if (typeof window !== 'undefined' && window.localStorage) {
    const val = window.localStorage.getItem(STORAGE_POINTS_KEY);
    if (val !== null) {
      const parsed = parseFloat(val);
      if (!isNaN(parsed)) return parsed;
    }
  }
  return 1250;
};

const getInitialCoupons = (): number => {
  if (typeof window !== 'undefined' && window.localStorage) {
    const val = window.localStorage.getItem(STORAGE_COUPONS_KEY);
    if (val !== null) {
      const parsed = parseInt(val, 10);
      if (!isNaN(parsed)) return parsed;
    }
  }
  return 2;
};

const saveCoins = (coins: number) => {
  if (typeof window !== 'undefined' && window.localStorage) {
    window.localStorage.setItem(STORAGE_COINS_KEY, coins.toString());
  }
};

const savePoints = (points: number) => {
  if (typeof window !== 'undefined' && window.localStorage) {
    window.localStorage.setItem(STORAGE_POINTS_KEY, points.toString());
  }
};

const saveCoupons = (coupons: number) => {
  if (typeof window !== 'undefined' && window.localStorage) {
    window.localStorage.setItem(STORAGE_COUPONS_KEY, coupons.toString());
  }
};

const getInitialMatchCoupons = (): number => {
  if (typeof window !== 'undefined' && window.localStorage) {
    const val = window.localStorage.getItem(STORAGE_MATCH_COUPONS_KEY);
    if (val !== null) {
      const parsed = parseInt(val, 10);
      if (!isNaN(parsed)) return parsed;
    }
  }
  return 2; // 2 kupon matchmaking gratis untuk user baru
};

const saveMatchCoupons = (coupons: number) => {
  if (typeof window !== 'undefined' && window.localStorage) {
    window.localStorage.setItem(STORAGE_MATCH_COUPONS_KEY, coupons.toString());
  }
};

const getInitialStarterPackClaimed = (): boolean => {
  if (typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage.getItem(STORAGE_STARTER_PACK_KEY) === 'true';
  }
  return false;
};

const saveStarterPackClaimed = (claimed: boolean) => {
  if (typeof window !== 'undefined' && window.localStorage) {
    window.localStorage.setItem(STORAGE_STARTER_PACK_KEY, claimed ? 'true' : 'false');
  }
};

export const useWalletStore = create<WalletState>((set, get) => ({
  coinBalance: getInitialCoins(),
  pointsBalance: getInitialPoints(),
  diamondBalance: getInitialPoints(), // Alias
  chatCoupons: getInitialCoupons(),
  matchCoupons: getInitialMatchCoupons(),
  hasClaimedStarterPack: getInitialStarterPackClaimed(),
  isStarterPackModalOpen: false,
  isTopupModalVisible: false,

  setCoins: (amount) => {
    saveCoins(amount);
    set({ coinBalance: amount });
  },
  deductCoins: (amount) =>
    set((state) => {
      const newBalance = Math.max(0, state.coinBalance - amount);
      saveCoins(newBalance);
      return { coinBalance: newBalance };
    }),
  addCoins: (amount) =>
    set((state) => {
      const newBalance = state.coinBalance + amount;
      saveCoins(newBalance);
      return { coinBalance: newBalance };
    }),

  setPoints: (amount) => {
    const val = Math.round(amount * 100) / 100;
    savePoints(val);
    set({ pointsBalance: val, diamondBalance: val });
  },
  addPoints: (amount) =>
    set((state) => {
      const newVal = Math.round((state.pointsBalance + amount) * 100) / 100;
      savePoints(newVal);
      return {
        pointsBalance: newVal,
        diamondBalance: newVal,
      };
    }),
  deductPoints: (amount) =>
    set((state) => {
      const newVal = Math.max(0, Math.round((state.pointsBalance - amount) * 100) / 100);
      savePoints(newVal);
      return {
        pointsBalance: newVal,
        diamondBalance: newVal,
      };
    }),

  setChatCoupons: (amount) => {
    const clamped = Math.max(0, amount);
    saveCoupons(clamped);
    set({ chatCoupons: clamped });
  },
  addChatCoupons: (amount) =>
    set((state) => {
      const newVal = state.chatCoupons + amount;
      saveCoupons(newVal);
      return { chatCoupons: newVal };
    }),
  useChatCoupon: () => {
    const { chatCoupons } = get();
    if (chatCoupons > 0) {
      const newVal = chatCoupons - 1;
      saveCoupons(newVal);
      set({ chatCoupons: newVal });
      return true;
    }
    return false;
  },

  setMatchCoupons: (amount) => {
    const clamped = Math.max(0, amount);
    saveMatchCoupons(clamped);
    set({ matchCoupons: clamped });
  },
  addMatchCoupons: (amount) =>
    set((state) => {
      const newVal = state.matchCoupons + amount;
      saveMatchCoupons(newVal);
      return { matchCoupons: newVal };
    }),
  useMatchCoupon: () => {
    const { matchCoupons } = get();
    if (matchCoupons > 0) {
      const newVal = matchCoupons - 1;
      saveMatchCoupons(newVal);
      set({ matchCoupons: newVal });
      return true;
    }
    return false;
  },

  setDiamonds: (amount) => {
    const val = Math.round(amount * 100) / 100;
    savePoints(val);
    set({ diamondBalance: val, pointsBalance: val });
  },

  openStarterPackModal: () => {
    soundService.playPromoChime();
    set({ isStarterPackModalOpen: true });
  },
  closeStarterPackModal: () => set({ isStarterPackModalOpen: false }),

  buyStarterPack: () => {
    const currentCoins = get().coinBalance;
    const currentCoupons = get().matchCoupons;

    const newCoins = currentCoins + 120;
    const newCoupons = currentCoupons + 5;

    saveCoins(newCoins);
    saveMatchCoupons(newCoupons);
    saveStarterPackClaimed(true);

    set({
      coinBalance: newCoins,
      matchCoupons: newCoupons,
      hasClaimedStarterPack: true,
      isStarterPackModalOpen: false,
    });

    soundService.playGiftChime();
    toast.success('Paket Perdana Gentleman VIP Berhasil Diaktifkan! 120 Koin & 5 Kupon Ditambahkan');
  },

  openTopupModal: () => set({ isTopupModalVisible: true }),
  closeTopupModal: () => set({ isTopupModalVisible: false }),
}));
