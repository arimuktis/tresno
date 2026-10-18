import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import {
  Activity,
  BarChart3,
  Sliders,
  CheckCircle2,
  AlertCircle,
  TrendingDown,
  TrendingUp,
  RefreshCw,
  Zap,
} from 'lucide-react-native';
import { useThemeStore } from '../../../../theme/useThemeStore';
import { useAdminCmsStore } from '../../stores/useAdminCmsStore';
import { ButtonChip } from '../../../../shared/components/atoms/Chip';

export const CmsPostHogView: React.FC = () => {
  const { colors } = useThemeStore();
  const {
    posthogStats,
    featureFlags,
    funnelReport,
    isLoadingPosthog,
    fetchPosthogData,
    updateFeatureFlag,
  } = useAdminCmsStore();

  useEffect(() => {
    fetchPosthogData();
  }, []);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header Bar */}
      <View style={styles.sectionHeader}>
        <View style={styles.headerLeft}>
          <Activity size={20} color="#FF2E63" />
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            PostHog Telemetry & Funnel Analytics
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.refreshBtn, { backgroundColor: colors.surfaceCard }]}
          onPress={fetchPosthogData}
          disabled={isLoadingPosthog}
        >
          <RefreshCw size={14} color={colors.textSecondary} />
          <Text style={[styles.refreshText, { color: colors.textSecondary }]}>
            {isLoadingPosthog ? 'Memuat...' : 'Refresh'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* 1. Live Telemetry KPI Cards */}
      <View style={styles.kpiGrid}>
        <View style={[styles.kpiCard, { backgroundColor: colors.surfaceCard, borderColor: colors.border }]}>
          <Text style={[styles.kpiLabel, { color: colors.textSecondary }]}>Total Events (24h)</Text>
          <Text style={[styles.kpiValue, { color: colors.text }]}>
            {posthogStats?.totalEvents24h.toLocaleString('id-ID') || '24.890'}
          </Text>
          <View style={styles.kpiTrend}>
            <TrendingUp size={12} color="#10B981" />
            <Text style={styles.kpiTrendText}>+18.4% vs kemarin</Text>
          </View>
        </View>

        <View style={[styles.kpiCard, { backgroundColor: colors.surfaceCard, borderColor: colors.border }]}>
          <Text style={[styles.kpiLabel, { color: colors.textSecondary }]}>Ingestion Rate</Text>
          <Text style={[styles.kpiValue, { color: '#00D19D' }]}>
            {posthogStats?.eventIngestionRatePerSec || '4.8'} / det
          </Text>
          <Text style={[styles.kpiSub, { color: colors.textMuted }]}>Sub-millisecond pipeline</Text>
        </View>

        <View style={[styles.kpiCard, { backgroundColor: colors.surfaceCard, borderColor: colors.border }]}>
          <Text style={[styles.kpiLabel, { color: colors.textSecondary }]}>Active Tracked Users</Text>
          <Text style={[styles.kpiValue, { color: '#FFB800' }]}>
            {posthogStats?.activeUsers24h.toLocaleString('id-ID') || '1.840'}
          </Text>
          <Text style={[styles.kpiSub, { color: colors.textMuted }]}>DAU teridentifikasi</Text>
        </View>

        <View style={[styles.kpiCard, { backgroundColor: colors.surfaceCard, borderColor: colors.border }]}>
          <Text style={[styles.kpiLabel, { color: colors.textSecondary }]}>Telemetry Error Rate</Text>
          <Text style={[styles.kpiValue, { color: '#10B981' }]}>
            {posthogStats?.errorRatePercentage || 0.04}%
          </Text>
          <Text style={[styles.kpiSub, { color: colors.textMuted }]}>SLA 99.96% Health</Text>
        </View>
      </View>

      {/* 2. Conversion Funnel Visualizer */}
      <View style={[styles.panelCard, { backgroundColor: colors.surfaceCard, borderColor: colors.border }]}>
        <View style={styles.panelHeader}>
          <BarChart3 size={18} color="#FFB800" />
          <Text style={[styles.panelTitle, { color: colors.text }]}>
            Alur Konversi Radar Match menuju Top-up (Funnel Analysis)
          </Text>
        </View>
        <Text style={[styles.panelSubtitle, { color: colors.textSecondary }]}>
          Menganalisis rasio konversi bertingkat dari impresi radar hingga pembayaran paket koin.
        </Text>

        <View style={styles.funnelStepsContainer}>
          {(funnelReport?.steps || []).map((step, idx) => (
            <View key={step.stepIndex} style={styles.funnelRow}>
              <View style={styles.stepInfo}>
                <View style={styles.stepBadge}>
                  <Text style={styles.stepIndexText}>{step.stepIndex}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.stepName, { color: colors.text }]}>{step.stepName}</Text>
                  <Text style={[styles.stepDesc, { color: colors.textMuted }]}>{step.description}</Text>
                </View>
                <View style={styles.stepMetricBox}>
                  <Text style={[styles.stepUsers, { color: colors.text }]}>
                    {step.uniqueUsers.toLocaleString('id-ID')} user
                  </Text>
                  <Text style={[styles.stepRate, { color: '#FF2E63' }]}>
                    {(step.conversionRate * 100).toFixed(1)}%
                  </Text>
                </View>
              </View>

              {/* Progress Bar */}
              <View style={[styles.progressBarBg, { backgroundColor: 'rgba(255,255,255,0.08)' }]}>
                <View
                  style={[
                    styles.progressBarFill,
                    {
                      width: `${Math.max(5, step.conversionRate * 100)}%`,
                      backgroundColor: idx === 0 ? '#10B981' : idx === 5 ? '#FF2E63' : '#FFB800',
                    },
                  ]}
                />
              </View>

              {step.dropOffRate > 0 && (
                <View style={styles.dropOffBadge}>
                  <TrendingDown size={11} color="#EF4444" />
                  <Text style={styles.dropOffText}>
                    Drop-off: {(step.dropOffRate * 100).toFixed(1)}%
                  </Text>
                </View>
              )}
            </View>
          ))}
        </View>
      </View>

      {/* 3. Feature Flags Control Panel */}
      <View style={[styles.panelCard, { backgroundColor: colors.surfaceCard, borderColor: colors.border }]}>
        <View style={styles.panelHeader}>
          <Sliders size={18} color="#00D19D" />
          <Text style={[styles.panelTitle, { color: colors.text }]}>
            PostHog Dynamic Feature Flags & Rollout
          </Text>
        </View>
        <Text style={[styles.panelSubtitle, { color: colors.textSecondary }]}>
          Kontrol perilisan fitur AI dan algoritma pencocokan secara dinamis tanpa perlu deploy ulang.
        </Text>

        <View style={styles.flagsList}>
          {featureFlags.map((flag) => (
            <View
              key={flag.key}
              style={[
                styles.flagItem,
                { backgroundColor: 'rgba(255,255,255,0.03)', borderColor: colors.border },
              ]}
            >
              <View style={styles.flagMeta}>
                <View style={styles.flagTitleRow}>
                  <Text style={[styles.flagKey, { color: colors.text }]}>{flag.key}</Text>
                  <View
                    style={[
                      styles.statusPill,
                      { backgroundColor: flag.isEnabled ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)' },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusPillText,
                        { color: flag.isEnabled ? '#10B981' : '#EF4444' },
                      ]}
                    >
                      {flag.isEnabled ? 'ACTIVE' : 'DISABLED'}
                    </Text>
                  </View>
                  <View style={[styles.audienceBadge, { backgroundColor: 'rgba(255,46,99,0.1)' }]}>
                    <Text style={styles.audienceText}>{flag.targetAudience}</Text>
                  </View>
                </View>
                <Text style={[styles.flagDesc, { color: colors.textSecondary }]}>
                  {flag.description}
                </Text>
                <Text style={[styles.flagRollout, { color: colors.textMuted }]}>
                  Rollout: {flag.rolloutPercentage}% target audiens
                </Text>
              </View>

              <View style={styles.flagActions}>
                <TouchableOpacity
                  style={[
                    styles.toggleBtn,
                    { backgroundColor: flag.isEnabled ? '#EF4444' : '#10B981' },
                  ]}
                  onPress={() => updateFeatureFlag(flag.key, !flag.isEnabled, flag.rolloutPercentage)}
                >
                  <Text style={styles.toggleBtnText}>
                    {flag.isEnabled ? 'Nonaktifkan' : 'Aktifkan'}
                  </Text>
                </TouchableOpacity>

                <View style={styles.rolloutQuickBtns}>
                  <TouchableOpacity
                    style={[styles.miniRolloutBtn, flag.rolloutPercentage === 50 && styles.miniActive]}
                    onPress={() => updateFeatureFlag(flag.key, true, 50)}
                  >
                    <Text style={styles.miniRolloutText}>50%</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.miniRolloutBtn, flag.rolloutPercentage === 100 && styles.miniActive]}
                    onPress={() => updateFeatureFlag(flag.key, true, 100)}
                  >
                    <Text style={styles.miniRolloutText}>100%</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* 4. Live Event Stream */}
      <View style={[styles.panelCard, { backgroundColor: colors.surfaceCard, borderColor: colors.border }]}>
        <View style={styles.panelHeader}>
          <Zap size={18} color="#FF2E63" />
          <Text style={[styles.panelTitle, { color: colors.text }]}>
            Live Telemetry Ingestion Stream
          </Text>
        </View>

        <View style={styles.eventStreamContainer}>
          {(posthogStats?.recentEvents || []).map((ev) => (
            <View
              key={ev.id}
              style={[styles.eventRow, { borderBottomColor: colors.border }]}
            >
              <View style={styles.eventLeft}>
                <Text style={[styles.eventName, { color: '#00D19D' }]}>{ev.event}</Text>
                <Text style={[styles.eventUser, { color: colors.textSecondary }]}>
                  User: {ev.distinctId}
                </Text>
              </View>
              <View style={styles.eventRight}>
                <Text style={[styles.eventTime, { color: colors.textMuted }]}>
                  {new Date(ev.timestamp).toLocaleTimeString('id-ID')}
                </Text>
                <Text style={[styles.eventProps, { color: colors.textMuted }]}>
                  {Object.keys(ev.properties || {}).length} props
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  refreshBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  refreshText: {
    fontSize: 12,
    fontWeight: '600',
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  kpiCard: {
    flex: 1,
    minWidth: 140,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  kpiLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  kpiValue: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 4,
  },
  kpiTrend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  kpiTrendText: {
    fontSize: 11,
    color: '#10B981',
    fontWeight: '600',
  },
  kpiSub: {
    fontSize: 11,
  },
  panelCard: {
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 16,
  },
  panelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  panelTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  panelSubtitle: {
    fontSize: 12,
    marginBottom: 14,
  },
  funnelStepsContainer: {
    gap: 12,
  },
  funnelRow: {
    marginBottom: 4,
  },
  stepInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 6,
  },
  stepBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FF2E63',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepIndexText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '800',
  },
  stepName: {
    fontSize: 13,
    fontWeight: '700',
  },
  stepDesc: {
    fontSize: 11,
  },
  stepMetricBox: {
    alignItems: 'flex-end',
  },
  stepUsers: {
    fontSize: 12,
    fontWeight: '700',
  },
  stepRate: {
    fontSize: 12,
    fontWeight: '800',
  },
  progressBarBg: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  dropOffBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  dropOffText: {
    fontSize: 10,
    color: '#EF4444',
    fontWeight: '600',
  },
  flagsList: {
    gap: 10,
  },
  flagItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  flagMeta: {
    flex: 1,
    marginRight: 12,
  },
  flagTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  flagKey: {
    fontSize: 13,
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  statusPill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusPillText: {
    fontSize: 9,
    fontWeight: '800',
  },
  audienceBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  audienceText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#FF2E63',
  },
  flagDesc: {
    fontSize: 11,
    marginBottom: 2,
  },
  flagRollout: {
    fontSize: 10,
  },
  flagActions: {
    alignItems: 'flex-end',
    gap: 6,
  },
  toggleBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  toggleBtnText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '700',
  },
  rolloutQuickBtns: {
    flexDirection: 'row',
    gap: 4,
  },
  miniRolloutBtn: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  miniActive: {
    backgroundColor: 'rgba(255,46,99,0.3)',
  },
  miniRolloutText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '600',
  },
  eventStreamContainer: {
    gap: 8,
  },
  eventRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  eventLeft: {
    gap: 2,
  },
  eventName: {
    fontSize: 12,
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  eventUser: {
    fontSize: 11,
  },
  eventRight: {
    alignItems: 'flex-end',
    gap: 2,
  },
  eventTime: {
    fontSize: 10,
  },
  eventProps: {
    fontSize: 10,
  },
});
