import { create } from 'zustand';
import { useWalletStore } from '../../wallet/stores/useWalletStore';
import { toast } from '../../../shared/stores/useToastStore';

export interface MissionItem {
  id: string;
  titleKey: string;
  descKey: string;
  icon: string;
  category: 'daily' | 'novice';
  progress: number;
  target: number;
  rewardType: 'combo' | 'coins' | 'chatCoupons' | 'points';
  coinsReward?: number;
  couponsReward?: number;
  pointsReward?: number;
  rewardLabel: string;
  isClaimed: boolean;
}

interface MissionState {
  missions: MissionItem[];
  isMissionModalOpen: boolean;

  openMissionModal: () => void;
  closeMissionModal: () => void;

  claimReward: (missionId: string) => boolean;
  incrementMission: (missionId: string, amount?: number) => void;
  getUnclaimedCount: () => number;
}

const INITIAL_MISSIONS: MissionItem[] = [
  {
    id: 'daily_checkin',
    titleKey: 'missions.dailyCheckinTitle',
    descKey: 'missions.dailyCheckinDesc',
    icon: 'calendar',
    category: 'daily',
    progress: 1,
    target: 1,
    rewardType: 'combo',
    coinsReward: 5,
    couponsReward: 1,
    rewardLabel: '+1 Kupon & +5 Koin',
    isClaimed: false,
  },
  {
    id: 'send_message',
    titleKey: 'missions.sendMessageTitle',
    descKey: 'missions.sendMessageDesc',
    icon: 'message',
    category: 'daily',
    progress: 0,
    target: 1,
    rewardType: 'chatCoupons',
    couponsReward: 1,
    rewardLabel: '+1 Kupon Chat',
    isClaimed: false,
  },
  {
    id: 'follow_anchor',
    titleKey: 'missions.followAnchorTitle',
    descKey: 'missions.followAnchorDesc',
    icon: 'user-plus',
    category: 'novice',
    progress: 0,
    target: 1,
    rewardType: 'coins',
    coinsReward: 10,
    rewardLabel: '+10 Koin',
    isClaimed: false,
  },
  {
    id: 'watch_story',
    titleKey: 'missions.watchStoryTitle',
    descKey: 'missions.watchStoryDesc',
    icon: 'play',
    category: 'daily',
    progress: 2,
    target: 2,
    rewardType: 'coins',
    coinsReward: 5,
    rewardLabel: '+5 Koin',
    isClaimed: false,
  },
  {
    id: 'video_call',
    titleKey: 'missions.videoCallTitle',
    descKey: 'missions.videoCallDesc',
    icon: 'video',
    category: 'daily',
    progress: 0,
    target: 1,
    rewardType: 'combo',
    coinsReward: 10,
    couponsReward: 1,
    rewardLabel: '+1 Kupon & +10 Koin',
    isClaimed: false,
  },
  {
    id: 'host_reply',
    titleKey: 'missions.hostReplyTitle',
    descKey: 'missions.hostReplyDesc',
    icon: 'star',
    category: 'daily',
    progress: 1,
    target: 3,
    rewardType: 'points',
    pointsReward: 0.5,
    rewardLabel: '+0.5 Poin Host',
    isClaimed: false,
  },
];

export const useMissionStore = create<MissionState>((set, get) => ({
  missions: INITIAL_MISSIONS,
  isMissionModalOpen: false,

  openMissionModal: () => set({ isMissionModalOpen: true }),
  closeMissionModal: () => set({ isMissionModalOpen: false }),

  claimReward: (missionId: string) => {
    const { missions } = get();
    const mission = missions.find((m) => m.id === missionId);

    if (!mission || mission.isClaimed || mission.progress < mission.target) {
      return false;
    }

    const wallet = useWalletStore.getState();

    if (mission.coinsReward) {
      wallet.addCoins(mission.coinsReward);
    }
    if (mission.couponsReward) {
      wallet.addChatCoupons(mission.couponsReward);
    }
    if (mission.pointsReward) {
      wallet.addPoints(mission.pointsReward);
    }

    set({
      missions: missions.map((m) =>
        m.id === missionId ? { ...m, isClaimed: true } : m
      ),
    });

    toast.success(`Berhasil klaim ${mission.rewardLabel}!`);
    return true;
  },

  incrementMission: (missionId: string, amount = 1) => {
    const { missions } = get();
    set({
      missions: missions.map((m) => {
        if (m.id === missionId && !m.isClaimed) {
          const newProgress = Math.min(m.target, m.progress + amount);
          return { ...m, progress: newProgress };
        }
        return m;
      }),
    });
  },

  getUnclaimedCount: () => {
    const { missions } = get();
    return missions.filter((m) => m.progress >= m.target && !m.isClaimed).length;
  },
}));
