import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Image,
  Animated,
  Platform,
} from 'react-native';
import { Phone, PhoneOff, Video, Sparkles } from 'lucide-react-native';
import { THEME } from '../../../theme/tokens';
import { useThemeStore } from '../../../theme/useThemeStore';
import { useNotificationStore } from '../stores/useNotificationStore';
import { useCallStore } from '../../video-chat/stores/useCallStore';
import { useTranslation } from '../../../i18n';

export const IncomingCallModal: React.FC = () => {
  const { colors, isDark } = useThemeStore();
  const { t } = useTranslation();
  const { incomingCall, acceptIncomingCall, declineIncomingCall } = useNotificationStore();
  const { matchFound } = useCallStore();

  const pulse1 = useRef(new Animated.Value(0)).current;
  const pulse2 = useRef(new Animated.Value(0)).current;
  const acceptScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!incomingCall) return;

    // Pulsing halo animation
    const loop1 = Animated.loop(
      Animated.timing(pulse1, {
        toValue: 1,
        duration: 1800,
        useNativeDriver: Platform.OS !== 'web',
      })
    );
    const loop2 = Animated.loop(
      Animated.timing(pulse2, {
        toValue: 1,
        duration: 1800,
        delay: 600,
        useNativeDriver: Platform.OS !== 'web',
      })
    );

    // Accept button subtle bounce
    const bounceLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(acceptScale, {
          toValue: 1.1,
          duration: 400,
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(acceptScale, {
          toValue: 1,
          duration: 400,
          useNativeDriver: Platform.OS !== 'web',
        }),
      ])
    );

    loop1.start();
    loop2.start();
    bounceLoop.start();

    return () => {
      loop1.stop();
      loop2.stop();
      bounceLoop.stop();
      pulse1.setValue(0);
      pulse2.setValue(0);
      acceptScale.setValue(1);
    };
  }, [incomingCall]);

  if (!incomingCall) return null;

  const handleAccept = () => {
    const callData = acceptIncomingCall();
    if (callData) {
      matchFound({
        channelId: callData.channelId,
        peer: {
          id: callData.caller.id,
          nickname: callData.caller.nickname,
          avatarUrl: callData.caller.avatarUrl,
          gender: callData.caller.gender,
          level: callData.caller.level,
        },
        freeChatSeconds: callData.freeChatSeconds || 0,
        agoraUid: callData.agoraUid || 1002,
        billingIntervalSeconds: callData.billingIntervalSeconds || 60,
        costPerInterval: callData.costPerInterval || 60,
        isHostCaller: false,
        agoraToken: callData.agoraToken,
      });
    }
  };

  const handleDecline = () => {
    declineIncomingCall('user_declined');
  };

  const renderPulseRing = (anim: Animated.Value) => {
    const scale = anim.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 2.3],
    });
    const opacity = anim.interpolate({
      inputRange: [0, 0.4, 1],
      outputRange: [0.8, 0.4, 0],
    });

    return (
      <Animated.View
        style={[
          styles.pulseRing,
          {
            borderColor: colors.primary,
            transform: [{ scale }],
            opacity,
          },
        ]}
      />
    );
  };

  return (
    <Modal
      visible={!!incomingCall}
      transparent
      animationType="fade"
      onRequestClose={handleDecline}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.card, { backgroundColor: isDark ? '#14121F' : '#FFFFFF' }]}>
          {/* Top Live Badge */}
          <View style={styles.badgeRow}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>PANGGILAN VIDEO MASUK</Text>
          </View>

          {/* Avatar with Animated Pulse Rings */}
          <View style={styles.avatarSection}>
            {renderPulseRing(pulse1)}
            {renderPulseRing(pulse2)}

            <View style={[styles.avatarCircle, { borderColor: colors.primary }]}>
              {incomingCall.caller.avatarUrl ? (
                <Image
                  source={{ uri: incomingCall.caller.avatarUrl }}
                  style={styles.avatarImg}
                />
              ) : (
                <View style={[styles.avatarPlaceholder, { backgroundColor: colors.primary }]}>
                  <Text style={styles.avatarInitial}>
                    {incomingCall.caller.nickname.charAt(0)}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Caller Details */}
          <Text style={[styles.callerName, { color: colors.text }]}>
            {incomingCall.caller.nickname}
          </Text>
          <Text style={[styles.callerSub, { color: colors.textSecondary }]}>
            Mengajakmu untuk obrolan video privat
          </Text>

          {/* Action Buttons: Tolak & Terima */}
          <View style={styles.actionsRow}>
            {/* Tolak */}
            <View style={styles.actionCol}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleDecline}
                style={[styles.actionBtn, styles.declineBtn]}
              >
                <PhoneOff size={28} color="#FFFFFF" />
              </TouchableOpacity>
              <Text style={[styles.actionLabel, { color: colors.textSecondary }]}>Tolak</Text>
            </View>

            {/* Terima */}
            <View style={styles.actionCol}>
              <Animated.View style={{ transform: [{ scale: acceptScale }] }}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={handleAccept}
                  style={[styles.actionBtn, styles.acceptBtn]}
                >
                  <Phone size={30} color="#FFFFFF" />
                </TouchableOpacity>
              </Animated.View>
              <Text style={[styles.actionLabel, { color: '#00D26A', fontWeight: '800' }]}>
                Terima
              </Text>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.78)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    borderRadius: THEME.borderRadius.xl,
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 28,
    elevation: 25,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 210, 106, 0.12)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 16,
    marginBottom: 28,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#00D26A',
    marginRight: 6,
  },
  liveText: {
    color: '#00D26A',
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  avatarSection: {
    width: 140,
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    position: 'relative',
  },
  pulseRing: {
    position: 'absolute',
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 2.5,
  },
  avatarCircle: {
    width: 104,
    height: 104,
    borderRadius: 52,
    borderWidth: 3,
    overflow: 'hidden',
    backgroundColor: '#1E1B2E',
  },
  avatarImg: {
    width: '100%',
    height: '100%',
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    color: '#FFFFFF',
    fontSize: 36,
    fontWeight: '800',
  },
  callerName: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 6,
    textAlign: 'center',
  },
  callerSub: {
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 36,
    paddingHorizontal: 12,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: 20,
  },
  actionCol: {
    alignItems: 'center',
  },
  actionBtn: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
    marginBottom: 8,
  },
  declineBtn: {
    backgroundColor: '#FF3366',
  },
  acceptBtn: {
    backgroundColor: '#00D26A',
  },
  actionLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
});
