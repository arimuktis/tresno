export type Gender = 'male' | 'female' | 'all';
export type UserPresenceStatus = 'available' | 'busy' | 'offline';

export interface UserProfile {
  id: string;
  username: string;
  nickname: string;
  avatarUrl?: string;
  gender: Gender;
  birthdate?: string;
  bio?: string;
  coinBalance: number;
  diamondBalance: number;
  isHost: boolean;
  isOnline: boolean;
  presenceStatus?: UserPresenceStatus;
  isBanned: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserSummary {
  id: string;
  nickname: string;
  avatarUrl?: string;
  gender: Gender;
  level: number;
}
