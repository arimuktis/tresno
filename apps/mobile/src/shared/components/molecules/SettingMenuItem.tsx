import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { useThemeStore } from '../../../theme/useThemeStore';

interface SettingMenuItemProps {
  icon: string | React.ReactNode;
  title: string;
  subtitle?: string;
  badge?: string;
  onPress: () => void;
  isDanger?: boolean;
  showChevron?: boolean;
  isLast?: boolean;
  style?: ViewStyle;
}

export const SettingMenuItem: React.FC<SettingMenuItemProps> = ({
  icon,
  title,
  subtitle,
  badge,
  onPress,
  isDanger = false,
  showChevron = true,
  isLast = false,
  style,
}) => {
  const { colors } = useThemeStore();

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={[
        styles.container,
        {
          borderBottomColor: colors.border,
          borderBottomWidth: isLast ? 0 : 1,
        },
        style,
      ]}
    >
      <View style={styles.leftCol}>
        {typeof icon === 'string' ? (
          <Text style={styles.icon}>{icon}</Text>
        ) : (
          <View style={styles.iconWrapper}>{icon}</View>
        )}
        <View style={styles.textContainer}>
          <Text
            style={[
              styles.title,
              { color: isDanger ? colors.danger : colors.text },
            ]}
          >
            {title}
          </Text>
          {subtitle && (
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              {subtitle}
            </Text>
          )}
        </View>
      </View>

      <View style={styles.rightCol}>
        {badge && (
          <View style={[styles.badgePill, { backgroundColor: colors.primaryGlow }]}>
            <Text style={[styles.badgeText, { color: colors.primary }]}>{badge}</Text>
          </View>
        )}
        {showChevron && (
          <ChevronRight
            size={18}
            color={isDanger ? colors.danger : colors.textSecondary}
          />
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  leftCol: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  icon: {
    fontSize: 20,
    marginRight: 12,
  },
  iconWrapper: {
    marginRight: 12,
    width: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 13,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 11,
    marginTop: 2,
  },
  rightCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  badgePill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  chevron: {
    fontSize: 20,
    fontWeight: '300',
    marginLeft: 4,
  },
});
