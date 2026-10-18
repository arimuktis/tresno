import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useThemeStore } from '../../../theme/useThemeStore';
import { useTranslation } from '../../../i18n';
import { useCallStore } from '../../video-chat/stores/useCallStore';
import { useWalletStore } from '../../wallet/stores/useWalletStore';
import { useChatStore } from '../../messages/stores/useChatStore';
import { useAuthStore } from '../../auth/stores/useAuthStore';
import { FilterChipBar, FilterItem } from '../../../shared/components/molecules/FilterChipBar';
import { AnchorCard, AnchorData } from '../../../shared/components/organisms/AnchorCard';
import { StoryBar } from '../../stories/components/StoryBar';
import { toast } from '../../../shared/stores/useToastStore';
import { getSmartRankedAnchors } from '../services/destinyAlgorithm';
import { Crown, RotateCw, Zap, Sparkles, Radio } from 'lucide-react-native';
import { supabaseRealtimeService } from '../../../shared/services/supabaseRealtimeService';
import { posthog } from '../../../shared/services/posthogService';
import { usePresenceStore } from '../../../shared/stores/usePresenceStore';

export const DestinyTab: React.FC = () => {
  const { colors, isDark } = useThemeStore();
  const { t } = useTranslation();
  const { matchFound } = useCallStore();
  const { coinBalance, openTopupModal } = useWalletStore();
  const { openChat } = useChatStore();
  const { user: authUser } = useAuthStore();

  const [activeFilter, setActiveFilter] = useState<'all' | 'online' | 'nearby' | 'popular'>('all');
  const [refreshSeed, setRefreshSeed] = useState(0);

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

  const handleShuffle = () => {
    setRefreshSeed((prev) => prev + 1);
    toast.show('Algoritma memperbarui rotasi eksposur host.', 'info');
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
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} showsVerticalScrollIndicator={false}>
      {/* Header with Title and Fair Exposure Shuffle Action */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text style={[styles.title, { color: colors.text }]}>{t('destiny.title')}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <View style={[styles.livePresenceBadge, { backgroundColor: 'rgba(0, 210, 106, 0.15)', borderColor: '#00D26A' }]}>
                <View style={styles.livePulseDot} />
                <Text style={{ color: '#00D26A', fontSize: 10, fontWeight: '800' }}>
                  {availableCount} Tersedia
                </Text>
              </View>
              {busyCount > 0 && (
                <View style={[styles.livePresenceBadge, { backgroundColor: 'rgba(255, 46, 99, 0.15)', borderColor: '#FF2E63' }]}>
                  <View style={[styles.livePulseDot, { backgroundColor: '#FF2E63' }]} />
                  <Text style={{ color: '#FF2E63', fontSize: 10, fontWeight: '800' }}>
                    {busyCount} Sedang Call
                  </Text>
                </View>
              )}
            </View>
          </View>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {t('destiny.subtitle')}
          </Text>
        </View>

        <TouchableOpacity
          onPress={handleShuffle}
          style={[styles.shuffleBtn, { backgroundColor: colors.surfaceCard, borderColor: colors.border }]}
          activeOpacity={0.7}
        >
          <RotateCw size={13} color={colors.primary} style={{ marginRight: 4 }} />
          <Text style={[styles.shuffleText, { color: colors.primary }]}>Acak Rotasi</Text>
        </TouchableOpacity>
      </View>

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
            onCall={handleCallAnchor}
            onChat={handleChatAnchor}
            callLabel={t('destiny.directCall')}
          />
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  shuffleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  shuffleText: {
    fontSize: 11,
    fontWeight: '700',
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
    gap: 12,
    paddingBottom: 24,
  },
  livePresenceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
    gap: 4,
  },
  livePulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#00D26A',
  },
});

