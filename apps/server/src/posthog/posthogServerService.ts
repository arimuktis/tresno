import {
  PostHogEventPayload,
  PostHogFeatureFlagConfig,
  PostHogFunnelReport,
  PostHogTelemetryStat,
  DEFAULT_POSTHOG_FEATURE_FLAGS,
} from '@tresno/shared';

class PostHogServerService {
  private events: Array<{
    id: string;
    event: string;
    distinctId: string;
    properties: Record<string, any>;
    timestamp: number;
  }> = [];

  private featureFlags: Map<string, PostHogFeatureFlagConfig> = new Map();
  private totalEventsCaptured: number = 24890;
  private startTime: number = Date.now();

  constructor() {
    // Inisialisasi feature flags default
    for (const flag of DEFAULT_POSTHOG_FEATURE_FLAGS) {
      this.featureFlags.set(flag.key, { ...flag });
    }

    // Seed beberapa event realistis
    this.seedRecentEvents();
  }

  private seedRecentEvents(): void {
    const sampleEvents = [
      {
        event: 'match_radar_started',
        distinctId: 'user_sultan_99',
        properties: { genderFilter: 'female', mode: 'auto_radar', device: 'chrome_mac' },
      },
      {
        event: 'match_found',
        distinctId: 'user_sultan_99',
        properties: { hostId: 'host_dewi_lestari_jkt', latencyMs: 140, matchScore: 98 },
      },
      {
        event: 'call_minute_billed',
        distinctId: 'user_sultan_99',
        properties: { hostId: 'host_dewi_lestari_jkt', minuteIndex: 1, costCoins: 60 },
      },
      {
        event: 'ai_icebreaker_requested',
        distinctId: 'user_curhat_01',
        properties: { hostId: 'host_bella_putri_bdg', category: 'DEEP' },
      },
      {
        event: 'pgvector_semantic_match',
        distinctId: 'user_gamer_id',
        properties: { queryText: 'suka main game dan anime', matchedHost: 'host_clara_anindya_yk', score: 0.96 },
      },
      {
        event: 'gift_sent',
        distinctId: 'user_sultan_99',
        properties: { giftId: 'gift_super_sports_car', hostId: 'host_dewi_lestari_jkt', costCoins: 1200 },
      },
      {
        event: 'topup_success',
        distinctId: 'user_whale_surabaya',
        properties: { packageId: 'pack_1200k', amountIdr: 1200000, paymentMethod: 'QRIS' },
      },
    ];

    sampleEvents.forEach((item, idx) => {
      this.events.push({
        id: `ev_${Date.now() - (7 - idx) * 15000}_${idx}`,
        event: item.event,
        distinctId: item.distinctId,
        properties: item.properties,
        timestamp: Date.now() - (7 - idx) * 15000,
      });
    });
  }

  /**
   * Menangkap dan mencatat event telemetry
   */
  public capture(payload: PostHogEventPayload): void {
    const ev = {
      id: `ev_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      event: payload.event,
      distinctId: payload.distinctId,
      properties: payload.properties || {},
      timestamp: payload.timestamp || Date.now(),
    };

    this.events.unshift(ev);
    this.totalEventsCaptured++;

    // Batasi buffer in-memory ke 200 event terbaru
    if (this.events.length > 200) {
      this.events.pop();
    }
  }

  /**
   * Mengembalikan telemetry statistik untuk CMS
   */
  public getTelemetryStats(): PostHogTelemetryStat {
    const elapsedSec = Math.max(1, (Date.now() - this.startTime) / 1000);
    const rate = Number((this.events.length / Math.min(elapsedSec, 60)).toFixed(1));

    return {
      totalEvents24h: this.totalEventsCaptured,
      activeUsers24h: 1840,
      eventIngestionRatePerSec: Math.max(rate, 4.2),
      errorRatePercentage: 0.04,
      lastEventReceivedAt: this.events[0]?.timestamp || Date.now(),
      recentEvents: this.events.slice(0, 30),
    };
  }

  /**
   * Mengambil daftar feature flag
   */
  public getFeatureFlags(): PostHogFeatureFlagConfig[] {
    return Array.from(this.featureFlags.values());
  }

  /**
   * Mengecek apakah sebuah feature flag aktif untuk distinctId
   */
  public isFeatureEnabled(flagKey: string, distinctId?: string): boolean {
    const flag = this.featureFlags.get(flagKey);
    if (!flag || !flag.isEnabled) return false;
    if (flag.rolloutPercentage >= 100) return true;
    if (flag.rolloutPercentage <= 0) return false;

    // Deterministic hashing berdasarkan distinctId
    if (distinctId) {
      let hash = 0;
      for (let i = 0; i < distinctId.length; i++) {
        hash = (hash << 5) - hash + distinctId.charCodeAt(i);
        hash |= 0;
      }
      const score = Math.abs(hash) % 100;
      return score < flag.rolloutPercentage;
    }

    return Math.random() * 100 < flag.rolloutPercentage;
  }

  /**
   * Memperbarui konfigurasi feature flag dari CMS
   */
  public updateFeatureFlag(
    key: string,
    updatesOrEnabled: Partial<PostHogFeatureFlagConfig> | boolean,
    rolloutPercentage?: number
  ): PostHogFeatureFlagConfig | null {
    const existing = this.featureFlags.get(key);
    if (!existing) return null;

    const updates: Partial<PostHogFeatureFlagConfig> =
      typeof updatesOrEnabled === 'object'
        ? updatesOrEnabled
        : {
            isEnabled: updatesOrEnabled,
            ...(rolloutPercentage !== undefined ? { rolloutPercentage } : {}),
          };

    const updated: PostHogFeatureFlagConfig = {
      ...existing,
      ...updates,
      lastModifiedAt: Date.now(),
    };

    this.featureFlags.set(key, updated);
    return updated;
  }


  /**
   * Menghasilkan laporan Funnel Analitik Konversi
   */
  public getFunnelReport(): PostHogFunnelReport {
    const totalEntrants = 12500;
    return {
      funnelId: 'funnel_match_to_topup',
      funnelName: 'Matchmaking to VIP Monetization Funnel',
      period: '7d',
      totalEntrants,
      overallConversionRate: 0.142, // 14.2% sampai topup
      steps: [
        {
          stepIndex: 1,
          stepName: 'Mulai Radar Match',
          description: 'Pengguna menekan tombol mulai pencarian di Tab Match',
          uniqueUsers: totalEntrants,
          conversionRate: 1.0,
          dropOffRate: 0.0,
        },
        {
          stepIndex: 2,
          stepName: 'Terhubung ke Host',
          description: 'Berhasil melakukan koneksi RTC WebRTC/Agora ke host',
          uniqueUsers: 10875,
          conversionRate: 0.87,
          dropOffRate: 0.13,
        },
        {
          stepIndex: 3,
          stepName: 'Melewati 20 Detik Gratis',
          description: 'Pengguna menikmati obrolan dan tidak menutup sebelum 20 detik',
          uniqueUsers: 6850,
          conversionRate: 0.548,
          dropOffRate: 0.37,
        },
        {
          stepIndex: 4,
          stepName: 'Masuk Menit Berbayar (60 Koin)',
          description: 'Memotong saldo koin pertama dan melanjutkan panggilan',
          uniqueUsers: 3950,
          conversionRate: 0.316,
          dropOffRate: 0.42,
        },
        {
          stepIndex: 5,
          stepName: 'Mengirim Hadiah Virtual (Gifts)',
          description: 'Mengirimkan kado virtual animasi ke host saat panggilan berlangsung',
          uniqueUsers: 2420,
          conversionRate: 0.1936,
          dropOffRate: 0.387,
        },
        {
          stepIndex: 6,
          stepName: 'Top-up Koin Ulang (Monetisasi)',
          description: 'Membeli paket koin melalui QRIS, Virtual Account, atau E-Wallet',
          uniqueUsers: 1775,
          conversionRate: 0.142,
          dropOffRate: 0.266,
        },
      ],
    };
  }
}

export const posthogServerService = new PostHogServerService();
