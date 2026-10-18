import React from 'react';
import { View, Image, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { useThemeStore } from '../../../theme/useThemeStore';

interface AvatarChainProps {
  avatars: string[];
  maxVisible?: number;
  onAddPress?: () => void;
  style?: ViewStyle;
}

export const AvatarChain: React.FC<AvatarChainProps> = ({
  avatars,
  maxVisible = 5,
  onAddPress,
  style,
}) => {
  const { colors, isDark } = useThemeStore();

  const visibleAvatars = avatars.slice(0, maxVisible);

  return (
    <View style={[styles.container, style]}>
      {visibleAvatars.map((uri, index) => {
        // Curve offset to mimic the curved arch in reference image
        const isCenter = index === 2;
        const translateY = isCenter ? -12 : index === 1 || index === 3 ? -6 : 0;
        const scale = isCenter ? 1.15 : index === 1 || index === 3 ? 1.05 : 0.95;

        return (
          <View
            key={index}
            style={[
              styles.avatarWrapper,
              {
                marginLeft: index === 0 ? 0 : -18,
                zIndex: index + 1,
                transform: [{ translateY }, { scale }],
              },
            ]}
          >
            <Image
              source={{ uri }}
              style={[
                styles.avatarImage,
                {
                  borderColor: isDark ? colors.background : '#FFFFFF',
                },
              ]}
            />
            {onAddPress && (
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={onAddPress}
                style={[
                  styles.plusBadge,
                  {
                    backgroundColor: isDark ? colors.surfaceCard : '#FFFFFF',
                    borderColor: isDark ? colors.border : '#E2E8F0',
                  },
                ]}
              >
                <Text style={[styles.plusText, { color: colors.textSecondary }]}>+</Text>
              </TouchableOpacity>
            )}
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    overflow: 'visible',
  },
  avatarWrapper: {
    position: 'relative',
    alignItems: 'center',
  },
  avatarImage: {
    width: 66,
    height: 66,
    borderRadius: 33,
    borderWidth: 3,
    backgroundColor: '#CCCCCC',
  },
  plusBadge: {
    position: 'absolute',
    bottom: -6,
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  plusText: {
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 16,
  },
});
