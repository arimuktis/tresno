import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  Animated,
  Easing,
  Modal,
  Pressable,
} from 'react-native';
import { useThemeStore } from '../../../theme/useThemeStore';
import { useTranslation } from '../../../i18n';
import { useChatStore, ChatPeer, ChatMessage } from '../stores/useChatStore';
import { useAuthStore } from '../../auth/stores/useAuthStore';
import { useWalletStore } from '../../wallet/stores/useWalletStore';
import { useCallStore } from '../../video-chat/stores/useCallStore';
import { useSocialStore } from '../../social/stores/useSocialStore';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { toast } from '../../../shared/stores/useToastStore';
import { ReadReceiptBatcher } from '../services/readReceiptBatcher';
import { IcebreakerSuggestion } from '@tresno/shared';
import { aiVectorService } from '../../../shared/services/aiVectorService';
import { posthog } from '../../../shared/services/posthogService';
import { usePresenceStore } from '../../../shared/stores/usePresenceStore';

import { Avatar } from '../../../shared/components/atoms/Avatar';
import { ChatBubble } from '../../../shared/components/molecules/ChatBubble';
import { GiftItemCard, GiftItem } from '../../../shared/components/molecules/GiftItemCard';
import {
  ChevronLeft,
  Crown,
  PhoneCall,
  Calendar,
  Clock,
  X,
  Gift,
  Send,
  Megaphone,
  Heart,
  Sparkles,
  Gem,
  Pin,
  PinOff,
  Copy,
  Reply,
  Trash2,
} from 'lucide-react-native';
import {
  formatDateDivider,
  formatTimeOnly,
  isDifferentDay,
  hasSignificantGap,
} from '../../../shared/utils/dateTimeUtils';

const VIRTUAL_GIFTS: GiftItem[] = [
  { icon: Heart, name: 'Mawar Cinta', coins: 10 },
  { icon: Gift, name: 'Bingkisan', coins: 30 },
  { icon: Crown, name: 'Mahkota VIP', coins: 100 },
  { icon: Gem, name: 'Berlian Mulia', coins: 500 },
];

export const ChatRoomModal: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useThemeStore();
  const { t } = useTranslation();
  const { user: authUser } = useAuthStore();
  const { coinBalance, chatCoupons, openTopupModal } = useWalletStore();
  const { isFollowing, isMutualFriend, toggleFollow } = useSocialStore();
  const { matchFound } = useCallStore();
  const {
    activePeer,
    isChatModalOpen,
    closeChat,
    messages,
    sendMessage,
    sendGift,
    markBatchAsRead,
    isChatUnlocked,
    togglePinChat,
    isChatPinned,
    deleteMessage,
    pinnedRoomMessages,
    pinRoomMessage,
  } = useChatStore();

  const SCREEN_WIDTH = Dimensions.get('window').width || 420;
  const slideAnim = useRef(new Animated.Value(SCREEN_WIDTH)).current;
  const [isRendered, setIsRendered] = useState(false);
  const [cachedPeer, setCachedPeer] = useState<ChatPeer | null>(null);

  const [inputText, setInputText] = useState('');
  const [showGiftPicker, setShowGiftPicker] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const inputRef = useRef<TextInput>(null);
  const batcherRef = useRef<ReadReceiptBatcher | null>(null);

  // States untuk fitur klik-tahan (hold action): reaksi emoji, quote reply, & menu aksi
  const [selectedMsgAction, setSelectedMsgAction] = useState<ChatMessage | null>(null);
  const [reactionsMap, setReactionsMap] = useState<Record<string, string>>({});
  const [replyingToMsg, setReplyingToMsg] = useState<ChatMessage | null>(null);

  const currentPeer = activePeer || cachedPeer;
  const chatId = currentPeer?.id || '';
  const chatMessages = messages[chatId] || [];
  const isHost = authUser?.isHost ?? false;
  const isSystemPeer = currentPeer?.isSystem || currentPeer?.id === 'anchor_system';
  const isUnlocked = isChatUnlocked(chatId);
  const isPeerFollowing = isFollowing(chatId);
  const isPeerMutual = isMutualFriend(chatId);
  const storeStatus = usePresenceStore((s) => (currentPeer ? s.presences[currentPeer.id]?.status : undefined));
  const effectivePresence = currentPeer?.presenceStatus || storeStatus || (currentPeer?.isOnline ? 'available' : 'offline');

  // States untuk AI Smart Icebreakers
  const [icebreakers, setIcebreakers] = useState<IcebreakerSuggestion[]>([]);
  const [showAiIcebreakers, setShowAiIcebreakers] = useState(true);

  useEffect(() => {
    if (currentPeer && !currentPeer.isSystem && !isHost) {
      aiVectorService.generateIcebreakers(currentPeer.id, currentPeer.name).then((res) => {
        setIcebreakers(res);
      });
      posthog.capture('chatroom_opened', {
        peerId: currentPeer.id,
        isHost,
      });
    }
  }, [currentPeer?.id]);


  const handleCopyMessage = (msg: ChatMessage) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(msg.text);
    }
    toast.show('Pesan disalin ke papan klip', 'success');
    setSelectedMsgAction(null);
  };

  const handleReplyMessage = (msg: ChatMessage) => {
    setReplyingToMsg(msg);
    setSelectedMsgAction(null);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 150);
  };

  const handleTogglePinMessage = (msg: ChatMessage) => {
    const isPinnedNow = pinnedRoomMessages[chatId]?.id === msg.id;
    pinRoomMessage(chatId, isPinnedNow ? null : msg);
    setSelectedMsgAction(null);
  };

  const handleDeleteMessage = (msg: ChatMessage) => {
    deleteMessage(chatId, msg.id);
    setSelectedMsgAction(null);
  };

  const handleReactToMessage = (msg: ChatMessage, emoji: string) => {
    setReactionsMap((prev) => ({
      ...prev,
      [msg.id]: prev[msg.id] === emoji ? '' : emoji,
    }));
    toast.show(`Reaksi ${emoji} ditambahkan`, 'info');
    setSelectedMsgAction(null);
  };

  // Animasi Slide Masuk & Keluar ala iOS/Native Chat Detail
  useEffect(() => {
    if (isChatModalOpen && activePeer) {
      setCachedPeer(activePeer);
      setIsRendered(true);
      slideAnim.setValue(SCREEN_WIDTH);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 280,
        easing: Easing.bezier(0.16, 1, 0.3, 1),
        useNativeDriver: Platform.OS !== 'web',
      }).start();
    } else if (!isChatModalOpen && isRendered) {
      Animated.timing(slideAnim, {
        toValue: SCREEN_WIDTH,
        duration: 220,
        easing: Easing.bezier(0.7, 0, 0.84, 0),
        useNativeDriver: Platform.OS !== 'web',
      }).start(() => {
        setIsRendered(false);
        setCachedPeer(null);
      });
    }
  }, [isChatModalOpen, activePeer]);

  const handleBack = () => {
    Animated.timing(slideAnim, {
      toValue: SCREEN_WIDTH,
      duration: 220,
      easing: Easing.bezier(0.7, 0, 0.84, 0),
      useNativeDriver: Platform.OS !== 'web',
    }).start(() => {
      closeChat();
      setIsRendered(false);
      setCachedPeer(null);
    });
  };

  // Inisialisasi Telegram-style batch read receipt manager
  useEffect(() => {
    if (!isChatModalOpen || !chatId) return;

    batcherRef.current = new ReadReceiptBatcher(
      chatId,
      (targetChatId, ids, maxSeq) => {
        markBatchAsRead(targetChatId, ids, maxSeq);
      },
      500,
      20
    );

    chatMessages.forEach((msg) => {
      if (msg.senderId !== authUser?.id && msg.status !== 'read') {
        batcherRef.current?.markVisible(msg.id, msg.sequenceId);
      }
    });

    return () => {
      batcherRef.current?.destroy();
      batcherRef.current = null;
    };
  }, [chatId, isChatModalOpen]);

  useEffect(() => {
    if (scrollRef.current) {
      setTimeout(() => {
        scrollRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [chatMessages.length]);

  if (!isRendered || !currentPeer) {
    return null;
  }

  const handleSend = async () => {
    if (!inputText.trim()) return;
    const textToSend = inputText.trim();

    const success = await sendMessage(
      textToSend,
      authUser?.id || 'me',
      authUser?.nickname || 'Saya',
      isHost
    );

    // Hanya hapus draft input jika pengiriman pesan benar-benar berhasil (koin cukup / gratis)
    if (success) {
      setInputText('');
      setReplyingToMsg(null);
    }
  };

  const getPlaceholderText = () => {
    if (isSystemPeer) return t('messages.typeSystemInquiry');
    if (isHost) return t('messages.typeReply');
    return t('messages.typeMessage');
  };

  const handleSendGift = async (gift: GiftItem) => {
    setShowGiftPicker(false);
    await sendGift(gift, authUser?.id || 'me', authUser?.nickname || 'Saya');
  };


  const handleStartDirectCall = () => {
    if (effectivePresence === 'busy') {
      toast.warning(`${currentPeer.name} sedang dalam panggilan video lain. Coba beberapa saat lagi atau kirim pesan!`);
      return;
    }

    // Panggilan normal/langsung: TIDAK ADA mekanisme gratis (gratis 20 detik HANYA untuk matchmaking)
    if (coinBalance < 60) {
      toast.show('Dibutuhkan minimal 60 koin untuk panggilan video langsung.', 'warning');
      openTopupModal();
      return;
    }

    matchFound({
      channelId: `ch_direct_${currentPeer.id}_${Date.now()}`,
      peer: {
        id: currentPeer.id,
        nickname: currentPeer.name,
        avatarUrl: currentPeer.avatar,
        gender: 'female',
        level: 3,
      },
      freeChatSeconds: 0, // Direct call: 0 detik gratis
      agoraUid: 1003,
      billingIntervalSeconds: 60,
      costPerInterval: 60,
      isHostCaller: false,
      agoraToken: `tok_${currentPeer.id}`,
    });
  };

  return (
    <Animated.View
      style={[
        styles.overlay,
        {
          backgroundColor: colors.background,
          transform: [{ translateX: slideAnim }],
        },
      ]}
    >
      {/* Header Room Chat */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: colors.surfaceCard,
            borderBottomColor: colors.border,
            paddingTop: Math.max(insets.top, 10),
          },
        ]}
      >
        <TouchableOpacity
          testID="btn-close-chat"
          accessibilityLabel="btn-close-chat"
          onPress={handleBack}
          style={styles.backBtn}
          activeOpacity={0.7}
        >
          <ChevronLeft size={22} color={colors.text} />
        </TouchableOpacity>

        {/* Peer Info with Avatar Atom / System Emblem */}
        {isSystemPeer ? (
          <View style={[styles.systemAvatarCircle, { backgroundColor: colors.gold }]}>
            <Megaphone size={18} color="#FFFFFF" />
          </View>
        ) : (
          <Avatar
            uri={currentPeer.avatar}
            name={currentPeer.name}
            size="sm"
            userId={currentPeer.id}
            presenceStatus={effectivePresence}
            showOnlineDot
            style={{ marginRight: 10 }}
          />
        )}

        <View style={styles.peerInfoCol}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={[styles.peerName, { color: colors.text }]} numberOfLines={1}>
              {currentPeer.name}
            </Text>
            {isSystemPeer && (
              <View style={[styles.officialTag, { backgroundColor: colors.gold }]}>
                <Text style={styles.officialTagText}>{t('common.official')}</Text>
              </View>
            )}
            {currentPeer.isHost && !isSystemPeer && (
              <Crown size={12} color={colors.gold} style={{ marginLeft: 4 }} />
            )}
          </View>
          <Text
            style={[
              styles.peerSub,
              {
                color: isSystemPeer
                  ? colors.textSecondary
                  : effectivePresence === 'busy'
                  ? '#FF2E63'
                  : effectivePresence === 'available'
                  ? '#00D26A'
                  : colors.textSecondary,
              },
            ]}
          >
            {isSystemPeer
              ? t('messages.systemSaluran')
              : effectivePresence === 'busy'
              ? '🔴 Sedang Dalam Panggilan'
              : effectivePresence === 'available'
              ? '🟢 ' + t('messages.quickReply')
              : '⚪ ' + t('common.offline')}
          </Text>
        </View>

        {/* Quick Actions: Follow, Pin & Video Call (Hanya untuk Obrolan User/Host, bukan System) */}
        {!isSystemPeer && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            {/* Quick Pin Toggle */}
            <TouchableOpacity
              style={[
                styles.pinHeaderBtn,
                isChatPinned(chatId)
                  ? { backgroundColor: colors.primaryGlow, borderColor: colors.primary }
                  : { backgroundColor: colors.surfaceGlass, borderColor: colors.border },
              ]}
              onPress={() => togglePinChat(chatId)}
              activeOpacity={0.7}
              accessibilityLabel={isChatPinned(chatId) ? t('messages.unpinChat') : t('messages.pinChat')}
            >
              <Pin
                size={13}
                color={isChatPinned(chatId) ? colors.primary : colors.textSecondary}
                fill={isChatPinned(chatId) ? colors.primary : 'none'}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.followBtn,
                isPeerMutual
                  ? { backgroundColor: `${colors.success}20`, borderColor: colors.success }
                  : isPeerFollowing
                  ? { backgroundColor: colors.surfaceGlass, borderColor: colors.border }
                  : { backgroundColor: colors.primaryGlow, borderColor: colors.primary },
              ]}
              onPress={() => toggleFollow(currentPeer.id)}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.followBtnText,
                  {
                    color: isPeerMutual
                      ? colors.success
                      : isPeerFollowing
                      ? colors.textSecondary
                      : colors.primary,
                  },
                ]}
              >
                {isPeerMutual
                  ? t('social.mutualFriend')
                  : isPeerFollowing
                  ? t('social.following')
                  : t('social.follow')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.callActionBtn, { backgroundColor: colors.primary }]}
              onPress={handleStartDirectCall}
              activeOpacity={0.8}
            >
              <PhoneCall size={13} color="#FFFFFF" style={{ marginRight: 4 }} />
              <Text style={styles.callActionText}>{t('common.call')}</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Dynamic Safety & Billing Notice Banner */}
      <View style={[styles.noticeBanner, { backgroundColor: colors.surfaceGlass, borderBottomColor: colors.border }]}>
        <Text style={[styles.noticeText, { color: colors.textSecondary }]}>
          {isSystemPeer
            ? t('messages.systemNoticeBanner')
            : isHost
            ? isPeerMutual
              ? t('chatBilling.bannerHostEarningMutual')
              : t('chatBilling.bannerHostEarning', { points: 2 })
            : isPeerMutual
            ? t('chatBilling.bannerMutualFree')
            : isUnlocked
            ? t('chatBilling.bannerUnlocked')
            : chatCoupons > 0
            ? t('chatBilling.bannerCouponAvailable', { coupons: chatCoupons })
            : t('chatBilling.bannerInitialCost')}
        </Text>
      </View>

      {/* Pinned Message Banner di Ruang Chat (Telegram/WhatsApp style) */}
      {pinnedRoomMessages[chatId] && (
        <View
          style={[
            styles.roomPinnedBanner,
            {
              backgroundColor: isDark ? 'rgba(255, 46, 99, 0.08)' : 'rgba(255, 46, 99, 0.05)',
              borderBottomColor: colors.border,
            },
          ]}
        >
          <View style={[styles.roomPinnedIconBox, { backgroundColor: colors.primaryGlow }]}>
            <Pin size={11} color={colors.primary} fill={colors.primary} />
          </View>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Text style={[styles.roomPinnedTitle, { color: colors.primary }]}>
              Pesan Disematkan • {pinnedRoomMessages[chatId]?.senderName}
            </Text>
            <Text style={[styles.roomPinnedSnippet, { color: colors.text }]} numberOfLines={1}>
              {pinnedRoomMessages[chatId]?.text}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => pinRoomMessage(chatId, null)}
            style={styles.roomPinnedCloseBtn}
            activeOpacity={0.7}
          >
            <X size={14} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      )}

      {/* Messages Scroll Area with Date & Time Dividers */}
      <ScrollView
        ref={scrollRef}
        style={styles.messagesScroll}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
      >
        {chatMessages.map((msg, idx) => {
          const isMe = msg.senderId === (authUser?.id || 'me');
          const prevMsg = idx > 0 ? chatMessages[idx - 1] : undefined;

          const prevTimestamp = prevMsg ? (prevMsg.createdAt || prevMsg.timestamp) : undefined;
          const currTimestamp = msg.createdAt || msg.timestamp;

          // Cek apakah tanggal berganti (beda hari)
          const showDateDivider = !prevMsg || isDifferentDay(prevTimestamp, currTimestamp);

          // Cek apakah ada jeda waktu signifikan (>15 menit) di hari yang sama
          const showTimeDivider =
            !showDateDivider && prevMsg && hasSignificantGap(prevTimestamp, currTimestamp, 15);

          return (
            <React.Fragment key={msg.id}>
              {/* Divider Tanggal (Hari ini, Kemarin, DD MMMM YYYY) */}
              {showDateDivider && (
                <View style={styles.dividerWrapper}>
                  <View
                    style={[
                      styles.dateDividerPill,
                      {
                        backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)',
                        borderColor: colors.border,
                        flexDirection: 'row',
                        alignItems: 'center',
                      },
                    ]}
                  >
                    <Calendar size={11} color={colors.textSecondary} style={{ marginRight: 4 }} />
                    <Text style={[styles.dateDividerText, { color: colors.textSecondary }]}>
                      {formatDateDivider(currTimestamp)}
                    </Text>
                  </View>
                </View>
              )}

              {/* Divider Jeda Jam di Hari yang Sama */}
              {showTimeDivider && (
                <View style={styles.dividerWrapper}>
                  <View
                    style={[
                      styles.timeDividerPill,
                      {
                        backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
                        flexDirection: 'row',
                        alignItems: 'center',
                      },
                    ]}
                  >
                    <Clock size={10} color={colors.textSecondary} style={{ marginRight: 4 }} />
                    <Text style={[styles.timeDividerText, { color: colors.textSecondary }]}>
                      {formatTimeOnly(currTimestamp)}
                    </Text>
                  </View>
                </View>
              )}

              <ChatBubble
                text={msg.text}
                timestamp={msg.timestamp}
                isMe={isMe}
                status={msg.status}
                peerAvatar={currentPeer.avatar}
                peerName={currentPeer.name}
                isSystem={isSystemPeer}
                gift={msg.gift}
                onLongPress={isSystemPeer ? undefined : () => setSelectedMsgAction(msg)}
                reaction={reactionsMap[msg.id]}
              />
            </React.Fragment>
          );
        })}
      </ScrollView>

      {/* Gift Picker Panel with GiftItemCard Molecules */}
      {showGiftPicker && !isSystemPeer && (
        <View style={[styles.giftPickerPanel, { backgroundColor: colors.surfaceCard, borderTopColor: colors.border }]}>
          <View style={styles.giftPickerHeader}>
            <Text style={[styles.giftPickerTitle, { color: colors.text }]}>{t('messages.virtualGiftTitle')}</Text>
            <TouchableOpacity onPress={() => setShowGiftPicker(false)} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Text style={{ color: colors.textSecondary, fontSize: 12 }}>{t('common.close')}</Text>
              <X size={13} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
          <View style={styles.giftGrid}>
            {VIRTUAL_GIFTS.map((gift) => (
              <GiftItemCard
                key={gift.name}
                gift={gift}
                onSelect={handleSendGift}
              />
            ))}
          </View>
        </View>
      )}

      {/* Footer Area: Read-Only Notice for System Announcements, or Input Bar for User Chats */}
      {isSystemPeer ? (
        <View
          style={[
            styles.systemFooter,
            {
              backgroundColor: colors.surfaceCard,
              borderTopColor: colors.border,
              paddingBottom: Math.max(insets.bottom, 14),
            },
          ]}
        >
          <View
            style={[
              styles.systemFooterPill,
              {
                backgroundColor: isDark ? 'rgba(255, 184, 0, 0.08)' : 'rgba(255, 184, 0, 0.06)',
                borderColor: isDark ? 'rgba(255, 184, 0, 0.22)' : 'rgba(255, 184, 0, 0.3)',
              },
            ]}
          >
            <Megaphone size={14} color={colors.gold} style={{ marginRight: 6 }} />
            <Text style={[styles.systemFooterText, { color: colors.textSecondary }]}>
              {t('messages.systemNoReply')}
            </Text>
          </View>
        </View>
      ) : (
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={20}
        >
          {/* Reply Quote Banner Preview */}
          {replyingToMsg && (
            <View
              style={[
                styles.replyPreviewBanner,
                {
                  backgroundColor: isDark ? '#2C2C2E' : '#F4F4F5',
                  borderTopColor: colors.border,
                },
              ]}
            >
              <View style={[styles.replyQuoteBar, { backgroundColor: colors.primary }]} />
              <View style={{ flex: 1, paddingHorizontal: 10 }}>
                <Text style={[styles.replySenderText, { color: colors.primary }]}>
                  Membalas {replyingToMsg.senderName}
                </Text>
                <Text style={[styles.replySnippetText, { color: colors.textSecondary }]} numberOfLines={1}>
                  {replyingToMsg.text}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setReplyingToMsg(null)}
                style={styles.replyCloseBtn}
                activeOpacity={0.7}
              >
                <X size={14} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
          )}

          {/* AI Smart Icebreaker Bar */}
          {icebreakers.length > 0 && showAiIcebreakers && !isHost && (
            <View
              style={[
                styles.aiIcebreakerContainer,
                {
                  backgroundColor: colors.surfaceCard,
                  borderTopColor: colors.border,
                },
              ]}
            >
              <View style={styles.aiIcebreakerHeader}>
                <View style={styles.aiTag}>
                  <Sparkles size={11} color="#00D19D" />
                  <Text style={styles.aiTagText}>AI Icebreaker</Text>
                </View>
                <TouchableOpacity
                  onPress={() => setShowAiIcebreakers(false)}
                  style={{ padding: 2 }}
                >
                  <X size={12} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.icebreakerScroll}
              >
                {icebreakers.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={[
                      styles.icebreakerChip,
                      {
                        backgroundColor: colors.surfaceGlass,
                        borderColor: colors.border,
                      },
                    ]}
                    onPress={() => {
                      setInputText(item.text);
                      posthog.capture('ai_icebreaker_selected', {
                        peerId: currentPeer?.id,
                        category: item.category,
                      });
                      inputRef.current?.focus();
                    }}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[styles.icebreakerChipText, { color: colors.text }]}
                      numberOfLines={1}
                    >
                      {item.text}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          <View
            style={[
              styles.inputBar,

              {
                backgroundColor: colors.surfaceCard,
                borderTopColor: colors.border,
                paddingBottom: Math.max(insets.bottom, 8),
              },
            ]}
          >
            <TouchableOpacity
              style={[styles.giftBtn, { backgroundColor: colors.primaryGlow }]}
              onPress={() => setShowGiftPicker(!showGiftPicker)}
              activeOpacity={0.7}
            >
              <Gift size={18} color={colors.primary} />
            </TouchableOpacity>

            <TextInput
              ref={inputRef}
              value={inputText}
              onChangeText={setInputText}
              placeholder={getPlaceholderText()}
              placeholderTextColor={colors.textSecondary}
              style={[
                styles.textInput,
                {
                  backgroundColor: colors.surfaceGlass,
                  color: colors.text,
                  borderColor: colors.border,
                },
              ]}
              multiline={false}
              onSubmitEditing={handleSend}
            />

            <TouchableOpacity
              style={[
                styles.sendBtn,
                { backgroundColor: inputText.trim() ? colors.primary : colors.surfaceGlass },
              ]}
              onPress={handleSend}
              disabled={!inputText.trim()}
              activeOpacity={0.8}
            >
              <Send size={15} color={inputText.trim() ? '#FFFFFF' : colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      )}

      {/* Modal Aksi Klik-Tahan Pesan Chat (Message Click-Hold Action Modal) */}
      <Modal
        visible={!!selectedMsgAction}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedMsgAction(null)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setSelectedMsgAction(null)}
        >
          <Pressable
            style={[
              styles.msgActionSheet,
              {
                backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
                borderTopColor: colors.border,
              },
            ]}
            onPress={(e) => e.stopPropagation()}
          >
            {/* Quick Reaction Bar */}
            <View style={[styles.reactionBar, { backgroundColor: isDark ? '#2C2C2E' : '#F4F4F5' }]}>
              {['❤️', '👍', '😂', '🔥', '👏', '😮'].map((emoji) => (
                <TouchableOpacity
                  key={emoji}
                  style={styles.reactionBtn}
                  onPress={() => selectedMsgAction && handleReactToMessage(selectedMsgAction, emoji)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.reactionBtnEmoji}>{emoji}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Message Preview Header */}
            {selectedMsgAction && (
              <View style={[styles.msgActionHeader, { borderBottomColor: colors.border }]}>
                <View style={[styles.quoteIndicator, { backgroundColor: colors.primary }]} />
                <View style={{ flex: 1, paddingHorizontal: 10 }}>
                  <Text style={[styles.msgActionSender, { color: colors.textSecondary }]}>
                    {selectedMsgAction.senderName} • {formatTimeOnly(selectedMsgAction.createdAt || selectedMsgAction.timestamp)}
                  </Text>
                  <Text style={[styles.msgActionPreview, { color: colors.text }]} numberOfLines={2}>
                    {selectedMsgAction.text}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => setSelectedMsgAction(null)}
                  style={[
                    styles.closeIconBtn,
                    { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)' },
                  ]}
                >
                  <X size={16} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>
            )}

            {/* Action Buttons List */}
            <View style={styles.msgActionsList}>
              {/* 1. Salin Teks */}
              <TouchableOpacity
                style={[styles.msgActionRow, { borderBottomColor: colors.border }]}
                onPress={() => selectedMsgAction && handleCopyMessage(selectedMsgAction)}
                activeOpacity={0.7}
              >
                <View style={[styles.actionIconBox, { backgroundColor: colors.surfaceGlass }]}>
                  <Copy size={16} color={colors.text} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.actionRowTitle, { color: colors.text }]}>Salin Teks</Text>
                  <Text style={[styles.actionRowSubtitle, { color: colors.textSecondary }]}>
                    Salin isi pesan ke papan klip
                  </Text>
                </View>
              </TouchableOpacity>

              {/* 2. Balas Pesan */}
              <TouchableOpacity
                style={[styles.msgActionRow, { borderBottomColor: colors.border }]}
                onPress={() => selectedMsgAction && handleReplyMessage(selectedMsgAction)}
                activeOpacity={0.7}
              >
                <View style={[styles.actionIconBox, { backgroundColor: colors.primaryGlow }]}>
                  <Reply size={16} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.actionRowTitle, { color: colors.text }]}>Balas Pesan</Text>
                  <Text style={[styles.actionRowSubtitle, { color: colors.textSecondary }]}>
                    Kutip pesan ini dalam balasan obrolan Anda
                  </Text>
                </View>
              </TouchableOpacity>

              {/* 3. Sematkan di Ruang Chat */}
              <TouchableOpacity
                style={[styles.msgActionRow, { borderBottomColor: colors.border }]}
                onPress={() => selectedMsgAction && handleTogglePinMessage(selectedMsgAction)}
                activeOpacity={0.7}
              >
                <View style={[styles.actionIconBox, { backgroundColor: 'rgba(255, 184, 0, 0.12)' }]}>
                  {pinnedRoomMessages[chatId]?.id === selectedMsgAction?.id ? (
                    <PinOff size={16} color={colors.gold || '#F59E0B'} />
                  ) : (
                    <Pin size={16} color={colors.gold || '#F59E0B'} fill={colors.gold || '#F59E0B'} />
                  )}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.actionRowTitle, { color: colors.text }]}>
                    {pinnedRoomMessages[chatId]?.id === selectedMsgAction?.id
                      ? 'Lepas Sematan Pesan'
                      : 'Sematkan Pesan'}
                  </Text>
                  <Text style={[styles.actionRowSubtitle, { color: colors.textSecondary }]}>
                    {pinnedRoomMessages[chatId]?.id === selectedMsgAction?.id
                      ? 'Hapus pesan dari banner atas obrolan'
                      : 'Tampilkan pesan di banner atas ruang obrolan ini'}
                  </Text>
                </View>
              </TouchableOpacity>

              {/* 4. Hapus Pesan */}
              <TouchableOpacity
                style={styles.msgActionRow}
                onPress={() => selectedMsgAction && handleDeleteMessage(selectedMsgAction)}
                activeOpacity={0.7}
              >
                <View style={[styles.actionIconBox, { backgroundColor: 'rgba(239, 68, 68, 0.12)' }]}>
                  <Trash2 size={16} color="#EF4444" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.actionRowTitle, { color: '#EF4444' }]}>Hapus Pesan</Text>
                  <Text style={[styles.actionRowSubtitle, { color: colors.textSecondary }]}>
                    Hapus pesan ini dari percakapan
                  </Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* Tombol Batal */}
            <TouchableOpacity
              style={[
                styles.modalCancelBtn,
                { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' },
              ]}
              onPress={() => setSelectedMsgAction(null)}
              activeOpacity={0.8}
            >
              <Text style={[styles.modalCancelText, { color: colors.text }]}>Batal</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
    justifyContent: 'space-between',
    shadowColor: '#000000',
    shadowOffset: { width: -4, height: 0 },
    shadowOpacity: 0.22,
    shadowRadius: 18,
    elevation: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  backBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 6,
  },
  backIcon: {
    fontSize: 28,
    fontWeight: '300',
  },
  systemAvatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  peerInfoCol: {
    flex: 1,
  },
  peerName: {
    fontSize: 14,
    fontWeight: '700',
  },
  officialTag: {
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
    marginLeft: 6,
  },
  officialTagText: {
    color: '#000000',
    fontSize: 8,
    fontWeight: '900',
  },
  peerSub: {
    fontSize: 10,
    marginTop: 1,
  },
  pinHeaderBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  followBtn: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  followBtnText: {
    fontSize: 10.5,
    fontWeight: '700',
  },
  callActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 18,
  },
  callActionText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  noticeBanner: {
    paddingVertical: 6,
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  noticeText: {
    fontSize: 11,
    fontWeight: '500',
  },
  messagesScroll: {
    flex: 1,
  },
  messagesContent: {
    padding: 12,
    gap: 6,
  },
  // Dividers
  dividerWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
    width: '100%',
  },
  dateDividerPill: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
  },
  dateDividerText: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  timeDividerPill: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
  },
  timeDividerText: {
    fontSize: 10,
    fontWeight: '500',
  },
  giftPickerPanel: {
    padding: 12,
    borderTopWidth: 1,
  },
  giftPickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  giftPickerTitle: {
    fontSize: 12,
    fontWeight: '700',
  },
  giftGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderTopWidth: 1,
    gap: 8,
  },
  giftBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textInput: {
    flex: 1,
    height: 38,
    borderRadius: 19,
    paddingHorizontal: 14,
    fontSize: 13,
    borderWidth: 1,
  },
  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  systemFooter: {
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  systemFooterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    maxWidth: '92%',
  },
  systemFooterText: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  // Pinned message banner di atas ruang obrolan
  roomPinnedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  roomPinnedIconBox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  roomPinnedTitle: {
    fontSize: 10.5,
    fontWeight: '700',
  },
  roomPinnedSnippet: {
    fontSize: 11.5,
  },
  roomPinnedCloseBtn: {
    padding: 4,
  },

  // Reply quote banner preview di atas input bar
  replyPreviewBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
  },
  replyQuoteBar: {
    width: 3,
    height: '100%',
    minHeight: 28,
    borderRadius: 2,
  },
  replySenderText: {
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 2,
  },
  replySnippetText: {
    fontSize: 12,
  },
  replyCloseBtn: {
    padding: 6,
  },

  // Message Click-Hold Modal & Reactions
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  msgActionSheet: {
    width: '100%',
    maxWidth: 414,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderTopWidth: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 24,
  },
  reactionBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 24,
    marginBottom: 14,
  },
  reactionBtn: {
    padding: 6,
    borderRadius: 18,
  },
  reactionBtnEmoji: {
    fontSize: 22,
  },
  msgActionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  quoteIndicator: {
    width: 3,
    height: '100%',
    minHeight: 30,
    borderRadius: 2,
  },
  msgActionSender: {
    fontSize: 10.5,
    fontWeight: '600',
    marginBottom: 2,
  },
  msgActionPreview: {
    fontSize: 13,
    lineHeight: 18,
  },
  closeIconBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  msgActionsList: {
    paddingVertical: 6,
  },
  msgActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  actionIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  actionRowTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    marginBottom: 2,
  },
  actionRowSubtitle: {
    fontSize: 11,
  },
  modalCancelBtn: {
    marginTop: 8,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCancelText: {
    fontSize: 13.5,
    fontWeight: '700',
  },
  aiIcebreakerContainer: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  aiIcebreakerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  aiTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  aiTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#00D19D',
    textTransform: 'uppercase',
  },
  icebreakerScroll: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 2,
  },
  icebreakerChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    maxWidth: 240,
  },
  icebreakerChipText: {
    fontSize: 12,
    fontWeight: '500',
  },
});

