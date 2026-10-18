import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { Moon, Sun, Sliders, X, Check, Sparkles } from 'lucide-react-native';
import {
  useThemeStore,
  ACCENT_PALETTES,
  ThemeMode,
  AccentColorKey,
} from '../../../theme/useThemeStore';
import { useTranslation, SUPPORTED_LANGUAGES, SupportedLanguage } from '../../../i18n';

interface ThemeSwitcherModalProps {
  visible?: boolean;
  onClose?: () => void;
}

export const ThemeSwitcherModal: React.FC<ThemeSwitcherModalProps> = ({
  visible: propVisible,
  onClose: propOnClose,
}) => {
  const {
    themeMode,
    accentKey,
    setThemeMode,
    setAccentKey,
    colors,
    isDark,
    isThemeModalOpen,
    closeThemeModal,
  } = useThemeStore();

  const { t, currentLanguage, setLanguage } = useTranslation();

  const isVisible = propVisible !== undefined ? propVisible : isThemeModalOpen;
  const handleClose = propOnClose || closeThemeModal;

  const renderModeIcon = (mode: ThemeMode, isSelected: boolean) => {
    const iconColor = isSelected ? colors.primary : colors.text;
    switch (mode) {
      case 'dark':
        return <Moon size={22} color={iconColor} />;
      case 'light':
        return <Sun size={22} color={iconColor} />;
      case 'system':
        return <Sliders size={22} color={iconColor} />;
    }
  };

  const themeModes: { key: ThemeMode; label: string; desc: string }[] = [
    {
      key: 'dark',
      label: t('theme.modeDark'),
      desc: t('theme.modeDarkDesc'),
    },
    {
      key: 'light',
      label: t('theme.modeLight'),
      desc: t('theme.modeLightDesc'),
    },
    {
      key: 'system',
      label: t('theme.modeSystem'),
      desc: t('theme.modeSystemDesc', {
        status: isDark ? t('theme.statusDark') : t('theme.statusLight'),
      }),
    },
  ];

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
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
                {t('theme.modalTitle')}
              </Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                {t('theme.modalSubtitle')}
              </Text>
            </View>
            <TouchableOpacity onPress={handleClose} style={[styles.closeBtn, { backgroundColor: colors.surfaceCard }]}>
              <X size={16} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
            {/* Section 1: Pilihan Bahasa (Language Selection) */}
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
              {t('theme.sectionLanguage')}
            </Text>
            <View style={styles.langRow}>
              {(Object.keys(SUPPORTED_LANGUAGES) as SupportedLanguage[]).map((code) => {
                const lang = SUPPORTED_LANGUAGES[code];
                const isSelected = currentLanguage === code;
                return (
                  <TouchableOpacity
                    key={code}
                    activeOpacity={0.7}
                    onPress={() => setLanguage(code)}
                    style={[
                      styles.langCard,
                      {
                        backgroundColor: isSelected ? colors.primaryGlow : colors.surfaceCard,
                        borderColor: isSelected ? colors.primary : colors.border,
                      },
                      isSelected && { borderWidth: 2 },
                    ]}
                  >
                    <View
                      style={[
                        styles.langCodeBadge,
                        {
                          backgroundColor: isSelected ? colors.primary : colors.surfaceCard,
                          borderColor: isSelected ? colors.primary : colors.border,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.langCodeText,
                          { color: isSelected ? '#FFFFFF' : colors.text },
                        ]}
                      >
                        {lang.code.toUpperCase()}
                      </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text
                        style={[
                          styles.langTitle,
                          { color: isSelected ? colors.primary : colors.text },
                        ]}
                      >
                        {lang.nativeName}
                      </Text>
                      <Text style={[styles.langSub, { color: colors.textSecondary }]}>
                        {lang.name}
                      </Text>
                    </View>
                    {isSelected && (
                      <View style={[styles.checkBadge, { backgroundColor: colors.primary }]}>
                        <Check size={10} color="#FFFFFF" strokeWidth={3} />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Section 2: Mode Tampilan */}
            <Text style={[styles.sectionTitle, { color: colors.textSecondary, marginTop: 18 }]}>
              {t('theme.sectionMode')}
            </Text>
            <View style={styles.modeRow}>
              {themeModes.map((item) => {
                const isSelected = themeMode === item.key;
                return (
                  <TouchableOpacity
                    key={item.key}
                    activeOpacity={0.7}
                    onPress={() => setThemeMode(item.key)}
                    style={[
                      styles.modeCard,
                      {
                        backgroundColor: isSelected ? colors.primaryGlow : colors.surfaceCard,
                        borderColor: isSelected ? colors.primary : colors.border,
                      },
                    ]}
                  >
                    <View style={{ marginBottom: 6 }}>
                      {renderModeIcon(item.key, isSelected)}
                    </View>
                    <Text
                      style={[
                        styles.modeLabel,
                        { color: isSelected ? colors.primary : colors.text },
                      ]}
                    >
                      {item.label}
                    </Text>
                    <Text
                      style={[
                        styles.modeDesc,
                        { color: isSelected ? colors.primary : colors.textSecondary },
                      ]}
                      numberOfLines={1}
                    >
                      {item.desc}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Section 3: Pilihan Aksen Warna */}
            <Text style={[styles.sectionTitle, { color: colors.textSecondary, marginTop: 18 }]}>
              {t('theme.sectionAccent')}
            </Text>
            <View style={styles.accentGrid}>
              {(Object.keys(ACCENT_PALETTES) as AccentColorKey[]).map((key) => {
                const accent = ACCENT_PALETTES[key](isDark);
                const isSelected = accentKey === key;
                return (
                  <TouchableOpacity
                    key={key}
                    activeOpacity={0.7}
                    onPress={() => setAccentKey(key)}
                    style={[
                      styles.accentChip,
                      {
                        backgroundColor: isSelected ? colors.primaryGlow : colors.surfaceCard,
                        borderColor: isSelected ? colors.primary : colors.border,
                      },
                      isSelected && { borderWidth: 2 },
                    ]}
                  >
                    <View
                      style={[
                        styles.colorCircle,
                        {
                          backgroundColor: accent.primary,
                          borderWidth: isSelected ? 2 : 1,
                          borderColor: isSelected ? '#FFFFFF' : 'rgba(255,255,255,0.3)',
                        },
                      ]}
                    />
                    <View style={{ flex: 1 }}>
                      <Text
                        style={[
                          styles.accentName,
                          { color: isSelected ? colors.text : colors.text },
                        ]}
                      >
                        {accent.name}
                      </Text>
                      <Text style={[styles.accentDesc, { color: colors.textSecondary }]}>
                        {accent.desc}
                      </Text>
                    </View>
                    {isSelected && (
                      <View style={[styles.checkBadge, { backgroundColor: colors.primary }]}>
                        <Check size={10} color="#FFFFFF" strokeWidth={3} />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Section 4: Live Interactive Preview */}
            <View
              style={[
                styles.previewBox,
                {
                  backgroundColor: colors.background,
                  borderColor: colors.border,
                },
              ]}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                <Sparkles size={12} color={colors.primary} style={{ marginRight: 6 }} />
                <Text style={[styles.previewLabel, { color: colors.textSecondary, marginBottom: 0 }]}>
                  {t('theme.sectionPreview')} ({themeMode.toUpperCase()} • {ACCENT_PALETTES[accentKey](isDark).name} • {SUPPORTED_LANGUAGES[currentLanguage].flag})
                </Text>
              </View>
              <View style={styles.previewContent}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <Text style={{ color: colors.primary, fontWeight: '900', fontSize: 16 }}>
                    {t('theme.previewBrand')}
                  </Text>
                  <View
                    style={{
                      backgroundColor: colors.surfaceGlass,
                      paddingVertical: 3,
                      paddingHorizontal: 8,
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor: colors.border,
                    }}
                  >
                    <Text style={{ color: colors.gold, fontWeight: 'bold', fontSize: 12 }}>
                      {t('theme.previewCoins')}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={[styles.sampleButton, { backgroundColor: colors.primary }]}
                  activeOpacity={0.8}
                >
                  <Text style={styles.sampleButtonText}>
                    {t('theme.previewButton')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>

          {/* Tombol Simpan & Tutup */}
          <TouchableOpacity
            style={[styles.doneButton, { backgroundColor: colors.primary }]}
            activeOpacity={0.85}
            onPress={handleClose}
          >
            <Text style={styles.doneButtonText}>{t('theme.doneButton')}</Text>
          </TouchableOpacity>
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
    maxHeight: '92%',
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
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  scrollArea: {
    maxHeight: 480,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  langRow: {
    flexDirection: 'row',
    gap: 8,
  },
  langCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  langTitle: {
    fontSize: 12,
    fontWeight: '700',
  },
  langSub: {
    fontSize: 10,
  },
  langCodeBadge: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  langCodeText: {
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  modeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  modeCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderRadius: 16,
    borderWidth: 1.5,
  },
  modeLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
  modeDesc: {
    fontSize: 9,
    marginTop: 2,
    textAlign: 'center',
  },
  accentGrid: {
    gap: 8,
  },
  accentChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  colorCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  accentName: {
    fontSize: 13,
    fontWeight: '700',
  },
  accentDesc: {
    fontSize: 10,
  },
  checkBadge: {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
  },
  previewBox: {
    marginTop: 16,
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
  },
  previewLabel: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  previewContent: {
    gap: 6,
  },
  sampleButton: {
    borderRadius: 9999,
    paddingVertical: 10,
    alignItems: 'center',
  },
  sampleButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
  doneButton: {
    borderRadius: 9999,
    paddingVertical: 13,
    alignItems: 'center',
    marginTop: 14,
  },
  doneButtonText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
});
