import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { THEME } from '../../../theme/tokens';
import { useAuthStore } from '../stores/useAuthStore';
import { Button } from '../../../shared/components/atoms/Button';
import { useThemeStore, ACCENT_PALETTES } from '../../../theme/useThemeStore';
import { ThemeSwitcherModal } from '../../../shared/components/molecules/ThemeSwitcherModal';
import { PhoneLoginModal } from './PhoneLoginModal';
import { EmailLoginModal } from './EmailLoginModal';
import { LegalModal } from '../../../shared/components/molecules/LegalModal';
import { useLegalModalStore } from '../../../shared/stores/useLegalModalStore';
import { useTranslation, SUPPORTED_LANGUAGES } from '../../../i18n';
import { LiquidBackgroundGlow } from '../../../shared/components/atoms/LiquidBackgroundGlow';

import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Moon,
  Sun,
  Sliders,
  Sparkles,
  Clock,
  Coins,
  Crown,
  MessageCircle,
  Mail,
  Check,
  AlertTriangle,
  AlertCircle,
  Globe,
} from 'lucide-react-native';

export const LoginScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const {
    loginWithGoogle,
    loginAsGuest,
    openPhoneModal,
    openEmailModal,
    isLoading,
    errorMessage,
  } = useAuthStore();

  const { open: openLegalModal } = useLegalModalStore();

  const { colors, themeMode, accentKey, isDark, openThemeModal } = useThemeStore();
  const { t, currentLanguage } = useTranslation();

  const [hasAgreedTerms, setHasAgreedTerms] = useState(true);
  const [agreementAlert, setAgreementAlert] = useState(false);

  const accentInfo = ACCENT_PALETTES[accentKey](isDark);

  const handleActionWithTerms = (action: () => void) => {
    if (!hasAgreedTerms) {
      setAgreementAlert(true);
      return;
    }
    setAgreementAlert(false);
    action();
  };

  const renderThemeIcon = () => {
    if (themeMode === 'dark') return <Moon size={13} color={colors.text} />;
    if (themeMode === 'light') return <Sun size={13} color={colors.text} />;
    return <Sliders size={13} color={colors.text} />;
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          paddingTop: Math.max(insets.top, 16),
          paddingBottom: Math.max(insets.bottom, 16),
        },
      ]}
    >
      {/* Ambient Liquid Glass Background Glow */}
      <LiquidBackgroundGlow />

      {/* Top Bar with Language & Theme Pill */}
      <View style={styles.topBar}>
        <View />
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={openThemeModal}
          style={[
            styles.themePill,
            {
              backgroundColor: colors.surfaceCard,
              borderColor: colors.border,
            },
          ]}
        >
          <Globe size={13} color={colors.primary} style={{ marginRight: 5 }} />
          <Text style={[styles.langText, { color: colors.textSecondary }]}>
            {currentLanguage.toUpperCase()}
          </Text>
          <View style={{ marginHorizontal: 6 }}>
            {renderThemeIcon()}
          </View>
          <View style={[styles.accentDot, { backgroundColor: colors.primary }]} />
          <Text style={[styles.themePillText, { color: colors.text }]}>
            {accentInfo.name}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Header Visual */}
      <View style={styles.header}>
        <View
          style={[
            styles.badge,
            {
              backgroundColor: colors.primaryGlow,
              borderColor: colors.primary,
            },
          ]}
        >
          <Text style={[styles.badgeText, { color: colors.primary }]}>
            {t('auth.badge')}
          </Text>
        </View>
        <View style={styles.brandTitleRow}>
          <Sparkles size={28} color={colors.primary} style={{ marginRight: 8 }} />
          <Text style={[styles.brandTitle, { color: colors.primary }]}>
            {t('common.appName')}
          </Text>
        </View>
        <Text style={[styles.brandSubtitle, { color: colors.textSecondary }]}>
          {t('auth.brandSubtitle')}
        </Text>
      </View>

      {/* Security Error Banner if any */}
      {errorMessage && (
        <View style={[styles.errorBanner, { backgroundColor: `${colors.danger}18`, borderColor: colors.danger }]}>
          <AlertTriangle size={15} color={colors.danger} style={{ marginRight: 6 }} />
          <Text style={[styles.errorBannerText, { color: colors.danger }]}>
            {errorMessage}
          </Text>
        </View>
      )}

      {/* Feature Highlights */}
      <View
        style={[
          styles.highlightCard,
          {
            backgroundColor: colors.surfaceGlass,
            borderColor: colors.border,
          },
        ]}
      >
        <View style={styles.highlightRow}>
          <View style={[styles.highlightIconWrap, { backgroundColor: `${colors.primary}20` }]}>
            <Clock size={18} color={colors.primary} />
          </View>
          <View style={styles.highlightTextContainer}>
            <Text style={[styles.highlightHeading, { color: colors.text }]}>
              {t('auth.highlightFreeTitle')}
            </Text>
            <Text style={[styles.highlightDesc, { color: colors.textSecondary }]}>
              {t('auth.highlightFreeDesc')}
            </Text>
          </View>
        </View>

        <View style={styles.highlightRow}>
          <View style={[styles.highlightIconWrap, { backgroundColor: `${colors.gold || '#F59E0B'}20` }]}>
            <Coins size={18} color={colors.gold || '#F59E0B'} />
          </View>
          <View style={styles.highlightTextContainer}>
            <Text style={[styles.highlightHeading, { color: colors.text }]}>
              {t('auth.highlightTopupTitle')}
            </Text>
            <Text style={[styles.highlightDesc, { color: colors.textSecondary }]}>
              {t('auth.highlightTopupDesc')}
            </Text>
          </View>
        </View>

        <View style={styles.highlightRow}>
          <View style={[styles.highlightIconWrap, { backgroundColor: `${colors.gold || '#F59E0B'}20` }]}>
            <Crown size={18} color={colors.gold || '#F59E0B'} />
          </View>
          <View style={styles.highlightTextContainer}>
            <Text style={[styles.highlightHeading, { color: colors.text }]}>
              {t('auth.highlightHostTitle')}
            </Text>
            <Text style={[styles.highlightDesc, { color: colors.textSecondary }]}>
              {t('auth.highlightHostDesc')}
            </Text>
          </View>
        </View>
      </View>

      {/* Login Action Buttons */}
      <View style={styles.actionSection}>
        {/* 1. Google OAuth Button */}
        <Button
          variant="white"
          size="md"
          fullWidth
          isLoading={isLoading}
          onPress={() => handleActionWithTerms(loginWithGoogle)}
          leftIcon={<Sparkles size={18} color="#EA4335" />}
          title={t('auth.loginGoogle')}
          style={{ marginBottom: 10 }}
        />

        {/* 2. WhatsApp / Phone OTP Button */}
        <Button
          variant="success"
          size="md"
          fullWidth
          isLoading={isLoading}
          onPress={() => handleActionWithTerms(openPhoneModal)}
          leftIcon={<MessageCircle size={18} color="#FFFFFF" />}
          title={t('auth.loginPhone')}
          style={{ marginBottom: 10 }}
        />

        {/* 3. Email & Password Login Button (ala Tigo) */}
        <Button
          variant="glass"
          size="md"
          fullWidth
          isLoading={isLoading}
          onPress={() => handleActionWithTerms(openEmailModal)}
          leftIcon={<Mail size={18} color={colors.text} />}
          title={t('auth.loginEmail')}
          style={{ marginBottom: 10 }}
        />

        {/* 4. Quick Guest Access Button (Tigo Quick Start) */}
        <Button
          variant="outline"
          size="md"
          fullWidth
          isLoading={isLoading}
          onPress={() => handleActionWithTerms(loginAsGuest)}
          title={t('auth.loginGuest')}
        />

        {/* Checkbox Persetujuan Syarat & Ketentuan (18+) ala Tigo */}
        <View style={styles.termsRow}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => {
              setHasAgreedTerms(!hasAgreedTerms);
              setAgreementAlert(false);
            }}
            style={[
              styles.checkboxBox,
              {
                borderColor: hasAgreedTerms ? colors.primary : colors.border,
                backgroundColor: hasAgreedTerms ? colors.primary : 'transparent',
              },
            ]}
          >
            {hasAgreedTerms && <Check size={12} color="#FFFFFF" strokeWidth={3} />}
          </TouchableOpacity>

          <Text style={[styles.termsText, { color: colors.textSecondary }]}>
            {currentLanguage === 'en' ? 'By signing in, you agree to ' : 'Dengan masuk, kamu menyetujui '}
            <Text
              style={[styles.linkText, { color: colors.primary }]}
              onPress={() => openLegalModal('terms')}
            >
              {t('auth.termsAgreementLink')}
            </Text>
            {' & '}
            <Text
              style={[styles.linkText, { color: colors.primary }]}
              onPress={() => openLegalModal('privacy')}
            >
              {t('auth.privacyAgreementLink')}
            </Text>
            {'. '}
            {t('auth.ageRequirement')}
          </Text>
        </View>

        {agreementAlert && (
          <View style={styles.alertTermsRow}>
            <AlertCircle size={13} color={colors.danger} style={{ marginRight: 4 }} />
            <Text style={[styles.alertTermsText, { color: colors.danger }]}>
              {t('auth.agreeTermsError')}
            </Text>
          </View>
        )}
      </View>

      {/* Phone OTP Modal */}
      <PhoneLoginModal />

      {/* Email & Password Login Modal (ala Tigo) */}
      <EmailLoginModal />

      {/* Terms of Service & Privacy Policy Modal */}
      <LegalModal onAgree={() => setHasAgreedTerms(true)} />

      {/* Theme & Language Switcher Modal */}
      <ThemeSwitcherModal />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: THEME.spacing.lg,
    justifyContent: 'space-between',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
  },
  themePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
  },
  accentDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  themePillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  header: {
    marginTop: 6,
    alignItems: 'center',
  },
  badge: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: THEME.borderRadius.full,
    borderWidth: 1,
    marginBottom: 14,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  brandTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  brandTitle: {
    fontSize: 34,
    fontWeight: '900',
  },
  brandSubtitle: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 8,
  },
  langText: {
    fontSize: 12,
    fontWeight: '700',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    marginVertical: 4,
  },
  errorBannerText: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  highlightCard: {
    borderRadius: THEME.borderRadius.md,
    padding: THEME.spacing.md,
    borderWidth: 1,
    marginVertical: THEME.spacing.sm,
    gap: 12,
  },
  highlightRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  highlightIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  highlightTextContainer: {
    flex: 1,
  },
  highlightHeading: {
    fontSize: 14,
    fontWeight: '700',
  },
  highlightDesc: {
    fontSize: 12,
    marginTop: 2,
  },
  actionSection: {
    marginBottom: 10,
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingHorizontal: 4,
  },
  checkboxBox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  checkmarkText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold',
  },
  termsText: {
    flex: 1,
    fontSize: 11,
    lineHeight: 15,
  },
  linkText: {
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  alertTermsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  alertTermsText: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
});
