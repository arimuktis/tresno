import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { THEME } from '../../../theme/tokens';
import { useAuthStore } from '../stores/useAuthStore';
import { useThemeStore } from '../../../theme/useThemeStore';
import { useTranslation } from '../../../i18n';

import { Sparkles } from 'lucide-react-native';

export const SplashScreen: React.FC = () => {
  const { checkAuthSession } = useAuthStore();
  const { colors } = useThemeStore();
  const { t } = useTranslation();

  useEffect(() => {
    const minTimer = new Promise((resolve) => setTimeout(resolve, 1500));
    Promise.all([checkAuthSession(), minTimer]).catch(() => {});
  }, [checkAuthSession]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.logoCircle,
          {
            backgroundColor: colors.primaryGlow,
            borderColor: colors.primary,
            shadowColor: colors.primary,
          },
        ]}
      >
        <Sparkles size={54} color={colors.primary} />
      </View>

      <Text style={[styles.title, { color: colors.primary }]}>
        {t('common.appName')}
      </Text>
      <Text style={[styles.tagline, { color: colors.textSecondary }]}>
        {t('common.appTagline')}
      </Text>

      <View style={styles.footer}>
        <ActivityIndicator color={colors.primary} size="small" />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          {t('splash.preparing')}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: THEME.spacing.xl,
  },
  logoCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: THEME.spacing.lg,
    borderWidth: 2,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
  },
  logoIcon: {
    fontSize: 54,
  },
  title: {
    fontSize: 36,
    fontWeight: '900',
    letterSpacing: 1,
    marginBottom: THEME.spacing.xs,
  },
  tagline: {
    fontSize: 15,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: THEME.spacing.xl * 2,
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  loadingText: {
    fontSize: 13,
  },
});
