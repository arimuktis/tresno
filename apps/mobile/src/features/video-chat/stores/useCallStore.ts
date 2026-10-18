import { create } from 'zustand';
import { MatchFoundPayload } from '@tresno/shared';

export type CallStage = 'idle' | 'searching' | 'connecting' | 'in_call' | 'ended';

interface CallState {
  stage: CallStage;
  activeMatch: MatchFoundPayload | null;
  trialSecondsRemaining: number;
  callDurationSeconds: number;
  isMuted: boolean;
  isVideoEnabled: boolean;
  endReason: string | null;

  startSearching: () => void;
  matchFound: (match: MatchFoundPayload) => void;
  decrementTrial: () => void;
  incrementDuration: () => void;
  toggleMute: () => void;
  toggleVideo: () => void;
  endCall: (reason?: string) => void;
  resetCall: () => void;
}

export const useCallStore = create<CallState>((set) => ({
  stage: 'idle',
  activeMatch: null,
  trialSecondsRemaining: 20,
  callDurationSeconds: 0,
  isMuted: false,
  isVideoEnabled: true,
  endReason: null,

  startSearching: () => set({ stage: 'searching', endReason: null }),
  matchFound: (match) => {
    // Update live presence: user and peer are now in call ('busy' merah pink)
    try {
      const { usePresenceStore } = require('../../../shared/stores/usePresenceStore');
      usePresenceStore.getState().setMyStatus('busy');
      if (match.peer?.id) {
        usePresenceStore.getState().setUserStatus(match.peer.id, 'busy', match.channelId);
      }
    } catch (_) {}

    set({
      stage: 'in_call',
      activeMatch: match,
      trialSecondsRemaining: match.freeChatSeconds,
      callDurationSeconds: 0,
    });
  },
  decrementTrial: () => set((state) => ({
    trialSecondsRemaining: Math.max(0, state.trialSecondsRemaining - 1),
  })),
  incrementDuration: () => set((state) => ({
    callDurationSeconds: state.callDurationSeconds + 1,
  })),
  toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),
  toggleVideo: () => set((state) => ({ isVideoEnabled: !state.isVideoEnabled })),
  endCall: (reason = 'user_ended') => {
    // Revert live presence: user and peer become available again ('available' ijo)
    try {
      const { usePresenceStore } = require('../../../shared/stores/usePresenceStore');
      usePresenceStore.getState().setMyStatus('available');
      const activeMatch = useCallStore.getState().activeMatch;
      if (activeMatch?.peer?.id) {
        usePresenceStore.getState().setUserStatus(activeMatch.peer.id, 'available');
      }
    } catch (_) {}

    set({
      stage: 'idle',
      activeMatch: null,
      trialSecondsRemaining: 20,
      callDurationSeconds: 0,
      endReason: reason,
    });
  },
  resetCall: () => set({
    stage: 'idle',
    activeMatch: null,
    trialSecondsRemaining: 20,
    callDurationSeconds: 0,
    endReason: null,
  }),
}));
