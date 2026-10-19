import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
} from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { useAuthStore } from '../../auth/stores/useAuthStore';
import { useAlbumStore } from '../../album';
import { useWalletStore } from '../../wallet/stores/useWalletStore';
import { useThemeStore } from '../../../theme/useThemeStore';
import { useTranslation } from '../../../i18n';
import { LevelBadge } from '../../../shared/components/atoms/LevelBadge';
import { VerifiedBadge } from '../../../shared/components/atoms/VerifiedBadge';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const MyProfilePreviewModal: React.FC = () => {
  const { colors, isDark } = useThemeStore();
  const { t } = useTranslation();
  const {
    user,
    isMyProfilePreviewOpen,
    closeMyProfilePreview,
    openEditProfile,
  } = useAuthStore();
  const { photos } = useAlbumStore();
  const { getLevelInfo } = useWalletStore();

  if (!isMyProfilePreviewOpen || !user) return null;

  const levelInfo = getLevelInfo();
  const coverPhoto =
    photos.find((p) => p.isCover && p.status !== 'rejected')?.url ||
    user.avatarUrl ||
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800';

  const userPhotos = photos.length > 0
    ? photos.filter((p) => p.status !== 'rejected').map((p) => p.url)
    : [coverPhoto];

  const hashtags =
    user.hashtags && user.hashtags.length > 0 ? user.hashtags : ['#Virgo'];

  const handleEdit = () => {
    closeMyProfilePreview();
    openEditProfile();
  };

  return (
    <Modal
      visible={isMyProfilePreviewOpen}
      animationType="slide"
      transparent={false}
      onRequestClose={closeMyProfilePreview}
    >
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Full Bleed Image Area */}
        <View style={styles.mediaContainer}>
          <Image
            source={{ uri: userPhotos[0] }}
            style={styles.fullPhoto}
            resizeMode="cover"
          />

          {/* Header Overlay ala Tigo */}
          <View style={styles.headerOverlay}>
            <TouchableOpacity
              style={styles.circleBtn}
              onPress={closeMyProfilePreview}
              activeOpacity={0.7}
            >
              <ChevronLeft size={28} color="#FFFFFF" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.editBtn}
              onPress={handleEdit}
              activeOpacity={0.7}
            >
              <Text style={styles.editText}>{t('common.edit')}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Profile Details Sheet ala Tigo */}
        <ScrollView
          style={[styles.sheetContent, { backgroundColor: colors.background }]}
          contentContainerStyle={styles.sheetScroll}
          showsVerticalScrollIndicator={false}
        >
          {/* Main Info Row */}
          <View style={styles.nameRow}>
            <Text style={[styles.nameText, { color: colors.text }]} numberOfLines={1}>
              {user.nickname || 'Bell'}
            </Text>
            <LevelBadge level={levelInfo.currentTier.level} size="md" />
          </View>

          {/* Verified Badge & Demographics */}
          <View style={styles.subRow}>
            <VerifiedBadge size="md" variant="outline" />
            <Text
              style={[
                styles.genderAgeText,
                { color: user.gender === 'female' ? '#FF2D55' : '#007AFF' },
              ]}
            >
              {user.gender === 'female' ? '♀' : '♂'} {user.age || 21}
            </Text>
            <View style={styles.countryPill}>
              <Text style={{ fontSize: 13 }}>{user.countryFlag || '🇮🇩'}</Text>
              <Text style={[styles.countryName, { color: colors.textSecondary }]}>
                {user.country || 'Indonesia'}
              </Text>
            </View>
          </View>

          {/* Hashtags Section */}
          <View style={styles.sectionBlock}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {t('profile.myHashtags')}
            </Text>
            <View style={styles.hashtagsGrid}>
              {hashtags.map((tag, idx) => (
                <View
                  key={idx}
                  style={[
                    styles.tagPill,
                    {
                      backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#F5F5F7',
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <Text style={[styles.tagText, { color: colors.text }]}>{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mediaContainer: {
    width: '100%',
    height: 440,
    backgroundColor: '#000000',
    position: 'relative',
  },
  fullPhoto: {
    width: '100%',
    height: '100%',
  },
  headerOverlay: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
  },
  circleBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  editBtn: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  editText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  sheetContent: {
    flex: 1,
  },
  sheetScroll: {
    padding: 20,
    paddingBottom: 40,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  nameText: {
    fontSize: 24,
    fontWeight: '800',
  },
  subRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 24,
  },
  genderAgeText: {
    fontSize: 14,
    fontWeight: '700',
  },
  countryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  countryName: {
    fontSize: 13,
  },
  sectionBlock: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 10,
  },
  hashtagsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 18,
    borderWidth: 1,
  },
  tagText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
