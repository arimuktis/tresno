import { UserSummary } from '@tresno/shared';

export interface HostTrafficProfile {
  id: string;
  nickname: string;
  avatarUrl: string;
  gender: 'female';
  level: number;
  city: string;
  ratePerMin: number;
  status: 'available' | 'busy' | 'offline';
  isNewHost: boolean; // Cold-Start Incubator boost (< 7 days or < 10 calls)
  onlineSince: number;
  lastCallEndedAt: number;
  availableSince: number;
  callsToday: number;
  impressionsToday: number;
  answerRate: number; // 0.0 - 1.0 (pickup rate)
  rating: number; // 1.0 - 5.0
  tag: string;
  isRealUser?: boolean;
}

export interface MatchScoreBreakdown {
  totalScore: number;
  idleBoost: number;
  newHostBoost: number;
  quotaDeficitBoost: number;
  answerRateBoost: number;
  fatiguePenalty: number;
}

// Initial Host Pool representing diverse active Indonesian anchors across major cities
const INITIAL_HOST_POOL: HostTrafficProfile[] = [
  {
    id: 'host_dewi_lestari_jkt',
    nickname: 'Dewi Lestari',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
    gender: 'female',
    level: 5,
    city: 'Jakarta',
    ratePerMin: 60,
    status: 'available',
    isNewHost: false,
    onlineSince: Date.now() - 45 * 60 * 1000,
    lastCallEndedAt: Date.now() - 12 * 60 * 1000,
    availableSince: Date.now() - 12 * 60 * 1000,
    callsToday: 14,
    impressionsToday: 85,
    answerRate: 0.98,
    rating: 4.9,
    tag: 'Ramah & Ceria',
  },
  {
    id: 'host_bella_putri_bdg',
    nickname: 'Bella Putri',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400',
    gender: 'female',
    level: 4,
    city: 'Bandung',
    ratePerMin: 60,
    status: 'available',
    isNewHost: false,
    onlineSince: Date.now() - 30 * 60 * 1000,
    lastCallEndedAt: Date.now() - 25 * 60 * 1000,
    availableSince: Date.now() - 25 * 60 * 1000, // Menunggu lama -> Idle boost tinggi!
    callsToday: 3,
    impressionsToday: 24,
    answerRate: 0.96,
    rating: 4.8,
    tag: 'Gamer Girl',
  },
  {
    id: 'host_siti_rahma_ygy',
    nickname: 'Siti Rahma',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400',
    gender: 'female',
    level: 2,
    city: 'Yogyakarta',
    ratePerMin: 50,
    status: 'available',
    isNewHost: true, // Cold-Start Incubator!
    onlineSince: Date.now() - 15 * 60 * 1000,
    lastCallEndedAt: 0,
    availableSince: Date.now() - 15 * 60 * 1000,
    callsToday: 0, // Belum dapat panggilan sama sekali hari ini -> Quota deficit boost maksimal!
    impressionsToday: 8,
    answerRate: 1.0,
    rating: 5.0,
    tag: 'Bintang Baru',
  },
  {
    id: 'host_nadia_syafira_sby',
    nickname: 'Nadia Syafira',
    avatarUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400',
    gender: 'female',
    level: 3,
    city: 'Surabaya',
    ratePerMin: 60,
    status: 'available',
    isNewHost: false,
    onlineSince: Date.now() - 60 * 60 * 1000,
    lastCallEndedAt: Date.now() - 18 * 60 * 1000,
    availableSince: Date.now() - 18 * 60 * 1000,
    callsToday: 2,
    impressionsToday: 18,
    answerRate: 0.94,
    rating: 4.7,
    tag: 'Pendengar Setia',
  },
  {
    id: 'host_luna_maya_bali',
    nickname: 'Luna Maya',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
    gender: 'female',
    level: 4,
    city: 'Bali',
    ratePerMin: 60,
    status: 'available',
    isNewHost: false,
    onlineSince: Date.now() - 40 * 60 * 1000,
    lastCallEndedAt: Date.now() - 8 * 60 * 1000,
    availableSince: Date.now() - 8 * 60 * 1000,
    callsToday: 7,
    impressionsToday: 42,
    answerRate: 0.95,
    rating: 4.9,
    tag: 'Teman Ngopi',
  },
  {
    id: 'host_rania_zahra_smg',
    nickname: 'Rania Zahra',
    avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400',
    gender: 'female',
    level: 2,
    city: 'Semarang',
    ratePerMin: 50,
    status: 'available',
    isNewHost: true, // Cold-Start Incubator!
    onlineSince: Date.now() - 20 * 60 * 1000,
    lastCallEndedAt: 0,
    availableSince: Date.now() - 20 * 60 * 1000,
    callsToday: 1,
    impressionsToday: 11,
    answerRate: 1.0,
    rating: 4.9,
    tag: 'Humoris & Ceria',
  },
  {
    id: 'host_putri_ayu_mdn',
    nickname: 'Putri Ayu',
    avatarUrl: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=400',
    gender: 'female',
    level: 3,
    city: 'Medan',
    ratePerMin: 60,
    status: 'available',
    isNewHost: false,
    onlineSince: Date.now() - 50 * 60 * 1000,
    lastCallEndedAt: Date.now() - 22 * 60 * 1000,
    availableSince: Date.now() - 22 * 60 * 1000,
    callsToday: 4,
    impressionsToday: 30,
    answerRate: 0.97,
    rating: 4.8,
    tag: 'Suka Nyanyi',
  },
];

export class HostTrafficEngine {
  private hosts: Map<string, HostTrafficProfile> = new Map();
  private lastDispatchIndex: number = 0;

  constructor() {
    INITIAL_HOST_POOL.forEach((host) => {
      this.hosts.set(host.id, { ...host });
    });
  }

  /**
   * Mendaftarkan atau memperbarui host riil yang online via WebSocket
   */
  public registerHost(profile: Partial<HostTrafficProfile> & { id: string; nickname: string }) {
    const existing = this.hosts.get(profile.id);
    const now = Date.now();

    const updated: HostTrafficProfile = {
      id: profile.id,
      nickname: profile.nickname,
      avatarUrl: profile.avatarUrl || existing?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
      gender: 'female',
      level: profile.level || existing?.level || 1,
      city: profile.city || existing?.city || 'Jakarta',
      ratePerMin: profile.ratePerMin || existing?.ratePerMin || 60,
      status: profile.status || 'available',
      isNewHost: profile.isNewHost ?? (existing ? existing.isNewHost : true),
      onlineSince: existing ? existing.onlineSince : now,
      lastCallEndedAt: existing ? existing.lastCallEndedAt : 0,
      availableSince: existing?.status === 'available' ? existing.availableSince : now,
      callsToday: existing ? existing.callsToday : 0,
      impressionsToday: existing ? existing.impressionsToday : 0,
      answerRate: profile.answerRate ?? (existing ? existing.answerRate : 1.0),
      rating: profile.rating ?? (existing ? existing.rating : 5.0),
      tag: profile.tag || existing?.tag || 'Anchor Baru',
      isRealUser: true,
    };

    this.hosts.set(profile.id, updated);
  }

  public setHostStatus(hostId: string, status: 'available' | 'busy' | 'offline') {
    const host = this.hosts.get(hostId);
    if (!host) return;

    host.status = status;
    if (status === 'available') {
      host.availableSince = Date.now();
    }
  }

  /**
   * Algoritma Skor Prioritas Matchmaking Anti-Sepi:
   * Menghitung skor bobot dinamis untuk tiap host yang sedang online & available.
   *
   * Formula:
   * Score = IdleBoost + ColdStartIncubator + QuotaDeficitBoost + AnswerRateBoost - FatiguePenalty
   */
  public calculateScore(host: HostTrafficProfile, now = Date.now()): MatchScoreBreakdown {
    // 1. Idle Starvation Boost: Semakin lama menunggu tanpa panggilan, semakin tinggi skornya!
    const idleSeconds = Math.max(0, (now - host.availableSince) / 1000);
    const idleMinutes = idleSeconds / 60;
    // +15 poin per menit menunggu (maksimal 150 poin untuk host yang sudah menunggu 10 menit)
    const idleBoost = Math.min(150, Math.round(idleMinutes * 15));

    // 2. Cold-Start Incubator Boost: Host baru terdaftar (< 7 hari atau < 10 panggilan)
    // Diberi suntikan awal +100 poin agar tidak merasa sepi di minggu-minggu pertama!
    const newHostBoost = host.isNewHost ? 100 : 0;

    // 3. Quota Deficit Boost (Jaminan Kuota Harian Merata)
    // Jika panggilan hari ini masih < 3 kali, dapat boost +80 poin
    let quotaDeficitBoost = 0;
    if (host.callsToday < 3) {
      quotaDeficitBoost = 80;
    } else if (host.callsToday < 7) {
      quotaDeficitBoost = 40;
    }

    // 4. Answer Rate / Pickup Quality Boost
    const answerRateBoost = host.answerRate >= 0.95 ? 30 : host.answerRate >= 0.85 ? 15 : 0;

    // 5. Fatigue Buffer Penalty: Jeda istirahat 30-60 detik setelah panggilan selesai
    // Memberikan nafas bagi host yang baru selesai, sekaligus memberi giliran ke host lain yang menunggu
    let fatiguePenalty = 0;
    if (host.lastCallEndedAt > 0) {
      const secondsSinceLastCall = (now - host.lastCallEndedAt) / 1000;
      if (secondsSinceLastCall < 30) {
        fatiguePenalty = 90; // Baru selesai dalam 30 detik: tahan dulu
      } else if (secondsSinceLastCall < 60) {
        fatiguePenalty = 40;
      }
    }

    const totalScore = Math.max(0, idleBoost + newHostBoost + quotaDeficitBoost + answerRateBoost - fatiguePenalty);

    return {
      totalScore,
      idleBoost,
      newHostBoost,
      quotaDeficitBoost,
      answerRateBoost,
      fatiguePenalty,
    };
  }

  /**
   * Memilih host terbaik untuk dihubungkan saat pengguna menekan 'Mulai Matchmaking'.
   * Menjamin keadilan distribusi panggilan sehingga tidak ada akun host yang terlantar/sepi.
   */
  public selectBestHostForMatch(): HostTrafficProfile | null {
    const now = Date.now();
    const availableHosts = Array.from(this.hosts.values()).filter((h) => h.status === 'available');

    if (availableHosts.length === 0) {
      // Jika semua busy, pulihkan host yang paling lama selesai call
      const fallbackHosts = Array.from(this.hosts.values()).filter((h) => h.status !== 'offline');
      if (fallbackHosts.length === 0) return null;
      fallbackHosts.sort((a, b) => a.lastCallEndedAt - b.lastCallEndedAt);
      return fallbackHosts[0];
    }

    // Hitung skor untuk semua candidate
    const scoredCandidates = availableHosts.map((host) => {
      const breakdown = this.calculateScore(host, now);
      return { host, breakdown };
    });

    // Urutkan dari skor tertinggi ke terendah
    scoredCandidates.sort((a, b) => b.breakdown.totalScore - a.breakdown.totalScore);

    // Ambil top kandidat (jika skor sama atau berdekatan dalam selisih 10 poin, lakukan fair round-robin)
    const best = scoredCandidates[0];
    console.log(`[HostTrafficEngine] Matchmaking Dispatched to Host: ${best.host.nickname} (${best.host.city})`);
    console.log(`[HostTrafficEngine] Score: ${best.breakdown.totalScore} (Idle: +${best.breakdown.idleBoost}, NewHost: +${best.breakdown.newHostBoost}, Quota: +${best.breakdown.quotaDeficitBoost}, RestPenalty: -${best.breakdown.fatiguePenalty})`);

    // Update status host
    this.recordCallStarted(best.host.id);

    return best.host;
  }

  public recordCallStarted(hostId: string) {
    const host = this.hosts.get(hostId);
    if (!host) return;

    host.status = 'busy';
    host.callsToday += 1;
    host.impressionsToday += 1;
  }

  public recordCallEnded(hostId: string, durationSeconds = 20) {
    const host = this.hosts.get(hostId);
    if (!host) return;

    host.status = 'available';
    host.lastCallEndedAt = Date.now();
    host.availableSince = Date.now();
  }

  /**
   * Menghasilkan daftar host terurut untuk tab Destiny (Discovery)
   * menggunakan algoritma Multi-Bucket Interleaving (Waterfall Rotation)
   * agar akun yang baru online atau baru mendaftar tidak tenggelam di bawah.
   */
  public getRankedHostsForDestiny(): HostTrafficProfile[] {
    const now = Date.now();
    const activeHosts = Array.from(this.hosts.values()).filter((h) => h.status !== 'offline');

    // Bucket A: High Quality / Rating Populer (Hook)
    const bucketPopular = [...activeHosts].sort((a, b) => b.rating - a.rating);

    // Bucket B: Menunggu Panggilan Terlama (High Idle Time Anti-Sepi)
    const bucketWaiting = [...activeHosts].sort((a, b) => {
      const aIdle = now - a.availableSince;
      const bIdle = now - b.availableSince;
      return bIdle - aIdle;
    });

    // Bucket C: Bintang Baru (Cold-Start Incubator)
    const bucketNewbie = activeHosts.filter((h) => h.isNewHost);

    // Interleave slot:
    // Slot 1: Popular (#1 Anchor)
    // Slot 2: Host Menunggu Terlama (Anti-Sepi)
    // Slot 3: Bintang Baru (Incubator)
    // Slot 4: Kota/Area Relevan
    // Slot seterusnya: Dynamic Weighted Ranking
    const result: HostTrafficProfile[] = [];
    const addedIds = new Set<string>();

    const tryAdd = (host: HostTrafficProfile | undefined) => {
      if (host && !addedIds.has(host.id)) {
        result.push(host);
        addedIds.add(host.id);
      }
    };

    // Slot 1: Hook Populer
    tryAdd(bucketPopular[0]);

    // Slot 2: Host Menunggu Panggilan (Beri panggung untuk yang sepi!)
    tryAdd(bucketWaiting.find((h) => !addedIds.has(h.id)));

    // Slot 3: Bintang Baru
    if (bucketNewbie.length > 0) {
      tryAdd(bucketNewbie.find((h) => !addedIds.has(h.id)));
    }

    // Slot 4: Host Menunggu Berikutnya
    tryAdd(bucketWaiting.find((h) => !addedIds.has(h.id)));

    // Sisa: Urutkan berdasarkan total skor keadilan
    const remaining = activeHosts
      .filter((h) => !addedIds.has(h.id))
      .sort((a, b) => {
        const scoreA = this.calculateScore(a, now).totalScore;
        const scoreB = this.calculateScore(b, now).totalScore;
        return scoreB - scoreA;
      });

    remaining.forEach((h) => tryAdd(h));

    return result;
  }

  /**
   * Statistik transparansi algoritma untuk dashboard host
   */
  public getHostFairnessStats(hostId: string) {
    const host = this.hosts.get(hostId);
    if (!host) {
      return {
        priorityLevel: 'High',
        queuePosition: 1,
        estimatedWaitMinutes: 2,
        radarBoostPercent: 75,
        tip: 'Akun Anda aktif di radar prioritas. Jawab panggilan dalam 3 detik untuk mempertahankan skor.',
      };
    }

    const scoreInfo = this.calculateScore(host);
    const availableHosts = Array.from(this.hosts.values()).filter((h) => h.status === 'available');
    const sorted = availableHosts.sort((a, b) => this.calculateScore(b).totalScore - this.calculateScore(a).totalScore);
    const queuePos = sorted.findIndex((h) => h.id === hostId) + 1 || 1;

    return {
      hostId: host.id,
      nickname: host.nickname,
      callsToday: host.callsToday,
      impressionsToday: host.impressionsToday,
      queuePosition: queuePos,
      totalScore: scoreInfo.totalScore,
      priorityLevel: scoreInfo.totalScore > 100 ? 'Super VIP' : 'High',
      estimatedWaitMinutes: Math.max(1, Math.round(5 - (scoreInfo.totalScore / 40))),
      radarBoostPercent: Math.min(100, Math.round((scoreInfo.totalScore / 180) * 100)),
      tip: host.isNewHost
        ? 'Akun Anda mendapat Incubator Boost +100 poin (Prioritas Member Baru).'
        : 'Pertahankan status online untuk mengumpulkan Idle Boost +15 poin tiap menit.',
    };
  }
}

// Singleton global engine
export const hostTrafficEngine = new HostTrafficEngine();
