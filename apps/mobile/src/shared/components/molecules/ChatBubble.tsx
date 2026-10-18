import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TouchableOpacity } from 'react-native';
import { useThemeStore } from '../../../theme/useThemeStore';
import { useTranslation } from '../../../i18n';
import { Avatar } from '../atoms/Avatar';
import { formatTimeOnly } from '../../utils/dateTimeUtils';
import { ShieldCheck, Coins, Check, CheckCheck } from 'lucide-react-native';

interface ChatBubbleProps {
  text: string;
  timestamp: string;
  isMe: boolean;
  status?: 'sending' | 'sent' | 'read';
  peerAvatar?: string;
  peerName?: string;
  isSystem?: boolean;
  gift?: {
    icon: string;
    name: string;
    coins: number;
  };
  style?: ViewStyle;
  onLongPress?: () => void;
  reaction?: string;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({
  text,
  timestamp,
  isMe,
  status = 'sent',
  peerAvatar,
  peerName,
  isSystem = false,
  gift,
  style,
  onLongPress,
  reaction,
}) => {
  const { colors, isDark } = useThemeStore();
  const { t } = useTranslation();
  const displayTime = formatTimeOnly(timestamp);

  // Jika pesan dari Sistem Resmi (Tigo Official Notice Bot Card)
  if (isSystem) {
    return (
      <View style={[styles.systemCardWrapper, style]}>
        <View
          style={[
            styles.systemCard,
            {
              backgroundColor: isDark ? 'rgba(30, 41, 59, 0.9)' : '#FFFFFF',
              borderColor: isDark ? 'rgba(255, 184, 0, 0.3)' : 'rgba(255, 184, 0, 0.5)',
            },
          ]}
        >
          {/* Header Kartu Notifikasi Resmi */}
          <View style={styles.systemHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <ShieldCheck size={16} color={colors.gold} style={{ marginRight: 6 }} />
              <Text style={[styles.systemTitle, { color: colors.text }]}>
                {peerName || 'Tresno Official'}
              </Text>
              <View style={[styles.systemOfficialBadge, { backgroundColor: colors.gold }]}>
                <Text style={styles.systemOfficialText}>{t('common.official')}</Text>
              </View>
            </View>
            <Text style={[styles.timeText, { color: colors.textSecondary }]}>
              {displayTime}
            </Text>
          </View>

          {/* Isi Pesan Notifikasi */}
          <Text style={[styles.systemBodyText, { color: colors.text }]}>
            {text}
          </Text>
        </View>
      </View>
    );
  }

  const holdTimerRef = React.useRef<any>(null);
  const isHeldRef = React.useRef(false);

  const startHold = () => {
    isHeldRef.current = false;
    if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
    holdTimerRef.current = setTimeout(() => {
      isHeldRef.current = true;
      onLongPress?.();
    }, 320);
  };

  const cancelHold = () => {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
  };

  return (
    <View
      style={[
        styles.row,
        isMe ? styles.rowMe : styles.rowPeer,
        style,
      ]}
    >
      {!isMe && (
        <Avatar
          uri={peerAvatar}
          name={peerName}
          size="sm"
          style={styles.avatarMargin}
        />
      )}

      <TouchableOpacity
        activeOpacity={0.88}
        onLongPress={() => {
          isHeldRef.current = true;
          onLongPress?.();
        }}
        delayLongPress={320}
        {...({
          onMouseDown: startHold,
          onMouseUp: cancelHold,
          onMouseLeave: cancelHold,
          onTouchStart: startHold,
          onTouchEnd: cancelHold,
          onContextMenu: (e: any) => {
            e.preventDefault();
            onLongPress?.();
          },
        } as any)}
        style={[
          styles.container,
          isMe
            ? [styles.bubbleMe, { backgroundColor: colors.primary }]
            : [styles.bubblePeer, { backgroundColor: colors.surfaceCard, borderColor: colors.border }],
        ]}
      >
        {gift ? (
          <View style={styles.giftBox}>
            <View style={{ alignItems: 'center', justifyContent: 'center', marginBottom: 4 }}>
              {typeof gift.icon === 'function' ? (
                React.createElement(gift.icon as any, { size: 32, color: colors.gold || '#F59E0B' })
              ) : React.isValidElement(gift.icon) ? (
                gift.icon
              ) : (
                <Text style={{ fontSize: 32 }}>{gift.icon}</Text>
              )}
            </View>
            <Text style={[styles.giftName, { color: isMe ? '#FFFFFF' : colors.text }]}>
              {gift.name}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
              <Coins size={12} color={colors.gold} style={{ marginRight: 4 }} />
              <Text style={{ color: colors.gold, fontSize: 11, fontWeight: 'bold' }}>
                {gift.coins} {t('common.coins')}
              </Text>
            </View>
          </View>
        ) : (
          <Text
            style={[
              styles.text,
              { color: isMe ? '#FFFFFF' : colors.text },
            ]}
          >
            {text}
          </Text>
        )}

        <View style={styles.metaRow}>
          <Text
            style={[
              styles.timeText,
              { color: isMe ? 'rgba(255,255,255,0.75)' : colors.textSecondary },
            ]}
          >
            {displayTime}
          </Text>
          {isMe && (
            <View style={{ marginLeft: 4 }}>
              {status === 'read' ? (
                <CheckCheck size={13} color={colors.gold} strokeWidth={2.5} />
              ) : (
                <Check size={13} color="rgba(255,255,255,0.75)" strokeWidth={2.5} />
              )}
            </View>
          )}
        </View>

        {/* Reaction Pill Badge */}
        {reaction && (
          <View
            style={[
              styles.reactionBadge,
              isMe ? styles.reactionBadgeMe : styles.reactionBadgePeer,
              {
                backgroundColor: isDark ? '#2C2C2E' : '#FFFFFF',
                borderColor: colors.border,
              },
            ]}
          >
            <Text style={styles.reactionText}>{reaction}</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginVertical: 3,
  },
  rowMe: {
    justifyContent: 'flex-end',
  },
  rowPeer: {
    justifyContent: 'flex-start',
  },
  avatarMargin: {
    marginRight: 6,
    marginBottom: 2,
  },
  container: {
    maxWidth: '78%',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
  },
  bubbleMe: {
    borderBottomRightRadius: 2,
  },
  bubblePeer: {
    borderBottomLeftRadius: 2,
    borderWidth: 1,
  },
  text: {
    fontSize: 13,
    lineHeight: 18,
  },
  giftBox: {
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  giftName: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 4,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 4,
  },
  timeText: {
    fontSize: 10,
    fontWeight: '400',
  },
  readStatus: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  // Style Notifikasi Resmi Sistem
  systemCardWrapper: {
    width: '100%',
    paddingHorizontal: 6,
    marginVertical: 6,
  },
  systemCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  systemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingBottom: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(150, 150, 150, 0.2)',
  },
  systemTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  systemOfficialBadge: {
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
    marginLeft: 6,
  },
  systemOfficialText: {
    color: '#000000',
    fontSize: 8,
    fontWeight: '900',
  },
  systemBodyText: {
    fontSize: 13,
    lineHeight: 19,
  },
  reactionBadge: {
    position: 'absolute',
    bottom: -9,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 4,
    zIndex: 5,
  },
  reactionBadgeMe: {
    right: 8,
  },
  reactionBadgePeer: {
    left: 8,
  },
  reactionText: {
    fontSize: 12,
    lineHeight: 16,
  },
});
