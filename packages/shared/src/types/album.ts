import { ModerationStatus, ModerationCategory } from './moderation.js';

export const MAX_ALBUM_PHOTOS = 8;

export interface AlbumPhoto {
  id: string;
  userId: string;
  url: string;
  caption?: string;
  status: ModerationStatus;
  violationCategory?: ModerationCategory;
  violationReason?: string;
  flaggedKeywords?: string[];
  isCover?: boolean;
  createdAt: number;
  reviewedAt?: number;
}

export interface AddPhotoPayload {
  url: string;
  caption?: string;
  isCover?: boolean;
}
