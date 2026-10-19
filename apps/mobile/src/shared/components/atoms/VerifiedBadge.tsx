import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Check } from 'lucide-react-native';

interface VerifiedBadgeProps {
  size?: 'sm' | 'md';
  variant?: 'gradient' | 'outline';
  style?: ViewStyle;
}

export const VerifiedBadge: React.FC<VerifiedBadgeProps> = ({
  size = 'md',
  variant = 'gradient',
  style,
}) => {
  const isSm = size === 'sm';

  if (variant === 'outline') {
    return (
      <View
        style={[
          styles.outlineContainer,
          isSm && styles.smPadding,
          style,
        ]}
      >
        <Check size={isSm ? 10 : 12} color="#A855F7" strokeWidth={3} />
        <Text style={[styles.outlineText, isSm && styles.smText]}>Verified</Text>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.gradientContainer,
        isSm && styles.smPadding,
        style,
      ]}
    >
      <View style={styles.iconCircle}>
        <Check size={isSm ? 8 : 10} color="#FFFFFF" strokeWidth={3} />
      </View>
      <Text style={[styles.gradientText, isSm && styles.smText]}>Verified</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  gradientContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF6482', // Base sweet rose
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 12,
    gap: 3.5,
  },
  iconCircle: {
    width: 13,
    height: 13,
    borderRadius: 7,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gradientText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  outlineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    backgroundColor: 'rgba(168, 85, 247, 0.1)',
    borderWidth: 1,
    borderColor: '#A855F7',
    gap: 4,
  },
  outlineText: {
    color: '#A855F7',
    fontSize: 11,
    fontWeight: '700',
  },
  smPadding: {
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 10,
  },
  smText: {
    fontSize: 9,
  },
});
