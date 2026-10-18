import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Mic, MicOff, PhoneOff, Gift, ShieldAlert, User } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { THEME } from '../../../theme/tokens';
import { CoinBadge } from '../../../shared/components/atoms/CoinBadge';
import { useWalletStore } from '../../wallet/stores/useWalletStore';
import { useCallStore } from '../stores/useCallStore';
import { socketService } from '../../../shared/services/socketService';
import { useThemeStore } from '../../../theme/useThemeStore';
import { useTranslation } from '../../../i18n';

import { useCallDrm } from '../security/useCallDrm';
import { ForensicWatermark } from './ForensicWatermark';
import { CallDrmShield } from './CallDrmShield';
import { toast } from '../../../shared/stores/useToastStore';

export const VideoCallOverlay: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { coinBalance, openTopupModal } = useWalletStore();
  const { colors } = useThemeStore();
  const { t } = useTranslation();
  const {
    activeMatch,
    trialSecondsRemaining,
    callDurationSeconds,
    isMuted,
    toggleMute,
    endCall,
  } = useCallStore();

  const { isShieldActive, violationCount, lastViolationReason, dismissShield } = useCallDrm();

  const isFreeTrial = trialSecondsRemaining > 0;

  const handleHangup = () => {
    if (activeMatch?.channelId) {
      socketService.send('END_CALL', { channelId: activeMatch.channelId });
    }
    endCall('user_hungup');
    toast.show('Panggilan telah diakhiri.', 'info');
  };

  const formatDuration = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <>
      {/* Dynamic Forensic Watermark (Invisible/Visible Anti-Leak Protection) */}
      <ForensicWatermark />

      <View style={styles.overlayContainer} pointerEvents="box-none">
        {/* Top Bar: Peer Profile, DRM Badge, & Coin Counter */}
        <View style={[styles.topBar, { paddingTop: Math.max(insets.top, 16) }]}>
          <View style={[styles.peerInfo, { backgroundColor: colors.surfaceGlass }]}>
            <View style={[styles.avatarCircle, { backgroundColor: colors.primary }]}>
              {activeMatch?.peer.nickname ? (
                <Text style={styles.avatarText}>
                  {activeMatch.peer.nickname.charAt(0)}
                </Text>
              ) : (
                <User size={16} color="#FFFFFF" />
              )}
            </View>
            <View>
              <Text style={[styles.peerName, { color: colors.text }]}>
                {activeMatch?.peer.nickname || t('call.defaultPeerName')}
              </Text>
              <View style={styles.timerRow}>
                <Text style={[styles.callTimer, { color: colors.secondary }]}>
                  {formatDuration(callDurationSeconds)}
                </Text>
                <View style={styles.drmBadge}>
                  <ShieldAlert size={10} color="#00E676" style={{ marginRight: 3 }} />
                  <Text style={styles.drmBadgeText}>{t('call.drmActive')}</Text>
                </View>
              </View>
            </View>
          </View>

          <CoinBadge coins={coinBalance} onPress={openTopupModal} />
        </View>

        {/* Trial Countdown Indicator */}
        {isFreeTrial && (
          <View style={[styles.trialBanner, { backgroundColor: colors.primary }]}>
            <Text style={styles.trialText}>
              {t('call.freeTrialRemaining', { seconds: trialSecondsRemaining })}
            </Text>
          </View>
        )}

      {/* Bottom Action Controls */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 20) }]}>
        <TouchableOpacity
          testID="btn-mute"
          accessibilityLabel="btn-mute"
          style={[
            styles.circleButton,
            { backgroundColor: colors.surfaceGlass, borderColor: colors.border },
            isMuted && { backgroundColor: colors.danger },
          ]}
          onPress={toggleMute}
        >
          {isMuted ? (
            <MicOff size={24} color="#FFFFFF" />
          ) : (
            <Mic size={24} color="#FFFFFF" />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          testID="btn-hangup"
          accessibilityLabel="btn-hangup"
          style={[styles.circleButton, styles.endCallButton, { backgroundColor: colors.danger }]}
          onPress={handleHangup}
        >
          <PhoneOff size={28} color="#FFFFFF" />
        </TouchableOpacity>

        <TouchableOpacity
          testID="btn-gift"
          accessibilityLabel="btn-gift"
          style={[
            styles.circleButton,
            { backgroundColor: `${colors.gold}25`, borderColor: colors.gold },
          ]}
          onPress={openTopupModal}
        >
          <Gift size={24} color={colors.gold} />
        </TouchableOpacity>
      </View>
    </View>

    {/* Strict DRM Privacy Blackout Shield */}
    <CallDrmShield
      isActive={isShieldActive}
      reason={lastViolationReason}
      violationCount={violationCount}
      onDismiss={dismissShield}
    />
  </>
  );
};

const styles = StyleSheet.create({
  overlayContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
    padding: THEME.spacing.md,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  peerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: THEME.borderRadius.full,
  },
  avatarCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  avatarText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  peerName: {
    fontWeight: '700',
    fontSize: 14,
  },
  timerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  callTimer: {
    fontSize: 12,
    fontWeight: '600',
    marginRight: 8,
  },
  drmBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 230, 118, 0.18)',
    borderColor: 'rgba(0, 230, 118, 0.4)',
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 8,
  },
  drmBadgeText: {
    color: '#00E676',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  trialBanner: {
    alignSelf: 'center',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: THEME.borderRadius.full,
  },
  trialText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
  },
  circleButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  endCallButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  buttonIcon: {
    fontSize: 24,
  },
});
