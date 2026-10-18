import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';
import { Gem } from 'lucide-react-native';
import { useThemeStore } from '../../../theme/useThemeStore';

interface DiamondBadgeProps {
  diamonds: number;
  onPress?: () => void;
  style?: ViewStyle;
}

export const DiamondBadge: React.FC<DiamondBadgeProps> = ({ diamonds, onPress, style }) => {
  const { colors } = useThemeStore();

  return (
    <TouchableOpacity
      activeOpacity={onPress ? 0.7 : 1}
      onPress={onPress}
      disabled={!onPress}
      style={[
        styles.container,
        {
          backgroundColor: colors.surfaceCard,
          borderColor: colors.gold,
        },
        style,
      ]}
    >
      <Gem size={13} color={colors.gold} style={styles.icon} />
      <Text style={[styles.text, { color: colors.gold }]}>
        {diamonds.toLocaleString('id-ID')}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 20,
    borderWidth: 1,
    elevation: 2,
  },
  icon: {
    fontSize: 13,
    marginRight: 4,
  },
  text: {
    fontSize: 12,
    fontWeight: '800',
  },
});
