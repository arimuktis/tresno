import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, ActivityIndicator, Animated, Easing, Platform } from 'react-native';
import { X, AlertTriangle, ChevronLeft, Clock, RotateCw, Globe } from 'lucide-react-native';
import { useAuthStore } from '../stores/useAuthStore';
import { useThemeStore } from '../../../theme/useThemeStore';
import { useTranslation } from '../../../i18n';
import { Button } from '../../../shared/components/atoms/Button';
import { InlineError } from '../../../shared/components/molecules/InlineError';

export const PhoneLoginModal: React.FC = () => {
  const {
    isPhoneModalOpen,
    closePhoneModal,
    phoneStep,
    pendingPhone,
    otpCountdown,
    sendPhoneOtp,
    verifyPhoneOtp,
    isLoading,
    errorMessage,
  } = useAuthStore();

  const { colors } = useThemeStore();
  const { t } = useTranslation();

  const [inputPhone, setInputPhone] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const prevStepRef = useRef(phoneStep);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (phoneStep === prevStepRef.current) return;
    const isForward = phoneStep === 'otp';
    prevStepRef.current = phoneStep;

    slideAnim.setValue(isForward ? 36 : -36);
    fadeAnim.setValue(0);

    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 240,
        easing: Easing.bezier(0.16, 1, 0.3, 1),
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 240,
        easing: Easing.bezier(0.16, 1, 0.3, 1),
        useNativeDriver: Platform.OS !== 'web',
      }),
    ]).start();
  }, [phoneStep]);

  const handleSendOtp = async () => {
    setLocalError(null);
    let clean = inputPhone.trim().replace(/\D/g, '');
    if (clean.startsWith('0')) {
      clean = clean.substring(1);
      setInputPhone(clean);
    }
    if (!clean) {
      setLocalError('Nomor handphone wajib diisi.');
      return;
    }
    if (clean.length < 9) {
      setLocalError('Nomor HP Indonesia minimal 9-13 digit (contoh: 81234567890).');
      return;
    }
    await sendPhoneOtp(clean);
  };

  const handleVerifyOtp = async () => {
    setLocalError(null);
    const cleanOtp = otpCode.trim().replace(/\D/g, '');
    if (cleanOtp.length < 6) {
      setLocalError('Ketik lengkap 6 digit kode OTP verifikasi SMS.');
      return;
    }
    const success = await verifyPhoneOtp(cleanOtp);
    if (success) {
      setInputPhone('');
      setOtpCode('');
    }
  };

  const handleResend = () => {
    if (otpCountdown === 0 && pendingPhone) {
      sendPhoneOtp(pendingPhone);
    }
  };

  return (
    <Modal
      visible={isPhoneModalOpen}
      transparent
      animationType="fade"
      onRequestClose={closePhoneModal}
    >
      <View style={styles.backdrop}>
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
                {phoneStep === 'phone' ? t('auth.phoneModalTitle') : t('auth.otpModalTitle')}
              </Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                {phoneStep === 'phone'
                  ? t('auth.phoneModalSubtitle')
                  : t('auth.otpModalSubtitle', { phone: pendingPhone })}
              </Text>
            </View>
            <TouchableOpacity onPress={closePhoneModal} style={[styles.closeBtn, { backgroundColor: colors.surfaceCard }]}>
              <X size={16} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Animated Container for Phone <-> OTP Step Transitions */}
          <Animated.View style={{ transform: [{ translateX: slideAnim }], opacity: fadeAnim }}>
            {/* STEP 1: Input Nomor HP */}
            {phoneStep === 'phone' && (
              <View style={styles.stepContainer}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>
                  {t('auth.phoneInputLabel')}
                </Text>

                <View
                  style={[
                    styles.phoneInputRow,
                    {
                      backgroundColor: colors.surfaceCard,
                      borderColor: (localError || errorMessage)
                        ? (colors.danger || '#EF4444')
                        : colors.border,
                    },
                  ]}
                >
                  <View style={styles.countryCodeBadge}>
                    <Globe size={14} color={colors.primary} style={{ marginRight: 5 }} />
                    <Text style={[styles.countryCodeText, { color: colors.text }]}>+62</Text>
                  </View>
                  <TextInput
                    style={[styles.phoneTextInput, { color: colors.text }]}
                    placeholder={t('auth.phonePlaceholder')}
                    placeholderTextColor={colors.textSecondary}
                    keyboardType="phone-pad"
                    value={inputPhone}
                    onChangeText={(val) => {
                      setLocalError(null);
                      setInputPhone(val.replace(/\D/g, ''));
                    }}
                    autoFocus
                  />
                </View>

                {/* Inline Error for Phone Input */}
                <InlineError
                  message={localError || errorMessage}
                  variant="error"
                  containerStyle={{ marginTop: 6 }}
                />

                <Text style={[styles.hintText, { color: colors.textSecondary }]}>
                  {t('auth.carrierSupportHint')}
                </Text>

                <Button
                  title={t('auth.btnSendOtp')}
                  size="md"
                  isLoading={isLoading}
                  onPress={handleSendOtp}
                  style={{ marginTop: 18 }}
                />
              </View>
            )}

            {/* STEP 2: Input 6 Digit Kode OTP */}
            {phoneStep === 'otp' && (
              <View style={styles.stepContainer}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={[styles.inputLabel, { color: colors.text }]}>
                    {t('auth.otpCodeLabel')}
                  </Text>
                  <TouchableOpacity
                    onPress={() => {
                      setLocalError(null);
                      useAuthStore.setState({ phoneStep: 'phone' });
                    }}
                    style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 2, paddingHorizontal: 4 }}
                  >
                    <ChevronLeft size={14} color={colors.primary} style={{ marginRight: 2 }} />
                    <Text style={{ fontSize: 12, color: colors.primary, fontWeight: '600' }}>
                      {t('common.back')}
                    </Text>
                  </TouchableOpacity>
                </View>

                <TextInput
                  style={[
                    styles.otpInput,
                    {
                      backgroundColor: colors.surfaceCard,
                      borderColor: (localError || errorMessage)
                        ? (colors.danger || '#EF4444')
                        : colors.primary,
                      color: colors.text,
                    },
                  ]}
                  placeholder={t('auth.otpPlaceholder')}
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="number-pad"
                  maxLength={6}
                  value={otpCode}
                  onChangeText={(val) => {
                    setLocalError(null);
                    setOtpCode(val.replace(/\D/g, ''));
                  }}
                  autoFocus
                />

                {/* Inline Error for OTP Input */}
                <InlineError
                  message={localError || errorMessage}
                  variant="error"
                  containerStyle={{ marginTop: 8, alignSelf: 'center' }}
                />

                <View style={styles.resendRow}>
                  {otpCountdown > 0 ? (
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Clock size={12} color={colors.textSecondary} style={{ marginRight: 4 }} />
                      <Text style={[styles.countdownText, { color: colors.textSecondary }]}>
                        {t('auth.resendIn', { seconds: otpCountdown })}
                      </Text>
                    </View>
                  ) : (
                    <TouchableOpacity onPress={handleResend} style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <RotateCw size={12} color={colors.primary} style={{ marginRight: 4 }} />
                      <Text style={[styles.resendBtnText, { color: colors.primary }]}>
                        {t('auth.resendNow')}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>

                <Button
                  title={t('auth.btnVerifyOtp')}
                  size="md"
                  isLoading={isLoading}
                  onPress={handleVerifyOtp}
                  style={{ marginTop: 16 }}
                />
              </View>
            )}
          </Animated.View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  modalCard: {
    width: '92%',
    maxWidth: 380,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1.5,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 11,
    marginTop: 3,
    lineHeight: 16,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  errorBox: {
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  errorText: {
    fontSize: 12,
    fontWeight: '600',
  },
  stepContainer: {
    marginTop: 4,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
  },
  phoneInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 12,
    height: 50,
  },
  countryCodeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 10,
    borderRightWidth: 1,
    borderRightColor: 'rgba(150, 150, 150, 0.2)',
  },
  countryCodeText: {
    fontSize: 15,
    fontWeight: '700',
  },
  phoneTextInput: {
    flex: 1,
    paddingHorizontal: 10,
    fontSize: 16,
    fontWeight: '600',
  },
  hintText: {
    fontSize: 10,
    marginTop: 6,
  },
  otpInput: {
    height: 52,
    borderRadius: 14,
    borderWidth: 1.5,
    paddingHorizontal: 16,
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 4,
    textAlign: 'center',
  },
  resendRow: {
    alignItems: 'center',
    marginTop: 12,
  },
  countdownText: {
    fontSize: 12,
  },
  resendBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
