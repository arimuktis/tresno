import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, View } from 'react-native';
import { useThemeStore } from '../../../theme/useThemeStore';
import { Coins, LucideIcon } from 'lucide-react-native';

export interface GiftItem {
  icon: string | React.ReactNode | LucideIcon;
  name: string;
  coins: number;
}

interface GiftItemCardProps {
  gift: GiftItem;
  onSelect: (gift: GiftItem) => void;
  style?: ViewStyle;
}

export const GiftItemCard: React.FC<GiftItemCardProps> = ({ gift, onSelect, style }) => {
  const { colors } = useThemeStore();

  const renderIcon = () => {
    if (React.isValidElement(gift.icon)) return gift.icon;
    if (typeof gift.icon === 'function') {
      const IconComponent = gift.icon as LucideIcon;
      return <IconComponent size={24} color={colors.primary} />;
    }
    return <Text style={styles.iconText}>{gift.icon}</Text>;
  };

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => onSelect(gift)}
      style={[
        styles.card,
        {
          backgroundColor: colors.surfaceGlass,
          borderColor: colors.border,
        },
        style,
      ]}
    >
      <View style={styles.iconContainer}>{renderIcon()}</View>
      <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
        {gift.name}
      </Text>
      <View style={styles.priceRow}>
        <Coins size={11} color={colors.gold || '#F59E0B'} style={{ marginRight: 3 }} />
        <Text style={[styles.price, { color: colors.gold || '#F59E0B' }]}>
          {gift.coins}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    padding: 8,
    borderRadius: 14,
    borderWidth: 1,
    flex: 1,
    marginHorizontal: 3,
  },
  iconContainer: {
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 24,
  },
  name: {
    fontSize: 10,
    fontWeight: '700',
    marginTop: 2,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  price: {
    fontSize: 10,
    fontWeight: '800',
  },
});
