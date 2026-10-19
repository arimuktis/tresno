import React, { useState } from 'react';
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
import {
  ChevronLeft,
  MoreHorizontal,
  MessageCircle,
  Video,
  UserPlus,
  UserCheck,
  Coins,
  ShieldAlert,
} from 'lucide-react-native';
import { useAnchorDetailStore } from '../stores/useAnchorDetailStore';
import { useSocialStore } from '../../social/stores/useSocialStore';
import { useChatStore } from '../../messages/stores/useChatStore';
import { useWalletStore } from '../../wallet/stores/useWalletStore';
import { useCallStore } from '../../video-chat/stores/useCallStore';
import { useThemeStore } from '../../../theme/useThemeStore';
import { useTranslation } from '../../../i18n';
import { toast } from '../../../shared/stores/useToastStore';
import { LevelBadge } from '../../../shared/components/atoms/LevelBadge';
import { VerifiedBadge } from '../../../shared/components/atoms/VerifiedBadge';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const AnchorProfileModal: React.FC = () => {
  const { colors, isDark } = useThemeStore();
  const { t } = useTranslation();
  const { selectedAnchor, isOpen, closeAnchorDetail } = useAnchorDetailStore();
  const { isFollowing, toggleFollow, recordVisit } = useSocialStore();
  const { openChat } = useChatStore();
  const { coinBalance, openTopupModal } = useWalletStore();
  const { matchFound } = useCallStore();

  const [activePhotoIndex, setActivePhotoIndex] = useState(0);

  if (!isOpen || !selectedAnchor) return null;

  const following = isFollowing(selectedAnchor.id);
  const photos =
    selectedAnchor.photos && selectedAnchor.photos.length > 0
      ? selectedAnchor.photos
      : [selectedAnchor.avatar];

  const hashtags =
    selectedAnchor.hashtags && selectedAnchor.hashtags.length > 0
      ? selectedAnchor.hashtags
      : ['#Virgo', `#${selectedAnchor.city.replace(/\s+/g, '')}`, '#Friendly'];

  const handleFollow = () => {
    toggleFollow(selectedAnchor.id);
    if (!following) {
      toast.success(`Mengikuti ${selectedAnchor.name}`);
    } else {
      toast.info(`Batal mengikuti ${selectedAnchor.name}`);
    }
  };

  const handleChat = () => {
    closeAnchorDetail();
    openChat({
      id: selectedAnchor.id,
      name: selectedAnchor.name,
      avatar: selectedAnchor.avatar,
      isOnline: selectedAnchor.isOnline,
      isHost: true,
      ratePerMin: selectedAnchor.ratePerMin,
    });
  };

  const handleCall = () => {
    const requiredCoins = selectedAnchor.ratePerMin || 60;
    if (coinBalance < requiredCoins) {
      toast.warning(
        `Dibutuhkan minimal ${requiredCoins} koin untuk panggilan video langsung.`
      );
      openTopupModal();
      return;
    }

    closeAnchorDetail();
    matchFound({
      channelId: `ch_${selectedAnchor.id}_${Date.now()}`,
      peer: {
        id: selectedAnchor.id,
        nickname: selectedAnchor.name,
        avatarUrl: selectedAnchor.avatar,
        gender: selectedAnchor.gender || 'female',
        level: selectedAnchor.level || 2,
      },
      freeChatSeconds: 0,
      agoraUid: 1001,
      billingIntervalSeconds: 60,
      costPerInterval: requiredCoins,
      isHostCaller: false,
      agoraToken: `tok_${selectedAnchor.id}`,
    });
  };

  const handleReport = () => {
    toast.info(`Laporan untuk ${selectedAnchor.name} telah dikirim ke tim moderasi.`);
  };

  return (
    <Modal
      visible={isOpen}
      animationType="slide"
      transparent={false}
      onRequestClose={closeAnchorDetail}
    >
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Top Full Bleed Media Area */}
        <View style={styles.mediaContainer}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={(e) => {
              const offsetX = e.nativeEvent.contentOffset.x;
              const index = Math.round(offsetX / Math.min(SCREEN_WIDTH, 480));
              setActivePhotoIndex(index);
            }}
            scrollEventThrottle={16}
            style={styles.photoCarousel}
          >
            {photos.map((photo, i) => (
              <Image
                key={i}
                source={{ uri: photo }}
                style={styles.fullPhoto}
                resizeMode="cover"
              />
            ))}
          </ScrollView>

          {/* Header Controls Overlay */}
          <View style={styles.headerOverlay}>
            <TouchableOpacity
              style={styles.circleBtn}
              onPress={closeAnchorDetail}
              activeOpacity={0.7}
            >
              <ChevronLeft size={28} color="#FFFFFF" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.circleBtn}
              onPress={handleReport}
              activeOpacity={0.7}
            >
              <MoreHorizontal size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Dots Indicator */}
          {photos.length > 1 && (
            <View style={styles.dotsWrapper}>
              {photos.map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.dot,
                    activePhotoIndex === i ? styles.activeDot : styles.inactiveDot,
                  ]}
                />
              ))}
            </View>
          )}
        </View>

        {/* Content Sheet Card */}
        <ScrollView
          style={[styles.sheetContent, { backgroundColor: colors.background }]}
          contentContainerStyle={styles.sheetScroll}
          showsVerticalScrollIndicator={false}
        >
          {/* Main Info Row ala Tigo */}
          <View style={styles.mainInfoRow}>
            <View style={styles.nameBadgeGroup}>
              <Text style={[styles.anchorName, { color: colors.text }]} numberOfLines={1}>
                {selectedAnchor.name}
              </Text>
              <LevelBadge level={selectedAnchor.level || 2} size="md" />
            </View>

            {/* Follow Button */}
            <TouchableOpacity
              style={[
                styles.followBtn,
                {
                  backgroundColor: following
                    ? (isDark ? 'rgba(255,255,255,0.1)' : '#F2F2F7')
                    : colors.primary,
                },
              ]}
              onPress={handleFollow}
              activeOpacity={0.8}
            >
              {following ? (
                <UserCheck size={18} color={isDark ? '#FFFFFF' : '#000000'} />
              ) : (
                <UserPlus size={18} color="#FFFFFF" />
              )}
            </TouchableOpacity>
          </View>

          {/* Verified Badge & Gender/Age Row */}
          <View style={styles.verifiedRow}>
            <VerifiedBadge size="md" variant="outline" />
            <Text
              style={[
                styles.genderAgeText,
                { color: selectedAnchor.gender === 'male' ? '#007AFF' : '#FF2D55' },
              ]}
            >
              {selectedAnchor.gender === 'male' ? '♂' : '♀'} {selectedAnchor.age}
            </Text>
            {selectedAnchor.country && (
              <View style={styles.countryPill}>
                <Text style={{ fontSize: 13 }}>{selectedAnchor.countryFlag || '🇮🇩'}</Text>
                <Text style={[styles.countryName, { color: colors.textSecondary }]}>
                  {selectedAnchor.country}
                </Text>
              </View>
            )}
          </View>

          {/* Hashtags Section ala Tigo */}
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

        {/* Bottom Floating Action Bar ala Tigo */}
        <View
          style={[
            styles.bottomBar,
            {
              backgroundColor: colors.surfaceCard,
              borderTopColor: colors.border,
            },
          ]}
        >
          {/* Chat Button (Circular Pill) */}
          <TouchableOpacity
            style={[styles.chatActionBtn, { borderColor: '#A855F7' }]}
            onPress={handleChat}
            activeOpacity={0.8}
          >
            <MessageCircle size={22} color="#A855F7" />
          </TouchableOpacity>

          {/* Video Call Button with Coins Rate */}
          <TouchableOpacity
            style={[styles.callActionBtn, { backgroundColor: '#8B5CF6' }]}
            onPress={handleCall}
            activeOpacity={0.85}
          >
            <Video size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text style={styles.callRateText}>
              {selectedAnchor.ratePerMin || 30}
            </Text>
            <Coins size={14} color="#FFD700" style={{ marginHorizontal: 3 }} />
            <Text style={styles.callUnitText}>/min</Text>
          </TouchableOpacity>
        </View>
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
    height: 400,
    backgroundColor: '#000000',
    position: 'relative',
  },
  photoCarousel: {
    width: '100%',
    height: '100%',
  },
  fullPhoto: {
    width: Math.min(SCREEN_WIDTH, 480),
    height: 400,
  },
  headerOverlay: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  dotsWrapper: {
    position: 'absolute',
    bottom: 12,
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 6,
    zIndex: 10,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  activeDot: {
    width: 14,
    backgroundColor: '#FFFFFF',
  },
  inactiveDot: {
    width: 6,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  sheetContent: {
    flex: 1,
  },
  sheetScroll: {
    padding: 20,
    paddingBottom: 100,
  },
  mainInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  nameBadgeGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  anchorName: {
    fontSize: 22,
    fontWeight: '800',
  },
  followBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 20,
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
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 76,
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    gap: 14,
  },
  chatActionBtn: {
    width: 80,
    height: 48,
    borderRadius: 24,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  callActionBtn: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  callRateText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '900',
  },
  callUnitText: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 13,
    fontWeight: '600',
  },
});
