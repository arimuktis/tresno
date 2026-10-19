import { create } from 'zustand';
import { VisitorItem } from '@tresno/shared';

interface SocialState {
  following: string[]; // ID pengguna yang kita follow
  followers: string[]; // ID pengguna yang mem-follow kita
  visitors: VisitorItem[]; // Daftar pengguna yang mengunjungi profil kita ala Tigo
  isVisitorsModalOpen: boolean;

  followUser: (targetId: string) => void;
  unfollowUser: (targetId: string) => void;
  toggleFollow: (targetId: string) => void;

  isFollowing: (targetId: string) => boolean;
  isFollower: (targetId: string) => boolean;
  isMutualFriend: (targetId: string) => boolean;

  recordVisit: (visitor: VisitorItem) => void;
  openVisitorsModal: () => void;
  closeVisitorsModal: () => void;
}

// Initial Mock Visitors persis seperti di Screenshot Tigo
const INITIAL_VISITORS: VisitorItem[] = [
  {
    id: 'vis_1',
    userId: '17691490',
    nickname: 'sya',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
    isVerified: true,
    gender: 'female',
    age: 24,
    country: 'Indonesia',
    countryFlag: '🇮🇩',
    visitedAt: '2026-10-19T21:40:00.000Z',
  },
  {
    id: 'vis_2',
    userId: '17691491',
    nickname: 'bila',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200',
    isVerified: true,
    gender: 'female',
    age: 26,
    country: 'Indonesia',
    countryFlag: '🇮🇩',
    visitedAt: '2026-10-19T21:35:00.000Z',
  },
  {
    id: 'vis_3',
    userId: '17691492',
    nickname: 'Emiliah 💕',
    avatarUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200',
    isVerified: true,
    gender: 'female',
    age: 19,
    country: 'Madagascar',
    countryFlag: '🇲🇬',
    visitedAt: '2026-10-19T21:20:00.000Z',
  },
  {
    id: 'vis_4',
    userId: '17691493',
    nickname: 'Florence Vivi...',
    avatarUrl: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=200',
    isVerified: true,
    gender: 'female',
    age: 18,
    country: 'Madagascar',
    countryFlag: '🇲🇬',
    visitedAt: '2026-10-19T20:55:00.000Z',
  },
  {
    id: 'vis_5',
    userId: '17691494',
    nickname: 'Lesbian Play...',
    avatarUrl: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=200',
    isVerified: true,
    gender: 'female',
    age: 18,
    country: 'Madagascar',
    countryFlag: '🇲🇬',
    visitedAt: '2026-10-19T20:10:00.000Z',
  },
  {
    id: 'vis_6',
    userId: '17691495',
    nickname: 'Raima Khan',
    avatarUrl: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=200',
    isVerified: true,
    gender: 'female',
    age: 23,
    country: 'Pakistan',
    countryFlag: '🇵🇰',
    visitedAt: '2026-10-19T19:45:00.000Z',
  },
  {
    id: 'vis_7',
    userId: '17691496',
    nickname: 'Annah',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200',
    isVerified: true,
    gender: 'female',
    age: 20,
    country: 'Madagascar',
    countryFlag: '🇲🇬',
    visitedAt: '2026-10-19T18:30:00.000Z',
  },
  {
    id: 'vis_8',
    userId: '17691497',
    nickname: 'sakila 😊',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200',
    isVerified: true,
    gender: 'female',
    age: 18,
    country: 'Bangladesh',
    countryFlag: '🇧🇩',
    visitedAt: '2026-10-19T18:15:00.000Z',
  },
  {
    id: 'vis_9',
    userId: '17691498',
    nickname: 'les 3 filles 🥵',
    avatarUrl: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=200',
    isVerified: true,
    gender: 'female',
    age: 18,
    country: 'Madagascar',
    countryFlag: '🇲🇬',
    visitedAt: '2026-10-19T17:50:00.000Z',
  },
];

export const useSocialStore = create<SocialState>((set, get) => ({
  // Mock data: anchor_1 (Dewi Lestari) sudah mem-follow kita lebih dulu
  following: [],
  followers: ['anchor_1'],
  visitors: INITIAL_VISITORS,
  isVisitorsModalOpen: false,

  followUser: (targetId) => {
    const { following } = get();
    if (!following.includes(targetId)) {
      set({ following: [...following, targetId] });
    }
  },

  unfollowUser: (targetId) => {
    const { following } = get();
    set({ following: following.filter((id) => id !== targetId) });
  },

  toggleFollow: (targetId) => {
    const { following } = get();
    if (following.includes(targetId)) {
      set({ following: following.filter((id) => id !== targetId) });
    } else {
      set({ following: [...following, targetId] });
    }
  },

  isFollowing: (targetId) => {
    return get().following.includes(targetId);
  },

  isFollower: (targetId) => {
    return get().followers.includes(targetId);
  },

  isMutualFriend: (targetId) => {
    const { following, followers } = get();
    return following.includes(targetId) && followers.includes(targetId);
  },

  recordVisit: (visitor) => {
    const { visitors } = get();
    // Taruh di paling atas, hapus duplikat jika userId sama
    const filtered = visitors.filter((v) => v.userId !== visitor.userId);
    set({ visitors: [visitor, ...filtered] });
  },

  openVisitorsModal: () => set({ isVisitorsModalOpen: true }),
  closeVisitorsModal: () => set({ isVisitorsModalOpen: false }),
}));
