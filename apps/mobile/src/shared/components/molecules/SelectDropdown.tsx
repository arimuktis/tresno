import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
  Platform,
} from 'react-native';
import { useThemeStore } from '../../../theme/useThemeStore';
import { ChevronDown, ChevronUp, X, Check } from 'lucide-react-native';

export interface DropdownOption {
  label: string;
  value: string;
  icon?: string | React.ReactNode;
  badge?: string;
}

export interface SelectDropdownProps {
  label?: string;
  placeholder?: string;
  options: DropdownOption[];
  selectedValue?: string;
  onSelect: (value: string) => void;
  error?: string | null;
  disabled?: boolean;
}

export const SelectDropdown: React.FC<SelectDropdownProps> = ({
  label,
  placeholder = 'Pilih salah satu...',
  options,
  selectedValue,
  onSelect,
  error,
  disabled = false,
}) => {
  const { colors, isDark } = useThemeStore();
  const [isOpen, setIsOpen] = useState(false);

  const selectedOption = options.find((o) => o.value === selectedValue);
  const hasError = Boolean(error);

  const handleChoose = (value: string) => {
    onSelect(value);
    setIsOpen(false);
  };

  return (
    <View style={styles.wrapper}>
      {Boolean(label) && (
        <Text style={[styles.label, { color: hasError ? colors.danger : colors.textSecondary }]}>
          {label}
        </Text>
      )}

      {/* Trigger Button */}
      <TouchableOpacity
        style={[
          styles.trigger,
          {
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
            borderColor: hasError
              ? colors.danger
              : isOpen
              ? colors.primary
              : isDark
              ? 'rgba(255, 255, 255, 0.12)'
              : 'rgba(0, 0, 0, 0.12)',
            opacity: disabled ? 0.6 : 1,
          },
        ]}
        onPress={() => !disabled && setIsOpen(true)}
        activeOpacity={0.8}
        disabled={disabled}
      >
        <View style={styles.triggerContent}>
          {selectedOption?.icon && (
            <View style={{ marginRight: 8 }}>
              {typeof selectedOption.icon === 'string' ? (
                <Text style={styles.optionIcon}>{selectedOption.icon}</Text>
              ) : (
                selectedOption.icon
              )}
            </View>
          )}
          <Text
            style={[
              styles.triggerText,
              {
                color: selectedOption ? colors.text : isDark ? 'rgba(255,255,255,0.4)' : '#9CA3AF',
                fontWeight: selectedOption ? '600' : '400',
              },
            ]}
          >
            {selectedOption ? selectedOption.label : placeholder}
          </Text>
        </View>

        {isOpen ? (
          <ChevronUp size={18} color={colors.textSecondary} />
        ) : (
          <ChevronDown size={18} color={colors.textSecondary} />
        )}
      </TouchableOpacity>

      {hasError && <Text style={[styles.errorText, { color: colors.danger }]}>{error}</Text>}

      {/* Dropdown Selection Modal */}
      <Modal visible={isOpen} transparent animationType="fade" onRequestClose={() => setIsOpen(false)}>
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setIsOpen(false)}
        >
          <View
            style={[
              styles.dropdownCard,
              {
                backgroundColor: isDark ? 'rgba(24, 24, 36, 0.98)' : 'rgba(255, 255, 255, 0.98)',
                borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.1)',
              },
              Platform.OS === 'web' && ({
                backdropFilter: 'blur(24px)',
                boxShadow: '0 20px 48px rgba(0, 0, 0, 0.4)',
              } as any),
            ]}
            onStartShouldSetResponder={() => true}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>{label || 'Pilihan'}</Text>
              <TouchableOpacity onPress={() => setIsOpen(false)} style={styles.closeBtn}>
                <X size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <FlatList
              data={options}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => {
                const isSelected = item.value === selectedValue;
                return (
                  <TouchableOpacity
                    style={[
                      styles.optionRow,
                      isSelected && {
                        backgroundColor: `${colors.primary}18`,
                        borderColor: colors.primary,
                      },
                    ]}
                    onPress={() => handleChoose(item.value)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.optionLeft}>
                      {item.icon && (
                        <View style={{ marginRight: 8 }}>
                          {typeof item.icon === 'string' ? (
                            <Text style={styles.optionIcon}>{item.icon}</Text>
                          ) : (
                            item.icon
                          )}
                        </View>
                      )}
                      <Text
                        style={[
                          styles.optionLabel,
                          {
                            color: isSelected ? colors.primary : colors.text,
                            fontWeight: isSelected ? '700' : '500',
                          },
                        ]}
                      >
                        {item.label}
                      </Text>
                    </View>

                    {isSelected && (
                      <Check size={18} color={colors.primary} strokeWidth={2.4} />
                    )}
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 46,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1.2,
  },
  triggerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  triggerText: {
    fontSize: 14,
  },
  chevron: {
    fontSize: 10,
    marginLeft: 8,
  },
  optionIcon: {
    fontSize: 16,
    marginRight: 10,
  },
  errorText: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
    marginLeft: 2,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  dropdownCard: {
    width: '100%',
    maxWidth: 380,
    maxHeight: 450,
    borderRadius: 22,
    padding: 16,
    borderWidth: 1.2,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  closeBtn: {
    padding: 4,
  },
  closeBtnText: {
    color: '#9CA3AF',
    fontSize: 14,
    fontWeight: '700',
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginVertical: 2,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionLabel: {
    fontSize: 14,
  },
  checkmark: {
    fontSize: 16,
    fontWeight: '900',
  },
});
