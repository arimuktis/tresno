import { Gender, UserSummary } from './user.js';

export type MatchStatus = 'searching' | 'paired' | 'connecting' | 'connected' | 'ended';

export interface MatchFilter {
  targetRegion?: 'all' | 'id' | 'global';
  targetGender?: Gender;
}

export interface MatchRequestPayload {
  userId: string;
  filter: MatchFilter;
}

export interface MatchFoundPayload {
  channelId: string;
  agoraToken: string;
  agoraUid: number;
  peer: UserSummary;
  freeChatSeconds: number;
  billingIntervalSeconds: number;
  costPerInterval: number;
  isHostCaller: boolean;
}

export interface CallEndedPayload {
  channelId: string;
  reason: 'user_hungup' | 'peer_hungup' | 'insufficient_balance' | 'nsfw_detected' | 'timeout';
  durationSeconds: number;
  totalCoinsSpent: number;
  totalDiamondsEarned: number;
}
