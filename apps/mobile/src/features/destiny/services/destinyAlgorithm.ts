import { AnchorData } from '../../../shared/components/organisms/AnchorCard';
import { create } from 'zustand';

export interface HostLiveRadarStats {
  hostId: string;
  nickname: string;
  callsToday: number;
  impressionsToday: number;
  queuePosition: number;
  totalScore: number;
  priorityLevel: string;
  estimatedWaitMinutes: number;
  radarBoostPercent: number;
  tip: string;
}

interface HostRadarState {
  stats: HostLiveRadarStats;
  setStats: (stats: HostLiveRadarStats) => void;
}

export const useHostRadarStore = create<HostRadarState>((set) => ({
  stats: {
    hostId: '',
    nickname: '',
    callsToday: 0,
    impressionsToday: 0,
    queuePosition: 1,
    totalScore: 195,
    priorityLevel: 'Super VIP',
    estimatedWaitMinutes: 2,
    radarBoostPercent: 85,
    tip: 'Akun Anda mendapatkan Incubator Boost +100 poin (Prioritas Member Baru).',
  },
  setStats: (stats) => set({ stats }),
}));

export interface HostFairnessMetrics {
  totalCallsReceived: number;
  idleMinutes: number;
  isNewHost: boolean;
  answerRate: number;
  rating: number;
  priorityScore: number;
}

export const COMPREHENSIVE_ANCHOR_ROSTER: (AnchorData & HostFairnessMetrics)[] = [
  {
    id: 'anchor_dewi',
    name: 'Dewi Lestari',
    age: 22,
    city: 'Jakarta',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
    isOnline: true,
    ratePerMin: 60,
    tag: 'Ramah & Ceria',
    isCertified: true,
    exposureBadgeLabel: 'Paling Populer',
    exposureBadgeType: 'popular',
    totalCallsReceived: 18,
    idleMinutes: 10,
    isNewHost: false,
    answerRate: 0.98,
    rating: 4.9,
    priorityScore: 85,
  },
  {
    id: 'anchor_siti',
    name: 'Siti Rahma',
    age: 20,
    city: 'Yogyakarta',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400',
    isOnline: true,
    ratePerMin: 50,
    tag: 'Bintang Baru',
    isCertified: true,
    exposureBadgeLabel: 'Bintang Baru',
    exposureBadgeType: 'new',
    totalCallsReceived: 0, // Belum dapat call -> Prioritas Inkubator!
    idleMinutes: 18,
    isNewHost: true,
    answerRate: 1.0,
    rating: 5.0,
    priorityScore: 195,
  },
  {
    id: 'anchor_bella',
    name: 'Bella Putri',
    age: 21,
    city: 'Bandung',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400',
    isOnline: true,
    ratePerMin: 60,
    tag: 'Gamer Girl',
    isCertified: true,
    exposureBadgeLabel: 'Respon Kilat',
    exposureBadgeType: 'fast',
    totalCallsReceived: 2,
    idleMinutes: 24, // Menunggu lama -> Anti-sepi boost!
    isNewHost: false,
    answerRate: 0.96,
    rating: 4.8,
    priorityScore: 160,
  },
  {
    id: 'anchor_rania',
    name: 'Rania Zahra',
    age: 21,
    city: 'Semarang',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400',
    isOnline: true,
    ratePerMin: 50,
    tag: 'Humoris & Ceria',
    isCertified: true,
    exposureBadgeLabel: 'Bintang Baru',
    exposureBadgeType: 'new',
    totalCallsReceived: 1,
    idleMinutes: 15,
    isNewHost: true,
    answerRate: 1.0,
    rating: 4.9,
    priorityScore: 180,
  },
  {
    id: 'anchor_luna',
    name: 'Luna Maya',
    age: 24,
    city: 'Bali',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
    isOnline: true,
    ratePerMin: 60,
    tag: 'Teman Ngopi',
    isCertified: true,
    exposureBadgeLabel: 'Respon Cepat',
    exposureBadgeType: 'fast',
    totalCallsReceived: 6,
    idleMinutes: 8,
    isNewHost: false,
    answerRate: 0.95,
    rating: 4.9,
    priorityScore: 90,
  },
  {
    id: 'anchor_nadia',
    name: 'Nadia Syafira',
    age: 23,
    city: 'Surabaya',
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400',
    isOnline: true,
    ratePerMin: 60,
    tag: 'Pendengar Setia',
    isCertified: true,
    exposureBadgeLabel: 'Baru Online',
    exposureBadgeType: 'idle',
    totalCallsReceived: 2,
    idleMinutes: 20,
    isNewHost: false,
    answerRate: 0.94,
    rating: 4.7,
    priorityScore: 150,
  },
  {
    id: 'anchor_putri',
    name: 'Putri Ayu',
    age: 22,
    city: 'Medan',
    avatar: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=400',
    isOnline: true,
    ratePerMin: 60,
    tag: 'Suka Nyanyi',
    isCertified: true,
    exposureBadgeLabel: 'Dekat Kamu',
    exposureBadgeType: 'nearby',
    totalCallsReceived: 3,
    idleMinutes: 16,
    isNewHost: false,
    answerRate: 0.97,
    rating: 4.8,
    priorityScore: 130,
  },
  {
    id: 'anchor_jessica',
    name: 'Jessica Tan',
    age: 23,
    city: 'Makassar',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400',
    isOnline: false,
    ratePerMin: 70,
    tag: 'Teman Curhat',
    isCertified: true,
    exposureBadgeLabel: 'Offline',
    exposureBadgeType: 'idle',
    totalCallsReceived: 5,
    idleMinutes: 0,
    isNewHost: false,
    answerRate: 0.91,
    rating: 4.8,
    priorityScore: 40,
  },
];

/**
 * Algoritma Multi-Bucket Interleaving (Waterfall Fair Exposure)
 *
 * Mengurutkan akun host agar tidak ada akun yang merasa sepi:
 * 1. Menempatkan 'Bintang Baru' (Inkubator Host Baru) di posisi terdepan (top 3).
 * 2. Menempatkan Host Online yang sedang menunggu panggilan (High Idle Time) di slot utama.
 * 3. Mengocok (rotate shift) setiap kali pengguna refresh agar eksposur terbagi 100% merata.
 */
export function getSmartRankedAnchors(
  filter: 'all' | 'online' | 'nearby' | 'popular',
  userCity = 'Jakarta',
  refreshSeed = 0
): AnchorData[] {
  // Salin roster
  let list = [...COMPREHENSIVE_ANCHOR_ROSTER];

  // 1. Terapkan filter kategori jika dipilih
  if (filter === 'online') {
    list = list.filter((a) => a.isOnline);
  } else if (filter === 'nearby') {
    list = list.filter((a) => a.city === userCity || a.city === 'Jakarta' || a.city === 'Bandung');
  } else if (filter === 'popular') {
    return list.sort((a, b) => b.rating - a.rating);
  }

  // 2. Pisahkan ke 3 Bucket Strategis:
  // Bucket 1: Bintang Baru (Cold-Start Incubator)
  const newHosts = list.filter((a) => a.isNewHost && a.isOnline);

  // Bucket 2: Host Menunggu Panggilan Terlama (Idle Starvation Prevention)
  const waitingHosts = list.filter((a) => !a.isNewHost && a.isOnline && a.totalCallsReceived < 4);

  // Bucket 3: Host Berpengalaman & Populer
  const popularHosts = list.filter((a) => !a.isNewHost && a.isOnline && a.totalCallsReceived >= 4);

  // Bucket 4: Host Offline
  const offlineHosts = list.filter((a) => !a.isOnline);

  // 3. Rotasi shift dinamis berdasarkan refreshSeed
  const rotateArray = <T>(arr: T[], shift: number): T[] => {
    if (arr.length <= 1) return arr;
    const offset = shift % arr.length;
    return [...arr.slice(offset), ...arr.slice(0, offset)];
  };

  const rNew = rotateArray(newHosts, refreshSeed);
  const rWait = rotateArray(waitingHosts, refreshSeed);
  const rPop = rotateArray(popularHosts, refreshSeed);

  // 4. Interleaving Slotting:
  // Slot 1: Popular (#1 Anchor Hook)
  // Slot 2: Host Menunggu (Beri traffic untuk yang sepi!)
  // Slot 3: Bintang Baru (Inkubator hari pertama)
  // Slot 4: Host Menunggu Berikutnya
  // Slot 5: Bintang Baru Berikutnya
  // Slot 6+: Bergantian merata
  const ranked: AnchorData[] = [];
  const addedIds = new Set<string>();

  const append = (item: AnchorData | undefined) => {
    if (item && !addedIds.has(item.id)) {
      ranked.push(item);
      addedIds.add(item.id);
    }
  };

  // Susun slot terstruktur
  append(rPop[0]);
  append(rWait[0]);
  append(rNew[0]);
  append(rWait[1]);
  append(rNew[1]);
  append(rPop[1]);

  // Masukkan sisa host online
  rWait.forEach((h) => append(h));
  rNew.forEach((h) => append(h));
  rPop.forEach((h) => append(h));

  // Terakhir, masukkan host offline
  offlineHosts.forEach((h) => append(h));

  return ranked;
}
