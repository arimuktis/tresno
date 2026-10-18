import { create } from 'zustand';
import { UserStoryGroup, StoryItem } from '@tresno/shared';
import { storyService } from '../services/storyService';
import { useAuthStore } from '../../auth/stores/useAuthStore';
import { moderationService } from '../../../shared/services/moderationService';
import { toast } from '../../../shared/stores/useToastStore';
import { supabaseRealtimeService } from '../../../shared/services/supabaseRealtimeService';

let isRealtimeInitialized = false;

interface StoryState {
  storyGroups: UserStoryGroup[];
  activeGroupIndex: number | null;
  activeStoryIndex: number;
  isViewerOpen: boolean;
  isLoading: boolean;
  isUploading: boolean;
  isPaused: boolean;
  uploadError: string | null;

  // Actions
  fetchStories: () => Promise<void>;
  openStory: (groupIndex: number, storyIndex?: number) => void;
  closeStory: () => void;
  nextStory: () => void;
  prevStory: () => void;
  setPaused: (paused: boolean) => void;
  likeCurrentStory: () => Promise<void>;
  uploadStory: (file: File | Blob, caption?: string) => Promise<boolean>;
}

export const useStoryStore = create<StoryState>((set, get) => ({
  storyGroups: [],
  activeGroupIndex: null,
  activeStoryIndex: 0,
  isViewerOpen: false,
  isLoading: false,
  isUploading: false,
  isPaused: false,
  uploadError: null,

  fetchStories: async () => {
    // Hubungkan listener Realtime Supabase satu kali
    if (!isRealtimeInitialized) {
      isRealtimeInitialized = true;
      supabaseRealtimeService.onNewStory((newStory) => {
        set((state) => {
          const exists = state.storyGroups.some((g) => g.stories.some((s) => s.id === newStory.id));
          if (exists) return state;

          const groups = [...state.storyGroups];
          const targetUserId = (newStory as any).userId || 'anchor_1';
          const existingGroupIdx = groups.findIndex((g) => g.userId === targetUserId);

          if (existingGroupIdx !== -1) {
            const group = { ...groups[existingGroupIdx] };
            group.stories = [newStory, ...group.stories];
            group.hasUnseen = true;
            groups[existingGroupIdx] = group;
          } else {
            groups.unshift({
              userId: targetUserId,
              username: (newStory as any).username || 'Host Live',
              avatar: (newStory as any).avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300',
              isHost: true,
              hasUnseen: true,
              stories: [newStory],
            });
          }

          toast.info('🔴 [Supabase Realtime] Cerita baru diterima secara live!');
          return { storyGroups: groups };
        });
      });
    }

    set({ isLoading: true });
    try {
      const groups = await storyService.getActiveStories();
      set({ storyGroups: groups, isLoading: false });
    } catch (err: any) {
      set({ isLoading: false, uploadError: err.message });
    }
  },

  openStory: (groupIndex: number, storyIndex = 0) => {
    const { storyGroups } = get();
    if (groupIndex < 0 || groupIndex >= storyGroups.length) return;
    const group = storyGroups[groupIndex];
    if (!group || !group.stories.length) return;

    set({
      activeGroupIndex: groupIndex,
      activeStoryIndex: Math.min(storyIndex, group.stories.length - 1),
      isViewerOpen: true,
      isPaused: false,
    });

    // Catat view untuk story saat ini
    const currentStory = group.stories[storyIndex];
    if (currentStory) {
      storyService.recordView(currentStory.id);
    }
  },

  closeStory: () => {
    set({
      isViewerOpen: false,
      activeGroupIndex: null,
      activeStoryIndex: 0,
      isPaused: false,
    });
  },

  nextStory: () => {
    const { storyGroups, activeGroupIndex, activeStoryIndex, closeStory } = get();
    if (activeGroupIndex === null) return;

    const currentGroup = storyGroups[activeGroupIndex];
    if (!currentGroup) return;

    // Masih ada story berikutnya dalam user ini
    if (activeStoryIndex < currentGroup.stories.length - 1) {
      const nextIndex = activeStoryIndex + 1;
      set({ activeStoryIndex: nextIndex });
      const nextStoryItem = currentGroup.stories[nextIndex];
      if (nextStoryItem) storyService.recordView(nextStoryItem.id);
      return;
    }

    // Pindah ke user berikutnya jika ada
    if (activeGroupIndex < storyGroups.length - 1) {
      const nextGroupIndex = activeGroupIndex + 1;
      const nextGroup = storyGroups[nextGroupIndex];
      set({
        activeGroupIndex: nextGroupIndex,
        activeStoryIndex: 0,
      });
      if (nextGroup?.stories[0]) {
        storyService.recordView(nextGroup.stories[0].id);
      }
      return;
    }

    // Habis, tutup viewer
    closeStory();
  },

  prevStory: () => {
    const { storyGroups, activeGroupIndex, activeStoryIndex } = get();
    if (activeGroupIndex === null) return;

    // Masih ada story sebelumnya dalam user ini
    if (activeStoryIndex > 0) {
      set({ activeStoryIndex: activeStoryIndex - 1 });
      return;
    }

    // Pindah ke user sebelumnya jika ada
    if (activeGroupIndex > 0) {
      const prevGroupIndex = activeGroupIndex - 1;
      const prevGroup = storyGroups[prevGroupIndex];
      const lastStoryOfPrev = prevGroup ? Math.max(0, prevGroup.stories.length - 1) : 0;
      set({
        activeGroupIndex: prevGroupIndex,
        activeStoryIndex: lastStoryOfPrev,
      });
    }
  },

  setPaused: (paused: boolean) => {
    set({ isPaused: paused });
  },

  likeCurrentStory: async () => {
    const { storyGroups, activeGroupIndex, activeStoryIndex } = get();
    if (activeGroupIndex === null) return;
    const group = storyGroups[activeGroupIndex];
    const story = group?.stories[activeStoryIndex];
    if (!story) return;

    // Optimistic UI update
    set((state) => {
      const updatedGroups = [...state.storyGroups];
      const targetGroup = { ...updatedGroups[activeGroupIndex] };
      const updatedStories = [...targetGroup.stories];
      const targetStory = { ...updatedStories[activeStoryIndex] };

      targetStory.likesCount = (targetStory.likesCount || 0) + 1;
      updatedStories[activeStoryIndex] = targetStory;
      targetGroup.stories = updatedStories;
      updatedGroups[activeGroupIndex] = targetGroup;

      return { storyGroups: updatedGroups };
    });

    await storyService.recordLike(story.id);
  },

  uploadStory: async (file: File | Blob, caption?: string) => {
    const user = useAuthStore.getState().user;
    const userId = user?.id || `user_${Date.now().toString(36)}`;
    const username = user?.nickname || 'Saya';
    const avatar = user?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300';
    const isHost = Boolean(user?.isHost);

    if (!isHost) {
      set({ uploadError: 'Hanya host yang dapat memposting story.' });
      return false;
    }

    set({ isUploading: true, uploadError: null });

    try {
      // 1. Mekanisme Reviewing Otomatis untuk Deteksi SARA & Pornografi
      toast.info('Memindai konten story untuk kepatuhan SARA & Pornografi...');
      const moderation = await moderationService.inspectContent(caption, file);

      if (!moderation.isSafe) {
        const errorMsg = moderation.reason || 'Postingan ditolak karena melanggar pedoman SARA / Pornografi.';
        set({ isUploading: false, uploadError: errorMsg });
        toast.error(errorMsg);
        return false;
      }

      if (moderation.status === 'pending_review') {
        toast.warning('Story Anda mengandung kata sensitif dan sedang ditinjau kurator konten.');
      }

      // 2. Upload media ke cloud storage
      const mediaUrl = await storyService.uploadMedia(file, userId);

      // Tentukan tipe media
      let mediaType: 'image' | 'video' = 'image';
      if ('type' in file && typeof file.type === 'string' && file.type.startsWith('video/')) {
        mediaType = 'video';
      }

      // 3. Simpan metadata ke backend (auto-expires in 24h)
      const newStory = await storyService.createStory({
        userId,
        username,
        avatar,
        isHost,
        mediaUrl,
        mediaType,
        caption,
      });

      // Terapkan hasil moderasi ke local story item
      newStory.status = moderation.status;
      newStory.violationCategory = moderation.category;
      newStory.violationReason = moderation.reason;
      newStory.flaggedKeywords = moderation.flaggedKeywords;

      // 4. Update local state
      set((state) => {
        const groups = [...state.storyGroups];
        const existingGroupIdx = groups.findIndex((g) => g.userId === userId);

        if (existingGroupIdx !== -1) {
          const group = { ...groups[existingGroupIdx] };
          group.stories = [newStory, ...group.stories];
          group.hasUnseen = true;
          groups[existingGroupIdx] = group;
        } else {
          groups.unshift({
            userId,
            username,
            avatar,
            isHost,
            isVerified: false,
            hasUnseen: true,
            stories: [newStory],
          });
        }

        return {
          storyGroups: groups,
          isUploading: false,
        };
      });

      // 5. Broadcast live story data ke seluruh subscriber Supabase Realtime
      await supabaseRealtimeService.broadcastStory(newStory);

      toast.success(
        moderation.status === 'pending_review'
          ? 'Cerita diunggah (Sedang Ditinjau Tim Moderasi).'
          : 'Cerita berhasil lolos review moderasi dan dipublikasikan secara live!'
      );
      return true;
    } catch (err: any) {
      set({ isUploading: false, uploadError: err.message || 'Gagal mengunggah story' });
      return false;
    }
  },
}));
