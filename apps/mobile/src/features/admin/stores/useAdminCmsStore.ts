import { create } from 'zustand';
import {
  PostHogFeatureFlagConfig,
  PostHogFunnelReport,
  PostHogTelemetryStat,
  PgVectorConsoleStats,
  SemanticMatchResult,
  WithdrawalRequest,
  TopupTransaction,
  RevenueShareConfig,
  DEFAULT_REVENUE_SHARE_CONFIG,
  DEFAULT_POSTHOG_FEATURE_FLAGS,
} from '@tresno/shared';
import { aiVectorService } from '../../../shared/services/aiVectorService';
import { toast } from '../../../shared/stores/useToastStore';

export type CmsTab =
  | 'dashboard'
  | 'posthog'
  | 'pgvector'
  | 'users'
  | 'moderation'
  | 'withdrawals'
  | 'surveillance'
  | 'settings';

export interface CmsUserItem {
  id: string;
  username: string;
  nickname: string;
  avatarUrl: string;
  gender: 'female' | 'male';
  isHost: boolean;
  isOnline: boolean;
  isBanned: boolean;
  isVip: boolean;
  isKycVerified: boolean;
  coinBalance: number;
  diamondBalance: number;
  albumPhotos: Array<{
    id: string;
    url: string;
    status: 'approved' | 'pending_review' | 'rejected';
    isCover: boolean;
  }>;
  createdAt: number;
}

export interface CmsModerationItem {
  id: string;
  type: 'STORY' | 'ALBUM_PHOTO';
  authorId: string;
  authorNickname: string;
  mediaUrl: string;
  caption?: string;
  status: 'pending_review' | 'approved' | 'rejected' | 'blurred';
  aiConfidenceScores: {
    saraRisk: number; // 0 - 100%
    pornoRisk: number; // 0 - 100%
    cleanliness: number; // 0 - 100%
  };
  rejectionReason?: string;
  reportedAt: number;
}

interface AdminCmsState {
  activeTab: CmsTab;
  setActiveTab: (tab: CmsTab) => void;

  // PostHog
  posthogStats: PostHogTelemetryStat | null;
  featureFlags: PostHogFeatureFlagConfig[];
  funnelReport: PostHogFunnelReport | null;
  isLoadingPosthog: boolean;
  fetchPosthogData: () => Promise<void>;
  updateFeatureFlag: (key: string, isEnabled?: boolean, rolloutPercentage?: number) => Promise<void>;

  // PgVector
  pgvectorStats: PgVectorConsoleStats | null;
  vectorSearchQuery: string;
  setVectorSearchQuery: (q: string) => void;
  vectorSearchResults: SemanticMatchResult[];
  isSearchingVectors: boolean;
  isReindexing: boolean;
  fetchPgvectorStats: () => Promise<void>;
  runSemanticSearch: (query: string) => Promise<void>;
  reindexVectors: () => Promise<void>;

  // Users & Hosts CRM
  users: CmsUserItem[];
  selectedUser: CmsUserItem | null;
  setSelectedUser: (user: CmsUserItem | null) => void;
  adjustUserBalance: (userId: string, coinDelta: number, reason: string) => void;
  toggleUserBan: (userId: string, reason?: string) => void;
  toggleHostKyc: (userId: string) => void;

  // Moderasi Queue
  moderationQueue: CmsModerationItem[];
  approveModerationItem: (id: string) => void;
  rejectModerationItem: (id: string, reason: string) => void;
  blurModerationItem: (id: string) => void;

  // Finance & Withdrawals
  withdrawals: WithdrawalRequest[];
  topupList: TopupTransaction[];
  revenueShare: RevenueShareConfig;
  approveWithdrawal: (id: string) => void;
  rejectWithdrawal: (id: string, reason: string) => void;
  updateRevenueShare: (cfg: Partial<RevenueShareConfig>) => void;

  // System Credentials
  apiKeys: {
    supabaseUrl: string;
    supabaseServiceKey: string;
    posthogHost: string;
    posthogApiKey: string;
    agoraAppId: string;
  };
  setApiKeys: (keys: Partial<AdminCmsState['apiKeys']>) => void;

  isCmsOpen: boolean;
  openCms: () => void;
  closeCms: () => void;
}

export const useAdminCmsStore = create<AdminCmsState>((set, get) => ({
  activeTab: 'dashboard',
  setActiveTab: (tab) => set({ activeTab: tab }),

  isCmsOpen: false,
  openCms: () => set({ isCmsOpen: true }),
  closeCms: () => set({ isCmsOpen: false }),

  // 1. PostHog
  posthogStats: null,
  featureFlags: DEFAULT_POSTHOG_FEATURE_FLAGS,
  funnelReport: null,
  isLoadingPosthog: false,

  fetchPosthogData: async () => {
    set({ isLoadingPosthog: true });
    try {
      const [statsRes, flagsRes, funnelRes] = await Promise.all([
        fetch('http://localhost:4000/api/posthog/stats').catch(() => null),
        fetch('http://localhost:4000/api/posthog/feature-flags').catch(() => null),
        fetch('http://localhost:4000/api/posthog/funnel').catch(() => null),
      ]);

      if (statsRes && statsRes.ok) {
        const s = await statsRes.json();
        set({ posthogStats: s.data });
      }

      if (flagsRes && flagsRes.ok) {
        const f = await flagsRes.json();
        if (Array.isArray(f.data)) set({ featureFlags: f.data });
      }

      if (funnelRes && funnelRes.ok) {
        const fn = await funnelRes.json();
        set({ funnelReport: fn.data });
      }
    } finally {
      set({ isLoadingPosthog: false });
    }
  },

  updateFeatureFlag: async (key, isEnabled, rolloutPercentage) => {
    try {
      const res = await fetch('http://localhost:4000/api/posthog/feature-flags/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, isEnabled, rolloutPercentage }),
      });

      if (res.ok) {
        const json = await res.json();
        set((state) => ({
          featureFlags: state.featureFlags.map((f) => (f.key === key ? { ...f, ...json.data } : f)),
        }));
        toast.success(`Feature Flag '${key}' berhasil diperbarui`);
      }
    } catch {
      // Local fallback
      set((state) => ({
        featureFlags: state.featureFlags.map((f) =>
          f.key === key
            ? {
                ...f,
                isEnabled: isEnabled !== undefined ? isEnabled : f.isEnabled,
                rolloutPercentage: rolloutPercentage !== undefined ? rolloutPercentage : f.rolloutPercentage,
              }
            : f
        ),
      }));
      toast.success(`Feature Flag '${key}' diperbarui (lokal)`);
    }
  },

  // 2. PgVector
  pgvectorStats: null,
  vectorSearchQuery: 'curhat malam santai asik',
  setVectorSearchQuery: (q) => set({ vectorSearchQuery: q }),
  vectorSearchResults: [],
  isSearchingVectors: false,
  isReindexing: false,

  fetchPgvectorStats: async () => {
    const stats = await aiVectorService.getPgVectorStats();
    set({ pgvectorStats: stats });
  },

  runSemanticSearch: async (query) => {
    set({ isSearchingVectors: true });
    try {
      const results = await aiVectorService.searchHostsSemantic(query, 6);
      set({ vectorSearchResults: results });
    } finally {
      set({ isSearchingVectors: false });
    }
  },

  reindexVectors: async () => {
    set({ isReindexing: true });
    try {
      const updated = await aiVectorService.triggerReindex();
      set({ pgvectorStats: updated });
      toast.success('PgVector HNSW index & embeddings berhasil di-reindex!');
    } catch {
      toast.success('Re-indexing selesai (in-memory mode)');
    } finally {
      set({ isReindexing: false });
    }
  },

  // 3. User & Host CRM
  users: [
    {
      id: 'usr_sultan_01',
      username: 'sultan_jakarta_99',
      nickname: 'Sultan Jakarta 99',
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
      gender: 'male',
      isHost: false,
      isOnline: true,
      isBanned: false,
      isVip: true,
      isKycVerified: true,
      coinBalance: 28500,
      diamondBalance: 0,
      albumPhotos: [
        { id: 'ph_1', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400', status: 'approved', isCover: true },
        { id: 'ph_2', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400', status: 'approved', isCover: false },
      ],
      createdAt: Date.now() - 86400000 * 45,
    },
    {
      id: 'host_dewi_lestari_jkt',
      username: 'dewi_lestari',
      nickname: 'Dewi Lestari',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80',
      gender: 'female',
      isHost: true,
      isOnline: true,
      isBanned: false,
      isVip: true,
      isKycVerified: true,
      coinBalance: 420,
      diamondBalance: 8400,
      albumPhotos: [
        { id: 'ph_d1', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400', status: 'approved', isCover: true },
        { id: 'ph_d2', url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400', status: 'approved', isCover: false },
        { id: 'ph_d3', url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400', status: 'approved', isCover: false },
      ],
      createdAt: Date.now() - 86400000 * 90,
    },
    {
      id: 'usr_spammer_bot',
      username: 'bot_promo_vcs',
      nickname: 'VCS Murah 50k',
      avatarUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=200',
      gender: 'male',
      isHost: false,
      isOnline: false,
      isBanned: true,
      isVip: false,
      isKycVerified: false,
      coinBalance: 0,
      diamondBalance: 0,
      albumPhotos: [
        { id: 'ph_b1', url: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400', status: 'rejected', isCover: true },
      ],
      createdAt: Date.now() - 86400000 * 2,
    },
  ],
  selectedUser: null,
  setSelectedUser: (u) => set({ selectedUser: u }),

  adjustUserBalance: (userId, coinDelta, reason) => {
    set((state) => ({
      users: state.users.map((u) =>
        u.id === userId ? { ...u, coinBalance: Math.max(0, u.coinBalance + coinDelta) } : u
      ),
    }));
    toast.success(`Saldo koin user disesuaikan (${coinDelta > 0 ? '+' : ''}${coinDelta}): ${reason}`);
  },

  toggleUserBan: (userId, reason) => {
    set((state) => ({
      users: state.users.map((u) => {
        if (u.id === userId) {
          const nextBanned = !u.isBanned;
          toast.info(nextBanned ? `User diblokir (${reason || 'Pelanggaran pedoman'})` : 'Blokir user dicabut');
          return { ...u, isBanned: nextBanned };
        }
        return u;
      }),
    }));
  },

  toggleHostKyc: (userId) => {
    set((state) => ({
      users: state.users.map((u) => {
        if (u.id === userId) {
          const nextKyc = !u.isKycVerified;
          toast.success(nextKyc ? 'Status KYC Host Terverifikasi' : 'Status KYC Host Dinonaktifkan');
          return { ...u, isKycVerified: nextKyc };
        }
        return u;
      }),
    }));
  },

  // 4. Moderasi Queue
  moderationQueue: [
    {
      id: 'mod_story_01',
      type: 'STORY',
      authorId: 'usr_maya_09',
      authorNickname: 'Maya Putri',
      mediaUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400',
      caption: 'Lagi santai ngopi di Bandung, yang mau mabar merapat yaa!',
      status: 'pending_review',
      aiConfidenceScores: { saraRisk: 2, pornoRisk: 4, cleanliness: 94 },
      reportedAt: Date.now() - 3600000,
    },
    {
      id: 'mod_album_02',
      type: 'ALBUM_PHOTO',
      authorId: 'usr_spammer_bot',
      authorNickname: 'VCS Murah 50k',
      mediaUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400',
      caption: 'Open BO dan VCS langsung chat nomor WA',
      status: 'pending_review',
      aiConfidenceScores: { saraRisk: 5, pornoRisk: 96, cleanliness: 3 },
      reportedAt: Date.now() - 7200000,
    },
    {
      id: 'mod_story_03',
      type: 'STORY',
      authorId: 'host_siti_rahma_sby',
      authorNickname: 'Siti Rahmawati',
      mediaUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400',
      caption: 'Malam ini nyanyi lagu akustik request teman-teman 🎶',
      status: 'approved',
      aiConfidenceScores: { saraRisk: 1, pornoRisk: 2, cleanliness: 97 },
      reportedAt: Date.now() - 14400000,
    },
  ],

  approveModerationItem: (id) => {
    set((state) => ({
      moderationQueue: state.moderationQueue.map((m) =>
        m.id === id ? { ...m, status: 'approved' } : m
      ),
    }));
    toast.success('Konten disetujui untuk penayangan publik');
  },

  rejectModerationItem: (id, reason) => {
    set((state) => ({
      moderationQueue: state.moderationQueue.map((m) =>
        m.id === id ? { ...m, status: 'rejected', rejectionReason: reason } : m
      ),
    }));
    toast.warning(`Konten ditolak: ${reason}`);
  },

  blurModerationItem: (id) => {
    set((state) => ({
      moderationQueue: state.moderationQueue.map((m) =>
        m.id === id ? { ...m, status: 'blurred' } : m
      ),
    }));
    toast.info('Konten diburamkan (Blurred by Admin)');
  },

  // 5. Finance
  withdrawals: [
    {
      id: 'WD-20261017-001',
      hostId: 'host_dewi_lestari_jkt',
      hostName: 'Dewi Lestari',
      agencyCode: 'AGENCY_GARUDA',
      method: 'BCA',
      accountNumber: '8271920381',
      accountName: 'Dewi Lestari',
      pointsRequested: 3500,
      ratePerPoint: 100,
      grossAmountIdr: 350000,
      adminFeeIdr: 2500,
      netAmountIdr: 347500,
      status: 'PENDING_REVIEW',
      createdAt: Date.now() - 3600000 * 3,
    },
    {
      id: 'WD-20261017-002',
      hostId: 'host_bella_putri_bdg',
      hostName: 'Bella Putri',
      agencyCode: undefined,
      method: 'DANA',
      accountNumber: '081298765432',
      accountName: 'Bella Putri',
      pointsRequested: 2000,
      ratePerPoint: 100,
      grossAmountIdr: 200000,
      adminFeeIdr: 0,
      netAmountIdr: 200000,
      status: 'APPROVED',
      createdAt: Date.now() - 86400000,
    },
  ],

  topupList: [
    {
      id: 'INV-20261017-0941',
      userId: 'usr_sultan_01',
      userNickname: 'Sultan Jakarta 99',
      packageId: 'pack_1200k',
      packageName: 'Paket Mahkota Raja VIP',
      amountIdr: 1200000,
      coinsAwarded: 20000,
      bonusCoinsAwarded: 8000,
      couponsAwarded: 20,
      paymentMethod: 'QRIS',
      status: 'PAID',
      createdAt: Date.now() - 7200000,
      paidAt: Date.now() - 7180000,
      isSpenderVIP: true,
    },
  ],

  revenueShare: { ...DEFAULT_REVENUE_SHARE_CONFIG },

  approveWithdrawal: (id) => {
    set((state) => ({
      withdrawals: state.withdrawals.map((w) =>
        w.id === id ? { ...w, status: 'APPROVED', reviewedAt: Date.now() } : w
      ),
    }));
    toast.success(`Penarikan ${id} disetujui`);
  },

  rejectWithdrawal: (id, reason) => {
    set((state) => ({
      withdrawals: state.withdrawals.map((w) =>
        w.id === id ? { ...w, status: 'REJECTED', rejectionReason: reason, reviewedAt: Date.now() } : w
      ),
    }));
    toast.warning(`Penarikan ${id} ditolak: ${reason}`);
  },

  updateRevenueShare: (cfg) => {
    set((state) => ({
      revenueShare: { ...state.revenueShare, ...cfg },
    }));
    toast.success('Konfigurasi pembagian hasil berhasil disimpan');
  },

  // 6. API Keys
  apiKeys: {
    supabaseUrl: 'https://demo-tresno.supabase.co',
    supabaseServiceKey: 'eyJh...dummy_service_key',
    posthogHost: 'https://app.posthog.com',
    posthogApiKey: 'phc_dummy_posthog_key_2026',
    agoraAppId: 'dummy_agora_app_id',
  },

  setApiKeys: (keys) => {
    set((state) => ({
      apiKeys: { ...state.apiKeys, ...keys },
    }));
    toast.success('Kunci API konfigurasi berhasil diperbarui');
  },
}));
