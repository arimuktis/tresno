import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import {
  Gift,
  X,
  Coins,
  Ticket,
  Star,
  Calendar,
  Award,
  MessageCircle,
  UserPlus,
  PlayCircle,
  Video,
} from 'lucide-react-native';
import { useThemeStore } from '../../../theme/useThemeStore';
import { useTranslation } from '../../../i18n';
import { useMissionStore, MissionItem } from '../stores/useMissionStore';
import { useWalletStore } from '../../wallet/stores/useWalletStore';
import { Button } from '../../../shared/components/atoms/Button';

export const MissionsCenterModal: React.FC = () => {
  const { colors, isDark } = useThemeStore();
  const { t } = useTranslation();
  const { isMissionModalOpen, closeMissionModal, missions, claimReward } = useMissionStore();
  const { coinBalance, chatCoupons, pointsBalance } = useWalletStore();

  const [activeTab, setActiveTab] = useState<'daily' | 'novice'>('daily');

  if (!isMissionModalOpen) return null;

  const filteredMissions = missions.filter((m) => m.category === activeTab);

  const handleClaim = (missionId: string) => {
    claimReward(missionId);
  };

  const getMissionIcon = (iconName: string) => {
    switch (iconName) {
      case 'calendar':
        return <Calendar size={22} color={colors.primary} />;
      case 'message':
        return <MessageCircle size={22} color={colors.primary} />;
      case 'user-plus':
        return <UserPlus size={22} color={colors.primary} />;
      case 'play':
        return <PlayCircle size={22} color={colors.primary} />;
      case 'video':
        return <Video size={22} color={colors.primary} />;
      case 'star':
        return <Star size={22} color={colors.gold} />;
      default:
        return <Gift size={22} color={colors.primary} />;
    }
  };

  return (
    <Modal
      visible={isMissionModalOpen}
      transparent
      animationType="slide"
      onRequestClose={closeMissionModal}
    >
      <View style={styles.backdrop}>
        <View
          style={[
            styles.modalCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              shadowColor: colors.primary,
            },
          ]}
        >
          {/* Bottom Sheet Drag Indicator */}
          <View style={styles.sheetHandle} />

          {/* Header */}
          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Gift size={22} color={colors.primary} style={{ marginRight: 8 }} />
                <Text style={[styles.title, { color: colors.text }]}>
                  {t('missions.modalTitle')}
                </Text>
              </View>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                {t('missions.modalSubtitle')}
              </Text>
            </View>
            <TouchableOpacity
              testID="btn-close-missions"
              accessibilityLabel="btn-close-missions"
              onPress={closeMissionModal}
              style={[styles.closeBtn, { backgroundColor: colors.surfaceCard }]}
              activeOpacity={0.7}
            >
              <X size={16} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* User Asset Ribbon: Koin, Kupon Chat, Poin Host */}
          <View style={[styles.assetRibbon, { backgroundColor: colors.surfaceGlass, borderColor: colors.border }]}>
            <View style={styles.assetItem}>
              <Coins size={20} color={colors.gold} />
              <View>
                <Text style={[styles.assetValue, { color: colors.gold }]}>{coinBalance}</Text>
                <Text style={[styles.assetLabel, { color: colors.textSecondary }]}>{t('common.coins', { count: '' }).trim()}</Text>
              </View>
            </View>

            <View style={[styles.assetDivider, { backgroundColor: colors.border }]} />

            <View style={styles.assetItem}>
              <Ticket size={20} color={colors.primary} />
              <View>
                <Text style={[styles.assetValue, { color: colors.primary }]}>{chatCoupons}</Text>
                <Text style={[styles.assetLabel, { color: colors.textSecondary }]}>{t('chatBilling.couponBalanceLabel')}</Text>
              </View>
            </View>

            <View style={[styles.assetDivider, { backgroundColor: colors.border }]} />

            <View style={styles.assetItem}>
              <Star size={20} color={colors.secondary} />
              <View>
                <Text style={[styles.assetValue, { color: colors.secondary }]}>{pointsBalance}</Text>
                <Text style={[styles.assetLabel, { color: colors.textSecondary }]}>{t('mine.diamondsLabel')}</Text>
              </View>
            </View>
          </View>

          {/* Category Tabs: Misi Harian vs Misi Pemula */}
          <View style={[styles.tabBar, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)' }]}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setActiveTab('daily')}
              style={[
                styles.tabItem,
                activeTab === 'daily' && [styles.tabItemActive, { backgroundColor: colors.primary }],
              ]}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Calendar size={14} color={activeTab === 'daily' ? '#FFFFFF' : colors.textSecondary} style={{ marginRight: 6 }} />
                <Text
                  style={[
                    styles.tabItemText,
                    { color: activeTab === 'daily' ? '#FFFFFF' : colors.textSecondary },
                  ]}
                >
                  {t('missions.tabDaily')}
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setActiveTab('novice')}
              style={[
                styles.tabItem,
                activeTab === 'novice' && [styles.tabItemActive, { backgroundColor: colors.primary }],
              ]}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Award size={14} color={activeTab === 'novice' ? '#FFFFFF' : colors.textSecondary} style={{ marginRight: 6 }} />
                <Text
                  style={[
                    styles.tabItemText,
                    { color: activeTab === 'novice' ? '#FFFFFF' : colors.textSecondary },
                  ]}
                >
                  {t('missions.tabNovice')}
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Missions List */}
          <ScrollView
            style={styles.missionsScroll}
            contentContainerStyle={styles.missionsContent}
            showsVerticalScrollIndicator={false}
          >
            {filteredMissions.map((item) => {
              const isReadyToClaim = item.progress >= item.target && !item.isClaimed;
              const progressPct = Math.min(100, Math.round((item.progress / item.target) * 100));

              return (
                <View
                  key={item.id}
                  style={[
                    styles.missionCard,
                    {
                      backgroundColor: colors.surfaceCard,
                      borderColor: isReadyToClaim ? colors.primary : colors.border,
                    },
                    isReadyToClaim && {
                      shadowColor: colors.primary,
                      shadowOpacity: 0.25,
                      shadowRadius: 10,
                      elevation: 4,
                    },
                  ]}
                >
                  <View style={styles.cardHeader}>
                    <View style={[styles.iconBox, { backgroundColor: colors.primaryGlow }]}>
                      {getMissionIcon(item.icon)}
                    </View>

                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text style={[styles.missionTitle, { color: colors.text }]}>
                        {t(item.titleKey as any)}
                      </Text>
                      <Text style={[styles.missionDesc, { color: colors.textSecondary }]}>
                        {t(item.descKey as any)}
                      </Text>

                      {/* Reward Badge */}
                      <View style={[styles.rewardBadge, { backgroundColor: `${colors.gold}18`, borderColor: colors.gold }]}>
                        <Text style={[styles.rewardBadgeText, { color: colors.gold }]}>
                          {item.rewardLabel}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Progress Row & Action Button */}
                  <View style={styles.actionRow}>
                    <View style={{ flex: 1, marginRight: 12 }}>
                      <View style={styles.progressInfoRow}>
                        <Text style={[styles.progressStepText, { color: colors.textSecondary }]}>
                          {item.isClaimed
                            ? t('missions.claimedBtn')
                            : `${item.progress}/${item.target}`}
                        </Text>
                        <Text style={[styles.progressPctText, { color: isReadyToClaim ? colors.success : colors.textSecondary }]}>
                          {progressPct}%
                        </Text>
                      </View>

                      {/* Progress Bar Track */}
                      <View style={[styles.progressTrack, { backgroundColor: colors.surfaceGlass }]}>
                        <View
                          style={[
                            styles.progressFill,
                            {
                              width: `${progressPct}%`,
                              backgroundColor: item.isClaimed
                                ? colors.textSecondary
                                : isReadyToClaim
                                ? colors.success
                                : colors.primary,
                            },
                          ]}
                        />
                      </View>
                    </View>

                    {/* Claim Button */}
                    <TouchableOpacity
                      disabled={!isReadyToClaim}
                      onPress={() => handleClaim(item.id)}
                      style={[
                        styles.claimBtn,
                        item.isClaimed && { backgroundColor: `${colors.border}60` },
                        !item.isClaimed && !isReadyToClaim && { backgroundColor: `${colors.primary}20` },
                        isReadyToClaim && [styles.claimBtnActive, { backgroundColor: colors.primary }],
                      ]}
                      activeOpacity={0.8}
                    >
                      <Text
                        style={[
                          styles.claimBtnText,
                          {
                            color: item.isClaimed
                              ? colors.textSecondary
                              : isReadyToClaim
                              ? '#FFFFFF'
                              : colors.primary,
                          },
                        ]}
                      >
                        {item.isClaimed
                          ? t('missions.claimedBtn')
                          : isReadyToClaim
                          ? t('missions.claimBtn')
                          : t('missions.inProgress')}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </ScrollView>

          {/* Footer Action */}
          <View style={styles.footer}>
            <Button
              title={t('common.close')}
              variant="outline"
              size="md"
              onPress={closeMissionModal}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.78)',
    justifyContent: 'flex-end',
    alignItems: 'center',
    padding: 0,
  },
  modalCard: {
    width: '100%',
    maxWidth: 414,
    maxHeight: '90%',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderWidth: 1,
    borderBottomWidth: 0,
    padding: 18,
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 16,
  },

  sheetHandle: {
    width: 44,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    alignSelf: 'center',
    marginBottom: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  title: {
    fontSize: 19,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  assetRibbon: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 14,
  },
  assetItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  assetEmoji: {
    fontSize: 22,
  },
  assetValue: {
    fontSize: 15,
    fontWeight: '800',
  },
  assetLabel: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  assetDivider: {
    width: 1,
    height: 24,
  },
  tabBar: {
    flexDirection: 'row',
    borderRadius: 14,
    padding: 3,
    marginBottom: 14,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabItemActive: {
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  tabItemText: {
    fontSize: 12.5,
    fontWeight: '700',
  },
  missionsScroll: {
    maxHeight: 380,
  },
  missionsContent: {
    gap: 12,
    paddingBottom: 6,
  },
  missionCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  missionTitle: {
    fontSize: 14.5,
    fontWeight: '700',
  },
  missionDesc: {
    fontSize: 11.5,
    marginTop: 2,
  },
  rewardBadge: {
    alignSelf: 'flex-start',
    borderWidth: 0.8,
    borderRadius: 8,
    paddingHorizontal: 7,
    paddingVertical: 2,
    marginTop: 6,
  },
  rewardBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  progressInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  progressStepText: {
    fontSize: 11,
    fontWeight: '600',
  },
  progressPctText: {
    fontSize: 11,
    fontWeight: '700',
  },
  progressTrack: {
    height: 7,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  claimBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 105,
  },
  claimBtnActive: {
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 4,
  },
  claimBtnText: {
    fontSize: 12,
    fontWeight: '800',
  },
  footer: {
    marginTop: 14,
  },
});
