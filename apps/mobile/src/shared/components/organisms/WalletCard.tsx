import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, ViewStyle } from 'react-native';
import { Star, Sparkles, Coins, Ticket } from 'lucide-react-native';
import { useThemeStore } from '../../../theme/useThemeStore';
import { useTranslation } from '../../../i18n';
import { getGlassCardStyle } from '../../../theme/glassStyles';

export const MIN_HOST_CASHOUT_POINTS = 2000;

interface WalletCardProps {
  isHost?: boolean;
  coinBalance?: number;
  diamondBalance?: number; // Representing Host Points
  onTopupPress?: () => void;
  onCashoutPress?: () => void;
  isBroadcastOnline?: boolean;
  onToggleBroadcast?: (value: boolean) => void;
  coinsLabel?: string;
  diamondsLabel?: string;
  chatCoupons?: number;
  topupBtnLabel?: string;
  cashoutBtnLabel?: string;
  broadcastStatusLabel?: string;
  broadcastOnlineLabel?: string;
  broadcastOfflineLabel?: string;
  revenueShareNotice?: string;
  style?: ViewStyle;
}

export const WalletCard: React.FC<WalletCardProps> = ({
  isHost = false,
  coinBalance = 50,
  diamondBalance = 1250,
  chatCoupons = 2,
  onTopupPress,
  onCashoutPress,
  isBroadcastOnline = true,
  onToggleBroadcast,
  coinsLabel,
  diamondsLabel,
  topupBtnLabel,
  cashoutBtnLabel,
  broadcastStatusLabel,
  broadcastOnlineLabel,
  broadcastOfflineLabel,
  revenueShareNotice,
  style,
}) => {
  const { colors, isDark } = useThemeStore();
  const { t } = useTranslation();
  const glassStyle = getGlassCardStyle(colors, isDark);

  const finalCoinsLabel = coinsLabel || t('mine.coinsLabel');
  const finalDiamondsLabel = diamondsLabel || t('mine.diamondsLabel');
  const finalTopupBtnLabel = topupBtnLabel || t('mine.topupBtn');
  const finalCashoutBtnLabel = cashoutBtnLabel || t('mine.cashoutBtn');
  const finalBroadcastStatusLabel = broadcastStatusLabel || t('mine.broadcastStatus');
  const finalBroadcastOnlineLabel = broadcastOnlineLabel || t('mine.broadcastOnline');
  const finalBroadcastOfflineLabel = broadcastOfflineLabel || t('mine.broadcastOffline');
  const finalRevenueShareNotice = revenueShareNotice || t('mine.hostRevenueShareNotice');

  const pointsRupiah = (diamondBalance * 100).toLocaleString('id-ID');
  const canCashout = diamondBalance >= MIN_HOST_CASHOUT_POINTS;
  const progressRatio = Math.min(1, diamondBalance / MIN_HOST_CASHOUT_POINTS);
  const progressPercent = Math.floor(progressRatio * 100);
  const pointsRemaining = Math.max(0, MIN_HOST_CASHOUT_POINTS - diamondBalance);

  if (isHost) {
    return (
      <View
        style={[
          styles.card,
          glassStyle,
          { borderColor: canCashout ? colors.gold : colors.border },
          style,
        ]}
      >
        <View style={styles.headerRow}>
          <View>
            <Text style={[styles.title, { color: colors.textSecondary }]}>
              {finalDiamondsLabel}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
              <Star size={24} color={colors.gold} fill={colors.gold} style={{ marginRight: 8 }} />
              <Text style={[styles.valueText, { color: colors.gold }]}>
                {diamondBalance}
              </Text>
              <Text style={[styles.subValueText, { color: colors.textSecondary }]}>
                ≈ Rp {pointsRupiah}
              </Text>
            </View>
          </View>

          {onCashoutPress && (
            <TouchableOpacity
              style={[
                styles.actionBtn,
                {
                  backgroundColor: canCashout ? colors.gold : isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                  borderColor: canCashout ? colors.gold : colors.border,
                  borderWidth: canCashout ? 0 : 1,
                },
              ]}
              activeOpacity={0.8}
              onPress={onCashoutPress}
            >
              <Text
                style={[
                  styles.cashoutBtnText,
                  { color: canCashout ? '#000000' : colors.textSecondary },
                ]}
              >
                {canCashout ? finalCashoutBtnLabel : t('mine.underMinCashout')}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* 2000 Points Cashout Goal Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressLabelRow}>
            <Text style={[styles.progressLabel, { color: colors.textSecondary }]}>
              {t('mine.cashoutGoal', { current: diamondBalance, target: MIN_HOST_CASHOUT_POINTS })}
            </Text>
            <Text
              style={[
                styles.progressPercent,
                { color: canCashout ? colors.success : colors.gold },
              ]}
            >
              {progressPercent}%
            </Text>
          </View>

          <View
            style={[
              styles.progressBarTrack,
              { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)' },
            ]}
          >
            <View
              style={[
                styles.progressBarFill,
                {
                  width: `${progressPercent}%`,
                  backgroundColor: canCashout ? colors.success : colors.gold,
                },
              ]}
            />
          </View>

          {!canCashout && (
            <Text style={[styles.remainingHint, { color: colors.textSecondary }]}>
              {t('mine.needMorePoints', { remaining: pointsRemaining })}
            </Text>
          )}
        </View>

        {/* 75% Host Revenue Share Banner */}
        <View style={[styles.banner, { backgroundColor: colors.surfaceGlass }]}>
          <Sparkles size={14} color={colors.gold} style={{ marginRight: 6 }} />
          <Text style={[styles.bannerText, { color: colors.textSecondary }]}>
            {finalRevenueShareNotice}
          </Text>
        </View>

        {/* Broadcast Online/Offline Switch */}
        {onToggleBroadcast && (
          <View style={[styles.toggleRow, { borderTopColor: colors.border }]}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.toggleTitle, { color: colors.text }]}>
                {broadcastStatusLabel}
              </Text>
              <Text
                style={[
                  styles.toggleSubtitle,
                  { color: isBroadcastOnline ? colors.success : colors.textSecondary },
                ]}
              >
                {isBroadcastOnline ? broadcastOnlineLabel : broadcastOfflineLabel}
              </Text>
            </View>
            <Switch
              value={isBroadcastOnline}
              onValueChange={onToggleBroadcast}
              trackColor={{ false: colors.border, true: colors.success + '88' }}
              thumbColor={isBroadcastOnline ? colors.success : '#888888'}
            />
          </View>
        )}
      </View>
    );
  }

  // Caller / Male User View
  const coinRupiah = (coinBalance * 100).toLocaleString('id-ID');
  return (
    <View style={[styles.card, glassStyle, style]}>
      <View style={styles.headerRow}>
        <View>
          <Text style={[styles.title, { color: colors.textSecondary }]}>{finalCoinsLabel}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
            <Coins size={24} color={colors.primary} style={{ marginRight: 8 }} />
            <Text style={[styles.valueText, { color: colors.primary }]}>{coinBalance}</Text>
            <Text style={[styles.subValueText, { color: colors.textSecondary }]}>
              ≈ Rp {coinRupiah}
            </Text>
          </View>
        </View>

        {onTopupPress && (
          <TouchableOpacity
            testID="btn-open-topup"
            accessibilityLabel="btn-open-topup"
            style={[styles.actionBtn, { backgroundColor: colors.primary }]}
            activeOpacity={0.8}
            onPress={onTopupPress}
          >
            <Text style={styles.btnText}>{finalTopupBtnLabel}</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Kupon Chat Pill Row ala Tigo */}
      <View style={[styles.couponRow, { backgroundColor: colors.surfaceGlass, borderTopColor: colors.border }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Ticket size={20} color={colors.primary} style={{ marginRight: 8 }} />
          <View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={[styles.couponLabel, { color: colors.text }]}>
                {t('chatBilling.couponBalanceLabel')}:
              </Text>
              <Text style={[styles.couponCount, { color: colors.primary }]}>
                {' '}{chatCoupons}
              </Text>
            </View>
            <Text style={[styles.couponHint, { color: colors.textSecondary }]}>
              {chatCoupons > 0
                ? t('chatBilling.bannerCouponAvailable', { coupons: chatCoupons })
                : t('chatBilling.bannerInitialCost')}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 18,
    marginVertical: 10,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  valueText: {
    fontSize: 28,
    fontWeight: '900',
    marginRight: 8,
  },
  subValueText: {
    fontSize: 12,
    fontWeight: '600',
  },
  actionBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },
  cashoutBtnText: {
    fontWeight: '800',
    fontSize: 12.5,
  },
  progressContainer: {
    marginTop: 14,
    marginBottom: 4,
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  progressLabel: {
    fontSize: 11.5,
    fontWeight: '700',
  },
  progressPercent: {
    fontSize: 11.5,
    fontWeight: '900',
  },
  progressBarTrack: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  remainingHint: {
    fontSize: 10.5,
    marginTop: 5,
    lineHeight: 14,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginTop: 12,
  },
  bannerText: {
    fontSize: 11,
    fontWeight: '600',
    flex: 1,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    marginTop: 14,
    paddingTop: 12,
  },
  toggleTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  toggleSubtitle: {
    fontSize: 11,
    marginTop: 2,
    fontWeight: '500',
  },
  couponRow: {
    marginTop: 14,
    paddingTop: 10,
    borderTopWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 4,
  },
  couponLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
  couponCount: {
    fontSize: 13,
    fontWeight: '800',
  },
  couponHint: {
    fontSize: 10,
    marginTop: 2,
  },
});
