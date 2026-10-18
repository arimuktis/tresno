import { StoryItem, UserStoryGroup } from '@tresno/shared';
import { supabase, isSupabaseConfigured, STORY_BUCKET } from './supabaseClient';

// Simulasi data story aktif awal dari host online (Dewi, Bella, Nadia, Luna)
const INITIAL_HOST_STORIES: UserStoryGroup[] = [
  {
    userId: 'anchor_1',
    username: 'Dewi Lestari',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300',
    isHost: true,
    isVerified: true,
    hasUnseen: true,
    stories: [
      {
        id: 'story_dewi_1',
        mediaUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800',
        mediaType: 'image',
        caption: 'Lagi santai di coffee shop Jakarta. Ada yang mau ngobrol?',
        createdAt: Date.now() - 2 * 60 * 60 * 1000, // 2 jam lalu
        expiresAt: Date.now() + 22 * 60 * 60 * 1000, // 22 jam lagi
        viewsCount: 142,
        likesCount: 38,
      },
      {
        id: 'story_dewi_2',
        mediaUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800',
        mediaType: 'image',
        caption: 'Malam ini live sampai jam 12 ya! Tap Panggil Video untuk ngobrol langsung',
        createdAt: Date.now() - 30 * 60 * 1000, // 30 menit lalu
        expiresAt: Date.now() + 23.5 * 60 * 60 * 1000,
        viewsCount: 89,
        likesCount: 24,
      },
    ],
  },
  {
    userId: 'anchor_2',
    username: 'Bella Putri',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300',
    isHost: true,
    isVerified: true,
    hasUnseen: true,
    stories: [
      {
        id: 'story_bella_1',
        mediaUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800',
        mediaType: 'image',
        caption: 'Streaming game Valorant malam ini. Yuk mabar!',
        createdAt: Date.now() - 4 * 60 * 60 * 1000,
        expiresAt: Date.now() + 20 * 60 * 60 * 1000,
        viewsCount: 230,
        likesCount: 76,
      },
    ],
  },
  {
    userId: 'anchor_4',
    username: 'Luna Maya',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300',
    isHost: true,
    isVerified: true,
    hasUnseen: true,
    stories: [
      {
        id: 'story_luna_1',
        mediaUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800',
        mediaType: 'image',
        caption: 'Sunset di Pantai Kuta Bali indah banget sore ini',
        createdAt: Date.now() - 5 * 60 * 60 * 1000,
        expiresAt: Date.now() + 19 * 60 * 60 * 1000,
        viewsCount: 412,
        likesCount: 120,
      },
    ],
  },
];

class StoryManager {
  private storyGroups: Map<string, UserStoryGroup> = new Map();
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    INITIAL_HOST_STORIES.forEach((group) => {
      this.storyGroups.set(group.userId, group);
    });

    // Jalankan worker pembersih cerita expired (24-hour TTL) setiap 10 menit
    this.cleanupInterval = setInterval(() => {
      this.purgeExpiredStories();
    }, 10 * 60 * 1000);
  }

  public getActiveStories(): UserStoryGroup[] {
    const now = Date.now();
    const result: UserStoryGroup[] = [];

    this.storyGroups.forEach((group) => {
      // Filter hanya cerita yang belum expired (< 24 jam)
      const validStories = group.stories.filter((s) => s.expiresAt > now);
      if (validStories.length > 0) {
        result.push({
          ...group,
          stories: validStories,
        });
      }
    });

    return result;
  }

  public addStory(
    userId: string,
    username: string,
    avatar: string,
    isHost: boolean,
    mediaUrl: string,
    mediaType: 'image' | 'video' = 'image',
    caption?: string,
    moderation?: {
      status?: 'approved' | 'pending_review' | 'rejected';
      violationCategory?: 'sara' | 'pornography' | 'clean' | 'other';
      violationReason?: string;
      flaggedKeywords?: string[];
    }
  ): StoryItem {
    const now = Date.now();
    const TTL_24_HOURS = 24 * 60 * 60 * 1000;

    const newStory: StoryItem = {
      id: `story_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      mediaUrl,
      mediaType,
      caption,
      createdAt: now,
      expiresAt: now + TTL_24_HOURS,
      viewsCount: 0,
      likesCount: 0,
      status: moderation?.status || 'approved',
      violationCategory: moderation?.violationCategory,
      violationReason: moderation?.violationReason,
      flaggedKeywords: moderation?.flaggedKeywords,
    };

    let group = this.storyGroups.get(userId);
    if (!group) {
      group = {
        userId,
        username,
        avatar,
        isHost,
        hasUnseen: true,
        stories: [newStory],
      };
      this.storyGroups.set(userId, group);
    } else {
      group.stories.unshift(newStory);
      group.hasUnseen = true;
    }

    return newStory;
  }

  public recordView(storyId: string) {
    this.storyGroups.forEach((group) => {
      const story = group.stories.find((s) => s.id === storyId);
      if (story) {
        story.viewsCount += 1;
        story.hasViewed = true;
      }
    });
  }

  public recordLike(storyId: string) {
    this.storyGroups.forEach((group) => {
      const story = group.stories.find((s) => s.id === storyId);
      if (story) {
        story.likesCount += 1;
        story.hasLiked = true;
      }
    });
  }

  /**
   * 24-Hour TTL Auto-Purge Worker
   * Menghapus cerita dari database dan storage Supabase saat waktu 24 jam habis.
   */
  public async purgeExpiredStories() {
    const now = Date.now();
    const expiredStoragePaths: string[] = [];

    this.storyGroups.forEach((group, userId) => {
      const expiredStories = group.stories.filter((s) => s.expiresAt <= now);
      const activeStories = group.stories.filter((s) => s.expiresAt > now);

      expiredStories.forEach((story) => {
        console.log(`🗑️ [StoryWorker] Story ${story.id} (${story.caption || 'no caption'}) has expired (24h TTL) and will be deleted forever.`);

        // Jika URL berasal dari Supabase, kumpulkan path untuk dihapus
        if (story.mediaUrl.includes(STORY_BUCKET)) {
          const parts = story.mediaUrl.split(`${STORY_BUCKET}/`);
          if (parts[1]) {
            expiredStoragePaths.push(parts[1]);
          }
        }
      });

      if (activeStories.length === 0) {
        this.storyGroups.delete(userId);
      } else {
        group.stories = activeStories;
      }
    });

    // Hapus file secara permanen dari Supabase Storage Free Tier (menjaga kuota 50GB tetap lega)
    if (expiredStoragePaths.length > 0 && isSupabaseConfigured) {
      try {
        const { error } = await supabase.storage.from(STORY_BUCKET).remove(expiredStoragePaths);
        if (error) {
          console.error('Error removing expired files from Supabase Storage:', error);
        } else {
          console.log(`✅ [SupabaseStorage] Successfully deleted ${expiredStoragePaths.length} expired files from bucket "${STORY_BUCKET}"!`);
        }
      } catch (err) {
        console.error('Failed to purge Supabase files:', err);
      }
    }
  }
}

export const storyManager = new StoryManager();
