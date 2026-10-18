import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  ViewStyle,
  TextStyle,
  StyleProp,
  Image,
} from 'react-native';
import { X, LucideIcon } from 'lucide-react-native';
import { useThemeStore } from '../../../theme/useThemeStore';

export type ChipVariant = 'default' | 'primary' | 'glass' | 'danger' | 'warning' | 'outline';
export type ChipSize = 'sm' | 'md' | 'lg';

export interface ButtonChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  variant?: ChipVariant;
  size?: ChipSize;
  icon?: LucideIcon | React.ReactNode;
  iconColor?: string;
  avatarUrl?: string;
  count?: number | string;
  onRemove?: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
  testID?: string;
}

/**
 * ButtonChip / Chip: Atomic, reactive pill button with strictly consistent
 * box-model geometry, zero layout jumping on select, and full theme integration.
 */
export const ButtonChip: React.FC<ButtonChipProps> = ({
  label,
  selected = false,
  onPress,
  variant = 'default',
  size = 'md',
  icon,
  iconColor,
  avatarUrl,
  count,
  onRemove,
  disabled = false,
  style,
  labelStyle,
  testID,
}) => {
  const { colors, isDark } = useThemeStore();

  const sizeStyles = {
    sm: {
      height: 28,
      paddingHorizontal: 10,
      fontSize: 11,
      iconSize: 13,
      gap: 5,
    },
    md: {
      height: 34,
      paddingHorizontal: 13,
      fontSize: 12.5,
      iconSize: 15,
      gap: 6,
    },
    lg: {
      height: 40,
      paddingHorizontal: 16,
      fontSize: 14,
      iconSize: 17,
      gap: 8,
    },
  }[size];

  // Dynamic Theme Colors calculation ensuring 100% stability
  const getColors = () => {
    if (disabled) {
      return {
        bg: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.03)',
        border: 'transparent',
        text: colors.textSecondary,
        icon: colors.textSecondary,
      };
    }

    if (variant === 'danger') {
      return {
        bg: selected ? 'rgba(239, 68, 68, 0.18)' : (isDark ? 'rgba(239, 68, 68, 0.08)' : 'rgba(239, 68, 68, 0.05)'),
        border: selected ? '#EF4444' : 'rgba(239, 68, 68, 0.3)',
        text: selected ? '#EF4444' : (isDark ? '#FCA5A5' : '#DC2626'),
        icon: '#EF4444',
      };
    }

    if (variant === 'warning') {
      return {
        bg: selected ? 'rgba(245, 158, 11, 0.18)' : (isDark ? 'rgba(245, 158, 11, 0.08)' : 'rgba(245, 158, 11, 0.05)'),
        border: selected ? '#F59E0B' : 'rgba(245, 158, 11, 0.3)',
        text: selected ? '#F59E0B' : (isDark ? '#FDE68A' : '#D97706'),
        icon: '#F59E0B',
      };
    }

    if (selected) {
      return {
        bg: colors.primaryGlow || 'rgba(255, 46, 99, 0.14)',
        border: colors.primary,
        text: colors.primary,
        icon: colors.primary,
      };
    }

    // Unselected state
    return {
      bg: isDark ? colors.surfaceCard || '#1E293B' : colors.surfaceCard || '#F8FAFC',
      border: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)',
      text: colors.textSecondary,
      icon: colors.textSecondary,
    };
  };

  const currentColors = getColors();

  const renderIcon = () => {
    if (!icon) return null;
    if (React.isValidElement(icon)) {
      return icon;
    }
    const IconComponent = icon as LucideIcon;
    return (
      <IconComponent
        size={sizeStyles.iconSize}
        color={iconColor || currentColors.icon}
        strokeWidth={selected ? 2.4 : 1.9}
      />
    );
  };

  return (
    <TouchableOpacity
      testID={testID}
      activeOpacity={0.7}
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.chipBase,
        {
          height: sizeStyles.height,
          paddingHorizontal: sizeStyles.paddingHorizontal,
          backgroundColor: currentColors.bg,
          borderColor: currentColors.border,
          gap: sizeStyles.gap,
          opacity: disabled ? 0.45 : 1,
        },
        selected && styles.chipSelected,
        style,
      ]}
    >
      {/* Mini Avatar Option */}
      {Boolean(avatarUrl) && (
        <Image
          source={{ uri: avatarUrl }}
          style={[
            styles.miniAvatar,
            {
              width: sizeStyles.height - 12,
              height: sizeStyles.height - 12,
              borderRadius: (sizeStyles.height - 12) / 2,
            },
          ]}
        />
      )}

      {/* Leading Icon */}
      {renderIcon()}

      {/* Label Text */}
      <Text
        style={[
          styles.labelText,
          {
            fontSize: sizeStyles.fontSize,
            color: currentColors.text,
            fontWeight: selected ? '700' : '600',
          },
          labelStyle,
        ]}
        numberOfLines={1}
      >
        {label}
      </Text>

      {/* Trailing Count / Badge */}
      {count !== undefined && count !== null && (
        <View
          style={[
            styles.countBadge,
            {
              backgroundColor: selected ? currentColors.text : (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)'),
            },
          ]}
        >
          <Text
            style={[
              styles.countText,
              {
                color: selected ? '#FFFFFF' : currentColors.text,
              },
            ]}
          >
            {count}
          </Text>
        </View>
      )}

      {/* Dismiss / Remove Button */}
      {onRemove && (
        <TouchableOpacity
          onPress={onRemove}
          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          style={styles.removeBtn}
        >
          <X size={sizeStyles.iconSize - 2} color={currentColors.text} />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

// Alias for convenience
export const Chip = ButtonChip;

const styles = StyleSheet.create({
  chipBase: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 9999,
    borderWidth: 1.2,
    position: 'relative',
    ...Platform.select({
      web: {
        transition: 'all 0.15s ease-in-out',
        userSelect: 'none',
      } as any,
      default: {},
    }),
  },
  chipSelected: {
    ...Platform.select({
      web: {
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
      } as any,
      default: {
        elevation: 1,
      },
    }),
  },
  miniAvatar: {
    resizeMode: 'cover',
  },
  labelText: {
    letterSpacing: 0.2,
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  countBadge: {
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 9999,
    minWidth: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countText: {
    fontSize: 9,
    fontWeight: '800',
  },
  removeBtn: {
    marginLeft: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
