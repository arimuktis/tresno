export type Gender = 'male' | 'female' | 'all';
export type UserPresenceStatus = 'available' | 'busy' | 'offline';

export interface VisitorItem {
  id: string;
  userId: string;
  nickname: string;
  avatarUrl?: string;
  isVerified?: boolean;
  gender: Gender;
  age: number;
  country: string;
  countryFlag: string;
  visitedAt: string; // ISO timestamp
}

export interface LevelTier {
  level: number;
  requiredTopup: number;
  label: string;
  color: string;
  badgeBg: string;
  textColor: string;
  dailyBonusCoins: number;
}

export const LEVEL_TIERS: LevelTier[] = [
  { level: 0, requiredTopup: 0, label: 'Lv0', color: '#8E8E93', badgeBg: '#F2F2F7', textColor: '#636366', dailyBonusCoins: 5 },
  { level: 1, requiredTopup: 100, label: 'Lv1', color: '#00C853', badgeBg: '#E8F5E9', textColor: '#2E7D32', dailyBonusCoins: 10 },
  { level: 2, requiredTopup: 1000, label: 'Lv2', color: '#FF9100', badgeBg: '#FFF3E0', textColor: '#E65100', dailyBonusCoins: 20 },
  { level: 3, requiredTopup: 3000, label: 'Lv3', color: '#00B0FF', badgeBg: '#E1F5FE', textColor: '#0277BD', dailyBonusCoins: 35 },
  { level: 4, requiredTopup: 10000, label: 'Lv4', color: '#2979FF', badgeBg: '#E3F2FD', textColor: '#1565C0', dailyBonusCoins: 60 },
  { level: 5, requiredTopup: 30000, label: 'Lv5', color: '#651FFF', badgeBg: '#EDE7F6', textColor: '#4527A0', dailyBonusCoins: 100 },
  { level: 6, requiredTopup: 100000, label: 'Lv6', color: '#D500F9', badgeBg: '#F3E5F5', textColor: '#6A1B9A', dailyBonusCoins: 200 },
  { level: 7, requiredTopup: 300000, label: 'Lv7', color: '#FF1744', badgeBg: '#FFEBEE', textColor: '#C62828', dailyBonusCoins: 500 },
  { level: 8, requiredTopup: 1000000, label: 'Lv8', color: '#FFB800', badgeBg: '#FFF8E1', textColor: '#F57F17', dailyBonusCoins: 1200 },
  { level: 9, requiredTopup: 3000000, label: 'Lv9', color: '#FF6D00', badgeBg: '#FFF3E0', textColor: '#BF360C', dailyBonusCoins: 3000 },
];

export const calculateUserLevel = (historicalTopup: number = 0): LevelTier => {
  let matched = LEVEL_TIERS[0];
  for (const tier of LEVEL_TIERS) {
    if (historicalTopup >= tier.requiredTopup) {
      matched = tier;
    } else {
      break;
    }
  }
  return matched;
};

export const getNextLevelProgress = (historicalTopup: number = 0): {
  currentTier: LevelTier;
  nextTier: LevelTier | null;
  progressPercent: number;
  tokensNeeded: number;
} => {
  const currentTier = calculateUserLevel(historicalTopup);
  const nextTierIndex = LEVEL_TIERS.findIndex((t) => t.level === currentTier.level) + 1;
  const nextTier = nextTierIndex < LEVEL_TIERS.length ? LEVEL_TIERS[nextTierIndex] : null;

  if (!nextTier) {
    return {
      currentTier,
      nextTier: null,
      progressPercent: 100,
      tokensNeeded: 0,
    };
  }

  const range = nextTier.requiredTopup - currentTier.requiredTopup;
  const currentInTier = Math.max(0, historicalTopup - currentTier.requiredTopup);
  const progressPercent = Math.min(100, Math.max(0, Math.round((currentInTier / range) * 100)));
  const tokensNeeded = Math.max(0, nextTier.requiredTopup - historicalTopup);

  return {
    currentTier,
    nextTier,
    progressPercent,
    tokensNeeded,
  };
};

export interface UserProfile {
  id: string;
  username: string;
  nickname: string;
  avatarUrl?: string;
  gender: Gender;
  birthdate?: string;
  bio?: string;
  country?: string;
  countryCode?: string;
  countryFlag?: string;
  hashtags?: string[];
  isVerified?: boolean;
  historicalTopup?: number;
  level?: number;
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
  isVerified?: boolean;
  countryFlag?: string;
}

