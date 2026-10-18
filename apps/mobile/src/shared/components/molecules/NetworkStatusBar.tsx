import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Platform,
} from 'react-native';
import { Wifi, WifiOff } from 'lucide-react-native';
import { useNetworkStore } from '../../stores/useNetworkStore';
import { useThemeStore } from '../../../theme/useThemeStore';
import { useTranslation } from '../../../i18n';

export const NetworkStatusBar: React.FC = () => {
  const { colors, isDark } = useThemeStore();
  const { t } = useTranslation();
  const { isOnline, isReconnecting, offlineQueueCount, checkConnection } = useNetworkStore();

  const [showRestoredBanner, setShowRestoredBanner] = useState(false);
  const slideAnim = useRef(new Animated.Value(-60)).current;
  const prevOnlineRef = useRef(isOnline);

  useEffect(() => {
    // Deteksi transisi dari offline ke online
    if (!prevOnlineRef.current && isOnline) {
      setShowRestoredBanner(true);
      const timer = setTimeout(() => {
        setShowRestoredBanner(false);
      }, 3500);
      return () => clearTimeout(timer);
    }
    prevOnlineRef.current = isOnline;
  }, [isOnline]);

  const isVisible = !isOnline || showRestoredBanner;

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: isVisible ? 0 : -60,
      useNativeDriver: Platform.OS !== 'web',
      friction: 8,
      tension: 60,
    }).start();
  }, [isVisible, slideAnim]);

  if (!isVisible && !showRestoredBanner) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY: slideAnim }],
          backgroundColor: !isOnline
            ? isDark
              ? 'rgba(239, 68, 68, 0.95)'
              : '#EF4444'
            : isDark
            ? 'rgba(16, 185, 129, 0.95)'
            : '#10B981',
        },
        Platform.OS === 'web' && ({
          backdropFilter: 'blur(16px)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.25)',
        } as any),
      ]}
    >
      <View style={styles.contentRow}>
        {!isOnline ? (
          <WifiOff size={18} color="#FFFFFF" style={{ marginRight: 10 }} />
        ) : (
          <Wifi size={18} color="#FFFFFF" style={{ marginRight: 10 }} />
        )}
        <View style={styles.textCol}>
          <Text style={styles.title}>
            {!isOnline
              ? isReconnecting
                ? t('network.reconnecting')
                : t('network.noConnection')
              : t('network.restored')}
          </Text>
          <Text style={styles.subtitle}>
            {!isOnline
              ? offlineQueueCount > 0
                ? t('network.offlineQueue', { count: offlineQueueCount })
                : t('network.cachedData')
              : t('network.syncing')}
          </Text>
        </View>

        {!isOnline && (
          <TouchableOpacity
            style={styles.retryBtn}
            onPress={() => checkConnection()}
            activeOpacity={0.8}
            disabled={isReconnecting}
          >
            <Text style={styles.retryText}>{isReconnecting ? '...' : t('common.retry')}</Text>
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 99999,
    paddingTop: Platform.OS === 'web' ? 8 : 40,
    paddingBottom: 10,
    paddingHorizontal: 16,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  icon: {
    fontSize: 18,
    marginRight: 10,
  },
  textCol: {
    flex: 1,
  },
  title: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 12,
  },
  subtitle: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 10,
    fontWeight: '500',
    marginTop: 1,
  },
  retryBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    marginLeft: 8,
  },
  retryText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
});
