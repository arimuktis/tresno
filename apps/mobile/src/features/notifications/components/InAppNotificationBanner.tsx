import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Image,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Bell, MessageCircle, Gift, Sparkles, X, ChevronRight } from 'lucide-react-native';
import { THEME } from '../../../theme/tokens';
import { useThemeStore } from '../../../theme/useThemeStore';
import { useNotificationStore } from '../stores/useNotificationStore';
import { useChatStore } from '../../messages/stores/useChatStore';
import { useWalletStore } from '../../wallet/stores/useWalletStore';
import { deepLinkService } from '../../../shared/services/deepLinkService';

export const InAppNotificationBanner: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useThemeStore();
  const { activeBanner, dismissBanner, markAsRead } = useNotificationStore();
  const { openChat } = useChatStore();
  const { openTopupModal } = useWalletStore();

  const translateY = useRef(new Animated.Value(-120)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (activeBanner) {
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: Platform.OS !== 'web',
          tension: 80,
          friction: 9,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: Platform.OS !== 'web',
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: -120,
          duration: 200,
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 150,
          useNativeDriver: Platform.OS !== 'web',
        }),
      ]).start();
    }
  }, [activeBanner]);

  if (!activeBanner) return null;

  const handlePress = () => {
    markAsRead(activeBanner.id);
    dismissBanner();

    // 1. If notification has explicit actionUrl (deep link), route via DeepLinkService!
    if (activeBanner.actionUrl) {
      deepLinkService.handleUrl(activeBanner.actionUrl, 'notification');
      return;
    }

    // 2. Fallback smart routing based on notification type
    switch (activeBanner.type) {
      case 'chat_message':
        if (activeBanner.senderId) {
          deepLinkService.handleUrl(`tresno://chat/${activeBanner.senderId}`, 'notification');
        } else {
          deepLinkService.handleUrl('tresno://messages', 'notification');
        }
        break;
      case 'system_promo':
      case 'wallet_topup':
        deepLinkService.handleUrl('tresno://topup', 'notification');
        break;
      case 'match_found':
        deepLinkService.handleUrl('tresno://match', 'notification');
        break;
      case 'gift_received':
        deepLinkService.handleUrl('tresno://destiny', 'notification');
        break;
      default:
        deepLinkService.handleUrl('tresno://destiny', 'notification');
        break;
    }
  };

  const getIcon = () => {
    switch (activeBanner.type) {
      case 'chat_message':
        return <MessageCircle size={18} color="#FFFFFF" />;
      case 'gift_received':
        return <Gift size={18} color="#FFFFFF" />;
      case 'match_found':
        return <Sparkles size={18} color="#FFFFFF" />;
      case 'system_promo':
      default:
        return <Bell size={18} color="#FFFFFF" />;
    }
  };

  const getIconBg = () => {
    switch (activeBanner.type) {
      case 'chat_message':
        return colors.primary;
      case 'gift_received':
        return '#FFB800';
      case 'match_found':
        return '#00D26A';
      case 'system_promo':
      default:
        return colors.secondary;
    }
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          top: Math.max(insets.top, 12),
          transform: [{ translateY }],
          opacity,
        },
      ]}
      pointerEvents="box-none"
    >
      <TouchableOpacity
        activeOpacity={0.92}
        onPress={handlePress}
        style={[
          styles.bannerCard,
          {
            backgroundColor: isDark ? 'rgba(30, 27, 46, 0.94)' : 'rgba(255, 255, 255, 0.96)',
            borderColor: colors.border,
          },
        ]}
      >
        {/* Avatar or Icon */}
        {activeBanner.avatarUrl ? (
          <Image source={{ uri: activeBanner.avatarUrl }} style={styles.avatar} />
        ) : (
          <View style={[styles.iconWrapper, { backgroundColor: getIconBg() }]}>
            {getIcon()}
          </View>
        )}

        {/* Content */}
        <View style={styles.textContainer}>
          <View style={styles.titleRow}>
            <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
              {activeBanner.title}
            </Text>
            <Text style={[styles.timeText, { color: colors.textSecondary }]}>Baru saja</Text>
          </View>
          <Text style={[styles.body, { color: colors.textSecondary }]} numberOfLines={2}>
            {activeBanner.body}
          </Text>
        </View>

        {/* Action / Dismiss */}
        <TouchableOpacity
          style={styles.dismissBtn}
          onPress={(e) => {
            e.stopPropagation();
            dismissBanner();
          }}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <X size={16} color={colors.textSecondary} />
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 12,
    right: 12,
    zIndex: 9999,
    alignItems: 'center',
  },
  bannerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    maxWidth: 380,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: THEME.borderRadius.lg,
    borderWidth: 1,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 16,
    elevation: 12,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    marginRight: 10,
    borderWidth: 1.5,
    borderColor: THEME.colors.primary,
  },
  iconWrapper: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  textContainer: {
    flex: 1,
    marginRight: 8,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  title: {
    fontSize: 13,
    fontWeight: '700',
    flex: 1,
    marginRight: 6,
  },
  timeText: {
    fontSize: 10,
    fontWeight: '500',
  },
  body: {
    fontSize: 11.5,
    lineHeight: 15,
  },
  dismissBtn: {
    padding: 6,
    borderRadius: 12,
  },
});
