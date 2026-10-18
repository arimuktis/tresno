import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
} from 'react-native';
import { useThemeStore } from '../../../theme/useThemeStore';
import { useTranslation } from '../../../i18n';
import { Button } from '../atoms/Button';

export interface DatePickerModalProps {
  isVisible: boolean;
  initialDate?: Date;
  onConfirm: (date: Date, calculatedAge: number) => void;
  onCancel: () => void;
  minAge?: number;
  title?: string;
}

const MONTH_NAMES_ID = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

const MONTH_NAMES_EN = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export const DatePickerModal: React.FC<DatePickerModalProps> = ({
  isVisible,
  initialDate,
  onConfirm,
  onCancel,
  minAge = 18,
  title,
}) => {
  const { colors, isDark } = useThemeStore();
  const { t, currentLanguage } = useTranslation();
  const monthNames = currentLanguage === 'en' ? MONTH_NAMES_EN : MONTH_NAMES_ID;
  const modalTitle = title || t('photoPicker.selectBirthDate');

  const currentYear = new Date().getFullYear();
  const defaultYear = currentYear - 22; // Default 22 tahun

  const [selectedDay, setSelectedDay] = useState(initialDate ? initialDate.getDate() : 15);
  const [selectedMonth, setSelectedMonth] = useState(initialDate ? initialDate.getMonth() : 6);
  const [selectedYear, setSelectedYear] = useState(
    initialDate ? initialDate.getFullYear() : defaultYear
  );

  if (!isVisible) return null;

  // Hitung usia
  const birthDate = new Date(selectedYear, selectedMonth, selectedDay);
  const today = new Date();
  let calculatedAge = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    calculatedAge--;
  }

  const isEligible = calculatedAge >= minAge;

  const handleSave = () => {
    if (isEligible) {
      onConfirm(birthDate, calculatedAge);
    }
  };

  // Generate opsi Hari (1..31), Tahun (currentYear - 60 .. currentYear - 16)
  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const years = Array.from({ length: 50 }, (_, i) => currentYear - 16 - i);

  return (
    <Modal visible={isVisible} transparent animationType="slide" onRequestClose={onCancel}>
      <View style={styles.backdrop}>
        <View
          style={[
            styles.card,
            {
              backgroundColor: isDark ? 'rgba(22, 22, 34, 0.98)' : 'rgba(255, 255, 255, 0.98)',
              borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.1)',
            },
            Platform.OS === 'web' && ({
              backdropFilter: 'blur(24px)',
              boxShadow: '0 24px 60px rgba(0, 0, 0, 0.5)',
            } as any),
          ]}
        >
          {/* Header */}
          <Text style={[styles.title, { color: colors.text }]}>{modalTitle}</Text>

          {/* Age Indicator Banner */}
          <View
            style={[
              styles.ageBanner,
              {
                backgroundColor: isEligible
                  ? `${colors.primary}18`
                  : 'rgba(239, 68, 68, 0.18)',
                borderColor: isEligible ? colors.primary : colors.danger,
              },
            ]}
          >
            <Text style={[styles.ageText, { color: isEligible ? colors.primary : colors.danger }]}>
              {isEligible
                ? currentLanguage === 'en'
                  ? `Age: ${calculatedAge} yo (Meets 18+ requirement)`
                  : `Usia: ${calculatedAge} Tahun (Memenuhi Syarat 18+)`
                : currentLanguage === 'en'
                ? `Age: ${calculatedAge} yo (Must be at least ${minAge}+)`
                : `Usia: ${calculatedAge} Tahun (Wajib Minimal ${minAge}+ Tahun)`}
            </Text>
          </View>

          {/* Wheel / Columns Selector */}
          <View style={styles.selectorRow}>
            {/* 1. Kolom Hari */}
            <View style={styles.columnWrapper}>
              <Text style={[styles.colHeader, { color: colors.textSecondary }]}>{t('common.day')}</Text>
              <ScrollView style={styles.colScroll} showsVerticalScrollIndicator={false}>
                {days.map((d) => (
                  <TouchableOpacity
                    key={d}
                    style={[
                      styles.itemCell,
                      selectedDay === d && {
                        backgroundColor: colors.primary,
                      },
                    ]}
                    onPress={() => setSelectedDay(d)}
                  >
                    <Text
                      style={[
                        styles.itemText,
                        {
                          color: selectedDay === d ? '#FFFFFF' : colors.text,
                          fontWeight: selectedDay === d ? '700' : '500',
                        },
                      ]}
                    >
                      {d}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* 2. Kolom Bulan */}
            <View style={[styles.columnWrapper, { flex: 1.4 }]}>
              <Text style={[styles.colHeader, { color: colors.textSecondary }]}>{t('common.month')}</Text>
              <ScrollView style={styles.colScroll} showsVerticalScrollIndicator={false}>
                {monthNames.map((name, idx) => (
                  <TouchableOpacity
                    key={name}
                    style={[
                      styles.itemCell,
                      selectedMonth === idx && {
                        backgroundColor: colors.primary,
                      },
                    ]}
                    onPress={() => setSelectedMonth(idx)}
                  >
                    <Text
                      style={[
                        styles.itemText,
                        {
                          color: selectedMonth === idx ? '#FFFFFF' : colors.text,
                          fontWeight: selectedMonth === idx ? '700' : '500',
                        },
                      ]}
                      numberOfLines={1}
                    >
                      {name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* 3. Kolom Tahun */}
            <View style={styles.columnWrapper}>
              <Text style={[styles.colHeader, { color: colors.textSecondary }]}>{t('common.year')}</Text>
              <ScrollView style={styles.colScroll} showsVerticalScrollIndicator={false}>
                {years.map((y) => (
                  <TouchableOpacity
                    key={y}
                    style={[
                      styles.itemCell,
                      selectedYear === y && {
                        backgroundColor: colors.primary,
                      },
                    ]}
                    onPress={() => setSelectedYear(y)}
                  >
                    <Text
                      style={[
                        styles.itemText,
                        {
                          color: selectedYear === y ? '#FFFFFF' : colors.text,
                          fontWeight: selectedYear === y ? '700' : '500',
                        },
                      ]}
                    >
                      {y}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.btnRow}>
            <Button
              title={t('common.cancel')}
              variant="outline"
              size="md"
              onPress={onCancel}
              style={{ flex: 1, marginRight: 10 }}
            />
            <Button
              title={t('common.save')}
              variant="primary"
              size="md"
              onPress={handleSave}
              disabled={!isEligible}
              style={{ flex: 1.2 }}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: Platform.OS === 'web' ? 20 : 10,
  },
  card: {
    width: '92%',
    maxWidth: 380,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1.2,
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 12,
  },
  ageBanner: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: 16,
  },
  ageText: {
    fontSize: 12,
    fontWeight: '700',
  },
  selectorRow: {
    flexDirection: 'row',
    height: 180,
    marginBottom: 20,
    gap: 8,
  },
  columnWrapper: {
    flex: 1,
  },
  colHeader: {
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  colScroll: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 12,
    padding: 4,
  },
  itemCell: {
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 2,
  },
  itemText: {
    fontSize: 13,
  },
  btnRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
