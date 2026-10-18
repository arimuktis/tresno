import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Platform,
  ViewStyle,
  StyleProp,
  LayoutChangeEvent,
} from 'react-native';
import { useThemeStore } from '../../../theme/useThemeStore';
import { THEME } from '../../../theme/tokens';

export type ShimmerBorderRadius = number | 'none' | 'sm' | 'md' | 'lg' | 'full';

export interface ShimmerLoadingBarProps {
  width?: number | string;
  height?: number | string;
  borderRadius?: ShimmerBorderRadius;
  duration?: number;
  baseColor?: string;
  shimmerColor?: string;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
}

export const ShimmerLoadingBar: React.FC<ShimmerLoadingBarProps> = ({
  width = '100%',
  height = 16,
  borderRadius = 'md',
  duration = 1400,
  baseColor,
  shimmerColor,
  style,
  children,
}) => {
  const { colors, isDark } = useThemeStore();
  const [containerWidth, setContainerWidth] = useState<number>(200);
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration,
        useNativeDriver: Platform.OS !== 'web',
      })
    );
    animation.start();
    return () => animation.stop();
  }, [duration, shimmerAnim]);

  const handleLayout = (e: LayoutChangeEvent) => {
    const { width: measuredWidth } = e.nativeEvent.layout;
    if (measuredWidth > 0 && measuredWidth !== containerWidth) {
      setContainerWidth(measuredWidth);
    }
  };

  const getBorderRadius = (): number => {
    if (typeof borderRadius === 'number') return borderRadius;
    switch (borderRadius) {
      case 'none':
        return 0;
      case 'sm':
        return THEME.borderRadius.sm;
      case 'md':
        return THEME.borderRadius.md;
      case 'lg':
        return THEME.borderRadius.lg;
      case 'full':
        return THEME.borderRadius.full;
      default:
        return THEME.borderRadius.md;
    }
  };

  const defaultBaseColor = baseColor || (isDark ? 'rgba(255, 255, 255, 0.07)' : 'rgba(0, 0, 0, 0.06)');
  const defaultShimmerColor =
    shimmerColor || (isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.7)');

  const translateX = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-containerWidth, containerWidth * 1.5],
  });

  return (
    <View
      onLayout={handleLayout}
      style={[
        styles.container,
        {
          width: width as any,
          height: height as any,
          borderRadius: getBorderRadius(),
          backgroundColor: defaultBaseColor,
        },
        style,
      ]}
    >
      <Animated.View
        style={[
          styles.shimmerHighlight,
          {
            width: containerWidth * 0.75,
            transform: [{ translateX }],
            backgroundColor: Platform.OS === 'web' ? 'transparent' : defaultShimmerColor,
          },
          Platform.OS === 'web' &&
            ({
              backgroundImage: `linear-gradient(90deg, rgba(255,255,255,0) 0%, ${defaultShimmerColor} 50%, rgba(255,255,255,0) 100%)`,
            } as any),
        ]}
      />
      {children}
    </View>
  );
};

// 1. Shimmer Avatar (Circle)
export const ShimmerAvatar: React.FC<{
  size?: number;
  style?: StyleProp<ViewStyle>;
}> = ({ size = 48, style }) => (
  <ShimmerLoadingBar
    width={size}
    height={size}
    borderRadius="full"
    style={style}
  />
);

// 2. Shimmer Story Circle (Ring + Avatar placeholder ala Tigo/Instagram)
export const ShimmerStoryCircle: React.FC<{
  style?: StyleProp<ViewStyle>;
}> = ({ style }) => {
  const { colors } = useThemeStore();
  return (
    <View style={[styles.storyWrapper, style]}>
      <View style={[styles.storyRing, { borderColor: `${colors.primary}33` }]}>
        <ShimmerAvatar size={56} />
      </View>
      <ShimmerLoadingBar width={50} height={10} borderRadius="sm" style={{ marginTop: 6 }} />
    </View>
  );
};

// 3. Shimmer Anchor Card (For Discovery & Match Grids)
export const ShimmerAnchorCard: React.FC<{
  style?: StyleProp<ViewStyle>;
}> = ({ style }) => {
  const { colors, isDark } = useThemeStore();
  return (
    <View
      style={[
        styles.anchorCard,
        {
          backgroundColor: colors.surfaceCard,
          borderColor: colors.border,
        },
        style,
      ]}
    >
      {/* Photo Placeholder */}
      <ShimmerLoadingBar width="100%" height={165} borderRadius={0} />

      {/* Info Row */}
      <View style={styles.anchorCardBody}>
        <View style={styles.cardHeaderRow}>
          <ShimmerLoadingBar width="60%" height={14} borderRadius="sm" />
          <ShimmerLoadingBar width="20%" height={14} borderRadius="full" />
        </View>

        <ShimmerLoadingBar width="45%" height={11} borderRadius="sm" style={{ marginTop: 6 }} />

        {/* Action Row */}
        <View style={styles.cardFooterRow}>
          <ShimmerLoadingBar width="48%" height={32} borderRadius="full" />
          <ShimmerLoadingBar width="48%" height={32} borderRadius="full" />
        </View>
      </View>
    </View>
  );
};

// 4. Shimmer Message Row (For Chat & Conversation Lists)
export const ShimmerMessageRow: React.FC<{
  style?: StyleProp<ViewStyle>;
}> = ({ style }) => {
  const { colors } = useThemeStore();
  return (
    <View style={[styles.messageRow, { borderBottomColor: colors.border }, style]}>
      <ShimmerAvatar size={50} style={{ marginRight: 12 }} />
      <View style={{ flex: 1 }}>
        <View style={styles.messageRowHeader}>
          <ShimmerLoadingBar width="40%" height={14} borderRadius="sm" />
          <ShimmerLoadingBar width={45} height={11} borderRadius="sm" />
        </View>
        <ShimmerLoadingBar width="75%" height={12} borderRadius="sm" style={{ marginTop: 8 }} />
      </View>
    </View>
  );
};

// 5. Shimmer List (Helper to render multiple rows or cards)
export interface ShimmerListProps {
  count?: number;
  type?: 'messages' | 'cards' | 'stories' | 'bars';
  style?: StyleProp<ViewStyle>;
}

export const ShimmerList: React.FC<ShimmerListProps> = ({
  count = 4,
  type = 'messages',
  style,
}) => {
  const items = Array.from({ length: count }, (_, i) => i);

  if (type === 'stories') {
    return (
      <View style={[styles.storyListRow, style]}>
        {items.map((key) => (
          <ShimmerStoryCircle key={key} style={{ marginRight: 12 }} />
        ))}
      </View>
    );
  }

  if (type === 'cards') {
    return (
      <View style={[styles.cardsGrid, style]}>
        {items.map((key) => (
          <ShimmerAnchorCard key={key} style={styles.gridCardItem} />
        ))}
      </View>
    );
  }

  if (type === 'bars') {
    return (
      <View style={[styles.barsContainer, style]}>
        {items.map((key) => (
          <ShimmerLoadingBar
            key={key}
            width={key % 2 === 0 ? '100%' : '80%'}
            height={16}
            borderRadius="sm"
            style={{ marginBottom: 12 }}
          />
        ))}
      </View>
    );
  }

  return (
    <View style={style}>
      {items.map((key) => (
        <ShimmerMessageRow key={key} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    position: 'relative',
  },
  shimmerHighlight: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
  },
  storyWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  storyRing: {
    padding: 3,
    borderRadius: 999,
    borderWidth: 2,
  },
  storyListRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  anchorCard: {
    borderRadius: THEME.borderRadius.md,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 12,
  },
  anchorCardBody: {
    padding: 12,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    gap: 8,
  },
  cardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  gridCardItem: {
    width: '48.5%',
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  messageRowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  barsContainer: {
    padding: 16,
  },
});
