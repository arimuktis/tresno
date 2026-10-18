import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { useThemeStore } from '../../../theme/useThemeStore';

export const LiquidBackgroundGlow: React.FC = () => {
  const { colors, isDark } = useThemeStore();

  return (
    <View style={styles.container} pointerEvents="none">
      {/* Top Right Vibrant Pink Glow Orb */}
      <View
        style={[
          styles.orb,
          styles.topRightOrb,
          {
            backgroundColor: isDark ? colors.primary : colors.primaryGlow,
            opacity: isDark ? 0.22 : 0.15,
          },
        ]}
      />

      {/* Middle Left Deep Teal/Violet Ambient Orb */}
      <View
        style={[
          styles.orb,
          styles.midLeftOrb,
          {
            backgroundColor: isDark ? '#7928CA' : '#0891B2',
            opacity: isDark ? 0.18 : 0.12,
          },
        ]}
      />

      {/* Bottom Center Soft Ambient Orb */}
      <View
        style={[
          styles.orb,
          styles.bottomOrb,
          {
            backgroundColor: isDark ? colors.primary : colors.gold,
            opacity: isDark ? 0.12 : 0.08,
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
    zIndex: 0,
  },
  orb: {
    position: 'absolute',
    borderRadius: 999,
    ...(Platform.OS === 'web'
      ? {
          filter: 'blur(75px)',
          WebkitFilter: 'blur(75px)',
          transform: 'translate3d(0, 0, 0)',
        }
      : {
          elevation: 0,
        }),
  },
  topRightOrb: {
    width: 260,
    height: 260,
    top: -40,
    right: -50,
  },
  midLeftOrb: {
    width: 220,
    height: 220,
    top: '40%',
    left: -70,
  },
  bottomOrb: {
    width: 280,
    height: 200,
    bottom: -30,
    alignSelf: 'center',
  },
});
