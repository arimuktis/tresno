import { create } from 'zustand';
import { AnchorData } from '../../../shared/components/organisms/AnchorCard';

interface AnchorDetailState {
  selectedAnchor: AnchorData | null;
  isOpen: boolean;
  openAnchorDetail: (anchor: AnchorData) => void;
  closeAnchorDetail: () => void;
}

export const useAnchorDetailStore = create<AnchorDetailState>((set) => ({
  selectedAnchor: null,
  isOpen: false,
  openAnchorDetail: (anchor) => set({ selectedAnchor: anchor, isOpen: true }),
  closeAnchorDetail: () => set({ selectedAnchor: null, isOpen: false }),
}));
