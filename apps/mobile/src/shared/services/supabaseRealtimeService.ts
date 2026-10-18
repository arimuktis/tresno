import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase, isRealSupabaseConfigured } from './supabaseClient';
import { StoryItem, UserStoryGroup } from '@tresno/shared';
import { AuthUser } from '../../features/auth/services/authService';

import { UserPresenceStatus } from '@tresno/shared';

export interface PresenceUserInfo {
  userId: string;
  nickname: string;
  avatarUrl: string;
  isHost: boolean;
  status: UserPresenceStatus; // 'available' (ijo) | 'busy' (merah pink) | 'offline' (abu-abu)
  joinedAt: number;
}

export type RealtimeConnectionState = 'connected' | 'connecting' | 'simulated_live' | 'disconnected';

export interface RealtimeDiagnosticStats {
  state: RealtimeConnectionState;
  isRealSupabase: boolean;
  pingMs: number;
  activeChannels: string[];
  onlineUsersCount: number;
  totalEventsReceived: number;
  lastEventName?: string;
  lastEventTimestamp?: number;
}

class SupabaseRealtimeService {
  private presenceChannel: RealtimeChannel | null = null;
  private storiesChannel: RealtimeChannel | null = null;
  private chatChannel: RealtimeChannel | null = null;
  private localBroadcast: BroadcastChannel | null = null;

  private state: RealtimeConnectionState = 'disconnected';
  private pingMs: number = 0;
  private totalEventsReceived: number = 0;
  private lastEventName?: string;
  private lastEventTimestamp?: number;
  private onlineUsers: Map<string, PresenceUserInfo> = new Map();

  private storyListeners: Set<(story: StoryItem, group?: UserStoryGroup) => void> = new Set();
  private chatListeners: Set<(message: any) => void> = new Set();
  private presenceListeners: Set<(users: PresenceUserInfo[]) => void> = new Set();
  private statusListeners: Set<(stats: RealtimeDiagnosticStats) => void> = new Set();

  constructor() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.localBroadcast = new BroadcastChannel('tresno_supabase_realtime');
        this.localBroadcast.onmessage = (event) => {
          this.handleIncomingBroadcast(event.data);
        };
      } catch (_) {}
    }
  }

  /**
   * Inisialisasi koneksi Live Data Supabase Realtime
   */
  public init(currentUser?: AuthUser | null) {
    if (this.state === 'connected' || this.state === 'simulated_live') {
      return;
    }

    const isReal = isRealSupabaseConfigured();
    this.state = isReal ? 'connecting' : 'simulated_live';
    this.notifyStatus();

    if (isReal) {
      this.connectRealSupabase(currentUser);
    } else {
      this.initSimulatedRealtime(currentUser);
    }
  }

  /**
   * Koneksi ke Supabase Realtime Server yang sesungguhnya
   */
  private connectRealSupabase(currentUser?: AuthUser | null) {
    try {
      const startTime = Date.now();

      // 1. Channel Presence (Melacak Host & User Online)
      this.presenceChannel = supabase.channel('tresno-presence', {
        config: { presence: { key: currentUser?.id || 'anon_user' } },
      });

      this.presenceChannel
        .on('presence', { event: 'sync' }, () => {
          const presenceState = this.presenceChannel?.presenceState() || {};
          const users: PresenceUserInfo[] = [];
          Object.values(presenceState).forEach((presences: any) => {
            presences.forEach((p: PresenceUserInfo) => users.push(p));
          });
          this.updateOnlineUsers(users);
        })
        .subscribe(async (status) => {
          if (status === 'SUBSCRIBED') {
            this.state = 'connected';
            this.pingMs = Math.max(12, Date.now() - startTime);
            this.notifyStatus();

            if (currentUser) {
              await this.presenceChannel?.track({
                userId: currentUser.id,
                nickname: currentUser.nickname,
                avatarUrl: currentUser.avatarUrl || '',
                isHost: currentUser.isHost,
                status: 'available',
                joinedAt: Date.now(),
              });
            }
          }
        });

      // 2. Channel Live Stories (Broadcast & Postgres Changes)
      this.storiesChannel = supabase.channel('tresno-live-stories');
      this.storiesChannel
        .on('broadcast', { event: 'NEW_STORY' }, (payload) => {
          this.handleEventReceived('NEW_STORY', payload.payload);
        })
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'stories' }, (payload) => {
          this.handleEventReceived('POSTGRES_INSERT_STORY', payload.new);
        })
        .subscribe();

      // 3. Channel Live Chat (Broadcast & Postgres Changes)
      this.chatChannel = supabase.channel('tresno-live-chat');
      this.chatChannel
        .on('broadcast', { event: 'CHAT_MESSAGE' }, (payload) => {
          this.handleEventReceived('CHAT_MESSAGE', payload.payload);
        })
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
          this.handleEventReceived('POSTGRES_INSERT_MESSAGE', payload.new);
        })
        .subscribe();
    } catch (err) {
      console.warn('[Supabase Realtime] Error connecting to real channels, fallback to simulated:', err);
      this.initSimulatedRealtime(currentUser);
    }
  }

  /**
   * Broadcast presence status pengguna saat ini (tersedia, busy call, atau offline)
   */
  public async broadcastMyPresence(status: UserPresenceStatus): Promise<void> {
    if (this.presenceChannel && this.state === 'connected') {
      try {
        await this.presenceChannel.track({
          status,
          updatedAt: Date.now(),
        });
      } catch (err) {
        console.warn('[Supabase Realtime] Track presence status failed:', err);
      }
    }

    if (this.localBroadcast) {
      this.localBroadcast.postMessage({
        type: 'PRESENCE_STATUS_UPDATE',
        payload: { status, timestamp: Date.now() },
      });
    }
  }

  /**
   * Simulasi Realtime Lokal / Multi-Tab Fallback saat akun Supabase belum terisi
   */
  private initSimulatedRealtime(currentUser?: AuthUser | null) {
    this.state = 'simulated_live';
    this.pingMs = 5; // Fast local ping
    this.notifyStatus();

    // Inisialisasi daftar host online awal dengan 3 state: Available (Ijo), Busy (Merah Pink), Offline (Abu-abu)
    const defaultHosts: PresenceUserInfo[] = [
      {
        userId: 'anchor_1',
        nickname: 'Dewi Lestari',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300',
        isHost: true,
        status: 'available', // Ijo: Online & Available
        joinedAt: Date.now() - 3600000,
      },
      {
        userId: 'anchor_2',
        nickname: 'Bella Putri',
        avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300',
        isHost: true,
        status: 'busy', // Merah Pink: Sedang Video Call
        joinedAt: Date.now() - 1800000,
      },
      {
        userId: 'anchor_3',
        nickname: 'Siti Rahma',
        avatarUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=300',
        isHost: true,
        status: 'offline', // Abu-abu: Offline
        joinedAt: Date.now() - 7200000,
      },
      {
        userId: 'anchor_4',
        nickname: 'Nadia Safitri',
        avatarUrl: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=300',
        isHost: true,
        status: 'available', // Ijo: Online & Available
        joinedAt: Date.now() - 900000,
      },
    ];

    if (currentUser) {
      defaultHosts.push({
        userId: currentUser.id,
        nickname: currentUser.nickname,
        avatarUrl: currentUser.avatarUrl || '',
        isHost: currentUser.isHost,
        status: 'available',
        joinedAt: Date.now(),
      });
    }

    this.updateOnlineUsers(defaultHosts);
  }

  /**
   * Broadcast cerita baru secara instan ke seluruh client / tab yang terhubung
   */
  public async broadcastStory(story: StoryItem, group?: UserStoryGroup): Promise<void> {
    const payload = { story, group, timestamp: Date.now() };

    // 1. Broadcast ke Supabase Realtime Channel jika terhubung
    if (this.storiesChannel && this.state === 'connected') {
      try {
        await this.storiesChannel.send({
          type: 'broadcast',
          event: 'NEW_STORY',
          payload,
        });
      } catch (err) {
        console.warn('[Supabase Realtime] Broadcast failed:', err);
      }
    }

    // 2. Broadcast ke sesama browser tab / local context
    if (this.localBroadcast) {
      this.localBroadcast.postMessage({ type: 'NEW_STORY', payload });
    }

    // 3. Emit ke listeners lokal
    this.handleEventReceived('NEW_STORY', payload);
  }

  /**
   * Broadcast pesan chat baru secara realtime
   */
  public async broadcastChatMessage(message: any): Promise<void> {
    const payload = { message, timestamp: Date.now() };

    if (this.chatChannel && this.state === 'connected') {
      try {
        await this.chatChannel.send({
          type: 'broadcast',
          event: 'CHAT_MESSAGE',
          payload,
        });
      } catch (e) {}
    }

    if (this.localBroadcast) {
      this.localBroadcast.postMessage({ type: 'CHAT_MESSAGE', payload });
    }

    this.handleEventReceived('CHAT_MESSAGE', payload);
  }

  /**
   * Tangani data event yang masuk
   */
  private handleEventReceived(eventName: string, data: any) {
    this.totalEventsReceived++;
    this.lastEventName = eventName;
    this.lastEventTimestamp = Date.now();
    this.notifyStatus();

    if (eventName === 'NEW_STORY' || eventName === 'POSTGRES_INSERT_STORY') {
      const story = data.story || data;
      const group = data.group;
      this.storyListeners.forEach((listener) => listener(story, group));
    } else if (eventName === 'CHAT_MESSAGE' || eventName === 'POSTGRES_INSERT_MESSAGE') {
      const message = data.message || data;
      this.chatListeners.forEach((listener) => listener(message));
    }
  }

  private handleIncomingBroadcast(data: { type: string; payload: any }) {
    if (data && data.type) {
      this.handleEventReceived(data.type, data.payload);
    }
  }

  private updateOnlineUsers(users: PresenceUserInfo[]) {
    this.onlineUsers.clear();
    users.forEach((u) => this.onlineUsers.set(u.userId, u));
    this.presenceListeners.forEach((l) => l(Array.from(this.onlineUsers.values())));
    this.notifyStatus();
  }

  // Subscriptions & Listeners
  public onNewStory(callback: (story: StoryItem, group?: UserStoryGroup) => void): () => void {
    this.storyListeners.add(callback);
    return () => this.storyListeners.delete(callback);
  }

  public onChatMessage(callback: (message: any) => void): () => void {
    this.chatListeners.add(callback);
    return () => this.chatListeners.delete(callback);
  }

  public onPresenceChange(callback: (users: PresenceUserInfo[]) => void): () => void {
    this.presenceListeners.add(callback);
    callback(Array.from(this.onlineUsers.values()));
    return () => this.presenceListeners.delete(callback);
  }

  public onStatusChange(callback: (stats: RealtimeDiagnosticStats) => void): () => void {
    this.statusListeners.add(callback);
    callback(this.getStats());
    return () => this.statusListeners.delete(callback);
  }

  public getStats(): RealtimeDiagnosticStats {
    const activeChannels: string[] = [];
    if (this.presenceChannel) activeChannels.push('tresno-presence');
    if (this.storiesChannel) activeChannels.push('tresno-live-stories');
    if (this.chatChannel) activeChannels.push('tresno-live-chat');
    if (activeChannels.length === 0) activeChannels.push('simulated-broadcast-channel');

    return {
      state: this.state,
      isRealSupabase: isRealSupabaseConfigured(),
      pingMs: this.pingMs,
      activeChannels,
      onlineUsersCount: this.onlineUsers.size,
      totalEventsReceived: this.totalEventsReceived,
      lastEventName: this.lastEventName,
      lastEventTimestamp: this.lastEventTimestamp,
    };
  }

  private notifyStatus() {
    const stats = this.getStats();
    this.statusListeners.forEach((listener) => listener(stats));
  }

  /**
   * Simulasi pengiriman event live data uji coba
   */
  public triggerTestLiveEvent(type: 'story' | 'chat' | 'presence') {
    if (type === 'story') {
      const mockStory: StoryItem = {
        id: `story_live_${Date.now()}`,
        mediaUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800',
        mediaType: 'image',
        caption: '🔴 [LIVE REALTIME] Dewi Lestari baru saja memposting cerita baru via Supabase Live Data!',
        createdAt: Date.now(),
        expiresAt: Date.now() + 24 * 3600000,
        viewsCount: 1,
        likesCount: 0,
        status: 'approved',
      };
      this.broadcastStory(mockStory);
    } else if (type === 'presence') {
      const current = Array.from(this.onlineUsers.values());
      current.push({
        userId: `guest_${Date.now().toString(36)}`,
        nickname: `Pengguna Baru #${Math.floor(Math.random() * 900 + 100)}`,
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
        isHost: false,
        status: 'available',
        joinedAt: Date.now(),
      });
      this.updateOnlineUsers(current);
    }
  }

  public disconnect() {
    try {
      if (this.presenceChannel) supabase.removeChannel(this.presenceChannel);
      if (this.storiesChannel) supabase.removeChannel(this.storiesChannel);
      if (this.chatChannel) supabase.removeChannel(this.chatChannel);
    } catch (_) {}
    this.state = 'disconnected';
    this.notifyStatus();
  }
}

export const supabaseRealtimeService = new SupabaseRealtimeService();
