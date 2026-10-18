import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';
import { useThemeStore } from '../../../theme/useThemeStore';

interface InterestSquircleTileProps {
  icon: string;
  label: string;
  isSelected?: boolean;
  onPress: () => void;
  style?: ViewStyle;
}

export const InterestSquircleTile: React.FC<InterestSquircleTileProps> = ({
  icon,
  label,
  isSelected = false,
  onPress,
  style,
}) => {
  const { colors, isDark } = useThemeStore();

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={onPress}
      style={[
        styles.tile,
        {
          backgroundColor: isSelected
            ? isDark
              ? 'rgba(255, 0, 94, 0.16)'
              : 'rgba(255, 0, 94, 0.08)'
            : isDark
            ? colors.surfaceCard
            : '#F4F6F9',
          borderColor: isSelected
            ? colors.primary
            : isDark
            ? colors.border
            : 'transparent',
        },
        style,
      ]}
    >
      <Text style={styles.icon}>{icon}</Text>
      <Text
        style={[
          styles.label,
          {
            color: isSelected ? colors.primary : colors.text,
            fontWeight: isSelected ? '800' : '600',
          },
        ]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  tile: {
    width: '30%',
    aspectRatio: 1,
    borderRadius: 22,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    marginVertical: 6,
  },
  icon: {
    fontSize: 30,
    marginBottom: 6,
  },
  label: {
    fontSize: 12,
    textAlign: 'center',
  },
});
