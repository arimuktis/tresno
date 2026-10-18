import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { useThemeStore } from '../../../theme/useThemeStore';

export type IconButtonVariant = 'glass' | 'solid' | 'primary' | 'outline';

interface IconButtonProps {
  icon: string | React.ReactNode;
  onPress: () => void;
  variant?: IconButtonVariant;
  size?: number;
  style?: ViewStyle;
  iconStyle?: TextStyle;
  disabled?: boolean;
}

export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  onPress,
  variant = 'glass',
  size = 38,
  style,
  iconStyle,
  disabled = false,
}) => {
  const { colors } = useThemeStore();

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: colors.primary,
          borderColor: colors.primary,
        };
      case 'solid':
        return {
          backgroundColor: colors.surfaceCard,
          borderColor: colors.border,
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          borderColor: colors.border,
        };
      case 'glass':
      default:
        return {
          backgroundColor: colors.surfaceGlass,
          borderColor: colors.border,
        };
    }
  };

  const currentStyles = getVariantStyles();

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.button,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: currentStyles.backgroundColor,
          borderColor: currentStyles.borderColor,
          opacity: disabled ? 0.5 : 1,
        },
        style,
      ]}
    >
      {typeof icon === 'string' ? (
        <Text style={[{ fontSize: size * 0.45 }, iconStyle]}>{icon}</Text>
      ) : (
        icon
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
});
