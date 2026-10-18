import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Crown, Plus } from 'lucide-react-native';
import { useThemeStore } from '../../../theme/useThemeStore';

export interface StoryCircleProps {
  id?: string;
  username: string;
  avatar: string;
  isUserSelf?: boolean;
  hasStories?: boolean;
  hasUnseen?: boolean;
  isHost?: boolean;
  onPress: () => void;
  onAddPress?: () => void;
}

export const StoryCircle: React.FC<StoryCircleProps> = ({
  username,
  avatar,
  isUserSelf = false,
  hasStories = true,
  hasUnseen = true,
  isHost = false,
  onPress,
  onAddPress,
}) => {
  const { colors, isDark } = useThemeStore();

  const handleContainerPress = () => {
    if (isUserSelf && !hasStories) {
      if (onAddPress) onAddPress();
      else onPress();
    } else {
      onPress();
    }
  };

  // Tentukan styling ring lingkaran yang presisi dan centered
  const getRingStyle = () => {
    if (hasStories && hasUnseen) {
      return [
        styles.ringActive,
        {
          borderColor: colors.primary,
          backgroundColor: colors.background,
        },
      ];
    }
    if (hasStories) {
      return [
        styles.ringSeen,
        {
          borderColor: isDark ? 'rgba(255,255,255,0.22)' : 'rgba(0,0,0,0.18)',
          backgroundColor: colors.background,
        },
      ];
    }
    return [
      styles.ringNone,
      {
        borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)',
        backgroundColor: colors.background,
      },
    ];
  };

  return (
    <TouchableOpacity
      style={styles.container}
      activeOpacity={0.82}
      onPress={handleContainerPress}
    >
      <View style={styles.avatarWrapper}>
        {/* Outer Ring Presisi & Sempurna di Tengah */}
        <View style={[styles.ringBase, getRingStyle()]}>
          <View style={[styles.avatarFrame, { backgroundColor: colors.background }]}>
            <Image source={{ uri: avatar }} style={styles.avatarImage} />
          </View>
        </View>

        {/* User Self "+" badge (Khusus Host) */}
        {isUserSelf && (
          <TouchableOpacity
            style={[
              styles.addBadge,
              {
                backgroundColor: colors.primary,
                borderColor: colors.background,
              },
            ]}
            activeOpacity={0.8}
            onPress={onAddPress || onPress}
          >
            <Plus size={11} color="#FFFFFF" strokeWidth={3} />
          </TouchableOpacity>
        )}

        {/* Host Crown Badge */}
        {!isUserSelf && isHost && (
          <View
            style={[
              styles.hostBadge,
              {
                backgroundColor: '#FFA000',
                borderColor: colors.background,
              },
            ]}
          >
            <Crown size={11} color="#FFFFFF" />
          </View>
        )}
      </View>

      {/* Username label */}
      <Text
        style={[
          styles.usernameText,
          {
            color: isUserSelf ? colors.primary : colors.text,
            fontWeight: isUserSelf || hasUnseen ? '700' : '500',
          },
        ]}
        numberOfLines={1}
      >
        {isUserSelf ? 'Cerita Anda' : username}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginRight: 14,
    width: 66,
  },
  avatarWrapper: {
    position: 'relative',
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  ringBase: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringActive: {
    borderWidth: 2,
    borderStyle: 'solid',
  },
  ringSeen: {
    borderWidth: 1.5,
    borderStyle: 'solid',
  },
  ringNone: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
  },
  avatarFrame: {
    width: 56,
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  addBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  hostBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  usernameText: {
    fontSize: 11,
    textAlign: 'center',
    maxWidth: 66,
  },
});
