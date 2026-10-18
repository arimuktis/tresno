/**
 * PostHog Analytics & Telemetry Types
 * Mendefinisikan kontrak event, skema telemetry, dan feature flags terpadu
 */

export type PostHogFeatureFlag =
  | 'pgvector-semantic-match'
  | 'ai-smart-icebreaker'
  | 'anti-churn-radar'
  | 'strict-sara-moderation'
  | 'live-stealth-monitor'
  | 'vip-gift-animations';

export interface PostHogEventPayload {
  distinctId: string;
  event: string;
  properties?: Record<string, any>;
  timestamp?: number;
}

export interface PostHogFeatureFlagConfig {
  key: PostHogFeatureFlag;
  description: string;
  isEnabled: boolean;
  rolloutPercentage: number; // 0 - 100
  targetAudience: 'ALL' | 'BETA_TESTERS' | 'VIP_ONLY' | 'HOSTS_ONLY';
  lastModifiedAt: number;
}

export interface FunnelStepMetric {
  stepIndex: number;
  stepName: string;
  description: string;
  uniqueUsers: number;
  conversionRate: number; // 0.0 - 1.0 (100%)
  dropOffRate: number;
}

export interface PostHogFunnelReport {
  funnelId: string;
  funnelName: string;
  period: '1d' | '7d' | '30d';
  totalEntrants: number;
  overallConversionRate: number;
  steps: FunnelStepMetric[];
}

export interface PostHogTelemetryStat {
  totalEvents24h: number;
  activeUsers24h: number;
  eventIngestionRatePerSec: number;
  errorRatePercentage: number;
  lastEventReceivedAt: number;
  recentEvents: Array<{
    id: string;
    event: string;
    distinctId: string;
    properties: Record<string, any>;
    timestamp: number;
  }>;
}

export const DEFAULT_POSTHOG_FEATURE_FLAGS: PostHogFeatureFlagConfig[] = [
  {
    key: 'pgvector-semantic-match',
    description: 'Pencocokan host semantik bertenaga pgvector dan embedding kosinus',
    isEnabled: true,
    rolloutPercentage: 100,
    targetAudience: 'ALL',
    lastModifiedAt: Date.now() - 3600000 * 24,
  },
  {
    key: 'ai-smart-icebreaker',
    description: 'Generator kalimat pembuka chat otomatis berbasis konteks persona host',
    isEnabled: true,
    rolloutPercentage: 80,
    targetAudience: 'ALL',
    lastModifiedAt: Date.now() - 3600000 * 12,
  },
  {
    key: 'anti-churn-radar',
    description: 'Booster prioritas antrean dinamis untuk host yang standby lama',
    isEnabled: true,
    rolloutPercentage: 100,
    targetAudience: 'HOSTS_ONLY',
    lastModifiedAt: Date.now() - 3600000 * 48,
  },
  {
    key: 'strict-sara-moderation',
    description: 'Penegakan moderasi ketat otomatis dengan ambang batas vektor 0.70',
    isEnabled: true,
    rolloutPercentage: 100,
    targetAudience: 'ALL',
    lastModifiedAt: Date.now() - 3600000 * 6,
  },
  {
    key: 'live-stealth-monitor',
    description: 'Akses pengawasan siluman panggilan dan chatroom untuk akun admin',
    isEnabled: true,
    rolloutPercentage: 100,
    targetAudience: 'VIP_ONLY',
    lastModifiedAt: Date.now() - 3600000 * 72,
  },
];
