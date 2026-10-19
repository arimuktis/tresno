import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import {
  ChevronLeft,
  Crown,
  Coins,
  Video,
  Sparkles,
} from 'lucide-react-native';
import { useWalletStore } from '../stores/useWalletStore';
import { useThemeStore } from '../../../theme/useThemeStore';
import { useTranslation } from '../../../i18n';
import { LEVEL_TIERS } from '@tresno/shared';
import { LevelBadge } from '../../../shared/components/atoms/LevelBadge';

export const LevelModal: React.FC = () => {
  const { colors, isDark } = useThemeStore();
  const { t } = useTranslation();
  const {
    historicalTopup,
    isLevelModalOpen,
    closeLevelModal,
    getLevelInfo,
  } = useWalletStore();

  const levelInfo = getLevelInfo();
  const [selectedPreviewLevel, setSelectedPreviewLevel] = useState<number>(
    levelInfo.currentTier.level
  );

  if (!isLevelModalOpen) return null;

  const currentLevel = levelInfo.currentTier.level;
  const nextTier = levelInfo.nextTier;
  const progressPercent = levelInfo.progressPercent;
  const tokensNeeded = levelInfo.tokensNeeded;

  return (
    <Modal
      visible={isLevelModalOpen}
      animationType="slide"
      transparent={false}
      onRequestClose={closeLevelModal}
    >
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header ala Tigo */}
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={closeLevelModal}
            activeOpacity={0.7}
          >
            <ChevronLeft size={28} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            {t('level.title')}
          </Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Hero Card ala Tigo (Gradient Sky Blue) */}
          <View style={styles.heroCard}>
            {/* Crest Emblem */}
            <View style={styles.crestWrapper}>
              <View style={styles.crestShield}>
                <Crown size={32} color="#FFFFFF" />
                <View style={styles.crestPill}>
                  <Text style={styles.crestLevelText}>Lv{currentLevel}</Text>
                </View>
              </View>
            </View>

            {/* Current Koin vs Target */}
            <View style={styles.koinProgressRow}>
              <View style={styles.currentKoinPill}>
                <Text style={styles.koinTierLabel}>Lv{currentLevel}</Text>
                <Text style={styles.koinAmount}>{historicalTopup.toLocaleString('id-ID')}</Text>
                <Coins size={14} color="#FFD700" />
              </View>

              <Text style={styles.targetTierText}>
                {nextTier ? `Lv${nextTier.level}` : 'MAX'}
              </Text>
            </View>

            {/* Progress Bar */}
            <View style={styles.progressBarTrack}>
              <View
                style={[
                  styles.progressBarFill,
                  { width: `${progressPercent}%` },
                ]}
              />
            </View>

            {/* Top up needed label */}
            <Text style={styles.neededText}>
              {nextTier
                ? `Top up ${tokensNeeded.toLocaleString('id-ID')} tokens to level up`
                : 'Tingkat VIP Tertinggi Telah Dicapai'}
            </Text>
          </View>

          {/* Horizontal Level Selector ala Tigo */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.levelSelectorScroll}
            contentContainerStyle={styles.levelSelectorContent}
          >
            {LEVEL_TIERS.map((tier) => {
              const isSelected = selectedPreviewLevel === tier.level;
              return (
                <TouchableOpacity
                  key={tier.level}
                  style={styles.selectorItem}
                  onPress={() => setSelectedPreviewLevel(tier.level)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.selectorItemText,
                      {
                        color: isSelected
                          ? '#A855F7'
                          : colors.textSecondary,
                        fontWeight: isSelected ? '800' : '600',
                      },
                    ]}
                  >
                    Lv {tier.level}
                  </Text>
                  {isSelected && <View style={styles.selectorDot} />}
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Daily Bonus Benefit Card ala Tigo */}
          <View
            style={[
              styles.benefitCard,
              {
                backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : '#FFFFFF',
                borderColor: colors.border,
              },
            ]}
          >
            <View style={styles.benefitIconCircle}>
              <Video size={22} color="#FF2D55" />
            </View>
            <View style={styles.benefitTextCol}>
              <Text style={[styles.benefitTitle, { color: colors.text }]}>
                {t('level.dailyBonus')}
              </Text>
              <Text style={[styles.benefitSub, { color: colors.textSecondary }]}>
                {t('level.dailyBonusDesc')}
              </Text>
            </View>
          </View>

          {/* Level Rule Box & Tier Table ala Tigo */}
          <View
            style={[
              styles.ruleCard,
              {
                backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : '#F9F9FB',
                borderColor: colors.border,
              },
            ]}
          >
            <Text style={[styles.ruleTitle, { color: colors.text }]}>
              {t('level.levelRule')}
            </Text>
            <Text style={[styles.ruleSub, { color: colors.textSecondary }]}>
              {t('level.ruleDesc')}
            </Text>

            {/* Table Header */}
            <View style={[styles.tableHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.tableColTitle, { color: colors.textSecondary }]}>
                Level
              </Text>
              <Text style={[styles.tableColTitle, { color: colors.textSecondary }]}>
                Top up
              </Text>
            </View>

            {/* Table Rows */}
            {LEVEL_TIERS.map((tier) => (
              <View
                key={tier.level}
                style={[
                  styles.tableRow,
                  {
                    backgroundColor:
                      currentLevel === tier.level
                        ? (isDark ? 'rgba(168,85,247,0.12)' : '#F3E8FF')
                        : 'transparent',
                    borderBottomColor: isDark ? 'rgba(255,255,255,0.04)' : '#F0F0F2',
                  },
                ]}
              >
                <View style={styles.levelCell}>
                  <LevelBadge level={tier.level} size="sm" />
                </View>

                <Text style={[styles.topupCellText, { color: colors.text }]}>
                  {tier.requiredTopup.toLocaleString('id-ID')}
                </Text>
              </View>
            ))}
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
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  heroCard: {
    width: '100%',
    padding: 20,
    borderRadius: 20,
    backgroundColor: '#38BDF8', // Gradient sky blue fallback
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#38BDF8',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
  },
  crestWrapper: {
    alignItems: 'center',
    marginBottom: 16,
  },
  crestShield: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  crestPill: {
    position: 'absolute',
    bottom: -6,
    backgroundColor: '#D946EF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  crestLevelText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
  },
  koinProgressRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  currentKoinPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
    gap: 4,
  },
  koinTierLabel: {
    color: '#6366F1',
    fontSize: 11,
    fontWeight: '800',
  },
  koinAmount: {
    color: '#1E293B',
    fontSize: 12,
    fontWeight: '800',
  },
  targetTierText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  progressBarTrack: {
    width: '100%',
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#4F46E5',
    borderRadius: 4,
  },
  neededText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  levelSelectorScroll: {
    marginBottom: 16,
  },
  levelSelectorContent: {
    paddingHorizontal: 8,
    gap: 18,
    alignItems: 'center',
  },
  selectorItem: {
    alignItems: 'center',
    paddingVertical: 6,
  },
  selectorItemText: {
    fontSize: 15,
  },
  selectorDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#A855F7',
    marginTop: 4,
  },
  benefitCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 16,
    gap: 12,
  },
  benefitIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 45, 85, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  benefitTextCol: {
    flex: 1,
  },
  benefitTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  benefitSub: {
    fontSize: 12,
  },
  ruleCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
  ruleTitle: {
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 4,
  },
  ruleSub: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 16,
  },
  tableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginBottom: 4,
  },
  tableColTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  levelCell: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  topupCellText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
