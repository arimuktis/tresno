import React from 'react';
import { View, Image, Text, StyleSheet, ViewStyle } from 'react-native';
import { useThemeStore } from '../../../theme/useThemeStore';

import { UserPresenceStatus } from '@tresno/shared';
import { usePresenceStore } from '../../stores/usePresenceStore';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface AvatarProps {
  uri?: string;
  name?: string;
  size?: AvatarSize;
  isOnline?: boolean;
  presenceStatus?: UserPresenceStatus;
  userId?: string;
  showOnlineDot?: boolean;
  badgeIcon?: React.ReactNode | string;
  borderColor?: string;
  style?: ViewStyle;
}

const SIZE_MAP: Record<AvatarSize, number> = {
  xs: 24,
  sm: 32,
  md: 44,
  lg: 56,
  xl: 72,
};

export const Avatar: React.FC<AvatarProps> = ({
  uri,
  name = 'User',
  size = 'md',
  isOnline = false,
  presenceStatus,
  userId,
  showOnlineDot = false,
  badgeIcon,
  borderColor,
  style,
}) => {
  const { colors } = useThemeStore();
  const liveStatusFromStore = usePresenceStore((s) => (userId ? s.presences[userId]?.status : undefined));

  // Tentukan status efektif: prioritas presenceStatus prop -> store live data -> fallback boolean isOnline
  const effectiveStatus: UserPresenceStatus =
    presenceStatus ||
    liveStatusFromStore ||
    (isOnline ? 'available' : 'offline');

  const dimension = SIZE_MAP[size];
  const radius = dimension / 2;

  const fallbackInitial = name ? name.charAt(0).toUpperCase() : 'U';

  // Warna indikator:
  // 1. Hijau (#00D26A): Online & Available
  // 2. Merah Pink (#FF2E63): Busy Sedang Call
  // 3. Abu-abu (#94A3B8): Offline
  const getDotColor = (): { bg: string; glow: string } => {
    switch (effectiveStatus) {
      case 'available':
        return { bg: '#00D26A', glow: 'rgba(0, 210, 106, 0.45)' };
      case 'busy':
        return { bg: '#FF2E63', glow: 'rgba(255, 46, 99, 0.55)' };
      case 'offline':
      default:
        return { bg: '#94A3B8', glow: 'transparent' };
    }
  };

  const dotColors = getDotColor();

  return (
    <View style={[{ width: dimension, height: dimension }, styles.container, style]}>
      {uri ? (
        <Image
          source={{ uri }}
          style={[
            styles.image,
            {
              width: dimension,
              height: dimension,
              borderRadius: radius,
              borderWidth: borderColor ? 2 : 0,
              borderColor: borderColor || 'transparent',
            },
          ]}
        />
      ) : (
        <View
          style={[
            styles.fallbackContainer,
            {
              width: dimension,
              height: dimension,
              borderRadius: radius,
              backgroundColor: colors.primaryGlow,
              borderWidth: borderColor ? 2 : 1,
              borderColor: borderColor || colors.primary,
            },
          ]}
        >
          <Text style={[styles.fallbackText, { color: colors.primary, fontSize: dimension * 0.4 }]}>
            {fallbackInitial}
          </Text>
        </View>
      )}

      {/* Online/Busy/Offline Status Dot */}
      {showOnlineDot && (
        <View
          style={[
            styles.onlineDot,
            {
              backgroundColor: dotColors.bg,
              shadowColor: dotColors.bg,
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: effectiveStatus === 'offline' ? 0 : 0.7,
              shadowRadius: 4,
              elevation: effectiveStatus === 'offline' ? 0 : 3,
              width: Math.max(9, dimension * 0.23),
              height: Math.max(9, dimension * 0.23),
              borderRadius: Math.max(4.5, dimension * 0.115),
              borderColor: colors.surfaceCard || '#0D0C1D',
            },
          ]}
        />
      )}

      {/* Overlay Badge Icon (e.g. Crown, Missed Call) */}
      {badgeIcon ? (
        <View
          style={[
            styles.badgeWrapper,
            {
              backgroundColor: colors.surfaceCard,
              borderColor: colors.border,
            },
          ]}
        >
          {typeof badgeIcon === 'string' ? (
            <Text style={{ fontSize: Math.max(9, dimension * 0.22) }}>{badgeIcon}</Text>
          ) : (
            badgeIcon
          )}
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    resizeMode: 'cover',
  },
  fallbackContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  fallbackText: {
    fontWeight: '800',
  },
  onlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    borderWidth: 2,
  },
  badgeWrapper: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    borderRadius: 99,
    padding: 2,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
