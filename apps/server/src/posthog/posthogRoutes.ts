import { FastifyPluginAsync } from 'fastify';
import { posthogServerService } from './posthogServerService';
import { PostHogEventPayload } from '@tresno/shared';

export const posthogRoutes: FastifyPluginAsync = async (server) => {
  /**
   * 1. Capture Telemetry Event
   */
  server.post('/api/posthog/capture', async (request, reply) => {
    try {
      const payload = request.body as PostHogEventPayload;
      if (!payload || !payload.event || !payload.distinctId) {
        return reply.status(400).send({
          success: false,
          message: 'Payload event dan distinctId wajib diisi',
        });
      }

      posthogServerService.capture(payload);
      return reply.send({ success: true, message: 'Event captured' });
    } catch (err: any) {
      server.log.error(err);
      return reply.status(500).send({ success: false, message: 'Gagal mencatat event' });
    }
  });

  /**
   * 2. Live Telemetry Stats & Recent Event Feed
   */
  server.get('/api/posthog/stats', async () => {
    const stats = posthogServerService.getTelemetryStats();
    return {
      success: true,
      data: stats,
    };
  });

  /**
   * 3. Feature Flags List
   */
  server.get('/api/posthog/feature-flags', async () => {
    const flags = posthogServerService.getFeatureFlags();
    return {
      success: true,
      data: flags,
    };
  });

  /**
   * 4. Update Feature Flag Configuration (dari CMS)
   */
  server.post('/api/posthog/feature-flags/update', async (request, reply) => {
    try {
      const body = (request.body || {}) as {
        key: string;
        isEnabled?: boolean;
        rolloutPercentage?: number;
      };

      if (!body.key) {
        return reply.status(400).send({
          success: false,
          message: 'Parameter key feature flag wajib diisi',
        });
      }

      const updated = posthogServerService.updateFeatureFlag(body.key, {
        ...(body.isEnabled !== undefined ? { isEnabled: body.isEnabled } : {}),
        ...(body.rolloutPercentage !== undefined ? { rolloutPercentage: body.rolloutPercentage } : {}),
      });

      if (!updated) {
        return reply.status(404).send({
          success: false,
          message: `Feature flag '${body.key}' tidak ditemukan`,
        });
      }

      return reply.send({
        success: true,
        message: 'Feature flag berhasil diperbarui',
        data: updated,
      });
    } catch (err: any) {
      server.log.error(err);
      return reply.status(500).send({
        success: false,
        message: err.message || 'Gagal memperbarui feature flag',
      });
    }
  });

  /**
   * 5. Conversion Funnel Report
   */
  server.get('/api/posthog/funnel', async () => {
    const funnel = posthogServerService.getFunnelReport();
    return {
      success: true,
      data: funnel,
    };
  });
};
