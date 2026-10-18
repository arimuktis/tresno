import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useAuthStore } from '../stores/useAuthStore';
import { useThemeStore } from '../../../theme/useThemeStore';
import { useTranslation } from '../../../i18n';
import { Button } from '../../../shared/components/atoms/Button';
import { TextField } from '../../../shared/components/molecules/TextField';
import { X, Mail, Key, Lock, AlertCircle } from 'lucide-react-native';

type TabMode = 'login' | 'register' | 'forgot_password';

export const EmailLoginModal: React.FC = () => {
  const {
    isEmailModalOpen,
    closeEmailModal,
    loginWithEmail,
    registerWithEmail,
    resetPassword,
    isLoading,
    errorMessage,
  } = useAuthStore();

  const { colors, isDark } = useThemeStore();
  const { t } = useTranslation();

  const [mode, setMode] = useState<TabMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Local Validation Errors
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | null>(null);

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setEmailError(null);
    setPasswordError(null);
    setConfirmPasswordError(null);
  };

  const handleClose = () => {
    resetForm();
    setMode('login');
    closeEmailModal();
  };

  const validateEmail = (val: string): boolean => {
    const trimmed = val.trim();
    if (!trimmed) {
      setEmailError(t('auth.emailRequired'));
      return false;
    }
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regex.test(trimmed)) {
      setEmailError(t('auth.emailInvalid'));
      return false;
    }
    setEmailError(null);
    return true;
  };

  const validatePassword = (val: string): boolean => {
    if (!val || val.length < 6) {
      setPasswordError(t('auth.passwordMinLength'));
      return false;
    }
    setPasswordError(null);
    return true;
  };

  const handleSubmit = async () => {
    const isEmailValid = validateEmail(email);

    if (mode === 'forgot_password') {
      if (!isEmailValid) return;
      const success = await resetPassword(email);
      if (success) {
        setMode('login');
      }
      return;
    }

    const isPasswordValid = validatePassword(password);
    if (!isEmailValid || !isPasswordValid) return;

    if (mode === 'register') {
      if (password !== confirmPassword) {
        setConfirmPasswordError(t('auth.confirmPasswordMismatch'));
        return;
      }
      setConfirmPasswordError(null);

      const res = await registerWithEmail(email, password);
      if (res.success) {
        resetForm();
      }
    } else {
      // mode === 'login'
      const success = await loginWithEmail(email, password);
      if (success) {
        resetForm();
      }
    }
  };

  return (
    <Modal
      visible={isEmailModalOpen}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.backdrop}
      >
        <View
          style={[
            styles.modalCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              shadowColor: colors.primary,
            },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.title, { color: colors.text }]}>
                {mode === 'forgot_password'
                  ? t('auth.forgotPassword')
                  : t('auth.emailModalTitle')}
              </Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                {mode === 'forgot_password'
                  ? t('auth.forgotPasswordInstruction')
                  : t('auth.emailModalSubtitle')}
              </Text>
            </View>
            <TouchableOpacity
              onPress={handleClose}
              style={[styles.closeBtn, { backgroundColor: colors.surfaceCard }]}
              activeOpacity={0.7}
            >
              <X size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Tab Switcher: Masuk vs Daftar (Hidden in forgot_password mode) */}
          {mode !== 'forgot_password' ? (
            <View style={[styles.tabBar, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' }]}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => {
                  setMode('login');
                  setPasswordError(null);
                  setConfirmPasswordError(null);
                }}
                style={[
                  styles.tabItem,
                  mode === 'login' && [styles.tabItemActive, { backgroundColor: colors.primary }],
                ]}
              >
                <Text
                  style={[
                    styles.tabItemText,
                    { color: mode === 'login' ? '#FFFFFF' : colors.textSecondary },
                  ]}
                >
                  {t('auth.emailTabLogin')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => {
                  setMode('register');
                  setPasswordError(null);
                  setConfirmPasswordError(null);
                }}
                style={[
                  styles.tabItem,
                  mode === 'register' && [styles.tabItemActive, { backgroundColor: colors.primary }],
                ]}
              >
                <Text
                  style={[
                    styles.tabItemText,
                    { color: mode === 'register' ? '#FFFFFF' : colors.textSecondary },
                  ]}
                >
                  {t('auth.emailTabRegister')}
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              onPress={() => setMode('login')}
              style={styles.backLinkRow}
              activeOpacity={0.7}
            >
              <Text style={[styles.backLinkText, { color: colors.primary }]}>
                ← {t('auth.backToLogin')}
              </Text>
            </TouchableOpacity>
          )}

          {/* Error Banner */}
          {errorMessage && (
            <View style={[styles.errorBox, { backgroundColor: `${colors.danger}18`, borderColor: colors.danger, flexDirection: 'row', alignItems: 'center' }]}>
              <AlertCircle size={15} color={colors.danger} style={{ marginRight: 6 }} />
              <Text style={[styles.errorText, { color: colors.danger, flex: 1 }]}>
                {errorMessage}
              </Text>
            </View>
          )}

          {/* Form Content */}
          <ScrollView
            contentContainerStyle={styles.formScroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Email Field */}
            <TextField
              label={t('auth.emailInputLabel')}
              placeholder={t('auth.emailPlaceholder')}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (emailError) setEmailError(null);
              }}
              error={emailError}
              leftIcon={<Mail size={18} color={colors.textSecondary} />}
              onClear={() => setEmail('')}
            />

            {/* Password Field (only for login or register) */}
            {mode !== 'forgot_password' && (
              <TextField
                label={t('auth.passwordInputLabel')}
                placeholder={t('auth.passwordPlaceholder')}
                isPassword
                autoCapitalize="none"
                autoCorrect={false}
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (passwordError) setPasswordError(null);
                }}
                error={passwordError}
                leftIcon={<Key size={18} color={colors.textSecondary} />}
                containerStyle={{ marginTop: 14 }}
              />
            )}

            {/* Confirm Password Field (only for register) */}
            {mode === 'register' && (
              <TextField
                label={t('auth.confirmPasswordInputLabel')}
                placeholder={t('auth.confirmPasswordPlaceholder')}
                isPassword
                autoCapitalize="none"
                autoCorrect={false}
                value={confirmPassword}
                onChangeText={(text) => {
                  setConfirmPassword(text);
                  if (confirmPasswordError) setConfirmPasswordError(null);
                }}
                error={confirmPasswordError}
                leftIcon={<Lock size={18} color={colors.textSecondary} />}
                containerStyle={{ marginTop: 14 }}
              />
            )}

            {/* Forgot Password Link (only in login mode) */}
            {mode === 'login' && (
              <TouchableOpacity
                onPress={() => setMode('forgot_password')}
                style={styles.forgotPasswordRow}
                activeOpacity={0.7}
              >
                <Text style={[styles.forgotPasswordText, { color: colors.primary }]}>
                  {t('auth.forgotPassword')}
                </Text>
              </TouchableOpacity>
            )}

            {/* Submit Button */}
            <View style={{ marginTop: 22 }}>
              <Button
                title={
                  mode === 'forgot_password'
                    ? t('auth.btnResetPassword')
                    : mode === 'register'
                    ? t('auth.btnEmailRegister')
                    : t('auth.btnEmailLogin')
                }
                variant="primary"
                size="lg"
                isLoading={isLoading}
                onPress={handleSubmit}
              />
            </View>

            {/* Mode switch footer note */}
            {mode === 'login' && (
              <View style={styles.switchModeFooter}>
                <Text style={[styles.switchModeText, { color: colors.textSecondary }]}>
                  {t('auth.noAccountYet')}
                </Text>
                <TouchableOpacity onPress={() => setMode('register')} activeOpacity={0.7}>
                  <Text style={[styles.switchModeLink, { color: colors.primary }]}>
                    {t('auth.registerNewAccount')}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {mode === 'register' && (
              <View style={styles.switchModeFooter}>
                <Text style={[styles.switchModeText, { color: colors.textSecondary }]}>
                  {t('auth.hasAccountAlready')}
                </Text>
                <TouchableOpacity onPress={() => setMode('login')} activeOpacity={0.7}>
                  <Text style={[styles.switchModeLink, { color: colors.primary }]}>
                    {t('auth.loginNow')}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '92%',
    maxWidth: 380,
    maxHeight: '90%',
    borderRadius: 24,
    borderWidth: 1,
    padding: 20,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  title: {
    fontSize: 19,
    fontWeight: '800',
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12.5,
    lineHeight: 17,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  tabBar: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 9,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  tabItemActive: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  tabItemText: {
    fontSize: 13.5,
    fontWeight: '700',
  },
  backLinkRow: {
    marginBottom: 14,
    alignSelf: 'flex-start',
  },
  backLinkText: {
    fontSize: 13,
    fontWeight: '700',
  },
  errorBox: {
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 14,
  },
  errorText: {
    fontSize: 12.5,
    fontWeight: '600',
  },
  formScroll: {
    paddingBottom: 8,
  },
  inputEmoji: {
    fontSize: 16,
  },
  forgotPasswordRow: {
    alignSelf: 'flex-end',
    marginTop: 10,
    paddingVertical: 2,
  },
  forgotPasswordText: {
    fontSize: 12.5,
    fontWeight: '700',
  },
  switchModeFooter: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 18,
    paddingBottom: 4,
  },
  switchModeText: {
    fontSize: 13,
  },
  switchModeLink: {
    fontSize: 13,
    fontWeight: '800',
  },
});
