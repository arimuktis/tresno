import { FastifyPluginAsync } from 'fastify';
import { notificationWorker } from './notificationWorker';
import { NotificationPayload } from '@tresno/shared';

export const notificationRoutes: FastifyPluginAsync = async (fastify) => {
  /**
   * 1. GET /api/notifications - Ambil riwayat notifikasi user
   */
  fastify.get('/api/notifications', async (request, reply) => {
    const { userId } = (request.query || {}) as { userId?: string };
    if (!userId) {
      return reply.status(400).send({
        success: false,
        message: 'userId query parameter is required',
      });
    }

    const notifications = notificationWorker.getNotificationsForUser(userId);
    return reply.send({
      success: true,
      data: notifications,
      total: notifications.length,
    });
  });

  /**
   * 2. POST /api/notifications/dispatch - Kirim notifikasi baru ke user atau broadcast
   */
  fastify.post('/api/notifications/dispatch', async (request, reply) => {
    const body = (request.body || {}) as {
      targetUserId?: string;
      broadcast?: boolean;
      notification: Omit<NotificationPayload, 'id' | 'timestamp' | 'read'>;
    };

    if (!body.notification) {
      return reply.status(400).send({
        success: false,
        message: 'notification object is required',
      });
    }

    const fullPayload: NotificationPayload = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: Date.now(),
      read: false,
      ...body.notification,
    };

    if (body.broadcast) {
      notificationWorker.broadcastNotification(fullPayload);
      return reply.send({
        success: true,
        message: 'Notification broadcasted to all active users',
        data: fullPayload,
      });
    }

    if (!body.targetUserId) {
      return reply.status(400).send({
        success: false,
        message: 'targetUserId or broadcast: true is required',
      });
    }

    const delivered = notificationWorker.sendNotificationToUser(body.targetUserId, fullPayload);

    return reply.send({
      success: true,
      delivered,
      data: fullPayload,
    });
  });

  /**
   * 3. POST /api/notifications/simulate-incoming-call - Simulasikan panggilan video masuk dari Host
   */
  fastify.post('/api/notifications/simulate-incoming-call', async (request, reply) => {
    const body = (request.body || {}) as {
      targetUserId?: string;
      callerNickname?: string;
      callerAvatar?: string;
    };

    const targetUser = body.targetUserId || notificationWorker.getConnectedUserIds()[0];
    if (!targetUser) {
      return reply.status(404).send({
        success: false,
        message: 'No online users currently connected to trigger incoming call',
      });
    }

    const callPayload = notificationWorker.simulateIncomingCall(targetUser, {
      id: 'host_dewi',
      nickname: body.callerNickname || 'Dewi Lestari',
      avatarUrl: body.callerAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    });

    return reply.send({
      success: true,
      message: `Incoming call dispatched to user ${targetUser}`,
      data: callPayload,
    });
  });

  /**
   * 4. POST /api/notifications/mark-read - Tandai notifikasi telah dibaca
   */
  fastify.post('/api/notifications/mark-read', async (request, reply) => {
    const { userId, notificationId } = (request.body || {}) as {
      userId?: string;
      notificationId?: string;
    };

    if (!userId || !notificationId) {
      return reply.status(400).send({
        success: false,
        message: 'userId and notificationId are required',
      });
    }

    notificationWorker.markAsRead(userId, notificationId);
    return reply.send({
      success: true,
      message: 'Notification marked as read',
    });
  });
};
