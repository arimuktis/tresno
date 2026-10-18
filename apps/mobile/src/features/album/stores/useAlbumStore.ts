import { create } from 'zustand';
import { AlbumPhoto, MAX_ALBUM_PHOTOS, ModerationResult } from '@tresno/shared';
import { moderationService } from '../../../shared/services/moderationService';
import { toast } from '../../../shared/stores/useToastStore';

const STORAGE_ALBUM_KEY = 'tresno_user_album_photos';

const DEFAULT_PHOTOS: AlbumPhoto[] = [
  {
    id: 'photo_init_1',
    userId: 'user_me',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800',
    caption: 'Foto profil utama - Senang menyapa semua di Tresno!',
    status: 'approved',
    isCover: true,
    createdAt: Date.now() - 3 * 86400000,
    reviewedAt: Date.now() - 3 * 86400000,
  },
  {
    id: 'photo_init_2',
    userId: 'user_me',
    url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800',
    caption: 'Santai di cafe Jakarta Selatan ☕',
    status: 'approved',
    isCover: false,
    createdAt: Date.now() - 2 * 86400000,
    reviewedAt: Date.now() - 2 * 86400000,
  },
  {
    id: 'photo_init_3',
    userId: 'user_me',
    url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800',
    caption: 'Outdoor weekend photoshoot 📸',
    status: 'approved',
    isCover: false,
    createdAt: Date.now() - 1 * 86400000,
    reviewedAt: Date.now() - 1 * 86400000,
  },
  {
    id: 'photo_init_4',
    userId: 'user_me',
    url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800',
    caption: 'Senja di pantai 🌅',
    status: 'approved',
    isCover: false,
    createdAt: Date.now() - 12 * 3600000,
    reviewedAt: Date.now() - 12 * 3600000,
  },
];

function loadSavedPhotos(): AlbumPhoto[] {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const saved = window.localStorage.getItem(STORAGE_ALBUM_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.slice(0, MAX_ALBUM_PHOTOS);
        }
      }
    } catch (_) {}
  }
  return DEFAULT_PHOTOS;
}

function persistPhotos(photos: AlbumPhoto[]) {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      window.localStorage.setItem(STORAGE_ALBUM_KEY, JSON.stringify(photos));
    } catch (_) {}
  }
}

interface AlbumState {
  photos: AlbumPhoto[];
  activeSlideIndex: number;
  isViewerOpen: boolean;
  isUploading: boolean;
  isPolicyModalOpen: boolean;
  lastModerationResult: ModerationResult | null;
  error: string | null;

  // Actions
  addPhoto: (
    media: File | Blob | string,
    caption?: string,
    fileName?: string
  ) => Promise<{ success: boolean; photo?: AlbumPhoto; error?: string }>;
  deletePhoto: (id: string) => void;
  setCoverPhoto: (id: string) => void;
  recheckPhoto: (id: string) => Promise<void>;
  openViewer: (initialIndex?: number) => void;
  closeViewer: () => void;
  setActiveSlideIndex: (index: number) => void;
  openPolicyModal: () => void;
  closePolicyModal: () => void;
  resetToDefaultPhotos: () => void;
}

export const useAlbumStore = create<AlbumState>((set, get) => ({
  photos: loadSavedPhotos(),
  activeSlideIndex: 0,
  isViewerOpen: false,
  isUploading: false,
  isPolicyModalOpen: false,
  lastModerationResult: null,
  error: null,

  openViewer: (initialIndex = 0) => {
    const { photos } = get();
    const safeIndex = Math.max(0, Math.min(initialIndex, photos.length - 1));
    set({ isViewerOpen: true, activeSlideIndex: safeIndex });
  },

  closeViewer: () => set({ isViewerOpen: false }),

  setActiveSlideIndex: (index: number) => set({ activeSlideIndex: index }),

  openPolicyModal: () => set({ isPolicyModalOpen: true }),
  closePolicyModal: () => set({ isPolicyModalOpen: false }),

  resetToDefaultPhotos: () => {
    persistPhotos(DEFAULT_PHOTOS);
    set({ photos: DEFAULT_PHOTOS, activeSlideIndex: 0, error: null });
    toast.success('Album direset ke foto demo terverifikasi.');
  },

  /**
   * Menambahkan foto ke album pengguna
   * Maksimal 8 foto & melalui mekanisme reviewing otomatis SARA dan Pornografi
   */
  addPhoto: async (media, caption, fileName) => {
    const { photos } = get();

    // 1. Validasi Batas Maksimal 8 Foto
    if (photos.length >= MAX_ALBUM_PHOTOS) {
      const errorMsg = `Maksimal foto album adalah ${MAX_ALBUM_PHOTOS} foto. Hapus foto lama untuk menambahkan foto baru.`;
      set({ error: errorMsg });
      toast.error(errorMsg);
      return { success: false, error: errorMsg };
    }

    set({ isUploading: true, error: null });

    try {
      // 2. Jalankan Mekanisme Reviewing untuk Deteksi SARA & Pornografi
      toast.info('Memeriksa keamanan konten (Deteksi SARA & Pornografi)...');
      const moderation = await moderationService.inspectContent(caption, media, fileName);
      set({ lastModerationResult: moderation });

      // Selesaikan URL media
      let resolvedUrl = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800';
      if (typeof media === 'string') {
        resolvedUrl = media;
      } else if (typeof window !== 'undefined' && (media instanceof Blob || (media as any) instanceof File)) {
        resolvedUrl = URL.createObjectURL(media);
      }

      const isFirst = photos.length === 0;
      const newPhoto: AlbumPhoto = {
        id: `album_photo_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        userId: 'user_me',
        url: resolvedUrl,
        caption: caption || undefined,
        status: moderation.status,
        violationCategory: moderation.category !== 'clean' ? moderation.category : undefined,
        violationReason: moderation.reason,
        flaggedKeywords: moderation.flaggedKeywords.length > 0 ? moderation.flaggedKeywords : undefined,
        isCover: isFirst,
        createdAt: Date.now(),
        reviewedAt: Date.now(),
      };

      const updated = [...photos, newPhoto];
      persistPhotos(updated);
      set({
        photos: updated,
        isUploading: false,
        activeSlideIndex: updated.length - 1,
      });

      if (!moderation.isSafe) {
        toast.error(`Foto Ditolak: ${moderation.reason}`);
      } else if (moderation.status === 'pending_review') {
        toast.warning('Foto ditambahkan dalam status Menunggu Review Kurator.');
      } else {
        toast.success(`Foto album berhasil ditambahkan (${updated.length}/${MAX_ALBUM_PHOTOS}) dan lolos review!`);
      }

      return { success: moderation.isSafe, photo: newPhoto };
    } catch (err: any) {
      set({ isUploading: false, error: err.message || 'Gagal memproses foto album' });
      toast.error('Gagal memproses foto album.');
      return { success: false, error: err.message };
    }
  },

  deletePhoto: (id: string) => {
    const { photos, activeSlideIndex } = get();
    const target = photos.find((p) => p.id === id);
    const updated = photos.filter((p) => p.id !== id);

    // Jika yang dihapus adalah cover dan masih ada foto lain, jadikan foto pertama sebagai cover
    if (target?.isCover && updated.length > 0) {
      updated[0].isCover = true;
    }

    persistPhotos(updated);
    const newIndex = Math.max(0, Math.min(activeSlideIndex, updated.length - 1));
    set({ photos: updated, activeSlideIndex: newIndex });
    toast.info('Foto album dihapus.');
  },

  setCoverPhoto: (id: string) => {
    const { photos } = get();
    const target = photos.find((p) => p.id === id);
    if (target && target.status === 'rejected') {
      toast.error('Foto yang ditolak oleh moderasi tidak dapat dijadikan foto sampul.');
      return;
    }

    const updated = photos.map((p) => ({
      ...p,
      isCover: p.id === id,
    }));

    persistPhotos(updated);
    set({ photos: updated });
    toast.success('Foto sampul profil berhasil diperbarui.');
  },

  recheckPhoto: async (id: string) => {
    const { photos } = get();
    const photo = photos.find((p) => p.id === id);
    if (!photo) return;

    toast.info('Memindai ulang foto album...');
    const moderation = await moderationService.inspectContent(photo.caption, photo.url);

    const updated = photos.map((p) => {
      if (p.id === id) {
        return {
          ...p,
          status: moderation.status,
          violationCategory: moderation.category !== 'clean' ? moderation.category : undefined,
          violationReason: moderation.reason,
          flaggedKeywords: moderation.flaggedKeywords.length > 0 ? moderation.flaggedKeywords : undefined,
          reviewedAt: Date.now(),
        };
      }
      return p;
    });

    persistPhotos(updated);
    set({ photos: updated, lastModerationResult: moderation });

    if (!moderation.isSafe) {
      toast.error(`Hasil Tinjau Ulang: ${moderation.reason}`);
    } else {
      toast.success('Foto lolos peninjauan moderasi.');
    }
  },
}));
