import { FastifyPluginAsync } from 'fastify';
import { pgvectorService } from './pgvectorService';
import { aiEngineService } from './aiEngineService';

export const aiRoutes: FastifyPluginAsync = async (server) => {
  /**
   * 1. Semantic Vector Host Matchmaking
   */
  server.post('/api/ai/match-hosts', async (request, reply) => {
    try {
      const body = (request.body || {}) as {
        query?: string;
        limit?: number;
        gender?: 'female' | 'male';
      };

      const query = body.query || 'teman ngobrol asik dan santai';
      const limit = body.limit || 5;
      const results = aiEngineService.recommendHostsSemantic(query, limit, body.gender);

      return reply.send({
        success: true,
        count: results.length,
        query,
        algorithm: 'pgvector_cosine_similarity_hnsw',
        data: results,
      });
    } catch (err: any) {
      server.log.error(err);
      return reply.status(500).send({
        success: false,
        message: err.message || 'Gagal menjalankan semantic matchmaking',
      });
    }
  });

  /**
   * 2. Live Semantic Vector Search Explorer (Untuk Admin CMS & Testing)
   */
  server.post('/api/ai/semantic-search', async (request, reply) => {
    try {
      const body = (request.body || {}) as {
        queryText: string;
        target?: 'hosts' | 'knowledge' | 'all';
        limit?: number;
      };

      if (!body.queryText) {
        return reply.status(400).send({
          success: false,
          message: 'Parameter queryText wajib diisi',
        });
      }

      const hostMatches = pgvectorService.searchHostsSemantic(body.queryText, body.limit || 5);
      const knowledgeMatches = pgvectorService.searchKnowledgeBase(body.queryText, 3);

      return reply.send({
        success: true,
        query: body.queryText,
        hosts: hostMatches,
        knowledge: knowledgeMatches,
      });
    } catch (err: any) {
      server.log.error(err);
      return reply.status(500).send({
        success: false,
        message: err.message || 'Pencarian semantik gagal',
      });
    }
  });

  /**
   * 3. AI Smart Icebreaker Generator (Untuk Ruang Obrolan)
   */
  server.post('/api/ai/generate-icebreaker', async (request, reply) => {
    try {
      const body = (request.body || {}) as {
        hostId: string;
        hostNickname?: string;
        userTopic?: string;
      };

      const suggestions = aiEngineService.generateIcebreakers(
        body.hostId || 'host_default',
        body.hostNickname,
        body.userTopic
      );

      return reply.send({
        success: true,
        data: suggestions,
      });
    } catch (err: any) {
      server.log.error(err);
      return reply.status(500).send({
        success: false,
        message: err.message || 'Gagal menghasilkan icebreaker',
      });
    }
  });

  /**
   * 4. AI Content Moderation Vector Scanner
   */
  server.post('/api/ai/scan-moderation', async (request, reply) => {
    try {
      const body = (request.body || {}) as { text: string };
      if (!body.text) {
        return reply.status(400).send({
          success: false,
          message: 'Teks untuk pemindaian moderasi wajib disertakan',
        });
      }

      const scanResult = aiEngineService.scanContent(body.text);

      return reply.send({
        success: true,
        data: scanResult,
      });
    } catch (err: any) {
      server.log.error(err);
      return reply.status(500).send({
        success: false,
        message: err.message || 'Gagal memindai moderasi vektor',
      });
    }
  });

  /**
   * 5. PgVector Console Stats
   */
  server.get('/api/ai/pgvector-stats', async () => {
    const stats = pgvectorService.getConsoleStats();
    return {
      success: true,
      data: stats,
    };
  });

  /**
   * 6. PgVector Re-index Trigger
   */
  server.post('/api/ai/pgvector-reindex', async () => {
    pgvectorService.reindexAll();
    const stats = pgvectorService.getConsoleStats();
    return {
      success: true,
      message: 'PgVector embedding dan indeks HNSW berhasil diperbarui',
      data: stats,
    };
  });
};
