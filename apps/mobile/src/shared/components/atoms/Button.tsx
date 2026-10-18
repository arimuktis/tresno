import React, { useRef } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  Platform,
  Animated,
  StyleProp,
  View,
} from 'react-native';
import { ChevronRight, LucideIcon } from 'lucide-react-native';
import { THEME } from '../../../theme/tokens';
import { useThemeStore } from '../../../theme/useThemeStore';

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'danger'
  | 'success'
  | 'outline'
  | 'glass'
  | 'gold'
  | 'ghost'
  | 'white';

export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg';

export type ButtonRounded = 'none' | 'sm' | 'md' | 'lg' | 'full';

export interface ButtonProps {
  title?: string;
  children?: React.ReactNode;
  onPress?: (event?: any) => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  rounded?: ButtonRounded;
  fullWidth?: boolean;
  isLoading?: boolean;
  loadingText?: string;
  disabled?: boolean;
  hasChevron?: boolean;
  leftIcon?: React.ReactNode | LucideIcon;
  rightIcon?: React.ReactNode | LucideIcon;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  activeOpacity?: number;
  testID?: string;
  accessibilityLabel?: string;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export const Button: React.FC<ButtonProps> = ({
  title,
  children,
  onPress,
  variant = 'primary',
  size = 'md',
  rounded = 'full',
  fullWidth = false,
  isLoading = false,
  loadingText,
  disabled = false,
  hasChevron = false,
  leftIcon,
  rightIcon,
  style,
  textStyle,
  activeOpacity = 0.85,
  testID,
  accessibilityLabel,
}) => {
  const { colors, isDark } = useThemeStore();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (disabled || isLoading) return;
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      useNativeDriver: Platform.OS !== 'web',
      speed: 35,
      bounciness: 4,
    }).start();
  };

  const handlePressOut = () => {
    if (disabled || isLoading) return;
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: Platform.OS !== 'web',
      speed: 25,
      bounciness: 8,
    }).start();
  };

  // Color Mapping
  const getBackgroundColor = (): string => {
    if (disabled) {
      return isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)';
    }
    switch (variant) {
      case 'primary':
        return colors.primary;
      case 'secondary':
        return colors.secondary;
      case 'danger':
        return colors.danger;
      case 'success':
        return '#10B981';
      case 'gold':
        return colors.gold || '#F59E0B';
      case 'glass':
        return colors.surfaceGlass;
      case 'white':
        return '#FFFFFF';
      case 'outline':
      case 'ghost':
        return 'transparent';
      default:
        return colors.primary;
    }
  };

  const getBorderColor = (): string => {
    if (disabled) return 'transparent';
    switch (variant) {
      case 'outline':
        return colors.primary;
      case 'glass':
        return colors.border;
      case 'white':
        return isDark ? 'transparent' : colors.border;
      default:
        return 'transparent';
    }
  };

  const getTextColor = (): string => {
    if (disabled) {
      return colors.textSecondary;
    }
    switch (variant) {
      case 'outline':
      case 'ghost':
        return colors.primary;
      case 'secondary':
        return '#0F172A';
      case 'gold':
        return '#1C1917';
      case 'glass':
        return colors.text;
      case 'white':
        return '#0F172A';
      case 'primary':
      case 'danger':
      case 'success':
      default:
        return '#FFFFFF';
    }
  };

  const textColor = getTextColor();

  // Size Specifications
  const getSizeConfig = () => {
    switch (size) {
      case 'xs':
        return { height: 30, px: 10, fontSize: 12, iconSize: 13, gap: 4 };
      case 'sm':
        return { height: 38, px: 14, fontSize: 13, iconSize: 15, gap: 6 };
      case 'lg':
        return { height: 56, px: 28, fontSize: 17, iconSize: 20, gap: 10 };
      case 'md':
      default:
        return { height: 48, px: 22, fontSize: 15, iconSize: 17, gap: 8 };
    }
  };

  const sizeConfig = getSizeConfig();

  const getBorderRadius = (): number => {
    switch (rounded) {
      case 'none':
        return 0;
      case 'sm':
        return THEME.borderRadius.sm;
      case 'md':
        return THEME.borderRadius.md;
      case 'lg':
        return THEME.borderRadius.lg;
      case 'full':
      default:
        return THEME.borderRadius.full;
    }
  };

  // Icon Render Helper
  const renderIconItem = (icon: React.ReactNode | LucideIcon) => {
    if (!icon) return null;
    if (React.isValidElement(icon)) {
      return icon;
    }
    if (typeof icon === 'function') {
      const IconComponent = icon as LucideIcon;
      return <IconComponent size={sizeConfig.iconSize} color={textColor} strokeWidth={2.2} />;
    }
    if (typeof icon === 'string') {
      return <Text style={{ color: textColor, fontSize: sizeConfig.iconSize }}>{icon}</Text>;
    }
    return null;
  };

  const isGlowable = (variant === 'primary' || variant === 'gold') && !disabled;
  const glowColor = variant === 'gold' ? `${colors.gold || '#F59E0B'}66` : colors.liquidGlow;

  return (
    <AnimatedTouchable
      testID={testID}
      accessibilityLabel={accessibilityLabel || title}
      activeOpacity={activeOpacity}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || isLoading}
      style={[
        styles.base,
        {
          height: sizeConfig.height,
          paddingHorizontal: sizeConfig.px,
          borderRadius: getBorderRadius(),
          backgroundColor: getBackgroundColor(),
          borderColor: getBorderColor(),
          borderWidth: variant === 'outline' ? 1.5 : variant === 'glass' || variant === 'white' ? 1 : 0,
          transform: [{ scale: scaleAnim }],
          width: fullWidth ? '100%' : undefined,
          opacity: disabled ? 0.6 : 1,
        },
        isGlowable && {
          shadowColor: variant === 'gold' ? (colors.gold || '#F59E0B') : colors.primary,
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: isDark ? 0.38 : 0.28,
          shadowRadius: 16,
          elevation: 6,
          ...(Platform.OS === 'web'
            ? {
                boxShadow: `0 6px 20px 0 ${glowColor}`,
              }
            : {}),
        },
        style as any,
      ]}
    >
      {isLoading ? (
        <View style={styles.loadingRow}>
          <ActivityIndicator color={textColor} size="small" />
          {loadingText ? (
            <Text style={[styles.text, { fontSize: sizeConfig.fontSize, color: textColor, marginLeft: 8 }, textStyle]}>
              {loadingText}
            </Text>
          ) : null}
        </View>
      ) : (
        <View style={[styles.contentRow, { gap: sizeConfig.gap }]}>
          {leftIcon && <View style={styles.iconContainer}>{renderIconItem(leftIcon)}</View>}

          {title ? (
            <Text style={[styles.text, { fontSize: sizeConfig.fontSize, color: textColor }, textStyle]}>
              {title}
            </Text>
          ) : (
            children
          )}

          {hasChevron && (
            <ChevronRight
              size={sizeConfig.iconSize}
              color={textColor}
              strokeWidth={2.4}
              style={styles.chevron}
            />
          )}

          {rightIcon && <View style={styles.iconContainer}>{renderIconItem(rightIcon)}</View>}
        </View>
      )}
    </AnimatedTouchable>
  );
};

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: '700',
    letterSpacing: -0.2,
    textAlign: 'center',
  },
  chevron: {
    marginLeft: 2,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
