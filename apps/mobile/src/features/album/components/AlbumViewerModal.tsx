import React, { useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Dimensions,
  Platform,
  ScrollView,
} from 'react-native';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Star,
  Trash2,
  RefreshCw,
  ShieldCheck,
  ShieldAlert,
  Clock,
  AlertOctagon,
} from 'lucide-react-native';
import { useThemeStore } from '../../../theme/useThemeStore';
import { useAlbumStore } from '../stores/useAlbumStore';
import { MAX_ALBUM_PHOTOS } from '@tresno/shared';
import { toast } from '../../../shared/stores/useToastStore';

export const AlbumViewerModal: React.FC = () => {
  const { colors, isDark } = useThemeStore();
  const {
    photos,
    activeSlideIndex,
    isViewerOpen,
    closeViewer,
    setActiveSlideIndex,
    setCoverPhoto,
    deletePhoto,
    recheckPhoto,
  } = useAlbumStore();

  const currentPhoto = photos[activeSlideIndex] || photos[0];

  // Keyboard navigation for web (ArrowLeft / ArrowRight / Escape)
  useEffect(() => {
    if (Platform.OS !== 'web' || !isViewerOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'Escape') {
        closeViewer();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isViewerOpen, activeSlideIndex, photos.length]);

  if (!isViewerOpen || !currentPhoto) return null;

  const handleNext = () => {
    if (activeSlideIndex < photos.length - 1) {
      setActiveSlideIndex(activeSlideIndex + 1);
    } else {
      setActiveSlideIndex(0); // loop to first
    }
  };

  const handlePrev = () => {
    if (activeSlideIndex > 0) {
      setActiveSlideIndex(activeSlideIndex - 1);
    } else {
      setActiveSlideIndex(photos.length - 1); // loop to last
    }
  };

  const isRejected = currentPhoto.status === 'rejected';
  const isPending = currentPhoto.status === 'pending_review';
  const isApproved = currentPhoto.status === 'approved';

  return (
    <Modal
      visible={isViewerOpen}
      animationType="fade"
      transparent
      onRequestClose={closeViewer}
    >
      <View style={styles.overlay}>
        {/* HEADER BAR */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>
              Slide {activeSlideIndex + 1} dari {photos.length}
            </Text>
            <Text style={styles.headerSubtitle}>
              Maksimal Album: {MAX_ALBUM_PHOTOS} Foto
            </Text>
          </View>

          <TouchableOpacity
            onPress={closeViewer}
            style={styles.closeBtn}
            activeOpacity={0.8}
          >
            <X size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* MAIN SLIDE VIEWER CONTAINER */}
        <View style={styles.mainViewContainer}>
          {/* Left Arrow Button */}
          {photos.length > 1 && (
            <TouchableOpacity
              onPress={handlePrev}
              style={[styles.navArrow, styles.leftArrow]}
              activeOpacity={0.7}
            >
              <ChevronLeft size={24} color="#FFFFFF" />
            </TouchableOpacity>
          )}

          {/* Photo Display */}
          <View style={styles.photoContainer}>
            <Image
              source={{ uri: currentPhoto.url }}
              style={[styles.largeImage, isRejected && styles.blurredImage]}
              resizeMode="contain"
            />

            {/* If Rejected: Show Warning Overlay on top of blurred photo */}
            {isRejected && (
              <View style={styles.rejectedBanner}>
                <AlertOctagon size={40} color="#FF2D55" />
                <Text style={styles.rejectedBannerTitle}>KONTEN DITOLAK MODERASI</Text>
                <Text style={styles.rejectedBannerType}>
                  Kategori Pelanggaran: {currentPhoto.violationCategory === 'sara' ? 'SARA (Ujaran Kebencian / Diskriminasi)' : 'Pornografi / Nudity'}
                </Text>
                <Text style={styles.rejectedBannerReason}>
                  {currentPhoto.violationReason}
                </Text>
                <TouchableOpacity
                  onPress={() => recheckPhoto(currentPhoto.id)}
                  style={styles.recheckBtn}
                >
                  <RefreshCw size={14} color="#FFFFFF" style={{ marginRight: 6 }} />
                  <Text style={styles.recheckBtnText}>Pindai Ulang Sekarang</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Right Arrow Button */}
          {photos.length > 1 && (
            <TouchableOpacity
              onPress={handleNext}
              style={[styles.navArrow, styles.rightArrow]}
              activeOpacity={0.7}
            >
              <ChevronRight size={24} color="#FFFFFF" />
            </TouchableOpacity>
          )}
        </View>

        {/* BOTTOM DETAILS & MODERATION REPORT */}
        <View style={styles.footerPanel}>
          {/* Caption */}
          {Boolean(currentPhoto.caption) && (
            <Text style={styles.captionText}>{currentPhoto.caption}</Text>
          )}

          {/* Moderation Status Pill & Info */}
          <View
            style={[
              styles.moderationCard,
              {
                backgroundColor: isApproved
                  ? 'rgba(0, 210, 106, 0.12)'
                  : isPending
                  ? 'rgba(255, 184, 0, 0.12)'
                  : 'rgba(255, 45, 85, 0.15)',
                borderColor: isApproved
                  ? '#00D26A'
                  : isPending
                  ? '#FFB800'
                  : '#FF2D55',
              },
            ]}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              {isApproved ? (
                <ShieldCheck size={16} color="#00D26A" />
              ) : isPending ? (
                <Clock size={16} color="#FFB800" />
              ) : (
                <ShieldAlert size={16} color="#FF2D55" />
              )}
              <Text
                style={[
                  styles.moderationTitle,
                  {
                    color: isApproved
                      ? '#00D26A'
                      : isPending
                      ? '#FFB800'
                      : '#FF2D55',
                  },
                ]}
              >
                {isApproved
                  ? 'Status: Disetujui (Lolos Moderasi SARA & Pornografi)'
                  : isPending
                  ? 'Status: Sedang Ditinjau Tim Kurator Komunitas'
                  : 'Status: Ditolak (Melanggar Pedoman Komunitas)'}
              </Text>
            </View>

            <Text style={styles.moderationDetailText}>
              {isApproved
                ? 'Foto aman untuk ditayangkan ke publik, radar pencocokan, dan album profil.'
                : isPending
                ? 'Foto terdeteksi mengandung kata bersensitivitas sedang dan sedang dalam antrean verifikasi manual.'
                : currentPhoto.violationReason || 'Foto diblokir demi keamanan seluruh pengguna platform.'}
            </Text>
          </View>

          {/* Action Buttons: Set as Cover, Delete, Prev/Next */}
          <View style={styles.footerActionsRow}>
            {!currentPhoto.isCover && !isRejected && (
              <TouchableOpacity
                onPress={() => setCoverPhoto(currentPhoto.id)}
                style={styles.coverActionBtn}
                activeOpacity={0.8}
              >
                <Star size={15} color="#000000" fill="#000000" style={{ marginRight: 6 }} />
                <Text style={styles.coverActionText}>Jadikan Foto Utama</Text>
              </TouchableOpacity>
            )}

            {currentPhoto.isCover && (
              <View style={styles.currentCoverPill}>
                <Star size={14} color="#FFA000" fill="#FFA000" style={{ marginRight: 6 }} />
                <Text style={{ color: '#FFA000', fontSize: 12, fontWeight: '700' }}>
                  Foto Sampul Profil
                </Text>
              </View>
            )}

            <TouchableOpacity
              onPress={() => {
                deletePhoto(currentPhoto.id);
                if (photos.length <= 1) {
                  closeViewer();
                }
              }}
              style={styles.deleteActionBtn}
              activeOpacity={0.8}
            >
              <Trash2 size={15} color="#FF2D55" style={{ marginRight: 6 }} />
              <Text style={styles.deleteActionText}>Hapus Foto</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.94)',
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 54 : 20,
    paddingBottom: 12,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 11,
    marginTop: 2,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainViewContainer: {
    flex: 1,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  largeImage: {
    width: '90%',
    height: '85%',
    borderRadius: 12,
  },
  blurredImage: {
    opacity: 0.15,
  },
  rejectedBanner: {
    position: 'absolute',
    alignSelf: 'center',
    width: '85%',
    backgroundColor: 'rgba(20, 20, 20, 0.95)',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#FF2D55',
    padding: 20,
    alignItems: 'center',
  },
  rejectedBannerTitle: {
    color: '#FF2D55',
    fontSize: 15,
    fontWeight: '900',
    marginTop: 8,
    letterSpacing: 1,
  },
  rejectedBannerType: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 4,
    textAlign: 'center',
  },
  rejectedBannerReason: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 16,
  },
  recheckBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF2D55',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    marginTop: 14,
  },
  recheckBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  navArrow: {
    position: 'absolute',
    top: '50%',
    marginTop: -24,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  leftArrow: {
    left: 16,
  },
  rightArrow: {
    right: 16,
  },
  footerPanel: {
    width: '100%',
    maxWidth: 414,
    alignSelf: 'center',
    backgroundColor: 'rgba(18, 18, 20, 0.95)',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
  },
  captionText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 10,
  },
  moderationCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    marginBottom: 14,
  },
  moderationTitle: {
    fontSize: 12,
    fontWeight: '800',
  },
  moderationDetailText: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 11,
    marginTop: 4,
    lineHeight: 15,
  },
  footerActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  coverActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFB800',
    paddingVertical: 10,
    borderRadius: 12,
  },
  coverActionText: {
    color: '#000000',
    fontSize: 13,
    fontWeight: '800',
  },
  currentCoverPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 184, 0, 0.15)',
    borderWidth: 1,
    borderColor: '#FFA000',
  },
  deleteActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 45, 85, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 45, 85, 0.4)',
  },
  deleteActionText: {
    color: '#FF2D55',
    fontSize: 13,
    fontWeight: '700',
  },
});
