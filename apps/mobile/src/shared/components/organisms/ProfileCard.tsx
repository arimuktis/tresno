import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { Sparkles, User, Check, Copy, ShieldCheck, Crown } from 'lucide-react-native';
import { useThemeStore } from '../../../theme/useThemeStore';
import { Avatar } from '../atoms/Avatar';
import { Badge } from '../atoms/Badge';
import { StatItem } from '../molecules/StatItem';

import { Gender } from '@tresno/shared';

interface ProfileCardProps {
  userId: string;
  nickname: string;
  avatarUrl?: string;
  gender?: Gender;
  isHost?: boolean;
  levelText?: string;
  followersCount?: number;
  followingCount?: number;
  visitorsCount?: number;
  followersLabel?: string;
  followingLabel?: string;
  visitorsLabel?: string;
  style?: ViewStyle;
}

import { getGlassCardStyle } from '../../../theme/glassStyles';

export const ProfileCard: React.FC<ProfileCardProps> = ({
  userId,
  nickname,
  avatarUrl,
  gender = 'male',
  isHost = false,
  levelText = 'Lv.3',
  followersCount = 24,
  followingCount = 12,
  visitorsCount = 89,
  followersLabel = 'Pengikut',
  followingLabel = 'Mengikuti',
  visitorsLabel = 'Pengunjung',
  style,
}) => {
  const { colors, isDark } = useThemeStore();
  const glassStyle = getGlassCardStyle(colors, isDark);
  const [copied, setCopied] = useState(false);

  const handleCopyId = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const defaultAvatar =
    gender === 'female'
      ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200'
      : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200';

  return (
    <View
      style={[
        styles.card,
        glassStyle,
        style,
      ]}
    >
      <View style={styles.topRow}>
        {/* Avatar with Goddess/VIP border */}
        <Avatar
          uri={avatarUrl || defaultAvatar}
          name={nickname}
          size="lg"
          borderColor={isHost ? colors.primary : colors.gold}
          style={styles.avatarMargin}
        />

        {/* User Details */}
        <View style={styles.detailsCol}>
          <View style={styles.nameRow}>
            <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
              {nickname}
            </Text>
            {gender === 'female' ? (
              <Sparkles size={14} color={colors.primary} style={{ marginLeft: 6 }} />
            ) : (
              <User size={14} color={colors.secondary} style={{ marginLeft: 6 }} />
            )}
          </View>

          {/* User ID with Copy Button */}
          <TouchableOpacity
            onPress={handleCopyId}
            style={[styles.idPill, { backgroundColor: colors.surfaceGlass, borderColor: colors.border }]}
            activeOpacity={0.7}
          >
            <Text style={[styles.idText, { color: colors.textSecondary }]}>
              ID: {userId}
            </Text>
            <View style={{ marginLeft: 2 }}>
              {copied ? (
                <Check size={11} color={colors.success} strokeWidth={3} />
              ) : (
                <Copy size={11} color={colors.primary} />
              )}
            </View>
          </TouchableOpacity>

          {/* Role & Verification Badge */}
          <View style={styles.badgeRow}>
            {isHost ? (
              <Badge
                label="Terverifikasi Asli"
                variant="success"
                size="sm"
                icon={<ShieldCheck size={11} color={colors.success} />}
              />
            ) : (
              <Badge
                label="Anggota Resmi"
                variant="primary"
                size="sm"
                icon={<Sparkles size={11} color={colors.primary} />}
              />
            )}
            <View style={{ width: 6 }} />
            <Badge
              label={isHost ? 'Host' : levelText}
              variant={isHost ? 'primary' : 'gold'}
              size="sm"
              icon={isHost ? <Crown size={11} color={colors.primary} /> : undefined}
            />
          </View>
        </View>
      </View>

      {/* Stats Row (Following, Followers, Visitors) */}
      <View style={[styles.statsRow, { borderTopColor: colors.border }]}>
        <StatItem value={followingCount} label={followingLabel} />
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <StatItem value={followersCount} label={followersLabel} />
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <StatItem value={visitorsCount} label={visitorsLabel} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarMargin: {
    marginRight: 14,
  },
  detailsCol: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  name: {
    fontSize: 17,
    fontWeight: '800',
    flex: 1,
  },
  idPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 4,
    marginBottom: 6,
  },
  idText: {
    fontSize: 11,
    marginRight: 4,
  },
  copyIcon: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  divider: {
    width: 1,
    height: 20,
  },
});
