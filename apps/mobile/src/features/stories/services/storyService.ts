import { StoryItem, UserStoryGroup, StoryUploadPayload } from '@tresno/shared';
import { supabase, isRealSupabaseConfigured } from '../../../shared/services/supabaseClient';

const getApiBaseUrl = (): string => {
  const host = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
  return `http://${host}:4000`;
};

export const STORY_BUCKET = 'tresno-stories';

export const storyService = {
  /**
   * Mengambil semua active stories (belum lewat 24 jam)
   */
  async getActiveStories(): Promise<UserStoryGroup[]> {
    try {
      const response = await fetch(`${getApiBaseUrl()}/api/stories`);
      if (!response.ok) {
        throw new Error(`Failed to fetch stories: ${response.statusText}`);
      }
      const data = await response.json();
      return data.data || [];
    } catch (err) {
      console.warn('[StoryService] Fallback to local default anchor stories on network error', err);
      return [];
    }
  },

  /**
   * Upload media (foto / video) ke Cloud Storage
   * Menggunakan path terstruktur: tresno-stories/{userId}/{timestamp}_{filename}
   */
  async uploadMedia(file: File | Blob, userId: string, fileName?: string): Promise<string> {
    const timestamp = Date.now();
    const cleanName = fileName ? fileName.replace(/[^a-zA-Z0-9.-]/g, '_') : `story_${timestamp}.jpg`;
    const filePath = `${userId}/${timestamp}_${cleanName}`;

    if (isRealSupabaseConfigured()) {
      try {
        console.log(`[Supabase Storage] Uploading to bucket ${STORY_BUCKET} at ${filePath}...`);
        const { error: uploadError } = await supabase.storage
          .from(STORY_BUCKET)
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false,
          });

        if (uploadError) {
          console.warn('[Supabase Storage] Upload failed, falling back:', uploadError.message);
        } else {
          const { data: publicData } = supabase.storage
            .from(STORY_BUCKET)
            .getPublicUrl(filePath);

          if (publicData?.publicUrl) {
            console.log('[Supabase Storage] Media uploaded successfully:', publicData.publicUrl);
            return publicData.publicUrl;
          }
        }
      } catch (err) {
        console.warn('[Supabase Storage] Exception during upload:', err);
      }
    }

    // Fallback untuk local demo / simulated storage jika Supabase credentials belum diisi user
    if (file instanceof Blob || (typeof File !== 'undefined' && (file as any) instanceof File)) {
      return URL.createObjectURL(file);
    }
    return 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800';
  },

  /**
   * Simpan metadata story ke server dengan TTL 24 jam
   */
  async createStory(payload: StoryUploadPayload): Promise<StoryItem> {
    try {
      const response = await fetch(`${getApiBaseUrl()}/api/stories/upload`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        let errMessage = `Gagal mengunggah story (${response.statusText})`;
        try {
          const errData = await response.json();
          if (errData.error) errMessage = errData.error;
        } catch (_) {}
        throw new Error(errMessage);
      }

      const data = await response.json();
      return data.data;
    } catch (err: any) {
      if (err.message && (err.message.includes('SARA') || err.message.includes('Pornografi') || err.message.includes('Melanggar'))) {
        throw err;
      }
      // Fallback local simulated story item if backend server is unreachable
      return {
        id: `story_local_${Date.now()}`,
        mediaUrl: payload.mediaUrl,
        mediaType: payload.mediaType,
        caption: payload.caption,
        createdAt: Date.now(),
        expiresAt: Date.now() + 24 * 60 * 60 * 1000,
        viewsCount: 0,
        likesCount: 0,
        status: 'approved',
      };
    }
  },

  /**
   * Catat penayangan story
   */
  async recordView(storyId: string): Promise<void> {
    try {
      await fetch(`${getApiBaseUrl()}/api/stories/${storyId}/view`, { method: 'POST' });
    } catch (e) {
      // silent fail
    }
  },

  /**
   * Catat like pada story
   */
  async recordLike(storyId: string): Promise<void> {
    try {
      await fetch(`${getApiBaseUrl()}/api/stories/${storyId}/like`, { method: 'POST' });
    } catch (e) {
      // silent fail
    }
  },
};
