import { ViewStyle, Platform } from 'react-native';
import { ThemeColors } from './useThemeStore';

/**
 * Modern Liquid Glass Design System Helper
 * Menghadirkan efek frosted glass, specular rim highlight, dan ambient liquid glow
 * yang kompatibel dengan React Native Web dan Mobile.
 */
export const getGlassCardStyle = (colors: ThemeColors, isDark: boolean): ViewStyle => {
  const baseStyle: any = {
    backgroundColor: colors.glassCard,
    borderColor: colors.glassBorder,
    borderWidth: 1,
    shadowColor: isDark ? '#000000' : colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: isDark ? 0.35 : 0.12,
    shadowRadius: 18,
    elevation: 6,
  };

  // Di platform Web, aktifkan real CSS backdrop-filter blur & specular rim highlight
  if (Platform.OS === 'web') {
    baseStyle.backdropFilter = 'blur(20px) saturate(190%)';
    baseStyle.WebkitBackdropFilter = 'blur(20px) saturate(190%)';
    baseStyle.boxShadow = isDark
      ? `0 12px 32px 0 rgba(0, 0, 0, 0.45), inset 0 1px 1px 0 ${colors.glassBorderHighlight}, inset 0 -1px 1px 0 rgba(255, 46, 99, 0.12)`
      : `0 8px 24px 0 rgba(15, 23, 42, 0.08), inset 0 1px 2px 0 ${colors.glassBorderHighlight}`;
  }

  return baseStyle;
};

export const getGlassDockNavStyle = (colors: ThemeColors, isDark: boolean): ViewStyle => {
  const baseStyle: any = {
    backgroundColor: colors.glassBg,
    borderColor: colors.glassBorder,
    borderWidth: 1,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: isDark ? 0.4 : 0.18,
    shadowRadius: 20,
    elevation: 12,
  };

  if (Platform.OS === 'web') {
    baseStyle.backdropFilter = 'blur(24px) saturate(200%)';
    baseStyle.WebkitBackdropFilter = 'blur(24px) saturate(200%)';
    baseStyle.boxShadow = isDark
      ? `0 16px 40px 0 rgba(0, 0, 0, 0.55), inset 0 1px 1.5px 0 ${colors.glassBorderHighlight}, 0 0 20px 0 ${colors.liquidGlow}`
      : `0 12px 32px 0 rgba(15, 23, 42, 0.12), inset 0 1px 2px 0 ${colors.glassBorderHighlight}, 0 0 16px 0 ${colors.liquidGlow}`;
  }

  return baseStyle;
};
