import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Modal, TouchableOpacity, Pressable, RefreshControl } from 'react-native';
import { MessageSquareDashed, Pin, PinOff, PhoneCall, MessageCircle, X, Trash2 } from 'lucide-react-native';
import { useThemeStore } from '../../../theme/useThemeStore';
import { useTranslation } from '../../../i18n';
import { useCallStore } from '../../video-chat/stores/useCallStore';
import { useChatStore, DEFAULT_PEERS } from '../stores/useChatStore';
import { useAuthStore } from '../../auth/stores/useAuthStore';
import { useWalletStore } from '../../wallet/stores/useWalletStore';
import { toast } from '../../../shared/stores/useToastStore';
import { FilterChipBar, FilterItem } from '../../../shared/components/molecules/FilterChipBar';
import { PullToRefreshScrollView } from '../../../shared/components/molecules/PullToRefreshScrollView';
import { MessageItemRow, MessageRowData } from '../../../shared/components/organisms/MessageItemRow';
import { Avatar } from '../../../shared/components/atoms/Avatar';

export const MessagesTab: React.FC = () => {
  const { colors, isDark } = useThemeStore();
  const { t } = useTranslation();
  const { matchFound } = useCallStore();
  const { user: authUser } = useAuthStore();
  const {
    messages,
    peers,
    openChat,
    getRecentConversations,
    getSystemConversation,
    pinnedChatIds,
    togglePinChat,
    isChatPinned,
    deleteConversation,
  } = useChatStore();

  const [filter, setFilter] = useState<'all' | 'chat' | 'call' | 'system'>('all');
  const [selectedManageItem, setSelectedManageItem] = useState<MessageRowData | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handlePullRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      toast.show('Pesan & obrolan disinkronkan', 'info');
    }, 600);
  };

  const filterTabs: FilterItem<'all' | 'chat' | 'call' | 'system'>[] = [
    { key: 'all', label: t('messages.tabAll') },
    { key: 'chat', label: t('messages.tabChats') },
    { key: 'call', label: t('messages.tabCalls') },
    { key: 'system', label: t('messages.tabSystem') },
  ];

  // Dynamic Recent Conversations: otomatis terurut descending berdasarkan timestamp aktivitas terbaru
  const recentConversations = useMemo(
    () => getRecentConversations(authUser?.id || 'me'),
    [messages, peers, authUser?.id]
  );

  // Dynamic System Announcement Bot Message
  const systemConversation = useMemo(
    () => getSystemConversation(),
    [messages, peers]
  );

  const handleMessagePress = (msg: MessageRowData) => {
    if (msg.type === 'system' || msg.id === 'anchor_system') {
      openChat({
        id: 'anchor_system',
        name: 'Tresno Official',
        avatar: '',
        isOnline: true,
        isHost: false,
        isSystem: true,
      });
      return;
    }

    const peer = peers[msg.id] || DEFAULT_PEERS[msg.id] || {
      id: msg.id,
      name: msg.sender,
      avatar: msg.avatar,
      isOnline: true,
      isHost: msg.isHost,
    };

    openChat(peer);
  };

  const handleCallback = (msg: MessageRowData) => {
    const { coinBalance, openTopupModal } = useWalletStore.getState();
    // Panggilan normal/langsung: TIDAK ADA mekanisme gratis (gratis 20 detik HANYA untuk matchmaking)
    if (coinBalance < 60) {
      toast.show('Dibutuhkan minimal 60 koin untuk panggilan video langsung.', 'warning');
      openTopupModal();
      return;
    }

    matchFound({
      channelId: `ch_cb_${msg.id}_${Date.now()}`,
      peer: {
        id: msg.id,
        nickname: msg.sender,
        avatarUrl: msg.avatar,
        gender: 'female',
        level: 2,
      },
      freeChatSeconds: 0, // Direct callback: 0 detik gratis
      agoraUid: 1002,
      billingIntervalSeconds: 60,
      costPerInterval: 60,
      isHostCaller: false,
      agoraToken: `tok_${msg.id}`,
    });
  };

  const handleLongPress = (msg: MessageRowData) => {
    if (msg.type === 'system' || msg.id === 'anchor_system') return;
    setSelectedManageItem(msg);
  };

  const filteredMessages = recentConversations.filter((m) => {
    if (filter === 'all') return true;
    return m.type === filter;
  });

  const showSystemMessage = filter === 'all' || filter === 'system';

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <PullToRefreshScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshing={isRefreshing}
        onRefresh={handlePullRefresh}
      >
        {/* Header Halaman */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>{t('messages.title')}</Text>
        </View>

        {/* Filter Tabs Bar (Molecule) */}
        <View style={styles.filterBarContainer}>
          <FilterChipBar
            items={filterTabs}
            selectedKey={filter}
            onSelect={setFilter}
          />
        </View>

        {/* List Pesan Datar Bergaris Pemisah (Tigo Line Divider) */}
        <View style={styles.listContainer}>
          {/* Pesan Sistem Pinned (Tampil Khusus Tersendiri di Bagian Atas) */}
          {showSystemMessage && (
            <View style={styles.systemSection}>
              {filter === 'all' && (
                <View style={styles.sectionHeader}>
                  <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
                    {t('messages.sectionOfficial')}
                  </Text>
                </View>
              )}
              <MessageItemRow
                item={systemConversation}
                onPress={handleMessagePress}
                showDivider={true}
                style={{
                  backgroundColor: isDark ? 'rgba(255, 184, 0, 0.05)' : 'rgba(255, 243, 205, 0.4)',
                }}
              />
            </View>
          )}

          {/* Header Seksi Obrolan Langsung (Jika di Tab Semua) */}
          {filter === 'all' && filteredMessages.length > 0 && (
            <View style={styles.sectionHeaderRow}>
              <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
                {t('messages.sectionChats')}
              </Text>
              {pinnedChatIds.length > 0 && (
                <View
                  style={[
                    styles.pinnedCounterBadge,
                    {
                      backgroundColor: isDark ? 'rgba(255, 46, 99, 0.12)' : 'rgba(255, 46, 99, 0.08)',
                    },
                  ]}
                >
                  <Pin size={10} color={colors.primary} fill={colors.primary} style={{ marginRight: 4 }} />
                  <Text style={[styles.pinnedCounterText, { color: colors.primary }]}>
                    {pinnedChatIds.length}/20 {t('messages.pinnedBadge')}
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Baris-baris Obrolan Langsung (Auto Geser ke Atas jika disematkan atau ada aktivitas terbaru) */}
          {filter !== 'system' &&
            filteredMessages.map((msg, index) => (
              <MessageItemRow
                key={msg.id}
                item={msg}
                onPress={handleMessagePress}
                onLongPress={handleLongPress}
                onCallback={handleCallback}
                callbackLabel={t('messages.callback')}
                showDivider={index < filteredMessages.length - 1}
              />
            ))}

          {/* Empty State jika tidak ada item dalam filter */}
          {filter !== 'system' && filteredMessages.length === 0 && (
            <View style={styles.emptyContainer}>
              <MessageSquareDashed size={36} color={colors.textSecondary} />
              <Text style={[styles.emptyTitle, { color: colors.text }]}>
                {filter === 'call' ? 'Belum Ada Riwayat Panggilan' : 'Belum Ada Obrolan'}
              </Text>
              <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                {filter === 'call'
                  ? 'Panggilan video masuk dan tak terjawab akan tampil di sini.'
                  : 'Sapa host favoritmu di tab Jelajah untuk mulai mengobrol!'}
              </Text>
            </View>
          )}
        </View>
      </PullToRefreshScrollView>

      {/* Modal Aksi Kelola Obrolan & Pin (Long Press Bottom Sheet) */}
      <Modal
        visible={!!selectedManageItem}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedManageItem(null)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setSelectedManageItem(null)}
        >
          <Pressable
            style={[
              styles.modalSheet,
              {
                backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
                borderTopColor: colors.border,
              },
            ]}
            onPress={(e) => e.stopPropagation()}
          >
            {/* Header Dialog */}
            {selectedManageItem && (
              <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
                <Avatar
                  uri={selectedManageItem.avatar}
                  name={selectedManageItem.sender}
                  size="md"
                  isOnline={selectedManageItem.isHost}
                  showOnlineDot={selectedManageItem.isHost}
                  style={{ marginRight: 12 }}
                />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.modalPeerName, { color: colors.text }]} numberOfLines={1}>
                    {selectedManageItem.sender}
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                    <View
                      style={[
                        styles.modalPinPill,
                        {
                          backgroundColor: isChatPinned(selectedManageItem.id)
                            ? (isDark ? 'rgba(255, 46, 99, 0.18)' : 'rgba(255, 46, 99, 0.10)')
                            : (isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)'),
                        },
                      ]}
                    >
                      <Pin
                        size={10}
                        color={isChatPinned(selectedManageItem.id) ? colors.primary : colors.textSecondary}
                        fill={isChatPinned(selectedManageItem.id) ? colors.primary : 'none'}
                        style={{ marginRight: 4 }}
                      />
                      <Text
                        style={[
                          styles.modalPinPillText,
                          {
                            color: isChatPinned(selectedManageItem.id) ? colors.primary : colors.textSecondary,
                          },
                        ]}
                      >
                        {isChatPinned(selectedManageItem.id)
                          ? `${t('messages.pinnedBadge')} (${pinnedChatIds.length}/20)`
                          : `${pinnedChatIds.length}/20 ${t('messages.pinnedBadge')}`}
                      </Text>
                    </View>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() => setSelectedManageItem(null)}
                  style={[
                    styles.closeIconBtn,
                    { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)' },
                  ]}
                  activeOpacity={0.7}
                >
                  <X size={16} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>
            )}

            {/* List Aksi */}
            <View style={styles.modalActionsList}>
              {/* 1. Toggle Pin/Unpin Obrolan (Maks 20 pin) */}
              <TouchableOpacity
                style={[styles.modalActionRow, { borderBottomColor: colors.border }]}
                onPress={() => {
                  if (!selectedManageItem) return;
                  togglePinChat(selectedManageItem.id);
                  setSelectedManageItem(null);
                }}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.modalActionIconBox,
                    {
                      backgroundColor: isChatPinned(selectedManageItem?.id || '')
                        ? 'rgba(255, 46, 99, 0.15)'
                        : colors.primaryGlow,
                    },
                  ]}
                >
                  {isChatPinned(selectedManageItem?.id || '') ? (
                    <PinOff size={18} color={colors.primary} />
                  ) : (
                    <Pin size={18} color={colors.primary} fill={colors.primary} />
                  )}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.actionRowTitle, { color: colors.text }]}>
                    {isChatPinned(selectedManageItem?.id || '')
                      ? t('messages.unpinChat')
                      : t('messages.pinChat')}
                  </Text>
                  <Text style={[styles.actionRowSubtitle, { color: colors.textSecondary }]}>
                    {isChatPinned(selectedManageItem?.id || '')
                      ? 'Lepas sematan dari posisi atas daftar obrolan'
                      : `Sematkan ke paling atas daftar obrolan (${pinnedChatIds.length}/20)`}
                  </Text>
                </View>
              </TouchableOpacity>

              {/* 2. Panggilan Video Langsung */}
              <TouchableOpacity
                style={[styles.modalActionRow, { borderBottomColor: colors.border }]}
                onPress={() => {
                  const target = selectedManageItem;
                  setSelectedManageItem(null);
                  if (target) handleCallback(target);
                }}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.modalActionIconBox,
                    { backgroundColor: 'rgba(0, 209, 157, 0.12)' },
                  ]}
                >
                  <PhoneCall size={18} color={colors.success || '#00D19D'} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.actionRowTitle, { color: colors.text }]}>
                    Panggilan Video
                  </Text>
                  <Text style={[styles.actionRowSubtitle, { color: colors.textSecondary }]}>
                    Hubungi {selectedManageItem?.sender} secara langsung
                  </Text>
                </View>
              </TouchableOpacity>

              {/* 3. Buka Obrolan Penuh */}
              <TouchableOpacity
                style={styles.modalActionRow}
                onPress={() => {
                  const target = selectedManageItem;
                  setSelectedManageItem(null);
                  if (target) handleMessagePress(target);
                }}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.modalActionIconBox,
                    { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)' },
                  ]}
                >
                  <MessageCircle size={18} color={colors.text} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.actionRowTitle, { color: colors.text }]}>
                    Buka Obrolan
                  </Text>
                  <Text style={[styles.actionRowSubtitle, { color: colors.textSecondary }]}>
                    Ketik pesan dan lihat riwayat obrolan lengkap
                  </Text>
                </View>
              </TouchableOpacity>

              {/* 4. Hapus Percakapan */}
              <TouchableOpacity
                style={styles.modalActionRow}
                onPress={() => {
                  const target = selectedManageItem;
                  setSelectedManageItem(null);
                  if (target) deleteConversation(target.id);
                }}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.modalActionIconBox,
                    { backgroundColor: 'rgba(239, 68, 68, 0.12)' },
                  ]}
                >
                  <Trash2 size={18} color="#EF4444" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.actionRowTitle, { color: '#EF4444' }]}>
                    Hapus Percakapan
                  </Text>
                  <Text style={[styles.actionRowSubtitle, { color: colors.textSecondary }]}>
                    Hapus riwayat pesan obrolan ini
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
              onPress={() => setSelectedManageItem(null)}
              activeOpacity={0.8}
            >
              <Text style={[styles.modalCancelText, { color: colors.text }]}>Batal</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  filterBarContainer: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  listContainer: {
    width: '100%',
  },
  systemSection: {
    width: '100%',
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 6,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 6,
  },
  pinnedCounterBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  pinnedCounterText: {
    fontSize: 10.5,
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginTop: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
    maxWidth: 280,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  modalSheet: {
    width: '100%',
    maxWidth: 414,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderTopWidth: 1,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  modalPeerName: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  modalPinPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  modalPinPillText: {
    fontSize: 11,
    fontWeight: '600',
  },
  closeIconBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalActionsList: {
    paddingVertical: 8,
  },
  modalActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  modalActionIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  actionRowTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  actionRowSubtitle: {
    fontSize: 11.5,
  },
  modalCancelBtn: {
    marginTop: 8,
    paddingVertical: 13,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCancelText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
