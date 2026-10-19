import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Crown, Star, Zap, Flame, Shield, Award } from 'lucide-react-native';
import { LEVEL_TIERS } from '@tresno/shared';

interface LevelBadgeProps {
  level: number;
  size?: 'sm' | 'md' | 'lg';
  style?: ViewStyle;
}

export const LevelBadge: React.FC<LevelBadgeProps> = ({
  level,
  size = 'md',
  style,
}) => {
  const tier = LEVEL_TIERS.find((t) => t.level === level) || LEVEL_TIERS[0];
  const isLg = size === 'lg';
  const isSm = size === 'sm';

  const renderIcon = () => {
    const iconSize = isLg ? 14 : isSm ? 10 : 12;
    if (level >= 6) {
      return <Crown size={iconSize} color="#FFFFFF" />;
    }
    if (level >= 4) {
      return <Award size={iconSize} color="#FFFFFF" />;
    }
    if (level >= 3) {
      return <Star size={iconSize} color="#FFFFFF" />;
    }
    if (level >= 2) {
      return <Flame size={iconSize} color="#FFFFFF" />;
    }
    if (level >= 1) {
      return <Zap size={iconSize} color="#FFFFFF" />;
    }
    return <Shield size={iconSize} color="#FFFFFF" />;
  };

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: tier.color },
        isSm && styles.smBadge,
        isLg && styles.lgBadge,
        style,
      ]}
    >
      <View style={styles.iconWrapper}>{renderIcon()}</View>
      <Text style={[styles.text, isSm && styles.smText, isLg && styles.lgText]}>
        Lv{level}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 12,
    gap: 3.5,
  },
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.2,
  },
  smBadge: {
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 8,
    gap: 2.5,
  },
  smText: {
    fontSize: 9,
  },
  lgBadge: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 14,
    gap: 5,
  },
  lgText: {
    fontSize: 13,
  },
});
