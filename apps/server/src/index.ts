import Fastify from 'fastify';
import fastifyWebsocket from '@fastify/websocket';
import fastifyCors from '@fastify/cors';
import { createClient } from '@supabase/supabase-js';
import { env, isProduction } from './config/env';
import { SignalingHandler } from './socket/signalingHandler';
import { storyRoutes } from './story/storyRoutes';
import { notificationRoutes } from './notification/notificationRoutes';
import { billingRoutes } from './billing/billingRoutes';
import { securityRoutes } from './security/securityRoutes';
import { surveillanceRoutes } from './surveillance/surveillanceRoutes';
import { aiRoutes } from './ai/aiRoutes';
import { posthogRoutes } from './posthog/posthogRoutes';
import { hostTrafficEngine } from './match/hostTrafficEngine';
import { APP_CONFIG } from '@tresno/shared';

const server = Fastify({
  logger: isProduction ? { level: 'warn' } : true,
});

server.register(fastifyCors, {
  origin: env.CORS_ORIGIN === '*' ? '*' : env.CORS_ORIGIN.split(',').map((o: string) => o.trim()),
});

server.register(fastifyWebsocket);
server.register(storyRoutes);
server.register(notificationRoutes);
server.register(billingRoutes);
server.register(securityRoutes);
server.register(surveillanceRoutes);
server.register(aiRoutes);
server.register(posthogRoutes);


// Supabase Server Client
const isSupabaseLive = env.SUPABASE_URL !== 'https://demo-tresno.supabase.co' && !env.SUPABASE_URL.includes('your-project');
const supabaseAdmin = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

const signaling = new SignalingHandler();

server.register(async function (fastify) {
  // WebSocket endpoint untuk Mobile Client
  fastify.get('/ws', { websocket: true }, (socket, req) => {
    server.log.info('Client connected to WebSocket signaling');
    signaling.handleConnection(socket as any);
  });
});

// Health check endpoint
server.get('/health', async () => {
  return {
    status: 'ok',
    app: APP_CONFIG.NAME,
    tagline: APP_CONFIG.TAGLINE,
    version: APP_CONFIG.VERSION,
    timestamp: new Date().toISOString(),
  };
});

/**
 * Destiny Tab Smart Ranking Endpoint
 * Mengembalikan daftar anchor aktif yang diurutkan menggunakan Multi-Bucket Interleaving
 * agar akun host yang baru online atau baru mendaftar tidak sepi/tenggelam.
 */
server.get('/api/destiny/anchors', async () => {
  const ranked = hostTrafficEngine.getRankedHostsForDestiny();
  return {
    success: true,
    count: ranked.length,
    algorithm: 'multi_bucket_interleaving_v1',
    data: ranked,
  };
});

/**
 * Host Radar Status & Fairness Stats Endpoint
 * Memberikan transparansi real-time kepada host mengenai skor prioritas radar mereka,
 * posisi antrean, serta tips menjaga akun tetap ramai panggilan.
 */
server.get('/api/host/radar-status', async (request) => {
  const query = (request.query || {}) as { hostId?: string };
  const hostId = query.hostId || 'host_dewi_lestari_jkt';
  const stats = hostTrafficEngine.getHostFairnessStats(hostId);
  return {
    success: true,
    data: stats,
  };
});

// =================================================================
// AUTH & SECURITY ENDPOINTS (Mirrored from Anbu / WorkWise Patterns)
// =================================================================

/**
 * 1. Refresh Token Endpoint
 * Menerima refresh token lama dan mengembalikan access token baru + refresh token baru
 */
server.post('/api/auth/refresh-token', async (request, reply) => {
  try {
    const body = (request.body || {}) as { refreshToken?: string; refresh_token?: string };
    const token = body.refreshToken || body.refresh_token;

    if (!token) {
      return reply.status(401).send({
        success: false,
        message: 'invalid_refresh_token',
      });
    }

    if (isSupabaseLive) {
      const { data, error } = await supabaseAdmin.auth.refreshSession({
        refresh_token: token,
      });

      if (error || !data.session) {
        return reply.status(401).send({
          success: false,
          message: error?.message || 'token_expired',
        });
      }

      return reply.send({
        success: true,
        message: 'Token refreshed successfully',
        data: {
          accessToken: data.session.access_token,
          refreshToken: data.session.refresh_token,
          expiresAt: (data.session.expires_at || 0) * 1000,
        },
      });
    }

    // Rotasi token demo terenkripsi yang aman untuk testing
    const newExpiresAt = Date.now() + 3600 * 1000;
    return reply.send({
      success: true,
      message: 'Token refreshed successfully (sandbox)',
      data: {
        accessToken: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.rot_${Date.now()}`,
        refreshToken: `rf_srv_${Math.random().toString(36).substring(2, 14)}_${Date.now()}`,
        expiresAt: newExpiresAt,
      },
    });
  } catch (err: any) {
    server.log.error(err);
    return reply.status(500).send({
      success: false,
      message: err.message || 'Internal server error',
    });
  }
});

/**
 * 2. Google OAuth Token Verification (ala Anbu TokenVerification)
 */
server.post('/api/auth/verify-google', async (request, reply) => {
  try {
    const body = (request.body || {}) as { tokenId?: string; token?: string };
    const idToken = body.tokenId || body.token;

    if (!idToken) {
      return reply.status(400).send({
        success: false,
        message: 'Missing Google token ID',
      });
    }

    // Jika live supabase, verifikasi ID Token
    if (isSupabaseLive) {
      const { data, error } = await supabaseAdmin.auth.getUser(idToken);
      if (error || !data.user) {
        return reply.status(401).send({
          success: false,
          message: 'Invalid Google token',
        });
      }
      return reply.send({
        success: true,
        data: data.user,
      });
    }

    // Demo verification
    return reply.send({
      success: true,
      message: 'Google token verified successfully',
      data: {
        id: `g_${Date.now().toString(36)}`,
        email: 'user.verified@gmail.com',
      },
    });
  } catch (err: any) {
    server.log.error(err);
    return reply.status(500).send({
      success: false,
      message: err.message || 'Verification failed',
    });
  }
});

server.listen({ port: env.PORT, host: env.HOST }, (err, address) => {
  if (err) {
    server.log.error(err);
    process.exit(1);
  }
  console.log(`\n🚀 ${APP_CONFIG.NAME} Server running in [${env.NODE_ENV.toUpperCase()}] mode at: ${address}`);
  console.log(`📡 WebSocket Signaling available at: ws://${env.HOST}:${env.PORT}/ws\n`);
});

