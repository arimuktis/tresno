import { AgoraTokenService } from '../agora/tokenService';

export interface ParticipantSummary {
  id: string;
  nickname: string;
  avatarUrl: string;
  gender: string;
  level?: number;
  isHost?: boolean;
  coinsBalance?: number;
}

export interface ActiveCallRecord {
  channelId: string;
  caller: ParticipantSummary;
  callee: ParticipantSummary;
  startTime: number;
  durationSeconds: number;
  currentInterval: number;
  coinsSpent: number;
  status: 'active' | 'infiltrated' | 'terminated';
  riskFlags: string[];
  wiretappedByAdminId?: string;
  wiretapStartedAt?: number;
}

export interface ChatMessageRecord {
  id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: string;
  createdAt: number;
  isSystemWarning?: boolean;
  isFlagged?: boolean;
  gift?: {
    name: string;
    coins: number;
  };
}

export interface ChatroomRecord {
  chatId: string;
  participants: ParticipantSummary[];
  messages: ChatMessageRecord[];
  isFrozen: boolean;
  lastActivity: number;
  riskScore: number; // 0 - 100
  riskReason?: string;
}

const SUSPICIOUS_KEYWORDS = [
  'wa', 'whatsapp', 'rekening', 'transfer', 'bca', 'dana', 'gopay',
  'pulsa', 'hubungi luar', 'ketemuan', 'privat', 'bugil', 'video mesum', 'telegram'
];

export class SurveillanceService {
  private activeCalls: Map<string, ActiveCallRecord> = new Map();
  private chatrooms: Map<string, ChatroomRecord> = new Map();
  private auditLogs: Array<{ id: string; timestamp: number; adminId: string; action: string; targetId: string; details: any }> = [];

  // Callbacks hooked to WebSocket signaling for direct broadcast
  private onCallTerminatedCallback?: (channelId: string, reason: string) => void;
  private onCallWarningCallback?: (channelId: string, warning: string) => void;
  private onChatMessageInjectedCallback?: (chatId: string, message: ChatMessageRecord) => void;

  constructor() {
    this.seedRealisticDemoData();
  }

  setCallbacks(
    onTerminated: (channelId: string, reason: string) => void,
    onWarning: (channelId: string, warning: string) => void,
    onChatMessageInjected: (chatId: string, message: ChatMessageRecord) => void
  ) {
    this.onCallTerminatedCallback = onTerminated;
    this.onCallWarningCallback = onWarning;
    this.onChatMessageInjectedCallback = onChatMessageInjected;
  }

  // ==========================================
  // 1. LIVE CALL MONITORING & INFILTRATION
  // ==========================================

  registerCall(call: ActiveCallRecord) {
    this.activeCalls.set(call.channelId, call);
  }

  updateCallProgress(channelId: string, intervalIndex: number, coinsDeducted: number) {
    const call = this.activeCalls.get(channelId);
    if (call) {
      call.currentInterval = intervalIndex;
      call.coinsSpent += coinsDeducted;
      call.durationSeconds = Math.floor((Date.now() - call.startTime) / 1000);
      if (call.coinsSpent >= 500 && !call.riskFlags.includes('HIGH_SPENDING_SPIKE')) {
        call.riskFlags.push('HIGH_SPENDING_SPIKE');
      }
    }
  }

  removeCall(channelId: string, reason: string) {
    const call = this.activeCalls.get(channelId);
    if (call) {
      call.status = 'terminated';
      this.activeCalls.delete(channelId);
      this.recordAudit('SYSTEM', 'CALL_ENDED', channelId, { reason });
    }
  }

  getAllActiveCalls(): ActiveCallRecord[] {
    const now = Date.now();
    // Update live duration on the fly
    return Array.from(this.activeCalls.values()).map((call) => ({
      ...call,
      durationSeconds: Math.floor((now - call.startTime) / 1000),
    }));
  }

  getCallByChannelId(channelId: string): ActiveCallRecord | undefined {
    return this.activeCalls.get(channelId);
  }

  /**
   * Menghasilkan token silent subscriber bagi admin untuk menyusup ke channel panggilan
   * tanpa memicu notifikasi join ke caller maupun callee.
   */
  infiltrateCall(channelId: string, adminId: string) {
    const call = this.activeCalls.get(channelId);
    if (!call) {
      throw new Error(`Panggilan ${channelId} tidak ditemukan atau telah berakhir.`);
    }

    const ghostUid = 9999;
    const expireSeconds = 3600; // 1 jam monitoring window
    const ghostToken = AgoraTokenService.generateRtcToken(channelId, ghostUid, expireSeconds, true);

    call.status = 'infiltrated';
    call.wiretappedByAdminId = adminId;
    call.wiretapStartedAt = Date.now();

    this.recordAudit(adminId, 'INFILTRATE_CALL_GHOST', channelId, {
      callerId: call.caller.id,
      calleeId: call.callee.id,
      ghostUid,
    });

    return {
      channelId,
      ghostUid,
      ghostToken,
      caller: call.caller,
      callee: call.callee,
      startTime: call.startTime,
      durationSeconds: Math.floor((Date.now() - call.startTime) / 1000),
      coinsSpent: call.coinsSpent,
      riskFlags: call.riskFlags,
    };
  }

  /**
   * Kill-Switch: Putus paksa panggilan jika terjadi pelanggaran berat
   */
  terminateCall(channelId: string, adminId: string, reason: string) {
    const call = this.activeCalls.get(channelId);
    if (!call) {
      return false;
    }

    this.removeCall(channelId, reason);
    this.recordAudit(adminId, 'FORCE_TERMINATE_CALL', channelId, {
      reason,
      callerId: call.caller.id,
      calleeId: call.callee.id,
      duration: call.durationSeconds,
    });

    this.onCallTerminatedCallback?.(channelId, reason);
    return true;
  }

  /**
   * Mengirim flash banner peringatan langsung ke layar kedua peserta
   */
  warnCall(channelId: string, adminId: string, warningText: string) {
    const call = this.activeCalls.get(channelId);
    if (!call) return false;

    this.recordAudit(adminId, 'WARN_CALL_PARTICIPANTS', channelId, { warningText });
    this.onCallWarningCallback?.(channelId, warningText);
    return true;
  }

  // ==========================================
  // 2. LIVE CHATROOM SURVEILLANCE & SPYING
  // ==========================================

  recordChatMessage(chatId: string, rawMessage: any, senderSummary?: ParticipantSummary, peerSummary?: ParticipantSummary) {
    let room = this.chatrooms.get(chatId);
    if (!room) {
      room = {
        chatId,
        participants: [
          senderSummary || { id: rawMessage.senderId || 'user_1', nickname: rawMessage.senderName || 'Sender', avatarUrl: '', gender: 'unknown' },
          peerSummary || { id: rawMessage.recipientId || 'user_2', nickname: 'Peer User', avatarUrl: '', gender: 'unknown' },
        ],
        messages: [],
        isFrozen: false,
        lastActivity: Date.now(),
        riskScore: 0,
      };
      this.chatrooms.set(chatId, room);
    }

    const textLower = (rawMessage.text || '').toLowerCase();
    const hasSuspicious = SUSPICIOUS_KEYWORDS.some((kw) => textLower.includes(kw));

    const msgRecord: ChatMessageRecord = {
      id: rawMessage.id || `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      chatId,
      senderId: rawMessage.senderId,
      senderName: rawMessage.senderName,
      text: rawMessage.text,
      timestamp: rawMessage.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      createdAt: Date.now(),
      isFlagged: hasSuspicious,
      gift: rawMessage.gift,
    };

    room.messages.push(msgRecord);
    room.lastActivity = Date.now();

    if (hasSuspicious) {
      room.riskScore = Math.min(100, room.riskScore + 35);
      room.riskReason = 'Terdeteksi kata kunci mencurigakan transaksi luar atau kontak pribadi';
    }

    // Keep memory bounded to last 100 messages per room
    if (room.messages.length > 100) {
      room.messages.shift();
    }
  }

  getAllChatrooms(): Array<{
    chatId: string;
    participants: ParticipantSummary[];
    messageCount: number;
    lastMessage?: ChatMessageRecord;
    isFrozen: boolean;
    lastActivity: number;
    riskScore: number;
    riskReason?: string;
  }> {
    return Array.from(this.chatrooms.values())
      .sort((a, b) => b.lastActivity - a.lastActivity)
      .map((r) => ({
        chatId: r.chatId,
        participants: r.participants,
        messageCount: r.messages.length,
        lastMessage: r.messages[r.messages.length - 1],
        isFrozen: r.isFrozen,
        lastActivity: r.lastActivity,
        riskScore: r.riskScore,
        riskReason: r.riskReason,
      }));
  }

  getChatMessages(chatId: string): ChatMessageRecord[] {
    const room = this.chatrooms.get(chatId);
    return room ? room.messages : [];
  }

  /**
   * Menyusupkan pesan peringatan sistem resmi ke dalam chatroom pengguna
   */
  injectWarningMessage(chatId: string, adminId: string, warningText: string): ChatMessageRecord {
    let room = this.chatrooms.get(chatId);
    if (!room) {
      throw new Error(`Chatroom ${chatId} tidak ditemukan.`);
    }

    const warningMsg: ChatMessageRecord = {
      id: `sys_warn_${Date.now()}`,
      chatId,
      senderId: 'SYSTEM_ADMIN_SECURITY',
      senderName: '🛡️ Peringatan Resmi Tim Keamanan Tresno',
      text: warningText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      createdAt: Date.now(),
      isSystemWarning: true,
    };

    room.messages.push(warningMsg);
    room.lastActivity = Date.now();

    this.recordAudit(adminId, 'INJECT_CHAT_WARNING', chatId, { warningText });
    this.onChatMessageInjectedCallback?.(chatId, warningMsg);

    return warningMsg;
  }

  /**
   * Membekukan atau mencairkan ruang chat pengguna
   */
  toggleFreezeChatroom(chatId: string, adminId: string, freeze: boolean): boolean {
    const room = this.chatrooms.get(chatId);
    if (!room) return false;

    room.isFrozen = freeze;
    this.recordAudit(adminId, freeze ? 'FREEZE_CHATROOM' : 'UNFREEZE_CHATROOM', chatId, {});
    return true;
  }

  // ==========================================
  // 3. AUDIT TRAIL
  // ==========================================

  private recordAudit(adminId: string, action: string, targetId: string, details: any) {
    this.auditLogs.unshift({
      id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: Date.now(),
      adminId,
      action,
      targetId,
      details,
    });
    if (this.auditLogs.length > 200) this.auditLogs.pop();
  }

  getAuditLogs() {
    return this.auditLogs;
  }

  // Seed data awal agar admin langsung dapat menguji live infiltration dan chat spy
  private seedRealisticDemoData() {
    // 1. Demo Active Call: Spender Sultan Surabaya & Host Dewi Lestari
    const demoCall1: ActiveCallRecord = {
      channelId: 'ch_live_vip_surveillance_101',
      caller: {
        id: 'user_sultan_sby_891',
        nickname: 'Budi Santoso (Surabaya)',
        avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200',
        gender: 'male',
        coinsBalance: 24500,
      },
      callee: {
        id: 'host_dewi_lestari_jkt',
        nickname: 'Dewi Lestari',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
        gender: 'female',
        level: 5,
        isHost: true,
      },
      startTime: Date.now() - 148 * 1000, // 2m 28s ago
      durationSeconds: 148,
      currentInterval: 3,
      coinsSpent: 180,
      status: 'active',
      riskFlags: [],
    };

    // 2. Demo Active Call dengan Indikasi Pelanggaran: Spender Jakarta & Host Bella Putri
    const demoCall2: ActiveCallRecord = {
      channelId: 'ch_live_alert_surveillance_202',
      caller: {
        id: 'user_hadi_jkt_442',
        nickname: 'Hadi Nugroho',
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
        gender: 'male',
        coinsBalance: 1200,
      },
      callee: {
        id: 'host_bella_putri_bdg',
        nickname: 'Bella Putri',
        avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200',
        gender: 'female',
        level: 4,
        isHost: true,
      },
      startTime: Date.now() - 325 * 1000, // 5m 25s ago
      durationSeconds: 325,
      currentInterval: 6,
      coinsSpent: 360,
      status: 'active',
      riskFlags: ['POTENTIAL_OFFLINE_SOLICITATION', 'SUSPICIOUS_AUDIO_LEVEL'],
    };

    this.activeCalls.set(demoCall1.channelId, demoCall1);
    this.activeCalls.set(demoCall2.channelId, demoCall2);

    // 3. Demo Chatrooms dengan riwayat percakapan lengkap
    const chatDewi: ChatroomRecord = {
      chatId: 'anchor_1',
      participants: [
        { id: 'user_current', nickname: 'Spender Member', avatarUrl: '', gender: 'male' },
        { id: 'anchor_1', nickname: 'Dewi Lestari', avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', gender: 'female', isHost: true },
      ],
      messages: [
        {
          id: 'm1',
          chatId: 'anchor_1',
          senderId: 'anchor_1',
          senderName: 'Dewi Lestari',
          text: 'Halo kak! Makasih udah video call tadi seru banget ya 😊',
          timestamp: '14:20',
          createdAt: Date.now() - 3600000,
        },
        {
          id: 'm2',
          chatId: 'anchor_1',
          senderId: 'user_current',
          senderName: 'Spender Member',
          text: 'Iya Dewi, nanti malam call lagi ya, aku topup koin dulu.',
          timestamp: '14:22',
          createdAt: Date.now() - 3500000,
        },
        {
          id: 'm3',
          chatId: 'anchor_1',
          senderId: 'user_current',
          senderName: 'Spender Member',
          text: 'Aku kirim hadiah Mawar Merah buat kamu ya 🌹',
          timestamp: '14:25',
          createdAt: Date.now() - 3400000,
          gift: { name: 'Mawar Merah', coins: 50 },
        },
      ],
      isFrozen: false,
      lastActivity: Date.now() - 3400000,
      riskScore: 5,
    };

    const chatBellaSuspicious: ChatroomRecord = {
      chatId: 'anchor_2',
      participants: [
        { id: 'user_hadi_jkt_442', nickname: 'Hadi Nugroho', avatarUrl: '', gender: 'male' },
        { id: 'anchor_2', nickname: 'Bella Putri', avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150', gender: 'female', isHost: true },
      ],
      messages: [
        {
          id: 'mb1',
          chatId: 'anchor_2',
          senderId: 'anchor_2',
          senderName: 'Bella Putri',
          text: 'Hai kak Hadi! Makasih hadiahnya tadi ya.',
          timestamp: '15:10',
          createdAt: Date.now() - 1800000,
        },
        {
          id: 'mb2',
          chatId: 'anchor_2',
          senderId: 'user_hadi_jkt_442',
          senderName: 'Hadi Nugroho',
          text: 'Bella, koin di app ini agak mahal ya. Minta nomor WA kamu dong biar kita bisa video call langsung di luar?',
          timestamp: '15:14',
          createdAt: Date.now() - 1500000,
          isFlagged: true,
        },
        {
          id: 'mb3',
          chatId: 'anchor_2',
          senderId: 'anchor_2',
          senderName: 'Bella Putri',
          text: 'Boleh kak, transfer BCA langsung aja 200rb nanti aku kasih no WA pribadi ku ya.',
          timestamp: '15:15',
          createdAt: Date.now() - 1400000,
          isFlagged: true,
        },
      ],
      isFrozen: false,
      lastActivity: Date.now() - 1400000,
      riskScore: 85,
      riskReason: 'Terdeteksi upaya transaksi luar (transfer BCA & nomor WhatsApp)',
    };

    this.chatrooms.set('anchor_1', chatDewi);
    this.chatrooms.set('anchor_2', chatBellaSuspicious);
  }
}

export const surveillanceService = new SurveillanceService();
