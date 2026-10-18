import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ViewStyle } from 'react-native';
import { Coins, Crown, MapPin, MessageCircle, PhoneCall } from 'lucide-react-native';
import { useThemeStore } from '../../../theme/useThemeStore';
import { useTranslation } from '../../../i18n';
import { Badge } from '../atoms/Badge';
import { getGlassCardStyle } from '../../../theme/glassStyles';

import { usePresenceStore } from '../../stores/usePresenceStore';
import { toast } from '../../stores/useToastStore';

export interface AnchorData {
  id: string;
  name: string;
  age: number;
  city: string;
  avatar: string;
  isOnline: boolean;
  presenceStatus?: 'available' | 'busy' | 'offline';
  ratePerMin: number;
  tag: string;
  isCertified: boolean;
  exposureBadgeLabel?: string;
  exposureBadgeType?: 'new' | 'fast' | 'idle' | 'popular' | 'nearby';
}

interface AnchorCardProps {
  anchor: AnchorData;
  onCall: (anchor: AnchorData) => void;
  onChat: (anchor: AnchorData) => void;
  callLabel?: string;
  style?: ViewStyle;
}

export const AnchorCard: React.FC<AnchorCardProps> = ({
  anchor,
  onCall,
  onChat,
  callLabel,
  style,
}) => {
  const { colors, isDark } = useThemeStore();
  const { t } = useTranslation();
  const glassStyle = getGlassCardStyle(colors, isDark);
  const resolvedCallLabel = callLabel || t('common.call');

  // Ambil live presence status dari central presence store
  const storeStatus = usePresenceStore((s) => s.presences[anchor.id]?.status);
  const effectiveStatus = anchor.presenceStatus || storeStatus || (anchor.isOnline ? 'available' : 'offline');

  const getStatusBadgeConfig = () => {
    switch (effectiveStatus) {
      case 'available':
        return { label: t('common.online').toUpperCase(), variant: 'success' as const };
      case 'busy':
        return { label: 'SEDANG CALL', variant: 'danger' as const };
      case 'offline':
      default:
        return { label: t('common.offline').toUpperCase(), variant: 'neutral' as const };
    }
  };

  const badgeConfig = getStatusBadgeConfig();

  const handleCall = () => {
    if (effectiveStatus === 'busy') {
      toast.warning(`${anchor.name} sedang dalam panggilan lain. Coba beberapa saat lagi atau kirim pesan!`);
      return;
    }
    onCall(anchor);
  };

  return (
    <View
      style={[
        styles.card,
        glassStyle,
        style,
      ]}
    >
      {/* Anchor Photo Container */}
      <View style={styles.imageContainer}>
        <Image source={{ uri: anchor.avatar }} style={styles.image} />

        {/* Status Online (Hijau) / Busy Call (Merah Pink) / Offline (Abu-abu) Badge */}
        <View style={styles.statusBadgeWrapper}>
          <Badge
            label={badgeConfig.label}
            variant={badgeConfig.variant}
            size="sm"
          />
        </View>

        {/* Exposure Badge (Anti-Sepi Algorithm Flag) */}
        {anchor.exposureBadgeLabel && (
          <View
            style={[
              styles.exposureBadge,
              {
                backgroundColor:
                  anchor.exposureBadgeType === 'new'
                    ? '#00D26A'
                    : anchor.exposureBadgeType === 'fast'
                    ? '#00E5FF'
                    : anchor.exposureBadgeType === 'popular'
                    ? '#FFB800'
                    : 'rgba(255, 45, 85, 0.9)',
              },
            ]}
          >
            <Text style={styles.exposureBadgeText}>{anchor.exposureBadgeLabel}</Text>
          </View>
        )}

        {/* Rate Call Pill */}
        <View style={[styles.rateBadge, { backgroundColor: 'rgba(0,0,0,0.65)', flexDirection: 'row', alignItems: 'center' }]}>
          <Coins size={11} color={colors.gold} style={{ marginRight: 3 }} />
          <Text style={{ color: colors.gold, fontSize: 10, fontWeight: '800' }}>
            {t('destiny.callRate', { coins: anchor.ratePerMin })}
          </Text>
        </View>
      </View>

      {/* Anchor Information */}
      <View style={styles.infoContainer}>
        <View style={styles.nameRow}>
          <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
            {anchor.name} ({anchor.age})
          </Text>
          {anchor.isCertified && (
            <Crown size={12} color={colors.gold} style={{ marginLeft: 4 }} />
          )}
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2, marginBottom: 8 }}>
          <MapPin size={10} color={colors.textSecondary} style={{ marginRight: 3 }} />
          <Text style={[styles.cityTag, { color: colors.textSecondary }]} numberOfLines={1}>
            {anchor.city} • {anchor.tag}
          </Text>
        </View>

        {/* Action Buttons: Chat & Video Call */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[
              styles.chatBtn,
              {
                backgroundColor: colors.surfaceGlass,
                borderColor: colors.border,
              },
            ]}
            onPress={() => onChat(anchor)}
            activeOpacity={0.8}
          >
            <MessageCircle size={15} color={colors.text} />
          </TouchableOpacity>

          <TouchableOpacity
            testID="btn-direct-call"
            accessibilityLabel="btn-direct-call"
            style={[styles.callBtn, { backgroundColor: colors.primary }]}
            onPress={handleCall}
            activeOpacity={0.8}
          >
            <PhoneCall size={12} color="#FFFFFF" style={{ marginRight: 4 }} />
            <Text style={styles.callBtnText}>{resolvedCallLabel}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '48%',
    borderRadius: 18,
    borderWidth: 1,
    overflow: 'hidden',
  },
  imageContainer: {
    width: '100%',
    height: 180,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  statusBadgeWrapper: {
    position: 'absolute',
    top: 8,
    left: 8,
  },
  exposureBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 6,
  },
  exposureBadgeText: {
    color: '#000000',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.2,
  },
  rateBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  infoContainer: {
    padding: 10,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  name: {
    fontSize: 13,
    fontWeight: '700',
    flex: 1,
  },
  cityTag: {
    fontSize: 10,
    marginTop: 2,
    marginBottom: 8,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  chatBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  callBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    paddingVertical: 7,
  },
  callBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
});
