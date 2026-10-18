import { FastifyInstance } from 'fastify';
import { storyManager } from './storyWorker';
import { supabase, isSupabaseConfigured, STORY_BUCKET } from './supabaseClient';

import { checkContentModeration } from '../moderation/moderationChecker';

export async function storyRoutes(server: FastifyInstance) {
  // 1. Ambil seluruh cerita aktif (belum lewat 24 jam)
  server.get('/api/stories', async (request, reply) => {
    const stories = storyManager.getActiveStories();
    return {
      success: true,
      data: stories,
      storageProvider: isSupabaseConfigured ? 'supabase-storage-free-50gb' : 'local-hybrid-simulated',
    };
  });

  // 2. Upload cerita baru dengan validasi review SARA & Pornografi
  server.post<{
    Body: {
      userId: string;
      username: string;
      avatar: string;
      isHost: boolean;
      mediaUrl: string;
      mediaType?: 'image' | 'video';
      caption?: string;
    };
  }>('/api/stories/upload', async (request, reply) => {
    const { userId, username, avatar, isHost, mediaUrl, mediaType = 'image', caption } = request.body;

    if (!userId || !mediaUrl) {
      return reply.status(400).send({ error: 'userId and mediaUrl are required' });
    }

    // Mekanisme Review Deteksi SARA & Pornografi
    const moderation = checkContentModeration(caption, mediaUrl);
    if (!moderation.isSafe) {
      return reply.status(422).send({
        success: false,
        error: moderation.reason || 'Konten ditolak karena melanggar pedoman SARA / Pornografi.',
        category: moderation.category,
        flaggedKeywords: moderation.flaggedKeywords,
        moderation,
      });
    }

    const createdStory = storyManager.addStory(
      userId,
      username || 'User',
      avatar || '',
      Boolean(isHost),
      mediaUrl,
      mediaType,
      caption,
      moderation
    );

    return {
      success: true,
      message: 'Cerita berhasil ditinjau & diunggah, aktif selama 24 jam ke depan!',
      data: createdStory,
      moderation,
    };
  });

  // 3. Catat penayangan cerita (View count)
  server.post<{ Params: { id: string } }>('/api/stories/:id/view', async (request, reply) => {
    const { id } = request.params;
    storyManager.recordView(id);
    return { success: true };
  });

  // 4. Catat like cerita
  server.post<{ Params: { id: string } }>('/api/stories/:id/like', async (request, reply) => {
    const { id } = request.params;
    storyManager.recordLike(id);
    return { success: true };
  });

  // 5. Manual purge trigger (untuk testing atau verifikasi admin)
  server.post('/api/stories/purge-expired', async (request, reply) => {
    await storyManager.purgeExpiredStories();
    return { success: true, message: 'Auto-purge 24h stories executed successfully' };
  });
}
