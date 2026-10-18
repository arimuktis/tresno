import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { useThemeStore } from '../../../theme/useThemeStore';

interface StatItemProps {
  value: string | number;
  label: string;
  style?: ViewStyle;
}

export const StatItem: React.FC<StatItemProps> = ({ value, label, style }) => {
  const { colors } = useThemeStore();

  return (
    <View style={[styles.container, style]}>
      <Text style={[styles.value, { color: colors.text }]}>{value}</Text>
      <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  value: {
    fontSize: 16,
    fontWeight: '800',
  },
  label: {
    fontSize: 10,
    marginTop: 2,
    fontWeight: '500',
  },
});
