import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Coins, Plus } from 'lucide-react-native';
import { THEME } from '../../../theme/tokens';
import { useThemeStore } from '../../../theme/useThemeStore';

interface CoinBadgeProps {
  coins: number;
  onPress?: () => void;
  showAddButton?: boolean;
}

export const CoinBadge: React.FC<CoinBadgeProps> = ({
  coins,
  onPress,
  showAddButton = true,
}) => {
  const { colors } = useThemeStore();

  return (
    <TouchableOpacity
      activeOpacity={onPress ? 0.7 : 1}
      onPress={onPress}
      style={[
        styles.container,
        {
          backgroundColor: colors.surfaceGlass,
          borderColor: colors.border,
        },
      ]}
    >
      <View style={styles.coinCircle}>
        <Coins size={14} color={colors.gold} />
      </View>
      <Text style={[styles.coinText, { color: colors.gold }]}>
        {coins.toLocaleString('id-ID')}
      </Text>
      {showAddButton && (
        <View style={[styles.plusButton, { backgroundColor: colors.primary }]}>
          <Plus size={11} color="#FFFFFF" strokeWidth={3} />
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: THEME.borderRadius.full,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderWidth: 1,
  },
  coinCircle: {
    marginRight: 6,
  },
  coinIcon: {
    fontSize: 16,
  },
  coinText: {
    fontWeight: '800',
    fontSize: 14,
    marginRight: 6,
  },
  plusButton: {
    borderRadius: THEME.borderRadius.full,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plusText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
    lineHeight: 18,
  },
});
