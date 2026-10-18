import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
  Animated,
  Easing,
  Platform,
} from 'react-native';
import {
  User,
  Sparkles,
  Camera,
  MapPin,
  ShieldCheck,
  CheckCircle,
  ChevronLeft,
  Dices,
} from 'lucide-react-native';
import { THEME } from '../../../theme/tokens';
import { Gender } from '@tresno/shared';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '../../auth/stores/useAuthStore';
import { Button } from '../../../shared/components/atoms/Button';
import { ButtonChip } from '../../../shared/components/atoms/Chip';
import { useThemeStore } from '../../../theme/useThemeStore';
import { useTranslation } from '../../../i18n';
import { StepProgressBar } from '../../../shared/components/molecules/StepProgressBar';
import { InlineError } from '../../../shared/components/molecules/InlineError';
import { toast } from '../../../shared/stores/useToastStore';

// Pilihan avatar preset khas Tigo
const AVATAR_PRESETS_FEMALE = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
];

const AVATAR_PRESETS_MALE = [
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
];

const INDO_CITIES = ['Jakarta', 'Bandung', 'Surabaya', 'Medan', 'Semarang', 'Yogyakarta', 'Bali', 'Makassar'];

const PERSONAL_TAGS = ['Ramah & Ceria', 'Pendengar Setia', 'Humoris', 'Suka Nyanyi', 'Gamer Girl', 'Teman Ngopi'];

export const OnboardingScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { completeOnboarding } = useAuthStore();
  const { colors, isDark } = useThemeStore();
  const { t } = useTranslation();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const prevStepRef = useRef<1 | 2 | 3>(1);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;

  // Animasi horizontal slide antar step (1 <-> 2 <-> 3)
  useEffect(() => {
    if (step === prevStepRef.current) return;
    const isForward = step > prevStepRef.current;
    prevStepRef.current = step;

    slideAnim.setValue(isForward ? 40 : -40);
    fadeAnim.setValue(0);

    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 250,
        easing: Easing.bezier(0.16, 1, 0.3, 1),
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 250,
        easing: Easing.bezier(0.16, 1, 0.3, 1),
        useNativeDriver: Platform.OS !== 'web',
      }),
    ]).start();
  }, [step]);

  // Step 1: Gender & Role (Pria vs Host Wanita)
  // Step 2: Info Dasar (Foto Profil, Nickname, Tanggal Lahir, Kota - ala AddUserInfo Tigo)
  // Step 3: KYC Sertifikasi Anchor / Host (Khusus Wanita ala goddessCertification Tigo)

  const [gender, setGender] = useState<Gender>('male');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATAR_PRESETS_MALE[0]);
  const [nickname, setNickname] = useState('');
  const [birthYear, setBirthYear] = useState('2002');
  const [city, setCity] = useState('Jakarta');

  // Khusus Host Wanita (KYC ala Tigo goddessCertification)
  const [hostRegType, setHostRegType] = useState<'independent' | 'agency'>('agency');
  const [agencyCode, setAgencyCode] = useState('');
  const [selectedTag, setSelectedTag] = useState(PERSONAL_TAGS[0]);
  const [intro, setIntro] = useState('');
  const [isKycSelfieVerified, setIsKycSelfieVerified] = useState(false);

  const isFemale = gender === 'female';
  const currentYear = new Date().getFullYear();
  const parsedBirthYear = parseInt(birthYear, 10);
  const calculatedAge = currentYear - (parsedBirthYear || 2002);

  const [nicknameTouched, setNicknameTouched] = useState(false);
  const [birthYearTouched, setBirthYearTouched] = useState(false);
  const [step2Attempted, setStep2Attempted] = useState(false);
  const [step3Attempted, setStep3Attempted] = useState(false);

  // Validation calculations
  let nicknameError: string | null = null;
  if (step2Attempted || nicknameTouched) {
    const trimmed = nickname.trim();
    if (!trimmed) {
      nicknameError = 'Nama panggilan tidak boleh kosong.';
    } else if (trimmed.length < 3) {
      nicknameError = 'Nama panggilan minimal 3 karakter.';
    } else if (trimmed.length > 25) {
      nicknameError = 'Nama panggilan maksimal 25 karakter.';
    }
  }

  let birthYearError: string | null = null;
  if (step2Attempted || birthYearTouched) {
    if (!birthYear.trim()) {
      birthYearError = 'Tahun kelahiran wajib diisi (contoh: 2002).';
    } else if (isNaN(parsedBirthYear) || birthYear.length !== 4 || parsedBirthYear < 1940 || parsedBirthYear > currentYear) {
      birthYearError = `Masukkan tahun lahir yang valid (1940 - ${currentYear}).`;
    } else if (currentYear - parsedBirthYear < 18) {
      birthYearError = 'Pengguna harus berusia minimal 18 tahun untuk menggunakan Tresno.';
    }
  }

  let agencyCodeError: string | null = null;
  if (isFemale && hostRegType === 'agency' && (step3Attempted || agencyCode.length > 0)) {
    if (!agencyCode.trim()) {
      agencyCodeError = 'Kode agensi resmi wajib diisi.';
    } else if (agencyCode.trim().length < 3) {
      agencyCodeError = 'Kode agensi minimal 3 karakter (contoh: TRESNO-AG1).';
    }
  }

  let kycSelfieWarning: string | null = null;
  if (isFemale && step3Attempted && !isKycSelfieVerified) {
    kycSelfieWarning = 'Verifikasi foto selfie wajah wajib diselesaikan untuk sertifikasi host resmi.';
  }

  // Toggle gender otomatis ganti preset avatar
  const handleSelectGender = (g: Gender) => {
    setGender(g);
    setSelectedAvatar(g === 'female' ? AVATAR_PRESETS_FEMALE[0] : AVATAR_PRESETS_MALE[0]);
  };

  // Generate random nickname unik ala Tigo
  const handleRandomNickname = () => {
    const prefixes = isFemale ? ['Dewi', 'Bella', 'Siti', 'Mawar', 'Nadia', 'Putri', 'Luna'] : ['Rian', 'Bayu', 'Dimas', 'Adit', 'Gilang', 'Rafi'];
    const suffixes = ['Tresno', 'Ceria', 'Manis', 'Keren', 'Bintang', 'Kece'];
    const random = `${prefixes[Math.floor(Math.random() * prefixes.length)]} ${suffixes[Math.floor(Math.random() * suffixes.length)]}`;
    setNickname(random);
    setNicknameTouched(true);
  };

  const handleNextFromStep1 = () => {
    if (!nickname) handleRandomNickname();
    setStep(2);
  };

  const handleNextFromStep2 = () => {
    setStep2Attempted(true);
    const trimmed = nickname.trim();
    const isNickValid = trimmed.length >= 3 && trimmed.length <= 25;
    const isYearValid =
      !isNaN(parsedBirthYear) &&
      birthYear.length === 4 &&
      parsedBirthYear >= 1940 &&
      currentYear - parsedBirthYear >= 18;

    if (!isNickValid || !isYearValid) {
      toast.warning('Silakan periksa dan perbaiki data profil Anda.');
      return;
    }

    if (isFemale) {
      setStep(3);
    } else {
      handleFinish();
    }
  };

  const handleFinish = () => {
    if (isFemale) {
      setStep3Attempted(true);
      if (hostRegType === 'agency' && (!agencyCode.trim() || agencyCode.trim().length < 3)) {
        toast.warning('Masukkan kode agensi resmi yang valid.');
        return;
      }
      if (!isKycSelfieVerified) {
        toast.warning('Silakan lakukan verifikasi foto selfie wajah terlebih dahulu.');
        return;
      }
    }

    const rawName = nickname.trim() || (isFemale ? 'Host Cantik' : 'Member Tresno');
    const finalNickname = rawName.replace(/_/g, ' ');
    const age = Math.max(18, calculatedAge);

    completeOnboarding({
      nickname: finalNickname,
      gender,
      age,
      isHost: isFemale,
      agencyCode: isFemale && hostRegType === 'agency' ? agencyCode.trim().toUpperCase() : undefined,
    });
  };

  return (
    <ScrollView
      contentContainerStyle={[styles.scrollContainer, { backgroundColor: colors.background }]}
      bounces={false}
      keyboardShouldPersistTaps="handled"
    >
      <View
        style={[
          styles.container,
          {
            paddingTop: Math.max(insets.top, 16),
            paddingBottom: Math.max(insets.bottom, 16),
          },
        ]}
      >
        {/* Top Bar with Back Icon & Full Screen StepProgressBar */}
        <View style={styles.topBar}>
          {step > 1 && (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setStep((prev) => (prev > 1 ? ((prev - 1) as 1 | 2 | 3) : 1))}
              style={[
                styles.backIconButton,
                {
                  backgroundColor: colors.surfaceCard,
                  borderColor: colors.border,
                },
              ]}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              accessibilityLabel={t('common.back')}
            >
              <ChevronLeft size={22} color={colors.text} />
            </TouchableOpacity>
          )}

          <View style={styles.progressContainer}>
            <StepProgressBar totalSteps={isFemale ? 3 : 2} currentStep={step} />
          </View>
        </View>

        {/* Animated Container for Wizard Step Transitions */}
        <Animated.View
          style={[
            styles.animatedWrapper,
            { transform: [{ translateX: slideAnim }], opacity: fadeAnim },
          ]}
        >
          {/* ============================================================ */}
          {/* STEP 1: GENDER SELECTION (Pria vs Wanita)                     */}
          {/* ============================================================ */}
          {step === 1 && (
            <View style={styles.stepContent}>
              <View style={styles.stepBody}>
                <View style={styles.header}>
                  <Text style={[styles.stepBadge, { color: colors.primary }]}>
                    {t('onboarding.step1Badge')}
                  </Text>
                  <Text style={[styles.title, { color: colors.text }]}>
                    {t('onboarding.step1Title')}
                  </Text>
                  <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                    {t('onboarding.step1Desc')}
                  </Text>
                </View>

                <View style={styles.genderCardRow}>
                  {/* Card Pria */}
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => handleSelectGender('male')}
                    style={[
                      styles.genderCard,
                      {
                        backgroundColor: colors.surfaceGlass,
                        borderColor: gender === 'male' ? colors.secondary : colors.border,
                      },
                      gender === 'male' && { backgroundColor: `${colors.secondary}1A` },
                    ]}
                  >
                    <User size={44} color={gender === 'male' ? colors.secondary : colors.textSecondary} style={{ marginBottom: 12 }} />
                    <Text style={[styles.genderTitle, { color: colors.text }]}>
                      {t('onboarding.maleTitle')}
                    </Text>
                    <Text style={[styles.genderRole, { color: colors.textSecondary }]}>
                      {t('onboarding.maleRole')}
                    </Text>
                  </TouchableOpacity>

                  {/* Card Wanita (Anchor/Host) */}
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => handleSelectGender('female')}
                    style={[
                      styles.genderCard,
                      {
                        backgroundColor: colors.surfaceGlass,
                        borderColor: gender === 'female' ? colors.primary : colors.border,
                      },
                      gender === 'female' && { backgroundColor: colors.primaryGlow },
                    ]}
                  >
                    <Sparkles size={44} color={gender === 'female' ? colors.primary : colors.textSecondary} style={{ marginBottom: 12 }} />
                    <Text style={[styles.genderTitle, { color: colors.text }]}>
                      {t('onboarding.femaleTitle')}
                    </Text>
                    <Text style={[styles.genderRole, { color: colors.textSecondary }]}>
                      {t('onboarding.femaleRole')}
                    </Text>
                  </TouchableOpacity>
                </View>

                {isFemale && (
                  <View
                    style={[
                      styles.femaleNoticeBox,
                      {
                        backgroundColor: colors.primaryGlow,
                        borderColor: `${colors.primary}40`,
                      },
                    ]}
                  >
                    <Text style={[styles.femaleNoticeTitle, { color: colors.primary }]}>
                      {t('onboarding.femaleNoticeTitle')}
                    </Text>
                    <Text style={[styles.femaleNoticeText, { color: colors.textSecondary }]}>
                      {t('onboarding.femaleNoticeDesc')}
                    </Text>
                  </View>
                )}
              </View>

              {/* Action Button - Gravity Bottom */}
              <View style={styles.bottomActionContainer}>
                <Button
                  title={t('onboarding.btnContinueStep2')}
                  size="lg"
                  fullWidth
                  hasChevron
                  onPress={handleNextFromStep1}
                />
              </View>
            </View>
          )}

          {/* ============================================================ */}
          {/* STEP 2: SETUP FOTO PROFIL & INFO DASAR (Ala AddUserInfo Tigo) */}
          {/* ============================================================ */}
          {step === 2 && (
            <View style={styles.stepContent}>
              <View style={styles.stepBody}>
                <View style={styles.header}>
                  <Text style={[styles.stepBadge, { color: colors.primary }]}>
                    {t('onboarding.step2Badge')}
                  </Text>
                  <Text style={[styles.title, { color: colors.text }]}>
                    {t('onboarding.step2Title')}
                  </Text>
                  <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                    {t('onboarding.step2Desc')}
                  </Text>
                </View>

                {/* Foto Profil Utama dengan Avatar Picker */}
                <View style={styles.avatarMainSection}>
                  <View style={[styles.mainAvatarWrapper, { borderColor: colors.primary }]}>
                    <Image source={{ uri: selectedAvatar }} style={styles.mainAvatarImage} />
                    <View style={[styles.cameraBadge, { backgroundColor: colors.primary, borderColor: colors.background }]}>
                      <Camera size={14} color="#FFFFFF" />
                    </View>
                  </View>

                  <Text style={[styles.selectAvatarLabel, { color: colors.textSecondary }]}>
                    {t('onboarding.avatarPickerLabel')}
                  </Text>
                  <View style={styles.avatarPresetRow}>
                    {(isFemale ? AVATAR_PRESETS_FEMALE : AVATAR_PRESETS_MALE).map((url, idx) => (
                      <TouchableOpacity
                        key={idx}
                        onPress={() => setSelectedAvatar(url)}
                        style={[
                          styles.avatarThumbWrapper,
                          {
                            borderColor: selectedAvatar === url ? colors.primary : 'transparent',
                          },
                        ]}
                      >
                        <Image source={{ uri: url }} style={styles.avatarThumbImage} />
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Input Form */}
                <View style={styles.formContainer}>
                  {/* Nickname dengan Tombol Dadu Acak */}
                  <View style={styles.formGroup}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text style={[styles.inputLabel, { color: colors.text }]}>
                        {t('onboarding.nicknameLabel')}
                      </Text>
                      <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={handleRandomNickname}
                        style={[styles.diceButton, { backgroundColor: `${colors.gold}25` }]}
                      >
                        <Dices size={13} color={colors.gold} style={{ marginRight: 4 }} />
                        <Text style={[styles.diceText, { color: colors.gold }]}>
                          {t('onboarding.randomNameBtn')}
                        </Text>
                      </TouchableOpacity>
                    </View>
                    <TextInput
                      style={[
                        styles.textInput,
                        {
                          backgroundColor: colors.surfaceCard,
                          borderColor: nicknameError ? (colors.danger || '#EF4444') : colors.border,
                          color: colors.text,
                        },
                      ]}
                      placeholder={t('onboarding.nicknamePlaceholder')}
                      placeholderTextColor={colors.textSecondary}
                      value={nickname}
                      onChangeText={(val) => {
                        setNickname(val);
                        setNicknameTouched(true);
                      }}
                      onBlur={() => setNicknameTouched(true)}
                    />
                    <InlineError
                      message={nicknameError}
                      variant="error"
                      containerStyle={{ marginTop: 4 }}
                    />
                  </View>

                  {/* Tanggal Lahir / Tahun (Wajib 18+) */}
                  <View style={styles.formGroup}>
                    <Text style={[styles.inputLabel, { color: colors.text }]}>
                      {t('onboarding.birthYearLabel')}
                    </Text>
                    <TextInput
                      style={[
                        styles.textInput,
                        {
                          backgroundColor: colors.surfaceCard,
                          borderColor: birthYearError ? (colors.danger || '#EF4444') : colors.border,
                          color: colors.text,
                        },
                      ]}
                      keyboardType="numeric"
                      placeholder="2002"
                      placeholderTextColor={colors.textSecondary}
                      value={birthYear}
                      onChangeText={(val) => {
                        setBirthYear(val.replace(/\D/g, ''));
                        setBirthYearTouched(true);
                      }}
                      onBlur={() => setBirthYearTouched(true)}
                      maxLength={4}
                    />
                    <InlineError
                      message={birthYearError}
                      variant="error"
                      containerStyle={{ marginTop: 4 }}
                    />
                    {!birthYearError && (
                      <Text style={[styles.inputHint, { color: colors.textSecondary }]}>
                        {t('onboarding.calculatedAge', { age: calculatedAge })}
                      </Text>
                    )}
                  </View>

                  {/* Pilihan Kota di Indonesia (Flex Wrap Grid Rapih Tanpa Kepotong) */}
                  <View style={styles.formGroup}>
                    <Text style={[styles.inputLabel, { color: colors.text }]}>
                      {t('onboarding.cityLabel')}
                    </Text>
                    <View style={styles.cityGrid}>
                      {INDO_CITIES.map((c) => (
                        <ButtonChip
                          key={c}
                          label={c}
                          icon={MapPin}
                          selected={city === c}
                          onPress={() => setCity(c)}
                          size="sm"
                        />
                      ))}
                    </View>
                  </View>
                </View>
              </View>

              {/* Action Button - Gravity Bottom Full Width */}
              <View style={styles.bottomActionContainer}>
                <Button
                  title={isFemale ? t('onboarding.btnContinueStep3') : t('onboarding.btnFinishMale')}
                  variant="primary"
                  size="lg"
                  fullWidth
                  hasChevron
                  onPress={handleNextFromStep2}
                />
              </View>
            </View>
          )}

          {/* ============================================================ */}
          {/* STEP 3: SERTIFIKASI ANCHOR & KYC (Khusus Host Wanita Tigo)   */}
          {/* ============================================================ */}
          {step === 3 && isFemale && (
            <View style={styles.stepContent}>
              <View style={styles.stepBody}>
                <View style={styles.header}>
                  <Text style={[styles.stepBadge, { color: colors.primary }]}>
                    {t('onboarding.step3Badge')}
                  </Text>
                  <Text style={[styles.title, { color: colors.text }]}>
                    {t('onboarding.step3Title')}
                  </Text>
                  <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                    {t('onboarding.step3Desc')}
                  </Text>
                </View>

                {/* Kotak KYC Liveness Selfie Test */}
                <View
                  style={[
                    styles.kycCard,
                    {
                      backgroundColor: colors.surfaceCard,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <View style={styles.kycHeaderRow}>
                    <ShieldCheck size={28} color={colors.primary} style={{ marginRight: 10 }} />
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.kycCardTitle, { color: colors.text }]}>
                        {t('onboarding.kycTitle')}
                      </Text>
                      <Text style={[styles.kycCardDesc, { color: colors.textSecondary }]}>
                        {t('onboarding.kycDesc')}
                      </Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => setIsKycSelfieVerified(true)}
                    style={[
                      styles.selfieUploadBox,
                      {
                        backgroundColor: colors.background,
                        borderColor: isKycSelfieVerified ? colors.success : colors.border,
                      },
                      isKycSelfieVerified && {
                        backgroundColor: `${colors.success}18`,
                        borderStyle: 'solid',
                      },
                    ]}
                  >
                    {isKycSelfieVerified ? (
                      <CheckCircle size={32} color={colors.success} style={{ marginBottom: 6 }} />
                    ) : (
                      <Camera size={32} color={colors.textSecondary} style={{ marginBottom: 6 }} />
                    )}
                    <Text style={[styles.selfieUploadText, { color: colors.text }]}>
                      {isKycSelfieVerified
                        ? t('onboarding.kycVerified')
                        : t('onboarding.kycUnverified')}
                    </Text>
                  </TouchableOpacity>

                  <InlineError
                    message={kycSelfieWarning}
                    variant="warning"
                    containerStyle={{ marginTop: 8, alignSelf: 'center' }}
                  />
                </View>

                {/* Model Pendaftaran Hybrid: Agensi vs Mandiri */}
                <View
                  style={[
                    styles.hostHybridBox,
                    {
                      backgroundColor: colors.surfaceCard,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <Text style={[styles.inputLabel, { color: colors.text }]}>
                    {t('onboarding.hostTypeLabel')}
                  </Text>
                  <View style={[styles.hybridTabContainer, { backgroundColor: colors.background }]}>
                    <TouchableOpacity
                      style={[
                        styles.hybridTab,
                        hostRegType === 'agency' && { backgroundColor: colors.primary },
                      ]}
                      onPress={() => setHostRegType('agency')}
                    >
                      <Text
                        style={[
                          styles.hybridTabText,
                          { color: hostRegType === 'agency' ? '#FFFFFF' : colors.textSecondary },
                        ]}
                      >
                        {t('onboarding.hostTypeAgency')}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.hybridTab,
                        hostRegType === 'independent' && { backgroundColor: colors.primary },
                      ]}
                      onPress={() => setHostRegType('independent')}
                    >
                      <Text
                        style={[
                          styles.hybridTabText,
                          { color: hostRegType === 'independent' ? '#FFFFFF' : colors.textSecondary },
                        ]}
                      >
                        {t('onboarding.hostTypeIndependent')}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {hostRegType === 'agency' ? (
                    <View style={{ marginTop: 8 }}>
                      <TextInput
                        style={[
                          styles.textInput,
                          {
                            backgroundColor: colors.background,
                            borderColor: agencyCodeError ? (colors.danger || '#EF4444') : colors.border,
                            color: colors.text,
                          },
                        ]}
                        placeholder={t('onboarding.agencyCodePlaceholder')}
                        placeholderTextColor={colors.textSecondary}
                        value={agencyCode}
                        onChangeText={setAgencyCode}
                        autoCapitalize="characters"
                      />
                      <InlineError
                        message={agencyCodeError}
                        variant="error"
                        containerStyle={{ marginTop: 4 }}
                      />
                      {!agencyCodeError && (
                        <Text style={[styles.inputHint, { color: colors.textSecondary }]}>
                          {t('onboarding.agencyHint')}
                        </Text>
                      )}
                    </View>
                  ) : (
                    <Text style={[styles.inputHint, { color: colors.textSecondary }]}>
                      {t('onboarding.independentHint')}
                    </Text>
                  )}
                </View>

                {/* Personal Tags ala Tigo personalTag */}
                <View style={{ marginTop: 14 }}>
                  <Text style={[styles.inputLabel, { color: colors.text }]}>
                    {t('onboarding.tagsLabel')}
                  </Text>
                  <View style={styles.tagGrid}>
                    {PERSONAL_TAGS.map((tag) => (
                      <ButtonChip
                        key={tag}
                        label={tag}
                        selected={selectedTag === tag}
                        onPress={() => setSelectedTag(tag)}
                        size="md"
                      />
                    ))}
                  </View>
                </View>

                {/* Bio Perkenalan Singkat */}
                <View style={{ marginTop: 14 }}>
                  <Text style={[styles.inputLabel, { color: colors.text }]}>
                    {t('onboarding.bioLabel')}
                  </Text>
                  <TextInput
                    style={[
                      styles.textInput,
                      {
                        height: 60,
                        backgroundColor: colors.surfaceCard,
                        borderColor: colors.border,
                        color: colors.text,
                      },
                    ]}
                    multiline
                    placeholder={t('onboarding.bioPlaceholder')}
                    placeholderTextColor={colors.textSecondary}
                    value={intro}
                    onChangeText={setIntro}
                  />
                </View>
              </View>

              {/* Action Button - Gravity Bottom Full Width */}
              <View style={styles.bottomActionContainer}>
                <Button
                  title={t('onboarding.btnFinishFemale')}
                  variant="primary"
                  size="lg"
                  fullWidth
                  hasChevron
                  onPress={handleFinish}
                />
              </View>
            </View>
          )}
        </Animated.View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: THEME.spacing.lg,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    minHeight: 40,
  },
  backIconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  progressContainer: {
    flex: 1,
  },
  animatedWrapper: {
    flex: 1,
  },
  stepContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  stepBody: {
    flex: 1,
  },
  bottomActionContainer: {
    marginTop: 28,
  },
  header: {
    marginBottom: 16,
  },
  stepBadge: {
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 18,
  },
  genderCardRow: {
    flexDirection: 'row',
    gap: 12,
    marginVertical: 14,
  },
  genderCard: {
    flex: 1,
    borderWidth: 2,
    borderRadius: THEME.borderRadius.lg,
    padding: THEME.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 130,
  },
  genderTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  genderRole: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  femaleNoticeBox: {
    borderRadius: THEME.borderRadius.md,
    padding: 12,
    borderWidth: 1,
    marginTop: 12,
  },
  femaleNoticeTitle: {
    fontWeight: 'bold',
    fontSize: 13,
    marginBottom: 4,
  },
  femaleNoticeText: {
    fontSize: 12,
    lineHeight: 16,
  },
  avatarMainSection: {
    alignItems: 'center',
    marginVertical: 14,
  },
  mainAvatarWrapper: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    position: 'relative',
    marginBottom: 12,
  },
  mainAvatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  selectAvatarLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
  },
  avatarPresetRow: {
    flexDirection: 'row',
    gap: 12,
  },
  avatarThumbWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    overflow: 'hidden',
  },
  avatarThumbImage: {
    width: '100%',
    height: '100%',
  },
  formContainer: {
    marginVertical: 10,
  },
  formGroup: {
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 6,
  },
  diceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: THEME.borderRadius.full,
  },
  diceText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  textInput: {
    borderWidth: 1,
    borderRadius: THEME.borderRadius.sm,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
  },
  inputHint: {
    fontSize: 11,
    marginTop: 4,
  },
  cityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  kycCard: {
    borderRadius: THEME.borderRadius.md,
    padding: THEME.spacing.md,
    borderWidth: 1,
    marginBottom: 12,
  },
  kycHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  kycCardTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  kycCardDesc: {
    fontSize: 11,
    marginTop: 2,
  },
  selfieUploadBox: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: THEME.borderRadius.md,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selfieUploadText: {
    fontSize: 12,
    fontWeight: '700',
  },
  hostHybridBox: {
    borderRadius: THEME.borderRadius.md,
    padding: 12,
    borderWidth: 1,
  },
  hybridTabContainer: {
    flexDirection: 'row',
    borderRadius: THEME.borderRadius.full,
    padding: 3,
    marginTop: 6,
  },
  hybridTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: THEME.borderRadius.full,
  },
  hybridTabText: {
    fontSize: 12,
    fontWeight: '700',
  },
  tagGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
});
