import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  Image,
  Dimensions,
  Platform,
} from 'react-native';
import { THEME } from '../../../theme/tokens';
import { Button } from '../../../shared/components/atoms/Button';
import { useThemeStore } from '../../../theme/useThemeStore';
import { useTranslation } from '../../../i18n';
import { useAuthStore } from '../../auth/stores/useAuthStore';
import { Heart, Sparkles, Crown, MapPin } from 'lucide-react-native';

interface MatchRadarProps {
  onCancel: () => void;
}

export const MatchRadar: React.FC<MatchRadarProps> = ({ onCancel }) => {
  const { colors, isDark } = useThemeStore();
  const { t } = useTranslation();
  const { user } = useAuthStore();

  // Pulse Wave Animations (3 staggered expanding rings)
  const pulse1 = useRef(new Animated.Value(0)).current;
  const pulse2 = useRef(new Animated.Value(0)).current;
  const pulse3 = useRef(new Animated.Value(0)).current;

  // Center Heartbeat pulse
  const centerScale = useRef(new Animated.Value(1)).current;

  // Radar Scan Sweep Rotation
  const scanAnim = useRef(new Animated.Value(0)).current;

  // Blip dots opacity
  const blip1 = useRef(new Animated.Value(0)).current;
  const blip2 = useRef(new Animated.Value(0)).current;
  const blip3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 1. Staggered pulse wave animation
    const createPulseLoop = (anim: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, {
            toValue: 1,
            duration: 2400,
            easing: Easing.out(Easing.ease),
            useNativeDriver: Platform.OS !== 'web',
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 0,
            useNativeDriver: Platform.OS !== 'web',
          }),
        ])
      );
    };

    const pulseLoop1 = createPulseLoop(pulse1, 0);
    const pulseLoop2 = createPulseLoop(pulse2, 800);
    const pulseLoop3 = createPulseLoop(pulse3, 1600);

    pulseLoop1.start();
    pulseLoop2.start();
    pulseLoop3.start();

    // 2. Center Heartbeat animation
    const heartLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(centerScale, {
          toValue: 1.12,
          duration: 600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(centerScale, {
          toValue: 0.95,
          duration: 600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: Platform.OS !== 'web',
        }),
      ])
    );
    heartLoop.start();

    // 3. Rotating Radar Sweep Beam
    const sweepLoop = Animated.loop(
      Animated.timing(scanAnim, {
        toValue: 1,
        duration: 3200,
        easing: Easing.linear,
        useNativeDriver: Platform.OS !== 'web',
      })
    );
    sweepLoop.start();

    // 4. Blip twinkling
    const createBlip = (anim: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, { toValue: 1, duration: 400, useNativeDriver: Platform.OS !== 'web' }),
          Animated.delay(900),
          Animated.timing(anim, { toValue: 0, duration: 400, useNativeDriver: Platform.OS !== 'web' }),
        ])
      );
    };
    const bLoop1 = createBlip(blip1, 200);
    const bLoop2 = createBlip(blip2, 1100);
    const bLoop3 = createBlip(blip3, 1900);

    bLoop1.start();
    bLoop2.start();
    bLoop3.start();

    return () => {
      pulseLoop1.stop();
      pulseLoop2.stop();
      pulseLoop3.stop();
      heartLoop.stop();
      sweepLoop.stop();
      bLoop1.stop();
      bLoop2.stop();
      bLoop3.stop();
    };
  }, [pulse1, pulse2, pulse3, centerScale, scanAnim, blip1, blip2, blip3]);

  // Interpolasi untuk pulse wave
  const renderPulseRing = (anim: Animated.Value) => {
    const scale = anim.interpolate({
      inputRange: [0, 1],
      outputRange: [0.85, 2.6],
    });

    const opacity = anim.interpolate({
      inputRange: [0, 0.2, 0.8, 1],
      outputRange: [0.75, 0.65, 0.15, 0],
    });

    return (
      <Animated.View
        style={[
          styles.pulseRing,
          {
            borderColor: colors.primary,
            backgroundColor: isDark ? 'rgba(255, 0, 94, 0.08)' : 'rgba(255, 0, 94, 0.05)',
            transform: [{ scale }],
            opacity,
          },
        ]}
      />
    );
  };

  const sweepRotation = scanAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Background Liquid Glow Aura */}
      <View
        style={[
          styles.glowAura,
          {
            backgroundColor: colors.liquidGlow,
            shadowColor: colors.primary,
          },
        ]}
      />

      {/* Main Radar Visual Container */}
      <View style={styles.radarWrapper}>
        {/* Concentric Pulse Rings */}
        {renderPulseRing(pulse1)}
        {renderPulseRing(pulse2)}
        {renderPulseRing(pulse3)}

        {/* Static Background Rings */}
        <View style={[styles.staticRingLarge, { borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)' }]} />
        <View style={[styles.staticRingMedium, { borderColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)' }]} />

        {/* Rotating Radar Sweep Line */}
        <Animated.View
          style={[
            styles.scannerBeam,
            {
              transform: [{ rotate: sweepRotation }],
            },
          ]}
        >
          <View
            style={[
              styles.beamGradient,
              Platform.OS === 'web' && ({
                backgroundImage: `conic-gradient(from 0deg, transparent 0deg, transparent 300deg, ${colors.primary} 360deg)`,
              } as any),
            ]}
          />
        </Animated.View>

        {/* Detected Match Blip Dots */}
        <Animated.View style={[styles.blipDot, { top: 35, right: 45, opacity: blip1 }]}>
          <View style={[styles.blipInner, { backgroundColor: colors.secondary }]} />
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={styles.blipText}>Jakarta</Text>
            <MapPin size={9} color={colors.secondary} style={{ marginLeft: 3 }} />
          </View>
        </Animated.View>

        <Animated.View style={[styles.blipDot, { bottom: 50, left: 30, opacity: blip2 }]}>
          <View style={[styles.blipInner, { backgroundColor: colors.primary }]} />
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={styles.blipText}>Bandung</Text>
            <Heart size={9} color={colors.primary} style={{ marginLeft: 3 }} />
          </View>
        </Animated.View>

        <Animated.View style={[styles.blipDot, { top: 70, left: 40, opacity: blip3 }]}>
          <View style={[styles.blipInner, { backgroundColor: colors.gold }]} />
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={styles.blipText}>Bali</Text>
            <Crown size={9} color={colors.gold} style={{ marginLeft: 3 }} />
          </View>
        </Animated.View>

        {/* Center Pulsing Circle (User Avatar / Glowing Heart) */}
        <Animated.View
          style={[
            styles.radarCenterCircle,
            {
              backgroundColor: colors.primary,
              shadowColor: colors.primary,
              transform: [{ scale: centerScale }],
              alignItems: 'center',
              justifyContent: 'center',
            },
          ]}
        >
          {user?.avatarUrl ? (
            <Image source={{ uri: user.avatarUrl }} style={styles.centerAvatarImg} />
          ) : (
            <Heart size={28} color="#FFFFFF" fill="#FFFFFF" />
          )}

          {/* Glowing Ring Around Center */}
          <View style={[styles.centerBorderGlow, { borderColor: '#FFFFFF' }]} />
        </Animated.View>
      </View>

      {/* Info Status Text */}
      <View style={styles.statusSection}>
        <View style={styles.searchingRow}>
          <Text style={[styles.title, { color: colors.text }]}>
            {t('match.searchingTitle')}
          </Text>
          <Sparkles size={16} color={colors.primary} style={{ marginLeft: 6 }} />
        </View>

        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          {t('match.searchingDesc')}
        </Text>

        <View style={[styles.speedPill, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)' }]}>
          <Text style={[styles.speedText, { color: colors.primary }]}>
            {t('match.engineSpeedNotice')}
          </Text>
        </View>
      </View>

      {/* Action: Cancel Button */}
      <Button
        title={t('match.cancelSearch')}
        variant="outline"
        size="md"
        onPress={onCancel}
        style={styles.cancelButton}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: THEME.spacing.lg,
    overflow: 'hidden',
  },
  glowAura: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    opacity: 0.35,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 50,
  },
  radarWrapper: {
    width: 280,
    height: 280,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
    position: 'relative',
  },
  pulseRing: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 2,
  },
  staticRingLarge: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  staticRingMedium: {
    position: 'absolute',
    width: 170,
    height: 170,
    borderRadius: 85,
    borderWidth: 1,
  },
  scannerBeam: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    alignItems: 'center',
    justifyContent: 'center',
  },
  beamGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 130,
    opacity: 0.25,
  },
  blipDot: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 10,
  },
  blipInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 4,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
  },
  blipText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  radarCenterCircle: {
    width: 86,
    height: 86,
    borderRadius: 43,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
    elevation: 10,
  },
  centerAvatarImg: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  centerBorderGlow: {
    position: 'absolute',
    width: 86,
    height: 86,
    borderRadius: 43,
    borderWidth: 2,
    opacity: 0.85,
  },
  radarIcon: {
    fontSize: 38,
  },
  statusSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  searchingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  dotPulse: {
    fontSize: 18,
    marginLeft: 6,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 20,
  },
  speedPill: {
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  speedText: {
    fontSize: 11,
    fontWeight: '700',
  },
  cancelButton: {
    minWidth: 180,
  },
});
