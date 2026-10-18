import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { PhoneIncoming, PhoneCall, ShieldCheck, Megaphone, Crown, Pin } from 'lucide-react-native';
import { useThemeStore } from '../../../theme/useThemeStore';
import { useTranslation } from '../../../i18n';
import { Avatar } from '../atoms/Avatar';
import { formatMessageListTime } from '../../utils/dateTimeUtils';

export interface MessageRowData {
  id: string;
  sender: string;
  avatar: string;
  text: string;
  time: string;
  timestamp?: number;
  unread: boolean;
  unreadCount?: number;
  type: 'chat' | 'call' | 'system';
  isHost?: boolean;
  isOfficial?: boolean;
  isPinned?: boolean;
}

interface MessageItemRowProps {
  item: MessageRowData;
  onPress: (item: MessageRowData) => void;
  onLongPress?: (item: MessageRowData) => void;
  onCallback?: (item: MessageRowData) => void;
  callbackLabel?: string;
  showDivider?: boolean;
  style?: ViewStyle;
}

export const MessageItemRow: React.FC<MessageItemRowProps> = ({
  item,
  onPress,
  onLongPress,
  onCallback,
  callbackLabel,
  showDivider = true,
  style,
}) => {
  const { colors, isDark } = useThemeStore();
  const { t } = useTranslation();
  const finalCallbackLabel = callbackLabel || t('messages.callback');

  const formattedTime = formatMessageListTime(item.timestamp || item.time);
  const isSystem = item.type === 'system' || item.isOfficial;

  const holdTimerRef = React.useRef<any>(null);
  const isHeldRef = React.useRef(false);

  const startHold = () => {
    isHeldRef.current = false;
    if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
    holdTimerRef.current = setTimeout(() => {
      isHeldRef.current = true;
      onLongPress?.(item);
    }, 320);
  };

  const cancelHold = () => {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
  };

  const handlePress = () => {
    if (isHeldRef.current) {
      isHeldRef.current = false;
      return;
    }
    onPress(item);
  };

  const getBadgeIcon = () => {
    if (item.type === 'call') {
      return <PhoneIncoming size={10} color={colors.primary} />;
    }
    if (isSystem) {
      return <ShieldCheck size={10} color={colors.gold} />;
    }
    return undefined;
  };

  return (
    <View style={styles.wrapper}>
      <TouchableOpacity
        activeOpacity={0.65}
        onPress={handlePress}
        onLongPress={() => {
          isHeldRef.current = true;
          onLongPress?.(item);
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
            onLongPress?.(item);
          },
        } as any)}
        style={[
          styles.rowContainer,
          item.isPinned && {
            backgroundColor: isDark ? 'rgba(255, 46, 99, 0.05)' : 'rgba(255, 46, 99, 0.025)',
          },
          isSystem && {
            backgroundColor: isDark ? 'rgba(255, 184, 0, 0.04)' : 'rgba(255, 243, 205, 0.35)',
          },
          style,
        ]}
      >
        {/* Avatar with Status/Type Badge */}
        <View style={styles.avatarContainer}>
          {isSystem ? (
            <View style={[styles.systemAvatarBadge, { backgroundColor: colors.gold, borderColor: colors.background }]}>
              <Megaphone size={20} color="#000000" />
            </View>
          ) : (
            <Avatar
              uri={item.avatar}
              name={item.sender}
              size="md"
              badgeIcon={getBadgeIcon()}
              userId={item.id}
              showOnlineDot={true}
            />
          )}
        </View>

        {/* Middle & Right Content */}
        <View style={styles.contentCol}>
          {/* Top Row: Name + Badges + Exact Time */}
          <View style={styles.topRow}>
            <View style={styles.nameRow}>
              <Text
                style={[
                  styles.senderName,
                  { color: colors.text },
                  item.unread && { fontWeight: '700' },
                ]}
                numberOfLines={1}
              >
                {item.sender}
              </Text>

              {isSystem && (
                <View style={[styles.officialTag, { backgroundColor: colors.gold, borderColor: colors.gold }]}>
                  <Text style={styles.officialTagText}>{t('common.official')}</Text>
                </View>
              )}

              {item.isHost && !isSystem && (
                <View style={styles.hostBadge}>
                  <Crown size={12} color={colors.gold} />
                </View>
              )}
            </View>

            {/* Exact Time/Date Label + Pin indicator */}
            <View style={styles.timeRow}>
              {item.isPinned && (
                <View
                  style={[
                    styles.pinBadge,
                    { backgroundColor: isDark ? 'rgba(255, 46, 99, 0.15)' : 'rgba(255, 46, 99, 0.08)' },
                  ]}
                >
                  <Pin size={10} color={colors.primary} fill={colors.primary} />
                </View>
              )}
              <Text
                style={[
                  styles.timeText,
                  { color: item.unread ? colors.primary : colors.textSecondary },
                  item.unread && { fontWeight: '600' },
                ]}
              >
                {formattedTime}
              </Text>
            </View>
          </View>

          {/* Bottom Row: Message Preview + Unread Count Badge */}
          <View style={styles.bottomRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 10 }}>
              {item.type === 'call' && (
                <PhoneIncoming size={13} color={colors.textSecondary} style={{ marginRight: 4 }} />
              )}
              <Text
                style={[
                  styles.previewText,
                  { color: item.unread ? colors.text : colors.textSecondary },
                  item.unread && styles.previewTextUnread,
                ]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {item.text}
              </Text>
            </View>

            {/* Unread Count Badge */}
            {item.unread && (
              <View style={[styles.unreadBadge, { backgroundColor: colors.primary }]}>
                <Text style={styles.unreadCountText}>
                  {item.unreadCount && item.unreadCount > 1 ? item.unreadCount : ''}
                </Text>
              </View>
            )}
          </View>

          {/* Callback Quick Action for Missed Calls */}
          {item.type === 'call' && onCallback && (
            <TouchableOpacity
              style={[
                styles.callbackBtn,
                { backgroundColor: colors.primaryGlow, borderColor: colors.primary },
              ]}
              onPress={(e) => {
                e.stopPropagation();
                onCallback(item);
              }}
              activeOpacity={0.7}
            >
              <PhoneCall size={12} color={colors.primary} style={{ marginRight: 4 }} />
              <Text style={[styles.callbackBtnText, { color: colors.primary }]}>
                {finalCallbackLabel}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>

      {/* Clean Tigo-style Hairline Divider */}
      {showDivider && (
        <View
          style={[
            styles.dividerLine,
            { backgroundColor: colors.border, marginLeft: 72 },
          ]}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
  },
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    width: '100%',
  },
  avatarContainer: {
    marginRight: 12,
  },
  systemAvatarBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  systemAvatarIcon: {
    fontSize: 22,
  },
  contentCol: {
    flex: 1,
    justifyContent: 'center',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  senderName: {
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  officialTag: {
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
    marginLeft: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  officialTagText: {
    color: '#000000',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  hostBadge: {
    marginLeft: 4,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pinBadge: {
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeText: {
    fontSize: 11,
    fontWeight: '400',
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  previewText: {
    fontSize: 13,
    lineHeight: 18,
    flex: 1,
    marginRight: 10,
  },
  previewTextUnread: {
    fontWeight: '600',
  },
  unreadBadge: {
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  unreadCountText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    lineHeight: 12,
  },
  callbackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 6,
  },
  callbackBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
  dividerLine: {
    height: StyleSheet.hairlineWidth,
    width: '100%',
  },
});
