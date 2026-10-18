import { ModerationStatus, ModerationCategory } from './moderation.js';

export type StoryMediaType = 'image' | 'video';

export interface StoryItem {
  id: string;
  mediaUrl: string;
  mediaType: StoryMediaType;
  caption?: string;
  createdAt: number;
  expiresAt: number; // 24 jam setelah dibuat (TTL)
  viewsCount: number;
  likesCount: number;
  hasLiked?: boolean;
  hasViewed?: boolean;
  status?: ModerationStatus;
  violationCategory?: ModerationCategory;
  violationReason?: string;
  flaggedKeywords?: string[];
}

export interface UserStoryGroup {
  userId: string;
  username: string;
  avatar: string;
  isHost: boolean;
  isVerified?: boolean;
  hasUnseen: boolean;
  stories: StoryItem[];
}

export interface StoryUploadPayload {
  userId: string;
  mediaType: StoryMediaType;
  caption?: string;
  mediaUrl: string;
  username?: string;
  avatar?: string;
  isHost?: boolean;
}
