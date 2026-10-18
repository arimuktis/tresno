import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Platform,
  Alert,
} from 'react-native';
import {
  Plus,
  Star,
  Trash2,
  Maximize2,
  ShieldCheck,
  ShieldAlert,
  Clock,
  Sparkles,
  Info,
  RefreshCw,
  AlertOctagon,
} from 'lucide-react-native';
import { useThemeStore } from '../../../theme/useThemeStore';
import { useAlbumStore } from '../stores/useAlbumStore';
import { MAX_ALBUM_PHOTOS, AlbumPhoto } from '@tresno/shared';
import { getGlassCardStyle } from '../../../theme/glassStyles';
import { toast } from '../../../shared/stores/useToastStore';

export const AlbumCarousel: React.FC = () => {
  const { colors, isDark } = useThemeStore();
  const glassStyle = getGlassCardStyle(colors, isDark);
  const {
    photos,
    activeSlideIndex,
    isUploading,
    addPhoto,
    deletePhoto,
    setCoverPhoto,
    recheckPhoto,
    openViewer,
    setActiveSlideIndex,
    openPolicyModal,
    resetToDefaultPhotos,
  } = useAlbumStore();

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const scrollRef = useRef<ScrollView | null>(null);
  const [showDemoActions, setShowDemoActions] = useState(false);

  const screenWidth = Dimensions.get('window').width || 380;
  // Card slider width (responsive padding)
  const slideWidth = Math.min(screenWidth - 48, 360);

  const isMaxReached = photos.length >= MAX_ALBUM_PHOTOS;

  const handleScroll = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / (slideWidth + 12));
    if (index >= 0 && index < photos.length && index !== activeSlideIndex) {
      setActiveSlideIndex(index);
    }
  };

  const handlePickFile = () => {
    if (isMaxReached) {
      toast.error(`Maksimal ${MAX_ALBUM_PHOTOS} foto album sudah tercapai.`);
      return;
    }
    if (Platform.OS === 'web') {
      fileInputRef.current?.click();
    } else {
      Alert.alert(
        'Tambah Foto Album (Maks 8)',
        'Unggah foto untuk album profil Anda. Konten akan ditinjau secara otomatis untuk deteksi SARA & Pornografi.',
        [
          { text: 'Batal', style: 'cancel' },
          {
            text: 'Foto Demo Aman',
            onPress: () =>
              addPhoto(
                'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800',
                'Foto liburan musim panas ☀️'
              ),
          },
        ]
      );
    }
  };

  const handleWebFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';

    if (file.size > 20 * 1024 * 1024) {
      toast.error('Ukuran foto maksimal adalah 20MB.');
      return;
    }

    const caption = prompt('Tambahkan caption / deskripsi foto (opsional):') || undefined;
    await addPhoto(file, caption, file.name);
  };

  const handleAddSampleClean = async () => {
    await addPhoto(
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800',
      'Senyum ramah di hari yang cerah ✨'
    );
  };

  const handleAddSampleSara = async () => {
    await addPhoto(
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800',
      'Ujaran kebencian provokasi ganyang ras dan penistaan agama bakar masjid'
    );
  };

  const handleAddSamplePorn = async () => {
    await addPhoto(
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800',
      'Open bo murah vcs sange toket montok bugil telanjang'
    );
  };

  const handleDelete = (photo: AlbumPhoto) => {
    if (Platform.OS === 'web') {
      if (confirm('Hapus foto ini dari album Anda?')) {
        deletePhoto(photo.id);
      }
    } else {
      Alert.alert('Hapus Foto', 'Hapus foto ini dari album Anda?', [
        { text: 'Batal', style: 'cancel' },
        { text: 'Hapus', style: 'destructive', onPress: () => deletePhoto(photo.id) },
      ]);
    }
  };

  return (
    <View style={[styles.container, glassStyle, { borderColor: colors.border }]}>
      {/* Hidden Web File Input */}
      {Platform.OS === 'web' && (
        <input
          ref={fileInputRef as any}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleWebFileChange}
        />
      )}

      {/* Header with Title & Counter (Max 8) */}
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text style={[styles.title, { color: colors.text }]}>Foto Album</Text>
            <View
              style={[
                styles.counterPill,
                {
                  backgroundColor: isMaxReached ? 'rgba(255, 45, 85, 0.15)' : colors.primaryGlow,
                  borderColor: isMaxReached ? colors.primary : colors.primary,
                },
              ]}
            >
              <Text
                style={[
                  styles.counterText,
                  { color: isMaxReached ? colors.primary : colors.primary },
                ]}
              >
                {photos.length}/{MAX_ALBUM_PHOTOS} Foto
              </Text>
            </View>
          </View>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Slide untuk melihat foto • Wajib lolos deteksi SARA &amp; Pornografi
          </Text>
        </View>

        <TouchableOpacity
          onPress={openPolicyModal}
          style={[styles.policyBtn, { backgroundColor: colors.surfaceGlass, borderColor: colors.border }]}
          activeOpacity={0.7}
        >
          <ShieldAlert size={13} color={colors.gold} style={{ marginRight: 4 }} />
          <Text style={[styles.policyBtnText, { color: colors.gold }]}>Kebijakan SARA</Text>
        </TouchableOpacity>
      </View>

      {/* CAROUSEL / SLIDER CONTAINER */}
      {photos.length === 0 ? (
        <View style={[styles.emptyContainer, { borderColor: colors.border }]}>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>Album Masih Kosong</Text>
          <Text style={[styles.emptySub, { color: colors.textSecondary }]}>
            Tambahkan hingga {MAX_ALBUM_PHOTOS} foto terbaik Anda.
          </Text>
          <TouchableOpacity
            onPress={handlePickFile}
            style={[styles.emptyAddBtn, { backgroundColor: colors.primary }]}
            activeOpacity={0.8}
          >
            <Plus size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
            <Text style={styles.emptyAddBtnText}>Unggah Foto Pertama</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.sliderWrapper}>
          <ScrollView
            ref={scrollRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            contentContainerStyle={styles.scrollContent}
          >
            {photos.map((photo, index) => {
              const isRejected = photo.status === 'rejected';
              const isPending = photo.status === 'pending_review';
              const isApproved = photo.status === 'approved';

              return (
                <View
                  key={photo.id}
                  style={[
                    styles.slideCard,
                    {
                      width: slideWidth,
                      backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                      borderColor: isRejected ? colors.primary : isPending ? colors.gold : colors.border,
                    },
                  ]}
                >
                  {/* Photo Display with Blur Overlay if Rejected */}
                  <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={() => openViewer(index)}
                    style={styles.imageWrapper}
                  >
                    <Image
                      source={{ uri: photo.url }}
                      style={[
                        styles.slideImage,
                        isRejected && styles.blurredImage,
                      ]}
                      resizeMode="cover"
                    />

                    {/* REJECTED OVERLAY */}
                    {isRejected && (
                      <View style={styles.rejectedOverlay}>
                        <AlertOctagon size={32} color="#FF2D55" />
                        <Text style={styles.rejectedTitle}>KONTEN DITOLAK</Text>
                        <Text style={styles.rejectedCategory}>
                          Terdeteksi: {photo.violationCategory === 'sara' ? 'Ujaran SARA' : 'Pornografi / NSFW'}
                        </Text>
                        <Text style={styles.rejectedReason} numberOfLines={2}>
                          {photo.violationReason}
                        </Text>
                      </View>
                    )}

                    {/* TOP BADGES: REVIEW STATUS & COVER INDICATOR */}
                    <View style={styles.topBadgesRow}>
                      {/* Review Badge */}
                      <View
                        style={[
                          styles.reviewBadge,
                          {
                            backgroundColor: isApproved
                              ? 'rgba(0, 210, 106, 0.92)'
                              : isPending
                              ? 'rgba(255, 184, 0, 0.95)'
                              : 'rgba(255, 45, 85, 0.95)',
                          },
                        ]}
                      >
                        {isApproved ? (
                          <ShieldCheck size={12} color="#FFFFFF" style={{ marginRight: 4 }} />
                        ) : isPending ? (
                          <Clock size={12} color="#000000" style={{ marginRight: 4 }} />
                        ) : (
                          <ShieldAlert size={12} color="#FFFFFF" style={{ marginRight: 4 }} />
                        )}
                        <Text
                          style={[
                            styles.reviewBadgeText,
                            { color: isPending ? '#000000' : '#FFFFFF' },
                          ]}
                        >
                          {isApproved
                            ? 'Lolos Review'
                            : isPending
                            ? 'Sedang Ditinjau'
                            : 'Ditolak: SARA/Pornografi'}
                        </Text>
                      </View>

                      {/* Cover Photo Star */}
                      {photo.isCover && (
                        <View style={[styles.coverBadge, { backgroundColor: colors.gold }]}>
                          <Star size={11} color="#000000" fill="#000000" style={{ marginRight: 3 }} />
                          <Text style={styles.coverBadgeText}>Foto Utama</Text>
                        </View>
                      )}
                    </View>

                    {/* BOTTOM SLIDE PILL (Page Indicator 1/8) */}
                    <View style={styles.slideIndexPill}>
                      <Text style={styles.slideIndexText}>
                        {index + 1}/{photos.length} (Maks {MAX_ALBUM_PHOTOS})
                      </Text>
                    </View>
                  </TouchableOpacity>

                  {/* Caption & Metadata */}
                  <View style={styles.slideFooter}>
                    <Text
                      style={[styles.captionText, { color: colors.text }]}
                      numberOfLines={1}
                    >
                      {photo.caption || 'Tanpa deskripsi foto'}
                    </Text>

                    {/* Action Buttons Row */}
                    <View style={styles.slideActionsRow}>
                      <TouchableOpacity
                        onPress={() => openViewer(index)}
                        style={[styles.actionBtn, { backgroundColor: colors.surfaceGlass }]}
                        activeOpacity={0.7}
                      >
                        <Maximize2 size={13} color={colors.text} style={{ marginRight: 4 }} />
                        <Text style={[styles.actionBtnText, { color: colors.text }]}>Slide Full</Text>
                      </TouchableOpacity>

                      {!photo.isCover && !isRejected && (
                        <TouchableOpacity
                          onPress={() => setCoverPhoto(photo.id)}
                          style={[styles.actionBtn, { backgroundColor: colors.surfaceGlass }]}
                          activeOpacity={0.7}
                        >
                          <Star size={13} color={colors.gold} style={{ marginRight: 4 }} />
                          <Text style={[styles.actionBtnText, { color: colors.gold }]}>Jadikan Utama</Text>
                        </TouchableOpacity>
                      )}

                      {isRejected && (
                        <TouchableOpacity
                          onPress={() => recheckPhoto(photo.id)}
                          style={[styles.actionBtn, { backgroundColor: 'rgba(255, 184, 0, 0.15)' }]}
                          activeOpacity={0.7}
                        >
                          <RefreshCw size={13} color={colors.gold} style={{ marginRight: 4 }} />
                          <Text style={[styles.actionBtnText, { color: colors.gold }]}>Pindai Ulang</Text>
                        </TouchableOpacity>
                      )}

                      <TouchableOpacity
                        onPress={() => handleDelete(photo)}
                        style={[styles.actionBtn, { backgroundColor: 'rgba(255, 45, 85, 0.12)' }]}
                        activeOpacity={0.7}
                      >
                        <Trash2 size={13} color={colors.primary} style={{ marginRight: 4 }} />
                        <Text style={[styles.actionBtnText, { color: colors.primary }]}>Hapus</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              );
            })}
          </ScrollView>

          {/* PAGINATION DOTS */}
          <View style={styles.dotsRow}>
            {photos.map((_, dotIdx) => (
              <View
                key={dotIdx}
                style={[
                  styles.dot,
                  {
                    backgroundColor:
                      dotIdx === activeSlideIndex ? colors.primary : colors.border,
                    width: dotIdx === activeSlideIndex ? 18 : 6,
                  },
                ]}
              />
            ))}
          </View>
        </View>
      )}

      {/* BOTTOM CONTROLS & ADD PHOTO ACTION */}
      <View style={styles.bottomControlsRow}>
        <TouchableOpacity
          onPress={handlePickFile}
          disabled={isMaxReached || isUploading}
          style={[
            styles.addPhotoBtn,
            {
              backgroundColor: isMaxReached ? 'rgba(255,255,255,0.08)' : colors.primary,
              opacity: isMaxReached ? 0.6 : 1,
            },
          ]}
          activeOpacity={0.8}
        >
          <Plus size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
          <Text style={styles.addPhotoBtnText}>
            {isMaxReached ? `Batas ${MAX_ALBUM_PHOTOS} Foto Penuh` : `Tambah Foto (${photos.length}/${MAX_ALBUM_PHOTOS})`}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setShowDemoActions(!showDemoActions)}
          style={[styles.toggleDemoBtn, { borderColor: colors.border }]}
          activeOpacity={0.7}
        >
          <Sparkles size={14} color={colors.secondary} style={{ marginRight: 4 }} />
          <Text style={[styles.toggleDemoText, { color: colors.secondary }]}>
            {showDemoActions ? 'Tutup Uji' : 'Uji Deteksi SARA / Porn'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* QUICK REVIEWER SIMULATOR BUTTONS (FOR TESTING SARA & PORNOGRAPHY MECHANISM) */}
      {showDemoActions && (
        <View style={[styles.demoBox, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)', borderColor: colors.border }]}>
          <Text style={[styles.demoTitle, { color: colors.text }]}>
            Simulator Pengujian Review SARA &amp; Pornografi:
          </Text>
          <Text style={[styles.demoSub, { color: colors.textSecondary }]}>
            Coba tambahkan foto dengan teks/kata yang memicu mesin penyaring moderasi:
          </Text>

          <View style={styles.demoButtonsRow}>
            <TouchableOpacity
              onPress={handleAddSampleClean}
              disabled={isMaxReached}
              style={[styles.demoPill, { backgroundColor: 'rgba(0, 210, 106, 0.15)', borderColor: '#00D26A' }]}
            >
              <ShieldCheck size={12} color="#00D26A" style={{ marginRight: 4 }} />
              <Text style={{ color: '#00D26A', fontSize: 11, fontWeight: '700' }}>+ Uji Foto Aman (Lolos)</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleAddSampleSara}
              disabled={isMaxReached}
              style={[styles.demoPill, { backgroundColor: 'rgba(255, 45, 85, 0.15)', borderColor: '#FF2D55' }]}
            >
              <ShieldAlert size={12} color="#FF2D55" style={{ marginRight: 4 }} />
              <Text style={{ color: '#FF2D55', fontSize: 11, fontWeight: '700' }}>+ Uji SARA (Terdeteksi)</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleAddSamplePorn}
              disabled={isMaxReached}
              style={[styles.demoPill, { backgroundColor: 'rgba(255, 45, 85, 0.15)', borderColor: '#FF2D55' }]}
            >
              <AlertOctagon size={12} color="#FF2D55" style={{ marginRight: 4 }} />
              <Text style={{ color: '#FF2D55', fontSize: 11, fontWeight: '700' }}>+ Uji Pornografi (Terdeteksi)</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={resetToDefaultPhotos}
              style={[styles.demoPill, { backgroundColor: 'rgba(255, 184, 0, 0.15)', borderColor: colors.gold }]}
            >
              <RefreshCw size={12} color={colors.gold} style={{ marginRight: 4 }} />
              <Text style={{ color: colors.gold, fontSize: 11, fontWeight: '700' }}>Reset Demo</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
  },
  counterPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    borderWidth: 1,
  },
  counterText: {
    fontSize: 11,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  policyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
  },
  policyBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
  sliderWrapper: {
    marginTop: 6,
    marginBottom: 12,
  },
  scrollContent: {
    paddingRight: 16,
    gap: 12,
  },
  slideCard: {
    borderRadius: 18,
    borderWidth: 1.5,
    overflow: 'hidden',
  },
  imageWrapper: {
    width: '100%',
    height: 220,
    position: 'relative',
    backgroundColor: '#000000',
  },
  slideImage: {
    width: '100%',
    height: '100%',
  },
  blurredImage: {
    opacity: 0.18,
  },
  rejectedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  rejectedTitle: {
    color: '#FF2D55',
    fontSize: 14,
    fontWeight: '900',
    marginTop: 6,
    letterSpacing: 1,
  },
  rejectedCategory: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 4,
  },
  rejectedReason: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 15,
  },
  topBadgesRow: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reviewBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  reviewBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  coverBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  coverBadgeText: {
    color: '#000000',
    fontSize: 10,
    fontWeight: '800',
  },
  slideIndexPill: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.65)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  slideIndexText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  slideFooter: {
    padding: 12,
  },
  captionText: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
  slideActionsRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  actionBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
    marginTop: 10,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  emptyContainer: {
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: 'dashed',
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  emptySub: {
    fontSize: 12,
    marginTop: 4,
    marginBottom: 12,
  },
  emptyAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  emptyAddBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  bottomControlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  addPhotoBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
  },
  addPhotoBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  toggleDemoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 9,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  toggleDemoText: {
    fontSize: 11,
    fontWeight: '700',
  },
  demoBox: {
    marginTop: 12,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  demoTitle: {
    fontSize: 12,
    fontWeight: '800',
  },
  demoSub: {
    fontSize: 11,
    marginTop: 2,
    marginBottom: 8,
  },
  demoButtonsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  demoPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
});
