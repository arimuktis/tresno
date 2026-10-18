import { create } from 'zustand';

interface SocialState {
  following: string[]; // ID pengguna yang kita follow
  followers: string[]; // ID pengguna yang mem-follow kita

  followUser: (targetId: string) => void;
  unfollowUser: (targetId: string) => void;
  toggleFollow: (targetId: string) => void;

  isFollowing: (targetId: string) => boolean;
  isFollower: (targetId: string) => boolean;
  isMutualFriend: (targetId: string) => boolean;
}

export const useSocialStore = create<SocialState>((set, get) => ({
  // Mock data: anchor_1 (Dewi Lestari) sudah mem-follow kita lebih dulu
  following: [],
  followers: ['anchor_1'],

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
}));
