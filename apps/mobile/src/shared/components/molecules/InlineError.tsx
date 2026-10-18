import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  StyleProp,
  ViewStyle,
  TextStyle,
  Platform,
} from 'react-native';
import { AlertCircle, AlertTriangle, Info, CheckCircle2 } from 'lucide-react-native';
import { useThemeStore } from '../../../theme/useThemeStore';

export type InlineErrorVariant = 'error' | 'warning' | 'info' | 'success';

export interface InlineErrorProps {
  message?: string | null;
  variant?: InlineErrorVariant;
  icon?: React.ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  action?: {
    label: string;
    onPress: () => void;
  };
  shake?: boolean;
}

export const InlineError: React.FC<InlineErrorProps> = ({
  message,
  variant = 'error',
  icon,
  containerStyle,
  textStyle,
  action,
  shake = false,
}) => {
  const { colors, isDark } = useThemeStore();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (message) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: Platform.OS !== 'web',
      }).start();

      if (shake) {
        Animated.sequence([
          Animated.timing(shakeAnim, { toValue: -6, duration: 50, useNativeDriver: Platform.OS !== 'web' }),
          Animated.timing(shakeAnim, { toValue: 6, duration: 50, useNativeDriver: Platform.OS !== 'web' }),
          Animated.timing(shakeAnim, { toValue: -4, duration: 50, useNativeDriver: Platform.OS !== 'web' }),
          Animated.timing(shakeAnim, { toValue: 4, duration: 50, useNativeDriver: Platform.OS !== 'web' }),
          Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: Platform.OS !== 'web' }),
        ]).start();
      }
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: Platform.OS !== 'web',
      }).start();
    }
  }, [message, shake]);

  if (!message) return null;

  const getVariantStyles = () => {
    switch (variant) {
      case 'warning':
        return {
          color: colors.gold || '#F59E0B',
          bg: isDark ? 'rgba(245, 158, 11, 0.12)' : '#FEF3C7',
          border: 'rgba(245, 158, 11, 0.3)',
          defaultIcon: <AlertTriangle size={13} color={colors.gold || '#F59E0B'} />,
        };
      case 'info':
        return {
          color: colors.primary || '#FF3366',
          bg: isDark ? 'rgba(255, 51, 102, 0.1)' : '#FDF2F4',
          border: 'rgba(255, 51, 102, 0.25)',
          defaultIcon: <Info size={13} color={colors.primary || '#FF3366'} />,
        };
      case 'success':
        return {
          color: colors.success || '#10B981',
          bg: isDark ? 'rgba(16, 185, 129, 0.12)' : '#D1FAE5',
          border: 'rgba(16, 185, 129, 0.3)',
          defaultIcon: <CheckCircle2 size={13} color={colors.success || '#10B981'} />,
        };
      case 'error':
      default:
        return {
          color: colors.danger || '#EF4444',
          bg: isDark ? 'rgba(239, 68, 68, 0.12)' : '#FEE2E2',
          border: 'rgba(239, 68, 68, 0.35)',
          defaultIcon: <AlertCircle size={13} color={colors.danger || '#EF4444'} />,
        };
    }
  };

  const currentVariant = getVariantStyles();

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: currentVariant.bg,
          borderColor: currentVariant.border,
          opacity: fadeAnim,
          transform: [{ translateX: shakeAnim }],
        },
        containerStyle,
      ]}
    >
      <View style={styles.iconContainer}>
        {icon || currentVariant.defaultIcon}
      </View>

      <Text
        style={[
          styles.messageText,
          { color: currentVariant.color },
          textStyle,
        ]}
      >
        {message}
      </Text>

      {action && (
        <TouchableOpacity
          onPress={action.onPress}
          activeOpacity={0.7}
          style={[styles.actionBtn, { borderColor: currentVariant.color }]}
        >
          <Text style={[styles.actionBtnText, { color: currentVariant.color }]}>
            {action.label}
          </Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 5,
    alignSelf: 'flex-start',
    maxWidth: '100%',
  },
  iconContainer: {
    marginRight: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageText: {
    fontSize: 11.5,
    fontWeight: '600',
    lineHeight: 16,
    flexShrink: 1,
  },
  actionBtn: {
    marginLeft: 8,
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 6,
    borderWidth: 1,
  },
  actionBtnText: {
    fontSize: 10.5,
    fontWeight: '700',
  },
});
