import {
  PostHogEventPayload,
  PostHogFeatureFlag,
  PostHogFeatureFlagConfig,
  DEFAULT_POSTHOG_FEATURE_FLAGS,
} from '@tresno/shared';

const SERVER_BASE_URL = 'http://localhost:4000';

class PostHogClientService {
  private distinctId: string = 'anon_user';
  private userProperties: Record<string, any> = {};
  private flags: Map<string, boolean> = new Map();
  private eventQueue: PostHogEventPayload[] = [];
  private isFlushing: boolean = false;

  constructor() {
    // Muat default feature flags
    for (const f of DEFAULT_POSTHOG_FEATURE_FLAGS) {
      this.flags.set(f.key, f.isEnabled);
    }

    // Coba sinkronisasi feature flags dari server
    this.refreshFeatureFlags();
  }

  /**
   * Set user identity (Identify)
   */
  public identify(userId: string, properties?: Record<string, any>): void {
    this.distinctId = userId;
    if (properties) {
      this.userProperties = { ...this.userProperties, ...properties };
    }
    this.capture('$identify', { ...this.userProperties });
  }

  /**
   * Reset user identity saat logout
   */
  public reset(): void {
    this.distinctId = `anon_${Math.random().toString(36).substring(2, 9)}`;
    this.userProperties = {};
  }

  /**
   * Capture telemetry event
   */
  public capture(event: string, properties?: Record<string, any>): void {
    const payload: PostHogEventPayload = {
      distinctId: this.distinctId,
      event,
      properties: {
        ...this.userProperties,
        ...properties,
        $current_url: typeof window !== 'undefined' ? window.location?.href : '',
        $browser: 'Tresno App Web/Native',
        $timestamp: Date.now(),
      },
      timestamp: Date.now(),
    };

    this.eventQueue.push(payload);
    this.scheduleFlush();
  }

  /**
   * Track screen view
   */
  public screen(screenName: string, properties?: Record<string, any>): void {
    this.capture('$screen', {
      $screen_name: screenName,
      ...properties,
    });
  }

  /**
   * Evaluasi feature flag
   */
  public isFeatureEnabled(flagKey: PostHogFeatureFlag): boolean {
    return this.flags.get(flagKey) ?? true;
  }

  /**
   * Refresh feature flags dari backend
   */
  public async refreshFeatureFlags(): Promise<void> {
    try {
      const res = await fetch(`${SERVER_BASE_URL}/api/posthog/feature-flags`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          json.data.forEach((flag: PostHogFeatureFlagConfig) => {
            this.flags.set(flag.key, flag.isEnabled);
          });
        }
      }
    } catch {
      // Menggunakan cached/default fallback jika server offline
    }
  }

  /**
   * Flush event queue ke backend
   */
  private scheduleFlush(): void {
    if (this.isFlushing || this.eventQueue.length === 0) return;

    setTimeout(async () => {
      if (this.eventQueue.length === 0) return;
      this.isFlushing = true;
      const batch = [...this.eventQueue];
      this.eventQueue = [];

      try {
        for (const ev of batch) {
          await fetch(`${SERVER_BASE_URL}/api/posthog/capture`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(ev),
          }).catch(() => {});
        }
      } finally {
        this.isFlushing = false;
      }
    }, 500);
  }
}

export const posthog = new PostHogClientService();
