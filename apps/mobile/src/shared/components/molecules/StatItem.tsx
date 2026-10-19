import { View, Text, StyleSheet, ViewStyle, TouchableOpacity } from 'react-native';
import { useThemeStore } from '../../../theme/useThemeStore';

interface StatItemProps {
  value: string | number;
  label: string;
  onPress?: () => void;
  style?: ViewStyle;
}

export const StatItem: React.FC<StatItemProps> = ({ value, label, onPress, style }) => {
  const { colors } = useThemeStore();

  const content = (
    <View style={[styles.container, style]}>
      <Text style={[styles.value, { color: colors.text }]}>{value}</Text>
      <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.7}
        style={{ flex: 1, alignItems: 'center' }}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return content;
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
