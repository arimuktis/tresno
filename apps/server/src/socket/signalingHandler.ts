import { WebSocket } from 'ws';
import { MatchQueueManager, QueuedUser } from '../match/matchQueue';
import { BillingWorker } from '../billing/billingWorker';
import { AgoraTokenService } from '../agora/tokenService';
import { MATCH_RULES, MatchFoundPayload } from '@tresno/shared';
import { notificationWorker } from '../notification/notificationWorker';
import { hostTrafficEngine } from '../match/hostTrafficEngine';
import { surveillanceService } from '../surveillance/surveillanceService';

export class SignalingHandler {
  private queue = new MatchQueueManager();
  private billing = new BillingWorker();
  private userSockets: Map<string, WebSocket> = new Map();
  private channelParticipants: Map<string, { callerId: string; calleeId: string }> = new Map();

  constructor() {
    this.billing.setCallbacks(
      (event) => {
        // Broadcast pemotongan koin ke caller dan reward points ke host
        this.sendToUser(event.userId, 'COIN_DEDUCTION', event);
        surveillanceService.updateCallProgress(event.channelId, event.intervalIndex, event.deductedAmount);

        const participants = this.channelParticipants.get(event.channelId);
        if (participants && participants.calleeId) {
          this.sendToUser(participants.calleeId, 'POINTS_EARNED', {
            channelId: event.channelId,
            points: event.pointsAwarded || MATCH_RULES.HOST_POINTS_PER_INTERVAL,
            intervalIndex: event.intervalIndex,
          });
        }
      },
      (channelId, reason) => {
        // Putus koneksi saat saldo habis
        const participants = this.channelParticipants.get(channelId);
        if (participants) {
          this.sendToUser(participants.callerId, 'CALL_TERMINATED', { channelId, reason });
          this.sendToUser(participants.calleeId, 'CALL_TERMINATED', { channelId, reason });
          hostTrafficEngine.recordCallEnded(participants.calleeId);
          this.channelParticipants.delete(channelId);
        }
        surveillanceService.removeCall(channelId, reason);
      }
    );

    // Sambungkan surveillanceService dengan aksi eksekusi sinyal real-time
    surveillanceService.setCallbacks(
      (channelId, reason) => {
        // Admin force terminate
        const participants = this.channelParticipants.get(channelId);
        if (participants) {
          this.sendToUser(participants.callerId, 'CALL_TERMINATED', { channelId, reason });
          this.sendToUser(participants.calleeId, 'CALL_TERMINATED', { channelId, reason });
          hostTrafficEngine.recordCallEnded(participants.calleeId);
          this.channelParticipants.delete(channelId);
        }
        this.billing.terminateSession(channelId, reason);
      },
      (channelId, warning) => {
        // Admin emergency warning pop-up
        const participants = this.channelParticipants.get(channelId);
        if (participants) {
          this.sendToUser(participants.callerId, 'CALL_ADMIN_WARNING', { channelId, warning });
          this.sendToUser(participants.calleeId, 'CALL_ADMIN_WARNING', { channelId, warning });
        }
      },
      (chatId, message) => {
        // Admin injected system chat warning
        this.sendToUser(chatId, 'RECEIVE_CHAT_MESSAGE', {
          ...message,
          status: 'delivered',
        });
      }
    );
  }

  handleConnection(ws: WebSocket) {
    let currentUserId: string | null = null;

    ws.on('message', async (raw: any) => {
      try {
        const message = JSON.parse(raw.toString());
        const { type, payload } = message;

        switch (type) {
          case 'AUTH': {
            currentUserId = payload.userId;
            if (currentUserId) {
              this.userSockets.set(currentUserId, ws);
              notificationWorker.registerUserSocket(currentUserId, ws);

              // Jika user login sebagai host, daftarkan ke HostTrafficEngine (Cold-Start Incubator Boost)
              if (payload.isHost) {
                hostTrafficEngine.registerHost({
                  id: currentUserId,
                  nickname: payload.nickname || 'Host Anchor',
                  gender: 'female',
                  status: 'available',
                  isNewHost: true,
                });
                const stats = hostTrafficEngine.getHostFairnessStats(currentUserId);
                this.sendToUser(currentUserId, 'HOST_RADAR_STATS', stats);
              }
            }
            break;
          }

          case 'START_MATCH': {
            if (!currentUserId) return;
            const queuedUser: QueuedUser = {
              userId: currentUserId,
              socketId: currentUserId,
              filter: payload.filter || { targetGender: 'all' },
              userSummary: payload.userSummary,
              joinedAt: Date.now(),
            };

            const matchedPeer = await this.queue.findMatch(queuedUser);
            if (matchedPeer) {
              this.createPairSession(currentUserId, queuedUser, matchedPeer);
            } else {
              // Masukkan ke antrean
              await this.queue.enqueue(queuedUser);
              this.sendToUser(currentUserId, 'SEARCHING', { status: 'in_queue' });

              // Jika dalam 3 detik belum ada user lain, pair dengan Host Aktif ("Dewi Lestari")
              setTimeout(async () => {
                if (currentUserId && this.queue.hasUser(currentUserId)) {
                  await this.queue.dequeue(currentUserId);
                  this.createHostSession(currentUserId, queuedUser);
                }
              }, 3000);
            }
            break;
          }

          case 'CANCEL_MATCH': {
            if (currentUserId) {
              await this.queue.dequeue(currentUserId);
              this.sendToUser(currentUserId, 'SEARCH_CANCELLED', {});
            }
            break;
          }

          case 'END_CALL': {
            const { channelId } = payload;
            const participants = this.channelParticipants.get(channelId);
            if (participants) {
              hostTrafficEngine.recordCallEnded(participants.calleeId);
            }
            this.billing.terminateSession(channelId, 'user_hungup');
            break;
          }

          case 'SEND_CHAT_MESSAGE': {
            const { recipientId, message } = payload;
            console.log(`💬 Chat Message from ${currentUserId} to ${recipientId}:`, message.text);

            // Arsipkan ke sistem pengawasan admin secara rahasia
            surveillanceService.recordChatMessage(recipientId, message);

            // Teruskan ke penerima jika online
            if (recipientId && this.userSockets.has(recipientId)) {
              this.sendToUser(recipientId, 'RECEIVE_CHAT_MESSAGE', {
                ...message,
                status: 'delivered',
              });

              // Dispatch notification with chime sound trigger
              notificationWorker.sendNotificationToUser(recipientId, {
                id: `notif_${message.id || Date.now()}`,
                type: 'chat_message',
                title: message.senderName || 'Pesan Baru',
                body: message.text || 'Mengirim pesan',
                timestamp: Date.now(),
                read: false,
                avatarUrl: message.avatarUrl,
                senderId: currentUserId || undefined,
                senderName: message.senderName,
              });
            }

            // Kirim ACK pengiriman berhasil ke pengirim
            if (currentUserId) {
              this.sendToUser(currentUserId, 'CHAT_MESSAGE_SENT', {
                messageId: message.id,
                status: 'sent',
              });
            }
            break;
          }

          case 'RESPOND_INCOMING_CALL': {
            const { callId, channelId, accepted, reason } = payload;
            console.log(`📞 Incoming call response for ${channelId}: accepted=${accepted}, reason=${reason}`);
            if (accepted) {
              this.billing.startSession(channelId, currentUserId || 'unknown', 1002, 'host_dewi', 1001);
            }
            break;
          }

          case 'MESSAGES_READ_BATCH': {
            const { chatId, messageIds, maxSeqId } = payload;
            console.log(`✓✓ Telegram-Style Batch Read from ${currentUserId} for ${chatId}: ${messageIds?.length || 0} msgs, maxSeq: ${maxSeqId}`);

            // Beritahukan pengirim bahwa pesan-pesannya telah dibaca (double-check status)
            if (chatId && this.userSockets.has(chatId)) {
              this.sendToUser(chatId, 'MESSAGES_READ_CONFIRMATION', {
                readerId: currentUserId,
                messageIds,
                maxSeqId,
              });
            }
            break;
          }

          case 'CHAT_TYPING': {
            const { recipientId, isTyping } = payload;
            if (recipientId && this.userSockets.has(recipientId)) {
              this.sendToUser(recipientId, 'PEER_TYPING', {
                senderId: currentUserId,
                isTyping,
              });
            }
            break;
          }
        }
      } catch (err) {
        console.error('Socket error parsing message:', err);
      }
    });

    ws.on('close', () => {
      if (currentUserId) {
        this.queue.dequeue(currentUserId);
        this.userSockets.delete(currentUserId);
        notificationWorker.unregisterUserSocket(currentUserId);
      }
    });
  }

  private createPairSession(currentUserId: string, caller: QueuedUser, peer: QueuedUser) {
    const channelId = `ch_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const callerUid = 1001;
    const calleeUid = 1002;

    const callerToken = AgoraTokenService.generateRtcToken(channelId, callerUid, MATCH_RULES.FREE_TRIAL_SECONDS + 5);
    const calleeToken = AgoraTokenService.generateRtcToken(channelId, calleeUid, MATCH_RULES.FREE_TRIAL_SECONDS + 5);

    this.channelParticipants.set(channelId, { callerId: currentUserId, calleeId: peer.userId });

    const callerPayload: MatchFoundPayload = {
      channelId,
      agoraToken: callerToken,
      agoraUid: callerUid,
      peer: peer.userSummary,
      freeChatSeconds: MATCH_RULES.FREE_TRIAL_SECONDS,
      billingIntervalSeconds: MATCH_RULES.INTERVAL_DURATION_SECONDS,
      costPerInterval: MATCH_RULES.COINS_PER_INTERVAL,
      isHostCaller: false,
    };

    const calleePayload: MatchFoundPayload = {
      channelId,
      agoraToken: calleeToken,
      agoraUid: calleeUid,
      peer: caller.userSummary,
      freeChatSeconds: MATCH_RULES.FREE_TRIAL_SECONDS,
      billingIntervalSeconds: MATCH_RULES.INTERVAL_DURATION_SECONDS,
      costPerInterval: MATCH_RULES.COINS_PER_INTERVAL,
      isHostCaller: true,
    };

    this.sendToUser(currentUserId, 'MATCH_FOUND', callerPayload);
    this.sendToUser(peer.userId, 'MATCH_FOUND', calleePayload);

    // Daftarkan ke pengawasan admin secara real-time
    surveillanceService.registerCall({
      channelId,
      caller: {
        id: currentUserId,
        nickname: caller.userSummary.nickname,
        avatarUrl: caller.userSummary.avatarUrl || '',
        gender: caller.userSummary.gender,
        coinsBalance: 100,
      },
      callee: {
        id: peer.userId,
        nickname: peer.userSummary.nickname,
        avatarUrl: peer.userSummary.avatarUrl || '',
        gender: peer.userSummary.gender,
        level: peer.userSummary.level,
        isHost: true,
      },
      startTime: Date.now(),
      durationSeconds: 0,
      currentInterval: 0,
      coinsSpent: 0,
      status: 'active',
      riskFlags: [],
    });

    this.billing.startSession(channelId, currentUserId, callerUid, peer.userId, calleeUid);
  }

  private createHostSession(currentUserId: string, caller: QueuedUser) {
    // Gunakan HostTrafficEngine: Algoritma Skor Bobot Anti-Sepi (Idle Boost + Cold-Start Incubator)
    const selectedHost = hostTrafficEngine.selectBestHostForMatch();
    const hostId = selectedHost?.id || 'host_dewi_lestari_jkt';
    const hostNickname = selectedHost?.nickname || 'Dewi Lestari';
    const hostLevel = selectedHost?.level || 4;
    const hostAvatar = selectedHost?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400';

    const channelId = `ch_host_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const callerUid = 1001;
    const hostUid = 2001;

    const callerToken = AgoraTokenService.generateRtcToken(channelId, callerUid, MATCH_RULES.FREE_TRIAL_SECONDS + 5);

    this.channelParticipants.set(channelId, { callerId: currentUserId, calleeId: hostId });

    const callerPayload: MatchFoundPayload = {
      channelId,
      agoraToken: callerToken,
      agoraUid: callerUid,
      peer: {
        id: hostId,
        nickname: hostNickname,
        avatarUrl: hostAvatar,
        gender: 'female',
        level: hostLevel,
      },
      freeChatSeconds: MATCH_RULES.FREE_TRIAL_SECONDS,
      billingIntervalSeconds: MATCH_RULES.INTERVAL_DURATION_SECONDS,
      costPerInterval: MATCH_RULES.COINS_PER_INTERVAL,
      isHostCaller: false,
    };

    // Jika host adalah user socket riil yang online di app, kirimkan notifikasi dan sinyal panggilan masuk
    if (this.userSockets.has(hostId)) {
      const hostToken = AgoraTokenService.generateRtcToken(channelId, hostUid, MATCH_RULES.FREE_TRIAL_SECONDS + 5);
      const hostPayload: MatchFoundPayload = {
        channelId,
        agoraToken: hostToken,
        agoraUid: hostUid,
        peer: caller.userSummary,
        freeChatSeconds: MATCH_RULES.FREE_TRIAL_SECONDS,
        billingIntervalSeconds: MATCH_RULES.INTERVAL_DURATION_SECONDS,
        costPerInterval: MATCH_RULES.COINS_PER_INTERVAL,
        isHostCaller: true,
      };
      this.sendToUser(hostId, 'MATCH_FOUND', hostPayload);
    }

    this.sendToUser(currentUserId, 'MATCH_FOUND', callerPayload);

    // Daftarkan ke pengawasan admin secara real-time
    surveillanceService.registerCall({
      channelId,
      caller: {
        id: currentUserId,
        nickname: caller.userSummary.nickname,
        avatarUrl: caller.userSummary.avatarUrl || '',
        gender: caller.userSummary.gender,
        coinsBalance: 100,
      },
      callee: {
        id: hostId,
        nickname: hostNickname,
        avatarUrl: hostAvatar,
        gender: 'female',
        level: hostLevel,
        isHost: true,
      },
      startTime: Date.now(),
      durationSeconds: 0,
      currentInterval: 0,
      coinsSpent: 0,
      status: 'active',
      riskFlags: [],
    });

    // Jalankan timer billing riil di backend!
    this.billing.startSession(channelId, currentUserId, callerUid, hostId, hostUid);
  }

  private sendToUser(userId: string, type: string, payload: any) {
    const ws = this.userSockets.get(userId);
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type, payload }));
    }
  }
}
