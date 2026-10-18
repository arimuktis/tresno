import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Animated,
  Easing,
  Platform,
} from 'react-native';
import { useThemeStore } from '../../../theme/useThemeStore';
import { useTranslation } from '../../../i18n';
import { useAuthStore } from '../../auth/stores/useAuthStore';
import { useWalletStore } from '../../wallet/stores/useWalletStore';
import { CoinBadge } from '../../../shared/components/atoms/CoinBadge';
import { Button } from '../../../shared/components/atoms/Button';
import { THEME } from '../../../theme/tokens';
import { getGlassCardStyle } from '../../../theme/glassStyles';
import { Heart, User, Star, Palette, Crown, Sparkles, Ticket, Coins, ChevronRight, Globe, MapPin, Compass } from 'lucide-react-native';

interface MatchTabProps {
  onStartMatch: () => void;
}

const RADAR_AVATARS = [
  {
    uri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    top: '8%',
    left: '8%',
    name: 'Dewi',
    city: 'Jakarta',
  },
  {
    uri: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
    top: '12%',
    right: '8%',
    name: 'Bella',
    city: 'Bandung',
  },
  {
    uri: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150',
    bottom: '16%',
    left: '10%',
    name: 'Nadia',
    city: 'Surabaya',
  },
  {
    uri: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    bottom: '18%',
    right: '8%',
    name: 'Luna',
    city: 'Bali',
  },
];

export const MatchTab: React.FC<MatchTabProps> = ({ onStartMatch }) => {
  const { colors, isDark, openThemeModal } = useThemeStore();
  const { t } = useTranslation();
  const { user: authUser } = useAuthStore();
  const {
    coinBalance,
    openTopupModal,
    diamondBalance,
    matchCoupons,
    hasClaimedStarterPack,
    openStarterPackModal,
  } = useWalletStore();
  const glassStyle = getGlassCardStyle(colors, isDark);

  const [regionFilter, setRegionFilter] = useState<'all' | 'id' | 'global'>('all');
  const isHost = authUser?.isHost;
  const isMale = authUser?.gender === 'male' || (!isHost && authUser?.gender !== 'female');

  // Auto-popup penawaran Paket Perdana Gentleman VIP untuk user cowok pada kunjungan awal
  useEffect(() => {
    if (isMale && !isHost && !hasClaimedStarterPack) {
      const timer = setTimeout(() => {
        openStarterPackModal();
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [isMale, isHost, hasClaimedStarterPack]);

  // 1. Quad Staggered Pulse Wave Animations (Expanding Full-Screen Concentric Ripples)
  const pulseWave1 = useRef(new Animated.Value(0)).current;
  const pulseWave2 = useRef(new Animated.Value(0)).current;
  const pulseWave3 = useRef(new Animated.Value(0)).current;
  const pulseWave4 = useRef(new Animated.Value(0)).current;

  // 2. Center Heartbeat / Breathing Animation
  const heartScale = useRef(new Animated.Value(1)).current;
  const haloScale = useRef(new Animated.Value(1)).current;
  const haloOpacity = useRef(new Animated.Value(0.3)).current;

  // 3. Rotating 360-degree Radar Scanner Sweep
  const radarSweep = useRef(new Animated.Value(0)).current;

  // 4. Floating & Bobbing Avatars (Independent Oscillations)
  const floatAnim1 = useRef(new Animated.Value(0)).current;
  const floatAnim2 = useRef(new Animated.Value(0)).current;
  const floatAnim3 = useRef(new Animated.Value(0)).current;
  const floatAnim4 = useRef(new Animated.Value(0)).current;

  // 5. Green Online Beacon Ripple
  const onlinePulse = useRef(new Animated.Value(0)).current;

  // 6. Breathing CTA Match Button
  const btnPulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // A. Staggered Expanding Full-Screen Pulse Waves
    const createWaveLoop = (anim: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, {
            toValue: 1,
            duration: 3400,
            easing: Easing.out(Easing.cubic),
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

    const wave1 = createWaveLoop(pulseWave1, 0);
    const wave2 = createWaveLoop(pulseWave2, 850);
    const wave3 = createWaveLoop(pulseWave3, 1700);
    const wave4 = createWaveLoop(pulseWave4, 2550);

    wave1.start();
    wave2.start();
    wave3.start();
    wave4.start();

    // B. Authentic Heartbeat Pulse (Dub-Lub rhythm)
    const heartLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(heartScale, {
          toValue: 1.14,
          duration: 160,
          easing: Easing.out(Easing.ease),
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(heartScale, {
          toValue: 1.04,
          duration: 120,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(heartScale, {
          toValue: 1.22,
          duration: 200,
          easing: Easing.out(Easing.ease),
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(heartScale, {
          toValue: 1.0,
          duration: 600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.delay(600),
      ])
    );
    heartLoop.start();

    // C. Halo Glow Breathing Behind Heart
    const haloLoop = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(haloScale, {
            toValue: 1.38,
            duration: 800,
            easing: Easing.out(Easing.ease),
            useNativeDriver: Platform.OS !== 'web',
          }),
          Animated.timing(haloOpacity, {
            toValue: 0.8,
            duration: 800,
            easing: Easing.out(Easing.ease),
            useNativeDriver: Platform.OS !== 'web',
          }),
        ]),
        Animated.parallel([
          Animated.timing(haloScale, {
            toValue: 1.0,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: Platform.OS !== 'web',
          }),
          Animated.timing(haloOpacity, {
            toValue: 0.25,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: Platform.OS !== 'web',
          }),
        ]),
      ])
    );
    haloLoop.start();

    // D. Continuous 360° Radar Sweep
    const sweepLoop = Animated.loop(
      Animated.timing(radarSweep, {
        toValue: 1,
        duration: 4000,
        easing: Easing.linear,
        useNativeDriver: Platform.OS !== 'web',
      })
    );
    sweepLoop.start();

    // E. Floating Avatar Oscillations (Organic Phases)
    const createFloat = (anim: Animated.Value, range: number, duration: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.timing(anim, {
            toValue: range,
            duration: duration,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: Platform.OS !== 'web',
          }),
          Animated.timing(anim, {
            toValue: -range,
            duration: duration,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: Platform.OS !== 'web',
          }),
        ])
      );
    };

    const f1 = createFloat(floatAnim1, 7, 2100);
    const f2 = createFloat(floatAnim2, -6, 2500);
    const f3 = createFloat(floatAnim3, 8, 2300);
    const f4 = createFloat(floatAnim4, -7, 2700);

    f1.start();
    f2.start();
    f3.start();
    f4.start();

    // F. Online Dot Beacon Ripple
    const onlineLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(onlinePulse, {
          toValue: 1,
          duration: 1500,
          easing: Easing.out(Easing.ease),
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(onlinePulse, {
          toValue: 0,
          duration: 0,
          useNativeDriver: Platform.OS !== 'web',
        }),
      ])
    );
    onlineLoop.start();

    // G. CTA Button Subtle Pulse
    const btnAnimLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(btnPulse, {
          toValue: 1.035,
          duration: 1100,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(btnPulse, {
          toValue: 1.0,
          duration: 1100,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: Platform.OS !== 'web',
        }),
      ])
    );
    btnAnimLoop.start();

    return () => {
      wave1.stop();
      wave2.stop();
      wave3.stop();
      wave4.stop();
      heartLoop.stop();
      haloLoop.stop();
      sweepLoop.stop();
      f1.stop();
      f2.stop();
      f3.stop();
      f4.stop();
      onlineLoop.stop();
      btnAnimLoop.stop();
    };
  }, [
    pulseWave1,
    pulseWave2,
    pulseWave3,
    pulseWave4,
    heartScale,
    haloScale,
    haloOpacity,
    radarSweep,
    floatAnim1,
    floatAnim2,
    floatAnim3,
    floatAnim4,
    onlinePulse,
    btnPulse,
  ]);

  // Clean formatted user name (remove underscores)
  const rawNickname = authUser?.nickname || 'Pengguna';
  const cleanNickname = rawNickname.replace(/_/g, ' ');

  // Interpolate Radar Sweep Rotation
  const sweepRotation = radarSweep.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  // Helper for expanding ripple wave styles across full screen
  const getWaveStyle = (anim: Animated.Value) => ({
    transform: [
      {
        scale: anim.interpolate({
          inputRange: [0, 1],
          outputRange: [0.95, 7.8],
        }),
      },
    ],
    opacity: anim.interpolate({
      inputRange: [0, 0.08, 0.35, 0.75, 1],
      outputRange: [0.55, 0.42, 0.22, 0.08, 0],
    }),
  });

  const floatStyles = [
    { transform: [{ translateY: floatAnim1 }] },
    { transform: [{ translateY: floatAnim2 }] },
    { transform: [{ translateY: floatAnim3 }] },
    { transform: [{ translateY: floatAnim4 }] },
  ];

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Heart size={20} color={colors.primary} fill={colors.primary} style={{ marginRight: 6 }} />
            <Text style={[styles.logoText, { color: colors.primary }]}>{t('common.appName')}</Text>
          </View>
          <View style={styles.userRow}>
            <User size={12} color={colors.textSecondary} style={{ marginRight: 4 }} />
            <Text style={[styles.tagline, { color: colors.textSecondary }]}>
              {cleanNickname}
            </Text>
          </View>
        </View>

        <View style={styles.headerRight}>
          {isHost ? (
            <View style={[styles.diamondBadge, glassStyle, { borderColor: colors.gold }]}>
              <Star size={13} color={colors.gold} fill={colors.gold} style={{ marginRight: 4 }} />
              <Text style={[styles.diamondText, { color: colors.gold }]}>
                {diamondBalance || 1250} Pts
              </Text>
            </View>
          ) : (
            <CoinBadge coins={coinBalance} onPress={openTopupModal} />
          )}

          <TouchableOpacity
            onPress={openThemeModal}
            style={[styles.iconButton, glassStyle]}
            activeOpacity={0.7}
          >
            <Palette size={16} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Exclusive Gentleman VIP Upsell Banner for Male Users */}
      {isMale && !isHost && !hasClaimedStarterPack && (
        <TouchableOpacity
          activeOpacity={0.88}
          onPress={openStarterPackModal}
          style={[styles.upsellBanner, glassStyle]}
        >
          <View style={styles.upsellBadge}>
            <Crown size={12} color="#000000" fill="#000000" />
            <Text style={styles.upsellBadgeText}>VIP 80% OFF</Text>
          </View>
          <View style={styles.upsellContent}>
            <Text style={[styles.upsellTitle, { color: colors.text }]}>
              Paket Perdana Gentleman VIP
            </Text>
            <Text style={[styles.upsellSub, { color: colors.textSecondary }]}>
              120 Koin + 5 Kupon + Prioritas Radar 2 Detik • Rp 9.900
            </Text>
          </View>
          <View style={styles.upsellCtaBtn}>
            <Text style={styles.upsellCtaText}>Ambil</Text>
            <ChevronRight size={13} color="#000000" />
          </View>
        </TouchableOpacity>
      )}

      {/* Target Location / Country Selector (Tigo-Style Region Filter) */}
      {!isHost && (
        <View style={[styles.regionFilterRow, glassStyle]}>
          <TouchableOpacity
            style={[
              styles.regionOption,
              regionFilter === 'all' && [
                styles.regionOptionActive,
                { backgroundColor: colors.primaryGlow, borderColor: colors.primary },
              ],
            ]}
            onPress={() => setRegionFilter('all')}
            activeOpacity={0.8}
          >
            <Globe
              size={13}
              color={regionFilter === 'all' ? colors.primary : colors.textSecondary}
              style={{ marginRight: 5 }}
            />
            <Text
              style={[
                styles.regionText,
                { color: regionFilter === 'all' ? colors.primary : colors.textSecondary },
              ]}
            >
              {t('match.regionAll')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.regionOption,
              regionFilter === 'id' && [
                styles.regionOptionActive,
                { backgroundColor: colors.primaryGlow, borderColor: colors.primary },
              ],
            ]}
            onPress={() => setRegionFilter('id')}
            activeOpacity={0.8}
          >
            <MapPin
              size={13}
              color={regionFilter === 'id' ? colors.primary : colors.textSecondary}
              style={{ marginRight: 5 }}
            />
            <Text
              style={[
                styles.regionText,
                { color: regionFilter === 'id' ? colors.primary : colors.textSecondary },
              ]}
            >
              {t('match.regionId')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.regionOption,
              regionFilter === 'global' && [
                styles.regionOptionActive,
                { backgroundColor: colors.primaryGlow, borderColor: colors.primary },
              ],
            ]}
            onPress={() => setRegionFilter('global')}
            activeOpacity={0.8}
          >
            <Compass
              size={13}
              color={regionFilter === 'global' ? colors.primary : colors.textSecondary}
              style={{ marginRight: 5 }}
            />
            <Text
              style={[
                styles.regionText,
                { color: regionFilter === 'global' ? colors.primary : colors.textSecondary },
              ]}
            >
              {t('match.regionGlobal')}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Center Radar / Hero Match Section */}
      <View style={styles.radarSection}>
        {/* Radar Telemetry Crosshairs */}
        <View
          style={[
            styles.radarCrosshairH,
            { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 46, 99, 0.06)' },
          ]}
        />
        <View
          style={[
            styles.radarCrosshairV,
            { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 46, 99, 0.06)' },
          ]}
        />

        {/* 5 Full-Screen Concentric Guide Rings */}
        <View
          style={[
            styles.staticGuideRing1,
            { borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 46, 99, 0.09)' },
          ]}
        />
        <View
          style={[
            styles.staticGuideRing2,
            { borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 46, 99, 0.14)' },
          ]}
        />
        <View
          style={[
            styles.staticGuideRing3,
            { borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 46, 99, 0.09)' },
          ]}
        />
        <View
          style={[
            styles.staticGuideRing4,
            { borderColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(255, 46, 99, 0.07)' },
          ]}
        />
        <View
          style={[
            styles.staticGuideRing5,
            { borderColor: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(255, 46, 99, 0.05)' },
          ]}
        />

        {/* Dynamic Expanding Full-Screen Pulse Waves (4 Staggered Layers) */}
        <Animated.View
          style={[
            styles.pulseWave,
            {
              borderColor: colors.primary,
              backgroundColor: colors.primaryGlow,
            },
            getWaveStyle(pulseWave1),
          ]}
        />
        <Animated.View
          style={[
            styles.pulseWave,
            {
              borderColor: colors.primary,
              backgroundColor: colors.primaryGlow,
            },
            getWaveStyle(pulseWave2),
          ]}
        />
        <Animated.View
          style={[
            styles.pulseWave,
            {
              borderColor: colors.primary,
              backgroundColor: colors.primaryGlow,
            },
            getWaveStyle(pulseWave3),
          ]}
        />
        <Animated.View
          style={[
            styles.pulseWave,
            {
              borderColor: colors.primary,
              backgroundColor: colors.primaryGlow,
            },
            getWaveStyle(pulseWave4),
          ]}
        />

        {/* Rotating Radar Scanner Beam */}
        <Animated.View
          style={[
            styles.radarBeamContainer,
            {
              transform: [{ rotate: sweepRotation }],
            },
          ]}
        >
          <View
            style={[
              styles.radarBeam,
              {
                borderTopColor: colors.primary,
                borderRightColor: 'transparent',
                borderBottomColor: 'transparent',
                borderLeftColor: 'transparent',
              },
            ]}
          />
        </Animated.View>

        {/* Ambient Halo Breathing Glow behind Center Core */}
        <Animated.View
          style={[
            styles.heartHalo,
            {
              backgroundColor: colors.primaryGlow,
              transform: [{ scale: haloScale }],
              opacity: haloOpacity,
            },
          ]}
        />

        {/* Center Pulsing Heart Circle */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={onStartMatch}
          style={styles.centerTouchable}
        >
          <Animated.View
            style={[
              styles.radarCenterCircle,
              {
                borderColor: colors.primary,
                backgroundColor: colors.surface,
                transform: [{ scale: heartScale }],
                shadowColor: colors.primary,
              },
            ]}
          >
            <View
              style={[
                styles.heartInnerBubble,
                { backgroundColor: colors.primaryGlow },
              ]}
            >
              <View style={styles.centerIcon}>
                {isHost ? (
                  <Crown size={36} color={colors.gold} />
                ) : (
                  <Heart size={36} color={colors.primary} fill={colors.primary} />
                )}
              </View>
            </View>
          </Animated.View>
        </TouchableOpacity>

        {/* Orbiting Nearby Host Avatars with Floating Animations */}
        {RADAR_AVATARS.map((item, idx) => (
          <Animated.View
            key={idx}
            style={[
              styles.orbitingAvatarWrapper,
              floatStyles[idx],
              {
                top: item.top as any,
                bottom: item.bottom as any,
                left: item.left as any,
                right: item.right as any,
              },
            ]}
          >
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={onStartMatch}
              style={[
                styles.orbitingAvatar,
                {
                  borderColor: colors.primary,
                },
              ]}
            >
              <Image source={{ uri: item.uri }} style={styles.orbitingImg} />

              {/* Online Green Beacon with Animated Pulse Wave */}
              <View style={styles.beaconContainer}>
                <Animated.View
                  style={[
                    styles.beaconWave,
                    {
                      backgroundColor: colors.success,
                      transform: [
                        {
                          scale: onlinePulse.interpolate({
                            inputRange: [0, 1],
                            outputRange: [1, 2.3],
                          }),
                        },
                      ],
                      opacity: onlinePulse.interpolate({
                        inputRange: [0, 0.8, 1],
                        outputRange: [0.8, 0.2, 0],
                      }),
                    },
                  ]}
                />
                <View style={[styles.onlineDot, { backgroundColor: colors.success }]} />
              </View>
            </TouchableOpacity>

            {/* Small Host Name Pill */}
            <View
              style={[
                styles.avatarNamePill,
                {
                  backgroundColor: isDark ? 'rgba(20, 20, 25, 0.85)' : 'rgba(255, 255, 255, 0.92)',
                  borderColor: isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.08)',
                },
              ]}
            >
              <Text style={[styles.avatarNameText, { color: colors.text }]}>
                {item.name}
              </Text>
            </View>
          </Animated.View>
        ))}

        {/* Matchmaking Fee & 20s Trial Badge Pill */}
        <View style={[styles.trialPill, glassStyle, { borderColor: colors.primary }]}>
          {isHost ? (
            <>
              <Crown size={13} color={colors.gold} style={{ marginRight: 5 }} />
              <Text style={[styles.trialPillText, { color: colors.text }]}>
                Host Siap Terima Panggilan
              </Text>
            </>
          ) : matchCoupons > 0 ? (
            <>
              <Ticket size={13} color={colors.primary} style={{ marginRight: 5 }} />
              <Text style={[styles.trialPillText, { color: colors.text }]}>
                {matchCoupons} Kupon Match • 20 Detik Gratis
              </Text>
            </>
          ) : (
            <>
              <Coins size={13} color={colors.gold} style={{ marginRight: 5 }} />
              <Text style={[styles.trialPillText, { color: colors.text }]}>
                3 Koin per Match • 20 Detik Gratis
              </Text>
            </>
          )}
        </View>
      </View>

      {/* Bottom Action Area */}
      <View style={styles.actionSection}>
        {/* Live Activity Ticker */}
        <View style={[styles.tickerCard, glassStyle]}>
          <View style={[styles.pulseStatus, { backgroundColor: colors.success }]} />
          <Text style={[styles.tickerText, { color: colors.textSecondary }]} numberOfLines={1}>
            {isHost
              ? '1.480 pengguna sedang mencari match video saat ini'
              : 'Dewi (Jakarta) baru saja terhubung dengan seseorang'}
          </Text>
        </View>

        {/* Pulsing Main CTA Button */}
        <Animated.View style={{ transform: [{ scale: btnPulse }] }}>
          <Button
            title={isHost ? t('home.heroBtnHost') : t('home.heroBtnUser')}
            size="lg"
            onPress={onStartMatch}
            style={[
              styles.matchButton,
              {
                backgroundColor: colors.primary,
                shadowColor: colors.primary,
              },
            ]}
          />
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
    justifyContent: 'space-between',
    position: 'relative',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    zIndex: 20,
  },
  logoText: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  tagline: {
    fontSize: 12,
    fontWeight: '700',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  diamondBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
  },
  diamondText: {
    fontSize: 12,
    fontWeight: '800',
  },
  iconButton: {
    padding: 8,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  upsellBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1.2,
    borderColor: '#FFB800',
    marginTop: 8,
    backgroundColor: 'rgba(255, 184, 0, 0.08)',
    zIndex: 20,
  },
  upsellBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFB800',
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 3,
  },
  upsellBadgeText: {
    color: '#000000',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  upsellContent: {
    flex: 1,
    marginHorizontal: 8,
  },
  upsellTitle: {
    fontSize: 12,
    fontWeight: '800',
  },
  upsellSub: {
    fontSize: 10,
    marginTop: 1,
  },
  upsellCtaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFB800',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 2,
  },
  upsellCtaText: {
    color: '#000000',
    fontSize: 11,
    fontWeight: '800',
  },
  regionFilterRow: {
    flexDirection: 'row',
    borderRadius: 20,
    borderWidth: 1,
    padding: 3,
    marginTop: 8,
    justifyContent: 'space-between',
    zIndex: 20,
  },
  regionOption: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 7,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  regionOptionActive: {
    elevation: 2,
  },
  regionText: {
    fontSize: 12,
    fontWeight: '700',
  },
  radarSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginVertical: 4,
    minHeight: 330,
    zIndex: 1,
  },
  radarCrosshairH: {
    position: 'absolute',
    width: 900,
    height: 1,
    pointerEvents: 'none',
  },
  radarCrosshairV: {
    position: 'absolute',
    height: 900,
    width: 1,
    pointerEvents: 'none',
  },
  staticGuideRing1: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 1,
    borderStyle: 'solid',
    pointerEvents: 'none',
  },
  staticGuideRing2: {
    position: 'absolute',
    width: 290,
    height: 290,
    borderRadius: 145,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    pointerEvents: 'none',
  },
  staticGuideRing3: {
    position: 'absolute',
    width: 440,
    height: 440,
    borderRadius: 220,
    borderWidth: 1,
    borderStyle: 'solid',
    pointerEvents: 'none',
  },
  staticGuideRing4: {
    position: 'absolute',
    width: 650,
    height: 650,
    borderRadius: 325,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    pointerEvents: 'none',
  },
  staticGuideRing5: {
    position: 'absolute',
    width: 880,
    height: 880,
    borderRadius: 440,
    borderWidth: 1,
    borderStyle: 'solid',
    pointerEvents: 'none',
  },
  pulseWave: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 1.5,
    pointerEvents: 'none',
  },
  radarBeamContainer: {
    position: 'absolute',
    width: 900,
    height: 900,
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'none',
  },
  radarBeam: {
    position: 'absolute',
    top: 0,
    width: 0,
    height: 0,
    borderStyle: 'solid',
    borderTopWidth: 450,
    borderRightWidth: 110,
    borderBottomWidth: 0,
    borderLeftWidth: 110,
    opacity: 0.06,
  },
  heartHalo: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    zIndex: 2,
    pointerEvents: 'none',
  },
  centerTouchable: {
    zIndex: 25,
  },
  radarCenterCircle: {
    width: 106,
    height: 106,
    borderRadius: 53,
    borderWidth: 2.5,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  heartInnerBubble: {
    width: 90,
    height: 90,
    borderRadius: 45,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerIcon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  orbitingAvatarWrapper: {
    position: 'absolute',
    alignItems: 'center',
    zIndex: 22,
  },
  orbitingAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2.5,
    overflow: 'visible',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 6,
  },
  orbitingImg: {
    width: '100%',
    height: '100%',
    borderRadius: 26,
  },
  beaconContainer: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  beaconWave: {
    position: 'absolute',
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  onlineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  avatarNamePill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 0.5,
    marginTop: 4,
  },
  avatarNameText: {
    fontSize: 10.5,
    fontWeight: '800',
  },
  trialPill: {
    position: 'absolute',
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    zIndex: 15,
  },
  trialPillText: {
    fontSize: 11.5,
    fontWeight: '800',
  },
  actionSection: {
    paddingBottom: 16,
    gap: 12,
    zIndex: 20,
  },
  tickerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  pulseStatus: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  tickerText: {
    fontSize: 11,
    fontWeight: '600',
    flex: 1,
  },
  matchButton: {
    width: '100%',
    borderRadius: 28,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
});
