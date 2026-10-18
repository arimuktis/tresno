import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Dimensions,
  Platform,
  Animated,
  Easing,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Crown, Clock, X, PhoneCall, Heart } from 'lucide-react-native';
import { UserStoryGroup, StoryItem } from '@tresno/shared';
import { useStoryStore } from '../stores/useStoryStore';
import { useThemeStore } from '../../../theme/useThemeStore';
import { useTranslation } from '../../../i18n';
import { useCallStore } from '../../video-chat/stores/useCallStore';
import { useWalletStore } from '../../wallet/stores/useWalletStore';
import { useChatStore } from '../../messages/stores/useChatStore';
import { useAuthStore } from '../../auth/stores/useAuthStore';
import { toast } from '../../../shared/stores/useToastStore';

const STORY_DURATION_MS = 5000; // 5 detik per story ala Instagram

export const StoryViewerModal: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useThemeStore();
  const { t } = useTranslation();
  const {
    storyGroups,
    activeGroupIndex,
    activeStoryIndex,
    isViewerOpen,
    isPaused,
    closeStory,
    nextStory,
    prevStory,
    setPaused,
    likeCurrentStory,
  } = useStoryStore();

  const { matchFound } = useCallStore();
  const { coinBalance, openTopupModal } = useWalletStore();
  const { openChat, sendMessage } = useChatStore();

  const SCREEN_HEIGHT = Dimensions.get('window').height || 800;
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [isRendered, setIsRendered] = useState(false);
  const [cachedGroup, setCachedGroup] = useState<UserStoryGroup | null>(null);
  const [cachedStory, setCachedStory] = useState<StoryItem | null>(null);

  const [replyText, setReplyText] = useState('');
  const [progressPercent, setProgressPercent] = useState(0);
  const timerRef = useRef<any>(null);
  const startTimeRef = useRef<number>(Date.now());
  const elapsedBeforePauseRef = useRef<number>(0);

  // Group dan Story yang sedang aktif
  const liveGroup =
    activeGroupIndex !== null && storyGroups[activeGroupIndex]
      ? storyGroups[activeGroupIndex]
      : null;

  const liveStory =
    liveGroup && liveGroup.stories[activeStoryIndex]
      ? liveGroup.stories[activeStoryIndex]
      : null;

  const currentGroup = liveGroup || cachedGroup;
  const currentStory = liveStory || cachedStory;

  // Animasi Slide-Up Masuk & Slide-Down Keluar ala Instagram Story
  useEffect(() => {
    if (isViewerOpen && liveGroup && liveStory) {
      setCachedGroup(liveGroup);
      setCachedStory(liveStory);
      setIsRendered(true);
      slideAnim.setValue(SCREEN_HEIGHT);
      fadeAnim.setValue(0);

      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 280,
          easing: Easing.bezier(0.16, 1, 0.3, 1),
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 280,
          easing: Easing.bezier(0.16, 1, 0.3, 1),
          useNativeDriver: Platform.OS !== 'web',
        }),
      ]).start();
    } else if (!isViewerOpen && isRendered) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: SCREEN_HEIGHT,
          duration: 220,
          easing: Easing.bezier(0.7, 0, 0.84, 0),
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 220,
          easing: Easing.bezier(0.7, 0, 0.84, 0),
          useNativeDriver: Platform.OS !== 'web',
        }),
      ]).start(() => {
        setIsRendered(false);
        setCachedGroup(null);
        setCachedStory(null);
      });
    }
  }, [isViewerOpen]);

  // Sync cached story saat berpindah story di dalam viewer
  useEffect(() => {
    if (isViewerOpen && liveGroup && liveStory) {
      setCachedGroup(liveGroup);
      setCachedStory(liveStory);
    }
  }, [liveGroup, liveStory, isViewerOpen]);

  // Handle dismiss dengan animasi slide-down
  const handleClose = (callback?: () => void) => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: SCREEN_HEIGHT,
        duration: 220,
        easing: Easing.bezier(0.7, 0, 0.84, 0),
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 220,
        easing: Easing.bezier(0.7, 0, 0.84, 0),
        useNativeDriver: Platform.OS !== 'web',
      }),
    ]).start(() => {
      setIsRendered(false);
      setCachedGroup(null);
      setCachedStory(null);
      closeStory();
      if (callback) callback();
    });
  };

  // Reset timer setiap kali storyIndex atau groupIndex berganti
  useEffect(() => {
    if (!isViewerOpen || !currentStory) {
      setProgressPercent(0);
      elapsedBeforePauseRef.current = 0;
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    setProgressPercent(0);
    elapsedBeforePauseRef.current = 0;
    startTimeRef.current = Date.now();

    const interval = 50; // Update setiap 50ms
    timerRef.current = setInterval(() => {
      if (useStoryStore.getState().isPaused) {
        return;
      }

      const elapsed = Date.now() - startTimeRef.current + elapsedBeforePauseRef.current;
      const pct = Math.min(100, (elapsed / STORY_DURATION_MS) * 100);
      setProgressPercent(pct);

      if (elapsed >= STORY_DURATION_MS) {
        clearInterval(timerRef.current);
        nextStory();
      }
    }, interval);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isViewerOpen, activeGroupIndex, activeStoryIndex, currentStory?.id, nextStory]);

  if (!isRendered || !currentGroup || !currentStory) {
    return null;
  }

  // Handle Touch Hold / Pause
  const handlePressIn = () => {
    setPaused(true);
    elapsedBeforePauseRef.current += Date.now() - startTimeRef.current;
  };

  const handlePressOut = () => {
    startTimeRef.current = Date.now();
    setPaused(false);
  };

  // Navigasi kiri / kanan berdasarkan tap
  const handleScreenTouch = (evt: any) => {
    const screenWidth = Dimensions.get('window').width;
    const touchX = evt.nativeEvent.locationX || evt.nativeEvent.pageX || 0;

    // Jika tap di sepertiga kiri screen -> prev
    if (touchX < screenWidth * 0.3) {
      prevStory();
    } else {
      nextStory();
    }
  };

  // Format sisa waktu 24 jam
  const getRemainingHours = () => {
    const now = Date.now();
    const diffMs = currentStory.expiresAt - now;
    if (diffMs <= 0) return 'Kedaluwarsa';
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}j ${mins}m tersisa`;
  };

  // Langsung panggil video host (Panggilan normal: TIDAK ADA mekanisme gratis)
  const handleCallAnchor = () => {
    if (coinBalance < 60) {
      toast.show('Dibutuhkan minimal 60 koin untuk panggilan video langsung.', 'warning');
      openTopupModal();
      return;
    }

    handleClose(() => {
      matchFound({
        channelId: `ch_${currentGroup.userId}_${Date.now()}`,
        peer: {
          id: currentGroup.userId,
          nickname: currentGroup.username,
          avatarUrl: currentGroup.avatar,
          gender: 'female',
          level: 3,
        },
        freeChatSeconds: 0, // Direct call: 0 detik gratis
        agoraUid: 1001,
        billingIntervalSeconds: 60,
        costPerInterval: 60,
        isHostCaller: false,
        agoraToken: `tok_${currentGroup.userId}`,
      });
    });
  };

  // Balas story via Chat
  const handleSendReply = () => {
    if (!replyText.trim()) return;

    const user = useAuthStore.getState().user;
    const currentUserId = user?.id || 'guest_user';
    const currentUserName = user?.nickname || 'Pengguna';
    const isHost = Boolean(user?.isHost);

    openChat({
      id: currentGroup.userId,
      name: currentGroup.username,
      avatar: currentGroup.avatar,
      isOnline: true,
      isHost: currentGroup.isHost,
    });

    sendMessage(`Membalas story: ${replyText.trim()}`, currentUserId, currentUserName, isHost);
    setReplyText('');
    handleClose();
  };

  return (
    <Animated.View
      style={[
        styles.modalOverlay,
        {
          transform: [{ translateY: slideAnim }],
          opacity: fadeAnim,
        },
      ]}
    >
      <View style={styles.safeContainer}>
        {/* MEDIA DISPLAY (FULLSCREEN) */}
        <View
          style={styles.mediaContainer}
          onTouchStart={handlePressIn}
          onTouchEnd={handlePressOut}
          {...((Platform.OS === 'web'
            ? { onMouseDown: handlePressIn, onMouseUp: handlePressOut }
            : {}) as any)}
        >
          {currentStory.mediaType === 'video' ? (
            Platform.OS === 'web' ? (
              <video
                src={currentStory.mediaUrl}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
                autoPlay
                playsInline
                loop
                muted
              />
            ) : (
              <Image source={{ uri: currentStory.mediaUrl }} style={styles.mediaImage} resizeMode="cover" />
            )
          ) : (
            <Image source={{ uri: currentStory.mediaUrl }} style={styles.mediaImage} resizeMode="cover" />
          )}

          {/* Invisible touch navigation zones */}
          <TouchableOpacity
            style={styles.touchNavLeft}
            activeOpacity={1}
            onPress={prevStory}
          />
          <TouchableOpacity
            style={styles.touchNavRight}
            activeOpacity={1}
            onPress={nextStory}
          />

          {/* TOP GRADIENT OVERLAY */}
          <View style={styles.topGradient} />

          {/* BOTTOM GRADIENT OVERLAY */}
          <View style={styles.bottomGradient} />
        </View>

        {/* TOP SEGMENTED PROGRESS BARS (ALA INSTAGRAM) */}
        <View style={[styles.progressBarRow, { paddingTop: Math.max(insets.top, 12) }]}>
          {currentGroup.stories.map((s, idx) => {
            let widthPct = '0%';
            if (idx < activeStoryIndex) {
              widthPct = '100%';
            } else if (idx === activeStoryIndex) {
              widthPct = `${progressPercent}%`;
            }

            return (
              <View key={s.id} style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: widthPct as any,
                      backgroundColor: colors.primary,
                    },
                  ]}
                />
              </View>
            );
          })}
        </View>

        {/* TOP HEADER: USER INFO & TTL */}
        <View style={styles.headerRow}>
          <View style={styles.userMeta}>
            <Image source={{ uri: currentGroup.avatar }} style={styles.userAvatar} />
            <View style={styles.userInfoCol}>
              <View style={styles.nameRow}>
                <Text style={styles.userName}>{currentGroup.username}</Text>
                {currentGroup.isHost && <Crown size={14} color="#FFA000" style={{ marginLeft: 4 }} />}
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 1 }}>
                <Clock size={11} color="rgba(255,255,255,0.78)" style={{ marginRight: 4 }} />
                <Text style={styles.ttlText}>
                  {getRemainingHours()}
                </Text>
              </View>
            </View>
          </View>

          <TouchableOpacity
            testID="btn-close-story"
            accessibilityLabel="btn-close-story"
            style={styles.closeBtn}
            onPress={() => handleClose()}
            activeOpacity={0.8}
          >
            <X size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* BOTTOM CONTENT & ACTIONS */}
        <View style={[styles.bottomContent, { bottom: Math.max(insets.bottom, 16) }]}>
          {/* Moderation Review Status Badge */}
          {currentStory.status && currentStory.status !== 'approved' && (
            <View
              style={[
                styles.moderationStoryBadge,
                {
                  backgroundColor:
                    currentStory.status === 'pending_review'
                      ? 'rgba(255, 184, 0, 0.92)'
                      : 'rgba(255, 45, 85, 0.95)',
                },
              ]}
            >
              <Text
                style={{
                  color: currentStory.status === 'pending_review' ? '#000000' : '#FFFFFF',
                  fontSize: 11,
                  fontWeight: '800',
                }}
              >
                {currentStory.status === 'pending_review'
                  ? '⏳ Sedang Ditinjau Tim Moderasi'
                  : '🚫 Cerita Dibatasi: Melanggar Kebijakan SARA / Pornografi'}
              </Text>
            </View>
          )}

          {/* Caption */}
          {Boolean(currentStory.caption) && (
            <View style={styles.captionBubble}>
              <Text style={styles.captionText}>{currentStory.caption}</Text>
            </View>
          )}

          {/* Action Row: Reply + Call Anchor + Like */}
          <View style={styles.actionRow}>
            {/* Input Reply */}
            <View style={styles.replyInputContainer}>
              <TextInput
                style={styles.replyInput}
                placeholder={`Balas ${currentGroup.username}...`}
                placeholderTextColor="rgba(255,255,255,0.6)"
                value={replyText}
                onChangeText={setReplyText}
                onSubmitEditing={handleSendReply}
                onFocus={() => setPaused(true)}
                onBlur={() => setPaused(false)}
              />
              {replyText.trim().length > 0 && (
                <TouchableOpacity onPress={handleSendReply} style={styles.sendReplyBtn}>
                  <Text style={styles.sendReplyText}>{t('common.send')}</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Tombol Panggil Video 1-on-1 jika Anchor */}
            {currentGroup.isHost && (
              <TouchableOpacity
                style={[
                  styles.callButton,
                  {
                    backgroundColor: colors.primary,
                    shadowColor: colors.primary,
                  },
                ]}
                activeOpacity={0.85}
                onPress={handleCallAnchor}
              >
                <PhoneCall size={14} color="#FFFFFF" style={{ marginRight: 4 }} />
                <Text style={styles.callText}>{t('common.call')}</Text>
              </TouchableOpacity>
            )}

            {/* Like Button */}
            <TouchableOpacity
              style={styles.likeButton}
              activeOpacity={0.7}
              onPress={likeCurrentStory}
            >
              <Heart size={18} color="#FF2E63" fill="#FF2E63" />
              <Text style={styles.likeCount}>
                {currentStory.likesCount || 0}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#050508',
    zIndex: 9999,
  },
  safeContainer: {
    flex: 1,
    position: 'relative',
  },
  mediaContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000000',
    overflow: 'hidden',
  },
  mediaImage: {
    width: '100%',
    height: '100%',
  },
  touchNavLeft: {
    position: 'absolute',
    top: 80,
    left: 0,
    width: '30%',
    bottom: 120,
    zIndex: 10,
  },
  touchNavRight: {
    position: 'absolute',
    top: 80,
    right: 0,
    width: '70%',
    bottom: 120,
    zIndex: 10,
  },
  topGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 140,
    backgroundColor: 'transparent',
    ...(Platform.OS === 'web'
      ? ({
          backgroundImage: 'linear-gradient(to bottom, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0) 100%)',
        } as any)
      : {}),
  },
  bottomGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 220,
    backgroundColor: 'transparent',
    ...(Platform.OS === 'web'
      ? ({
          backgroundImage: 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0) 100%)',
        } as any)
      : {}),
  },
  progressBarRow: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingTop: Platform.OS === 'web' ? 12 : 6,
    zIndex: 20,
  },
  progressTrack: {
    flex: 1,
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.28)',
    borderRadius: 2,
    marginHorizontal: 2.5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    zIndex: 20,
  },
  userMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    marginRight: 10,
  },
  userInfoCol: {
    justifyContent: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userName: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  crown: {
    fontSize: 12,
    marginLeft: 4,
  },
  ttlText: {
    color: 'rgba(255,255,255,0.78)',
    fontSize: 11,
    marginTop: 1,
    fontWeight: '500',
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  bottomContent: {
    position: 'absolute',
    bottom: Platform.OS === 'web' ? 24 : 16,
    left: 16,
    right: 16,
    zIndex: 20,
  },
  captionBubble: {
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  captionText: {
    color: '#FFFFFF',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  replyInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: 14,
    height: 44,
    marginRight: 8,
  },
  replyInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 13,
    paddingVertical: 6,
  },
  sendReplyBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  sendReplyText: {
    color: '#FF005E',
    fontWeight: '700',
    fontSize: 12,
  },
  callButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    height: 44,
    borderRadius: 22,
    marginRight: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 6,
  },
  callIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  callText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 12,
  },
  likeButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  likeIcon: {
    fontSize: 18,
  },
  likeCount: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    marginTop: -2,
  },
  moderationStoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    marginBottom: 8,
  },
});
