import { create } from 'zustand';
import { ChuckerTransaction, ChuckerFilter, ChuckerStats } from './types';

const MAX_TRANSACTIONS = 200;
const STORAGE_BUBBLE_KEY = 'tresno_chucker_bubble_visible';

const getInitialBubbleVisible = (): boolean => {
  if (typeof window !== 'undefined' && window.localStorage) {
    const val = window.localStorage.getItem(STORAGE_BUBBLE_KEY);
    if (val !== null) return val === 'true';
  }
  return true; // Default aktif untuk mempermudah QA & developer
};

const saveBubbleVisible = (visible: boolean) => {
  if (typeof window !== 'undefined' && window.localStorage) {
    window.localStorage.setItem(STORAGE_BUBBLE_KEY, visible ? 'true' : 'false');
  }
};

interface ChuckerState {
  transactions: ChuckerTransaction[];
  isOpen: boolean;
  isBubbleVisible: boolean;
  selectedTransactionId: string | null;
  filter: ChuckerFilter;
  searchQuery: string;

  // Actions
  addTransaction: (tx: ChuckerTransaction) => void;
  updateTransaction: (id: string, updates: Partial<ChuckerTransaction>) => void;
  clearTransactions: () => void;
  setOpen: (open: boolean) => void;
  toggleOpen: () => void;
  setBubbleVisible: (visible: boolean) => void;
  selectTransaction: (id: string | null) => void;
  setFilter: (filter: ChuckerFilter) => void;
  setSearchQuery: (query: string) => void;

  // Getters
  getStats: () => ChuckerStats;
  getFilteredTransactions: () => ChuckerTransaction[];
}

export const useChuckerStore = create<ChuckerState>((set, get) => ({
  transactions: [],
  isOpen: false,
  isBubbleVisible: getInitialBubbleVisible(),
  selectedTransactionId: null,
  filter: 'all',
  searchQuery: '',

  addTransaction: (tx) =>
    set((state) => {
      // Circular buffer capped at MAX_TRANSACTIONS
      const updated = [tx, ...state.transactions].slice(0, MAX_TRANSACTIONS);
      return { transactions: updated };
    }),

  updateTransaction: (id, updates) =>
    set((state) => ({
      transactions: state.transactions.map((tx) =>
        tx.id === id ? { ...tx, ...updates } : tx
      ),
    })),

  clearTransactions: () =>
    set({
      transactions: [],
      selectedTransactionId: null,
    }),

  setOpen: (open) => set({ isOpen: open }),
  toggleOpen: () => set((state) => ({ isOpen: !state.isOpen })),

  setBubbleVisible: (visible) => {
    saveBubbleVisible(visible);
    set({ isBubbleVisible: visible });
  },

  selectTransaction: (id) => set({ selectedTransactionId: id }),

  setFilter: (filter) => set({ filter }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),

  getStats: () => {
    const { transactions } = get();
    let success = 0;
    let errors = 0;
    let ws = 0;
    let pending = 0;

    for (const tx of transactions) {
      if (tx.isPending) {
        pending++;
      } else if (tx.protocol === 'WS') {
        ws++;
        if (tx.method === 'WS-ERROR' || tx.error) errors++;
      } else if (tx.statusCode && tx.statusCode >= 200 && tx.statusCode < 400) {
        success++;
      } else if (tx.statusCode && tx.statusCode >= 400) {
        errors++;
      } else if (tx.error) {
        errors++;
      }
    }

    return {
      total: transactions.length,
      success,
      errors,
      ws,
      pending,
    };
  },

  getFilteredTransactions: () => {
    const { transactions, filter, searchQuery } = get();
    const query = searchQuery.trim().toLowerCase();

    return transactions.filter((tx) => {
      // 1. Filter Chip
      if (filter === 'errors') {
        const isErr =
          (tx.statusCode && tx.statusCode >= 400) ||
          tx.method === 'WS-ERROR' ||
          Boolean(tx.error);
        if (!isErr) return false;
      } else if (filter === 'http') {
        if (tx.protocol === 'WS') return false;
      } else if (filter === 'ws') {
        if (tx.protocol !== 'WS') return false;
      } else if (filter === 'pending') {
        if (!tx.isPending) return false;
      }

      // 2. Search Query
      if (query) {
        const matchUrl = tx.url.toLowerCase().includes(query);
        const matchPath = tx.path.toLowerCase().includes(query);
        const matchMethod = tx.method.toLowerCase().includes(query);
        const matchStatus = tx.statusCode ? tx.statusCode.toString().includes(query) : false;
        const matchBody = tx.requestBodyRaw?.toLowerCase().includes(query) ||
          tx.responseBodyRaw?.toLowerCase().includes(query);

        return matchUrl || matchPath || matchMethod || matchStatus || matchBody;
      }

      return true;
    });
  },
}));
