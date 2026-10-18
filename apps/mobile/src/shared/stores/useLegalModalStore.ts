import { create } from 'zustand';

export type LegalDocType = 'terms' | 'privacy';

interface LegalModalState {
  isOpen: boolean;
  activeDoc: LegalDocType;
  open: (type?: LegalDocType) => void;
  close: () => void;
  setActiveDoc: (type: LegalDocType) => void;
}

export const useLegalModalStore = create<LegalModalState>((set) => ({
  isOpen: false,
  activeDoc: 'terms',
  open: (type = 'terms') => set({ isOpen: true, activeDoc: type }),
  close: () => set({ isOpen: false }),
  setActiveDoc: (type) => set({ activeDoc: type }),
}));
