import { WebSocket } from 'ws';
import {
  NotificationPayload,
  IncomingCallRequestPayload,
  IncomingCallResponsePayload,
} from '@tresno/shared';
import { AgoraTokenService } from '../agora/tokenService';

export interface QueuedNotification {
  id: string;
  targetUserId: string;
  payload: NotificationPayload;
  status: 'pending' | 'delivered' | 'read';
  createdAt: number;
}

export class NotificationWorker {
  private userSockets: Map<string, WebSocket> = new Map();
  private notificationStore: Map<string, QueuedNotification[]> = new Map();
  private workerTimer: NodeJS.Timeout | null = null;
  private isRunning: boolean = false;

  constructor() {
    this.startWorker();
  }

  public registerUserSocket(userId: string, ws: WebSocket) {
    this.userSockets.set(userId, ws);
    // Deliver pending notifications
    this.flushPending(userId);
  }

  public unregisterUserSocket(userId: string) {
    this.userSockets.delete(userId);
  }

  public getConnectedUserIds(): string[] {
    return Array.from(this.userSockets.keys());
  }

  /**
   * Kirim notifikasi langsung ke user spesifik via WebSocket
   */
  public sendNotificationToUser(targetUserId: string, payload: NotificationPayload): boolean {
    const queued: QueuedNotification = {
      id: payload.id,
      targetUserId,
      payload,
      status: 'pending',
      createdAt: Date.now(),
    };

    const userNotifs = this.notificationStore.get(targetUserId) || [];
    userNotifs.unshift(queued);
    this.notificationStore.set(targetUserId, userNotifs);

    const ws = this.userSockets.get(targetUserId);
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'NOTIFICATION_RECEIVED',
        payload,
      }));
      queued.status = 'delivered';
      return true;
    }

    return false;
  }

  /**
   * Broadcast notifikasi ke seluruh user yang sedang terkoneksi
   */
  public broadcastNotification(payload: NotificationPayload) {
    for (const userId of this.userSockets.keys()) {
      this.sendNotificationToUser(userId, {
        ...payload,
        id: `${payload.id}_${userId}_${Date.now()}`,
      });
    }
  }

  /**
   * 📲 Simulasikan Panggilan Video Masuk (Incoming Call) dari Host Populer
   */
  public simulateIncomingCall(
    targetUserId: string,
    callerProfile?: { id: string; nickname: string; avatarUrl: string }
  ): IncomingCallRequestPayload | null {
    const ws = this.userSockets.get(targetUserId);
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      console.warn(`[NotificationWorker] User ${targetUserId} not connected for incoming call.`);
      return null;
    }

    const host = callerProfile || {
      id: 'host_dewi',
      nickname: 'Dewi Lestari',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    };

    const channelId = `ch_in_${targetUserId}_${Date.now()}`;
    const agoraUid = 1002;
    const token = AgoraTokenService.generateRtcToken(channelId, agoraUid, 3600);

    const callPayload: IncomingCallRequestPayload = {
      callId: `call_${Date.now()}`,
      channelId,
      caller: {
        id: host.id,
        nickname: host.nickname,
        avatarUrl: host.avatarUrl,
        gender: 'female',
        level: 3,
        ratePerMin: 60,
      },
      agoraUid,
      agoraToken: token,
      freeChatSeconds: 0,
      billingIntervalSeconds: 60,
      costPerInterval: 60,
      timestamp: Date.now(),
    };

    ws.send(JSON.stringify({
      type: 'INCOMING_CALL_REQUEST',
      payload: callPayload,
    }));

    return callPayload;
  }

  /**
   * Worker Loop background: membersihkan antrean lama & memicu interaksi berkala
   */
  public startWorker() {
    if (this.isRunning) return;
    this.isRunning = true;

    this.workerTimer = setInterval(() => {
      this.processBackgroundJobs();
    }, 45000); // Tiap 45 detik
  }

  public stopWorker() {
    if (this.workerTimer) {
      clearInterval(this.workerTimer);
      this.workerTimer = null;
    }
    this.isRunning = false;
  }

  private processBackgroundJobs() {
    const userIds = this.getConnectedUserIds();
    if (userIds.length === 0) return;

    // Engagement simulasi ramah pengguna jika ada user online
    const randomUser = userIds[Math.floor(Math.random() * userIds.length)];
    const sampleHosts = [
      {
        id: 'anchor_1',
        name: 'Dewi Lestari',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        message: 'Halo ganteng! Mau ngobrol santai bareng aku malam ini?',
      },
      {
        id: 'anchor_2',
        name: 'Siti Rahma',
        avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
        message: 'Lagi online nih, yuk temani aku ngobrol sebentar',
      },
    ];

    const host = sampleHosts[Math.floor(Math.random() * sampleHosts.length)];

    this.sendNotificationToUser(randomUser, {
      id: `notif_auto_${Date.now()}`,
      type: 'chat_message',
      title: `${host.name} mengirim pesan`,
      body: host.message,
      timestamp: Date.now(),
      read: false,
      avatarUrl: host.avatar,
      senderId: host.id,
      senderName: host.name,
    });
  }

  private flushPending(userId: string) {
    const list = this.notificationStore.get(userId);
    if (!list) return;

    const ws = this.userSockets.get(userId);
    if (!ws || ws.readyState !== WebSocket.OPEN) return;

    for (const item of list) {
      if (item.status === 'pending') {
        ws.send(JSON.stringify({
          type: 'NOTIFICATION_RECEIVED',
          payload: item.payload,
        }));
        item.status = 'delivered';
      }
    }
  }

  public getNotificationsForUser(userId: string): NotificationPayload[] {
    const list = this.notificationStore.get(userId) || [];
    return list.map((item) => item.payload);
  }

  public markAsRead(userId: string, notificationId: string) {
    const list = this.notificationStore.get(userId);
    if (list) {
      const target = list.find((item) => item.id === notificationId);
      if (target) {
        target.status = 'read';
        target.payload.read = true;
      }
    }
  }
}

export const notificationWorker = new NotificationWorker();
