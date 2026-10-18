import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { useThemeStore } from '../../../theme/useThemeStore';

export type BadgeVariant = 'primary' | 'success' | 'gold' | 'danger' | 'neutral' | 'outline';
export type BadgeSize = 'sm' | 'md';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  size?: BadgeSize;
  icon?: React.ReactNode | string;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'primary',
  size = 'sm',
  icon,
  style,
  textStyle,
}) => {
  const { colors } = useThemeStore();

  const getVariantStyles = () => {
    switch (variant) {
      case 'success':
        return {
          backgroundColor: colors.success + '22',
          borderColor: colors.success,
          textColor: colors.success,
        };
      case 'gold':
        return {
          backgroundColor: colors.gold + '22',
          borderColor: colors.gold,
          textColor: colors.gold,
        };
      case 'danger':
        return {
          backgroundColor: colors.danger + '22',
          borderColor: colors.danger,
          textColor: colors.danger,
        };
      case 'neutral':
        return {
          backgroundColor: colors.surfaceGlass,
          borderColor: colors.border,
          textColor: colors.textSecondary,
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          borderColor: colors.border,
          textColor: colors.textSecondary,
        };
      case 'primary':
      default:
        return {
          backgroundColor: colors.primaryGlow,
          borderColor: colors.primary,
          textColor: colors.primary,
        };
    }
  };

  const currentVariant = getVariantStyles();
  const isSm = size === 'sm';

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: currentVariant.backgroundColor,
          borderColor: currentVariant.borderColor,
          paddingVertical: isSm ? 2 : 4,
          paddingHorizontal: isSm ? 6 : 10,
          borderRadius: isSm ? 10 : 14,
        },
        style,
      ]}
    >
      {icon &&
        (typeof icon === 'string' ? (
          <Text style={{ fontSize: isSm ? 10 : 12, marginRight: 4 }}>{icon}</Text>
        ) : (
          <View style={{ marginRight: 4 }}>{icon}</View>
        ))}
      <Text
        style={[
          styles.text,
          {
            color: currentVariant.textColor,
            fontSize: isSm ? 10 : 12,
          },
          textStyle,
        ]}
      >
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderWidth: 1,
  },
  text: {
    fontWeight: '700',
  },
});
