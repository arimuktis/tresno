import { create } from 'zustand';
import { MATCH_RULES } from '@tresno/shared';
import { socketService } from '../../../shared/services/socketService';
import { soundService } from '../../../shared/services/soundService';
import { useWalletStore } from '../../wallet/stores/useWalletStore';
import { useSocialStore } from '../../social/stores/useSocialStore';
import { useMissionStore } from '../../missions/stores/useMissionStore';
import { toast } from '../../../shared/stores/useToastStore';
import { supabaseRealtimeService } from '../../../shared/services/supabaseRealtimeService';
import { MessageRowData } from '../../../shared/components/organisms/MessageItemRow';

let isChatRealtimeSubscribed = false;

export interface ChatMessage {
  id: string;
  sequenceId: number;
  chatId: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: string;
  createdAt?: number;
  status: 'sending' | 'sent' | 'read';
  gift?: {
    icon: any;
    name: string;
    coins: number;
  };
}

import { UserPresenceStatus } from '@tresno/shared';

export interface ChatPeer {
  id: string;
  name: string;
  avatar: string;
  isOnline: boolean;
  presenceStatus?: UserPresenceStatus;
  isHost?: boolean;
  isSystem?: boolean;
  ratePerMin?: number;
}

export const DEFAULT_PEERS: Record<string, ChatPeer> = {
  anchor_system: {
    id: 'anchor_system',
    name: 'Tresno Official',
    avatar: '',
    isOnline: true,
    presenceStatus: 'available',
    isHost: false,
    isSystem: true,
  },
  anchor_1: {
    id: 'anchor_1',
    name: 'Dewi Lestari',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    isOnline: true,
    presenceStatus: 'available',
    isHost: true,
    ratePerMin: 60,
  },
  anchor_2: {
    id: 'anchor_2',
    name: 'Bella Putri',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
    isOnline: true,
    presenceStatus: 'busy',
    isHost: true,
    ratePerMin: 60,
  },
  anchor_3: {
    id: 'anchor_3',
    name: 'Siti Rahma',
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150',
    isOnline: false,
    presenceStatus: 'offline',
    isHost: true,
    ratePerMin: 60,
  },
  anchor_4: {
    id: 'anchor_4',
    name: 'Nadia Safitri',
    avatar: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=150',
    isOnline: true,
    presenceStatus: 'available',
    isHost: true,
    ratePerMin: 60,
  },
};

const STORAGE_UNLOCKED_CHATS_KEY = 'tresno_unlocked_chats';
const STORAGE_PINNED_CHATS_KEY = 'tresno_pinned_chats';
export const MAX_PINNED_CHATS = 20;

const getInitialUnlockedChats = (): Record<string, boolean> => {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const stored = window.localStorage.getItem(STORAGE_UNLOCKED_CHATS_KEY);
      if (stored) {
        return { anchor_system: true, anchor_1: true, ...JSON.parse(stored) };
      }
    } catch {
      // fallback
    }
  }
  return { anchor_system: true, anchor_1: true };
};

const saveUnlockedChats = (unlocked: Record<string, boolean>) => {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      window.localStorage.setItem(STORAGE_UNLOCKED_CHATS_KEY, JSON.stringify(unlocked));
    } catch {
      // ignore
    }
  }
};

const getInitialPinnedChats = (): string[] => {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const stored = window.localStorage.getItem(STORAGE_PINNED_CHATS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          return parsed.slice(0, MAX_PINNED_CHATS);
        }
      }
    } catch {
      // fallback
    }
  }
  return ['anchor_1'];
};

const savePinnedChats = (ids: string[]) => {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      window.localStorage.setItem(STORAGE_PINNED_CHATS_KEY, JSON.stringify(ids.slice(0, MAX_PINNED_CHATS)));
    } catch {
      // ignore
    }
  }
};

interface ChatState {
  activePeer: ChatPeer | null;
  isChatModalOpen: boolean;
  messages: Record<string, ChatMessage[]>; // Keyed by chatId
  unlockedChatIds: Record<string, boolean>; // Status unlock initial chat (10 koin)
  pinnedChatIds: string[]; // List chatId yang disematkan ke atas (maksimal 20)
  peers: Record<string, ChatPeer>;
  isTyping: boolean;

  openChat: (peer: ChatPeer) => void;
  closeChat: () => void;
  registerPeer: (peer: ChatPeer) => void;
  isChatUnlocked: (chatId: string) => boolean;
  unlockChat: (chatId: string) => void;
  pinChat: (chatId: string) => boolean;
  unpinChat: (chatId: string) => void;
  togglePinChat: (chatId: string) => boolean;
  isChatPinned: (chatId: string) => boolean;
  deleteMessage: (chatId: string, messageId: string) => void;
  deleteConversation: (chatId: string) => void;
  pinnedRoomMessages: Record<string, ChatMessage | null>;
  pinRoomMessage: (chatId: string, msg: ChatMessage | null) => void;
  sendMessage: (text: string, currentUserId: string, currentUserName: string, isHost: boolean) => Promise<boolean>;
  sendGift: (gift: { icon: any; name: string; coins: number }, currentUserId: string, currentUserName: string) => Promise<boolean>;
  markBatchAsRead: (chatId: string, messageIds: string[], maxSeqId?: number) => void;
  receiveIncomingMessage: (msg: ChatMessage) => void;
  getRecentConversations: (currentUserId?: string) => MessageRowData[];
  getSystemConversation: () => MessageRowData;
}

const INITIAL_MOCK_CONVERSATIONS: Record<string, ChatMessage[]> = {
  anchor_1: [
    {
      id: 'msg_dewi_1',
      sequenceId: 1,
      chatId: 'anchor_1',
      senderId: 'anchor_1',
      senderName: 'Dewi Lestari',
      text: 'Halo! Senang kenalan denganmu. Lagi santai kah malam ini?',
      timestamp: '19:40',
      createdAt: Date.now() - 86400000 - 3600000, // Kemarin
      status: 'read',
    },
    {
      id: 'msg_dewi_2',
      sequenceId: 2,
      chatId: 'anchor_1',
      senderId: 'anchor_1',
      senderName: 'Dewi Lestari',
      text: 'Aku baru selesai photoshoot nih, lumayan capek tapi seru hehe',
      timestamp: '19:42',
      createdAt: Date.now() - 86400000 - 3480000, // Kemarin (2 menit kemudian)
      status: 'read',
    },
    {
      id: 'msg_dewi_3',
      sequenceId: 3,
      chatId: 'anchor_1',
      senderId: 'anchor_1',
      senderName: 'Dewi Lestari',
      text: 'Hai lagi! Kalau mau ngobrol langsung via video call, tap tombol telepon di atas ya!',
      timestamp: '11:30',
      createdAt: Date.now() - 7200000, // Hari ini (pagi/siang)
      status: 'read',
    },
    {
      id: 'msg_dewi_4',
      sequenceId: 4,
      chatId: 'anchor_1',
      senderId: 'anchor_1',
      senderName: 'Dewi Lestari',
      text: 'Lagi santai kah siang ini? Aku lagi online nih.',
      timestamp: '13:20',
      createdAt: Date.now() - 900000, // Hari ini (selang >15 mnt, time divider!)
      status: 'read',
    },
  ],
  anchor_2: [
    {
      id: 'msg_bella_1',
      sequenceId: 1,
      chatId: 'anchor_2',
      senderId: 'anchor_2',
      senderName: 'Bella Putri',
      text: 'Halo! Makasih ya udah mampir ke profil aku.',
      timestamp: '15:10',
      createdAt: Date.now() - 86400000 * 2, // 2 hari lalu
      status: 'read',
    },
    {
      id: 'msg_bella_2',
      sequenceId: 2,
      chatId: 'anchor_2',
      senderId: 'anchor_2',
      senderName: 'Bella Putri',
      text: 'Panggilan video tak terjawab (13 detik)',
      timestamp: '12:20',
      createdAt: Date.now() - 3600000, // Hari ini
      status: 'read',
    },
    {
      id: 'msg_bella_3',
      sequenceId: 3,
      chatId: 'anchor_2',
      senderId: 'anchor_2',
      senderName: 'Bella Putri',
      text: 'Hai! Tadi aku sempat missed call pas lagi live streaming. Mau video call balik?',
      timestamp: '12:25',
      createdAt: Date.now() - 3300000, // Hari ini
      status: 'read',
    },
  ],
  anchor_system: [
    {
      id: 'msg_sys_1',
      sequenceId: 1,
      chatId: 'anchor_system',
      senderId: 'system',
      senderName: 'Tresno Official',
      text: 'Selamat datang di Tresno! Akun Anda telah terdaftar dan terverifikasi secara resmi.',
      timestamp: '09:00',
      createdAt: Date.now() - 86400000, // Kemarin
      status: 'read',
    },
    {
      id: 'msg_sys_2',
      sequenceId: 2,
      chatId: 'anchor_system',
      senderId: 'system',
      senderName: 'Tresno Official',
      text: 'Bonus Sambutan: 50 Koin bonus percobaan telah masuk ke dompetmu. Gunakan untuk mencoba obrolan video!',
      timestamp: '09:05',
      createdAt: Date.now() - 86400000 + 300000, // Kemarin
      status: 'read',
    },
    {
      id: 'msg_sys_3',
      sequenceId: 3,
      chatId: 'anchor_system',
      senderId: 'system',
      senderName: 'Tresno Official',
      text: 'Tips Keamanan: Jangan pernah membagikan password atau informasi sensitif kepada siapapun. Tim Tresno tidak akan pernah meminta data pribadi Anda.',
      timestamp: '13:00',
      createdAt: Date.now() - 1800000, // Hari ini
      status: 'read',
    },
    {
      id: 'msg_sys_4',
      sequenceId: 4,
      chatId: 'anchor_system',
      senderId: 'system',
      senderName: 'Tresno Official',
      text: 'Promo Spesial: Dapatkan bonus hingga +50% koin untuk top up pertama Anda hari ini! Ketuk menu Dompet untuk melihat penawaran.',
      timestamp: '14:30',
      createdAt: Date.now() - 600000, // Hari ini
      status: 'read',
    },
  ],
};

export const useChatStore = create<ChatState>((set, get) => ({
  activePeer: null,
  isChatModalOpen: false,
  messages: INITIAL_MOCK_CONVERSATIONS,
  peers: DEFAULT_PEERS,
  unlockedChatIds: getInitialUnlockedChats(),
  pinnedChatIds: getInitialPinnedChats(),
  isTyping: false,

  openChat: (peer) => {
    if (!isChatRealtimeSubscribed) {
      isChatRealtimeSubscribed = true;
      supabaseRealtimeService.onChatMessage((data) => {
        if (!data || !data.message) return;
        const incoming = data.message;
        const targetChatId = data.chatId || incoming.chatId;
        if (!targetChatId) return;

        set((state) => {
          const currentList = state.messages[targetChatId] || [];
          if (currentList.some((m) => m.id === incoming.id)) return state;
          return {
            messages: {
              ...state.messages,
              [targetChatId]: [...currentList, incoming],
            },
          };
        });
      });
    }

    const { peers } = get();
    set({
      activePeer: peer,
      isChatModalOpen: true,
      peers: { ...peers, [peer.id]: peer },
    });
  },

  closeChat: () => {
    set({
      isChatModalOpen: false,
      activePeer: null,
    });
  },

  registerPeer: (peer) => {
    const { peers } = get();
    set({
      peers: { ...peers, [peer.id]: peer },
    });
  },

  isChatUnlocked: (chatId: string) => {
    const { unlockedChatIds } = get();
    return Boolean(unlockedChatIds[chatId]);
  },

  unlockChat: (chatId: string) => {
    const { unlockedChatIds } = get();
    const next = { ...unlockedChatIds, [chatId]: true };
    saveUnlockedChats(next);
    set({
      unlockedChatIds: next,
    });
  },

  pinChat: (chatId: string) => {
    const { pinnedChatIds } = get();
    if (pinnedChatIds.includes(chatId)) {
      return true; // Sudah disematkan
    }
    // Cek batas maksimal 20 obrolan disematkan
    if (pinnedChatIds.length >= MAX_PINNED_CHATS) {
      toast.show('Maksimal 20 obrolan yang dapat disematkan.', 'warning');
      return false;
    }
    const next = [chatId, ...pinnedChatIds];
    savePinnedChats(next);
    set({ pinnedChatIds: next });
    toast.show(`Obrolan disematkan ke atas (${next.length}/${MAX_PINNED_CHATS})`, 'success');
    return true;
  },

  unpinChat: (chatId: string) => {
    const { pinnedChatIds } = get();
    if (!pinnedChatIds.includes(chatId)) return;
    const next = pinnedChatIds.filter((id) => id !== chatId);
    savePinnedChats(next);
    set({ pinnedChatIds: next });
    toast.show(`Sematkan obrolan dibatalkan (${next.length}/${MAX_PINNED_CHATS})`, 'info');
  },

  togglePinChat: (chatId: string) => {
    const { isChatPinned, pinChat, unpinChat } = get();
    if (isChatPinned(chatId)) {
      unpinChat(chatId);
      return false;
    } else {
      return pinChat(chatId);
    }
  },

  pinnedRoomMessages: {},

  pinRoomMessage: (chatId: string, msg: ChatMessage | null) => {
    const { pinnedRoomMessages } = get();
    const next = { ...pinnedRoomMessages, [chatId]: msg };
    set({ pinnedRoomMessages: next });
    if (msg) {
      toast.show('Pesan disematkan di ruang obrolan', 'success');
    } else {
      toast.show('Sematan pesan dilepas', 'info');
    }
  },

  deleteMessage: (chatId: string, messageId: string) => {
    const { messages, pinnedRoomMessages } = get();
    const currentList = messages[chatId] || [];
    const nextList = currentList.filter((m) => m.id !== messageId);
    const currentPinned = pinnedRoomMessages[chatId];
    const nextPinned = currentPinned?.id === messageId ? null : currentPinned;
    set({
      messages: { ...messages, [chatId]: nextList },
      pinnedRoomMessages: { ...pinnedRoomMessages, [chatId]: nextPinned },
    });
    toast.show('Pesan dihapus', 'info');
  },

  deleteConversation: (chatId: string) => {
    const { messages, pinnedChatIds, unpinChat, pinnedRoomMessages } = get();
    const nextMessages = { ...messages };
    delete nextMessages[chatId];
    const nextPinnedRooms = { ...pinnedRoomMessages };
    delete nextPinnedRooms[chatId];
    if (pinnedChatIds.includes(chatId)) {
      unpinChat(chatId);
    }
    set({ messages: nextMessages, pinnedRoomMessages: nextPinnedRooms });
    toast.show('Percakapan dihapus', 'info');
  },

  isChatPinned: (chatId: string) => {
    const { pinnedChatIds } = get();
    return pinnedChatIds.includes(chatId);
  },

  sendMessage: async (text, currentUserId, currentUserName, isHost) => {
    const { activePeer, messages, unlockedChatIds } = get();
    if (!activePeer || !text.trim()) return false;

    const chatId = activePeer.id;
    const wallet = useWalletStore.getState();
    const isSystemPeer = activePeer.isSystem || activePeer.id === 'anchor_system';

    // 1. Chat dengan System resmi selalu gratis
    if (isSystemPeer) {
      // Tidak ada biaya untuk membaca atau berinteraksi dengan pesan sistem
    } else if (isHost) {
      // 2. Host cewek membalas pesan: 100% Gratis & dapat Point reward resmi ala Tigo (+2 Points)
      const social = useSocialStore.getState();
      const isMutual = social.isMutualFriend(activePeer.id);
      const HOST_REPLY_POINTS = MATCH_RULES.HOST_REPLY_CHAT_POINTS; // 2 Points

      if (!isMutual) {
        wallet.addPoints(HOST_REPLY_POINTS);
        soundService.playCoinSound();
        toast.success(`+${HOST_REPLY_POINTS} Points dari balasan chat!`);
      } else {
        toast.info('Obrolan dengan teman: tidak ada hadiah Points.');
      }
      useMissionStore.getState().incrementMission('host_reply', 1);
    } else {
      // 3. User pria / caller mengirim pesan:
      const isUnlocked = Boolean(unlockedChatIds[chatId]);

      if (!isUnlocked) {
        const social = useSocialStore.getState();
        const isMutual = social.isMutualFriend(activePeer.id);

        if (isMutual) {
          // Pengecualian 1: Bebas biaya jika sudah berteman / saling follow!
          const next = { ...unlockedChatIds, [chatId]: true };
          saveUnlockedChats(next);
          set({ unlockedChatIds: next });
          toast.info('Obrolan gratis dengan teman saling follow!');
        } else if (wallet.chatCoupons > 0) {
          // Pengecualian 2: Bebas biaya jika punya Kupon Chat (chat coupon ala Tigo)
          wallet.useChatCoupon();
          const next = { ...unlockedChatIds, [chatId]: true };
          saveUnlockedChats(next);
          set({ unlockedChatIds: next });
          toast.success('1 Kupon Chat digunakan! Obrolan terbuka (pesan berikutnya gratis).');
        } else {
          // Dikenakan biaya initial chat 10 koin
          const INITIAL_CHAT_COST = MATCH_RULES.INITIAL_CHAT_COST_COINS; // 10 Koin
          if (wallet.coinBalance < INITIAL_CHAT_COST) {
            // Trigger upsell: tawarkan starter pack Rp 9.900 (jika belum diklaim), atau modal topup koin
            if (!wallet.hasClaimedStarterPack && !isHost) {
              wallet.openStarterPackModal();
            } else {
              wallet.openTopupModal();
            }
            toast.error('Perlu 10 Koin untuk membuka obrolan pertama.');
            return false;
          }

          wallet.deductCoins(INITIAL_CHAT_COST);
          const next = { ...unlockedChatIds, [chatId]: true };
          saveUnlockedChats(next);
          set({ unlockedChatIds: next });
          toast.success('Initial chat dibuka (10 Koin). Pesan selanjutnya gratis sepuasnya!');
        }
      }

      // Progress misi harian kirim pesan
      useMissionStore.getState().incrementMission('send_message', 1);
    }

    const currentList = messages[chatId] || [];
    const nextSeq = currentList.length + 1;
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    const newMsg: ChatMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      sequenceId: nextSeq,
      chatId,
      senderId: currentUserId,
      senderName: currentUserName,
      text: text.trim(),
      timestamp: timeStr,
      createdAt: Date.now(),
      status: 'sent',
    };

    // Optimistic UI update: timestamp aktivitas terbaru membuat percakapan ini
    // langsung otomatis naik ke posisi paling atas (index 0) di daftar Recent Chats!
    set({
      messages: {
        ...messages,
        [chatId]: [...currentList, newMsg],
      },
    });

    // Kirim via backend WebSocket nyata
    socketService.send('SEND_CHAT_MESSAGE', {
      chatId,
      recipientId: activePeer.id,
      message: newMsg,
    });

    // Broadcast ke Supabase Realtime live channel
    supabaseRealtimeService.broadcastChatMessage({
      chatId,
      recipientId: activePeer.id,
      message: newMsg,
    });

    return true;
  },

  sendGift: async (gift, currentUserId, currentUserName) => {
    const { activePeer, messages } = get();
    if (!activePeer) return false;

    const wallet = useWalletStore.getState();
    if (wallet.coinBalance < gift.coins) {
      toast.warning(`Saldo koin tidak mencukupi untuk mengirim ${gift.name} (${gift.coins.toLocaleString()} Koin).`);
      wallet.openTopupModal();
      return false;
    }

    wallet.deductCoins(gift.coins);
    // Konversi koin hadiah menjadi Points untuk Host (75% bagi hasil)
    const hostEarnedPoints = Math.max(1, Math.round(gift.coins * 0.75));
    wallet.addPoints(hostEarnedPoints);
    toast.success(`Hadiah ${gift.name} terkirim! Host menerima +${hostEarnedPoints} Points`);

    const chatId = activePeer.id;
    const currentList = messages[chatId] || [];
    const nextSeq = currentList.length + 1;
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    const newMsg: ChatMessage = {
      id: `msg_gift_${Date.now()}`,
      sequenceId: nextSeq,
      chatId,
      senderId: currentUserId,
      senderName: currentUserName,
      text: `Mengirim Hadiah: ${gift.icon} ${gift.name} (${gift.coins} Koin)`,
      timestamp: timeStr,
      createdAt: Date.now(),
      status: 'sent',
      gift,
    };

    set({
      messages: {
        ...messages,
        [chatId]: [...currentList, newMsg],
      },
    });

    socketService.send('SEND_CHAT_MESSAGE', {
      chatId,
      recipientId: activePeer.id,
      message: newMsg,
    });

    return true;
  },

  markBatchAsRead: (chatId, messageIds, maxSeqId) => {
    const { messages } = get();
    const currentList = messages[chatId];
    if (!currentList || currentList.length === 0) return;

    const idSet = new Set(messageIds);

    const updated = currentList.map((m) => {
      if (idSet.has(m.id) || (maxSeqId && m.sequenceId <= maxSeqId)) {
        return { ...m, status: 'read' as const };
      }
      return m;
    });

    set({
      messages: {
        ...messages,
        [chatId]: updated,
      },
    });

    // Kirim sinyal batch read ke server via WebSocket
    socketService.send('MESSAGES_READ_BATCH', {
      chatId,
      messageIds,
      maxSeqId,
    });
  },

  receiveIncomingMessage: (msg) => {
    const { messages } = get();
    const currentList = messages[msg.chatId] || [];
    const msgWithTime: ChatMessage = {
      ...msg,
      createdAt: msg.createdAt || Date.now(),
    };
    set({
      messages: {
        ...messages,
        [msg.chatId]: [...currentList, msgWithTime],
      },
    });
  },

  getRecentConversations: (currentUserId) => {
    const { messages, peers, pinnedChatIds } = get();
    const rows: MessageRowData[] = [];

    for (const [chatId, msgList] of Object.entries(messages)) {
      if (chatId === 'anchor_system') continue;
      if (!msgList || msgList.length === 0) continue;

      const lastMsg = msgList[msgList.length - 1];
      const peer = peers[chatId] || DEFAULT_PEERS[chatId] || {
        id: chatId,
        name: lastMsg.senderId !== currentUserId ? lastMsg.senderName : 'Teman Bicara',
        avatar: '',
        isOnline: false,
      };

      // Hitung jumlah pesan belum terbaca dari lawan bicara
      const unreadCount = msgList.filter(
        (m) => m.senderId !== currentUserId && m.status !== 'read'
      ).length;

      // Deteksi apakah pesan terakhir adalah riwayat panggilan / missed call
      const isCall = lastMsg.text.toLowerCase().includes('panggilan video');
      const isPinned = pinnedChatIds.includes(chatId);

      rows.push({
        id: chatId,
        sender: peer.name,
        avatar: peer.avatar,
        text: lastMsg.text,
        time: lastMsg.timestamp,
        timestamp: lastMsg.createdAt || (typeof lastMsg.timestamp === 'number' ? lastMsg.timestamp : Date.now()),
        unread: unreadCount > 0,
        unreadCount,
        type: isCall ? 'call' : 'chat',
        isHost: peer.isHost,
        isPinned,
      });
    }

    // Sort: Percakapan yang disematkan (isPinned) selalu berada di paling atas.
    // Jika sesama disematkan atau sesama tidak disematkan, urutkan berdasarkan aktivitas terbaru (timestamp DESC).
    rows.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return (b.timestamp || 0) - (a.timestamp || 0);
    });
    return rows;
  },

  getSystemConversation: () => {
    const { messages, peers } = get();
    const sysMsgs = messages['anchor_system'] || [];
    const lastSys = sysMsgs[sysMsgs.length - 1];
    const sysPeer = peers['anchor_system'] || DEFAULT_PEERS['anchor_system'];

    return {
      id: 'anchor_system',
      sender: sysPeer.name,
      avatar: '',
      text: lastSys ? lastSys.text : 'Selamat datang di Tresno!',
      time: lastSys ? lastSys.timestamp : '09:00',
      timestamp: lastSys?.createdAt || Date.now() - 600000,
      unread: false,
      unreadCount: 0,
      type: 'system',
      isOfficial: true,
    };
  },
}));
