import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useThemeStore } from '../../../theme/useThemeStore';
import { useTranslation } from '../../../i18n';
import { useCallStore } from '../../video-chat/stores/useCallStore';
import { useWalletStore } from '../../wallet/stores/useWalletStore';
import { useChatStore } from '../../messages/stores/useChatStore';
import { useAuthStore } from '../../auth/stores/useAuthStore';
import { FilterChipBar, FilterItem } from '../../../shared/components/molecules/FilterChipBar';
import { PullToRefreshScrollView } from '../../../shared/components/molecules/PullToRefreshScrollView';
import { AnchorCard, AnchorData } from '../../../shared/components/organisms/AnchorCard';
import { StoryBar } from '../../stories/components/StoryBar';
import { toast } from '../../../shared/stores/useToastStore';
import { getSmartRankedAnchors } from '../services/destinyAlgorithm';
import { Crown, Zap, Sparkles, Radio } from 'lucide-react-native';
import { supabaseRealtimeService } from '../../../shared/services/supabaseRealtimeService';
import { posthog } from '../../../shared/services/posthogService';
import { usePresenceStore } from '../../../shared/stores/usePresenceStore';
import { soundService } from '../../../shared/services/soundService';
import { useStoryStore } from '../../stories/stores/useStoryStore';
import { useAnchorDetailStore } from '../stores/useAnchorDetailStore';
import { AnchorProfileModal } from './AnchorProfileModal';

export const DestinyTab: React.FC = () => {
  const { colors, isDark } = useThemeStore();
  const { t } = useTranslation();
  const { matchFound } = useCallStore();
  const { coinBalance, openTopupModal } = useWalletStore();
  const { openChat } = useChatStore();
  const { user: authUser } = useAuthStore();
  const { openAnchorDetail } = useAnchorDetailStore();

  const [activeFilter, setActiveFilter] = useState<'all' | 'online' | 'nearby' | 'popular'>('all');
  const [refreshSeed, setRefreshSeed] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const availableCount = usePresenceStore((s) => s.getAvailableCount());
  const busyCount = usePresenceStore((s) => s.getBusyCount());

  const filterItems: FilterItem<'all' | 'online' | 'nearby' | 'popular'>[] = [
    { key: 'all', label: t('destiny.filterAll') },
    { key: 'online', label: t('destiny.filterOnline') },
    { key: 'nearby', label: t('destiny.filterNearby') },
    { key: 'popular', label: t('destiny.filterPopular') },
  ];

  // Ambil daftar anchor yang diurutkan menggunakan Algoritma Multi-Bucket Interleaving Anti-Sepi
  const anchors = getSmartRankedAnchors(activeFilter, 'Jakarta', refreshSeed);

  // Pull-to-refresh handler
  const handlePullRefresh = async () => {
    setIsRefreshing(true);
    soundService.playMessageChime();

    // 1. Re-evaluate Smart Interleaving Algorithm
    setRefreshSeed((prev) => prev + 1);

    // 2. Refresh 24h stories
    useStoryStore.getState().fetchStories();

    // 3. Track PostHog telemetry
    posthog.capture('destiny_pulled_to_refresh', {
      filter: activeFilter,
      availableCount,
      busyCount,
    });

    // 4. Smooth minimum animation timeout (700ms)
    setTimeout(() => {
      setIsRefreshing(false);
      toast.show('Daftar host & status live diperbarui', 'info');
    }, 700);
  };

  const handleCallAnchor = (anchor: AnchorData) => {
    // Panggilan normal/langsung: TIDAK ADA mekanisme gratis (gratis 20 detik HANYA untuk matchmaking)
    const requiredCoins = anchor.ratePerMin || 60;
    if (coinBalance < requiredCoins) {
      toast.show(`Dibutuhkan minimal ${requiredCoins} koin untuk panggilan video langsung.`, 'warning');
      openTopupModal();
      return;
    }

    posthog.capture('direct_call_initiated', {
      hostId: anchor.id,
      hostName: anchor.name,
      ratePerMin: requiredCoins,
    });

    matchFound({
      channelId: `ch_${anchor.id}_${Date.now()}`,
      peer: {
        id: anchor.id,
        nickname: anchor.name,
        avatarUrl: anchor.avatar,
        gender: 'female',
        level: 3,
      },
      freeChatSeconds: 0, // Panggilan normal: 0 detik gratis
      agoraUid: 1001,
      billingIntervalSeconds: 60,
      costPerInterval: requiredCoins,
      isHostCaller: false,
      agoraToken: `tok_${anchor.id}`,
    });
  };

  const handleChatAnchor = (anchor: AnchorData) => {
    posthog.capture('direct_chat_opened', {
      hostId: anchor.id,
      hostName: anchor.name,
    });

    openChat({
      id: anchor.id,
      name: anchor.name,
      avatar: anchor.avatar,
      isOnline: anchor.isOnline,
      isHost: true,
      ratePerMin: anchor.ratePerMin,
    });
  };


  return (
    <PullToRefreshScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      showsVerticalScrollIndicator={false}
      refreshing={isRefreshing}
      onRefresh={handlePullRefresh}
    >

      {/* Host Traffic Transparency & Anti-Sepi Radar Indicator (Khusus Host) */}
      {authUser?.isHost && (
        <View
          style={[
            styles.hostStatusCard,
            {
              backgroundColor: isDark ? 'rgba(255, 184, 0, 0.08)' : '#FFF9E6',
              borderColor: colors.gold,
            },
          ]}
        >
          <View style={styles.hostStatusHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Crown size={15} color={colors.gold} />
              <Text style={[styles.hostStatusTitle, { color: colors.gold }]}>
                RADAR AKUN HOST: PRIORITAS TINGGI
              </Text>
            </View>
            <View style={styles.liveQueuePill}>
              <Zap size={10} color="#000" fill="#000" />
              <Text style={styles.liveQueueText}>Antrean #1</Text>
            </View>
          </View>
          <Text style={[styles.hostStatusDesc, { color: colors.textSecondary }]}>
            Estimasi Panggilan: &lt; 2 Menit • Boost Anti-Sepi: Aktif (Inkubator +100 Pts)
          </Text>
          <Text style={[styles.hostStatusTip, { color: colors.text }]}>
            Tips Akun Ramai: Pertahankan status online & respon panggilan dalam 3 detik untuk menjaga akun Anda selalu di slot teratas radar & explore!
          </Text>
        </View>
      )}

      {/* Stories Carousel (24h Ephemeral Stories) */}
      <StoryBar />

      {/* Filter Chips Bar (Molecule) */}
      <View style={{ marginBottom: 16 }}>
        <FilterChipBar
          items={filterItems}
          selectedKey={activeFilter}
          onSelect={setActiveFilter}
        />
      </View>

      {/* Anchor Cards Grid (Organisms) with Fair Exposure Interleaving */}
      <View style={styles.gridContainer}>
        {anchors.map((anchor) => (
          <AnchorCard
            key={anchor.id}
            anchor={anchor}
            onPress={openAnchorDetail}
            onCall={handleCallAnchor}
            onChat={handleChatAnchor}
            callLabel={t('destiny.directCall')}
          />
        ))}
      </View>

      {/* Anchor Profile Detail Modal ala Tigo */}
      <AnchorProfileModal />
    </PullToRefreshScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 8,
    paddingTop: 12,
  },
  hostStatusCard: {
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 14,
    gap: 4,
  },
  hostStatusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  hostStatusTitle: {
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  liveQueuePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFB800',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 3,
  },
  liveQueueText: {
    color: '#000000',
    fontSize: 10,
    fontWeight: '900',
  },
  hostStatusDesc: {
    fontSize: 11,
    fontWeight: '600',
  },
  hostStatusTip: {
    fontSize: 11,
    lineHeight: 15,
    marginTop: 2,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 8,
    paddingBottom: 24,
  },
});

