import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { MATCH_RULES, CoinDeductionEvent } from '@tresno/shared';
import { AgoraTokenService } from '../agora/tokenService';

export interface ActiveSession {
  channelId: string;
  callerId: string;
  callerUid: number;
  hostId: string;
  hostUid: number;
  startTime: number;
  freeTrialEndsAt: number;
  currentInterval: number;
  timerHandle?: NodeJS.Timeout;
}

export class BillingWorker {
  private supabase: SupabaseClient | null = null;
  private activeSessions: Map<string, ActiveSession> = new Map();
  private onDeductionCallback?: (event: CoinDeductionEvent) => void;
  private onCallTerminatedCallback?: (channelId: string, reason: string) => void;

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (supabaseUrl && supabaseServiceKey) {
      this.supabase = createClient(supabaseUrl, supabaseServiceKey);
    }
  }

  setCallbacks(
    onDeduction: (event: CoinDeductionEvent) => void,
    onTerminated: (channelId: string, reason: string) => void
  ) {
    this.onDeductionCallback = onDeduction;
    this.onCallTerminatedCallback = onTerminated;
  }

  startSession(
    channelId: string,
    callerId: string,
    callerUid: number,
    hostId: string,
    hostUid: number
  ) {
    const now = Date.now();
    const session: ActiveSession = {
      channelId,
      callerId,
      callerUid,
      hostId,
      hostUid,
      startTime: now,
      freeTrialEndsAt: now + MATCH_RULES.FREE_TRIAL_SECONDS * 1000,
      currentInterval: 0,
    };

    // Jadwalkan pemotongan pertama tepat saat masa free trial (20 detik) selesai!
    session.timerHandle = setTimeout(() => {
      this.executeIntervalBilling(channelId);
    }, MATCH_RULES.FREE_TRIAL_SECONDS * 1000);

    this.activeSessions.set(channelId, session);
  }

  /**
   * Eksekusi pemotongan saldo koin secara atomik.
   * Dipanggil tepat saat interval baru dimulai (Pre-Authorization Hold).
   */
  private async executeIntervalBilling(channelId: string) {
    const session = this.activeSessions.get(channelId);
    if (!session) return;

    session.currentInterval += 1;

    let deductionSuccess = true;
    let newBalance = 100; // Mock balance jika Supabase belum terkonfigurasi

    if (this.supabase) {
      // Panggil atomic function di database PostgreSQL
      const { data, error } = await this.supabase.rpc('deduct_call_coins', {
        p_caller_id: session.callerId,
        p_host_id: session.hostId,
        p_channel_id: channelId,
        p_coins_to_deduct: MATCH_RULES.COINS_PER_INTERVAL,
        p_diamonds_to_award: MATCH_RULES.HOST_POINTS_PER_INTERVAL,
      });

      if (error || !data?.success) {
        deductionSuccess = false;
        console.warn(`[Billing] Saldo tidak cukup untuk caller ${session.callerId}:`, data?.reason);
      } else {
        newBalance = data.new_balance;
      }
    }

    if (!deductionSuccess) {
      // ⚠️ SALDO HABIS: Hentikan sesi dan putus koneksi!
      this.terminateSession(channelId, 'insufficient_balance');
      return;
    }

    // Generate token perpanjangan Agora untuk 60 detik berikutnya
    const newAgoraToken = AgoraTokenService.generateRtcToken(
      channelId,
      session.callerUid,
      MATCH_RULES.INTERVAL_DURATION_SECONDS + 5 // +5 detik buffer toleransi jaringan
    );

    const deductionEvent: CoinDeductionEvent = {
      channelId,
      userId: session.callerId,
      deductedAmount: MATCH_RULES.COINS_PER_INTERVAL,
      newBalance,
      intervalIndex: session.currentInterval,
      isRenewed: true,
      nextRenewalTimestamp: Date.now() + MATCH_RULES.INTERVAL_DURATION_SECONDS * 1000,
      newAgoraToken,
      pointsAwarded: MATCH_RULES.HOST_POINTS_PER_INTERVAL,
    };

    this.onDeductionCallback?.(deductionEvent);

    // Jadwalkan evaluasi interval berikutnya (60 detik)
    session.timerHandle = setTimeout(() => {
      this.executeIntervalBilling(channelId);
    }, MATCH_RULES.INTERVAL_DURATION_SECONDS * 1000);
  }

  terminateSession(channelId: string, reason: string) {
    const session = this.activeSessions.get(channelId);
    if (session) {
      if (session.timerHandle) clearTimeout(session.timerHandle);
      this.activeSessions.delete(channelId);
      this.onCallTerminatedCallback?.(channelId, reason);
    }
  }
}
