import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { ChevronDown, ArrowUpRight, Bot } from 'lucide-react-native';

export interface EgoPillSelectorProps {
  stepNumber?: number | string;
  stepTitle?: string;
  label?: string;
  currentOption?: string;
  options?: string[];
  onSelectOption?: (option: string) => void;
  onPressAction?: () => void;
}

export const EgoPillSelector: React.FC<EgoPillSelectorProps> = ({
  stepNumber = 1,
  stepTitle = 'Set up your agent',
  label = 'Set up in',
  currentOption = 'Codex',
  options = ['Codex', 'Claude Desktop', 'Gemini CLI', 'Custom Agent'],
  onSelectOption,
  onPressAction,
}) => {
  const [selected, setSelected] = useState(currentOption);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handlePick = (opt: string) => {
    setSelected(opt);
    setIsDropdownOpen(false);
    if (onSelectOption) onSelectOption(opt);
  };

  return (
    <View style={styles.wrapper}>
      {/* Step Header */}
      {Boolean(stepTitle) && (
        <Text style={styles.stepTitle}>
          {stepNumber}. {stepTitle}
        </Text>
      )}

      {/* Pill Box */}
      <View style={styles.pillContainer}>
        {/* Left Label */}
        <Text style={styles.leftLabel}>{label}</Text>

        {/* Selected Option Chip */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setIsDropdownOpen(!isDropdownOpen)}
          style={styles.dropdownChip}
        >
          <View style={styles.appIconBadge}>
            <Bot size={13} color="#FFFFFF" />
          </View>
          <Text style={styles.optionText}>{selected}</Text>
          <ChevronDown size={14} color="#64748B" style={{ marginLeft: 2 }} />
        </TouchableOpacity>

        {/* Action Arrow Icon (External Link Style) */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onPressAction}
          style={styles.actionArrowBtn}
        >
          <ArrowUpRight size={18} color="#0F172A" />
        </TouchableOpacity>
      </View>

      {/* Floating Options Dropdown Menu */}
      {isDropdownOpen && (
        <View style={styles.dropdownMenu}>
          {options.map((opt) => (
            <TouchableOpacity
              key={opt}
              style={[
                styles.dropdownItem,
                selected === opt && { backgroundColor: '#F1F5F9' },
              ]}
              onPress={() => handlePick(opt)}
            >
              <Text
                style={[
                  styles.dropdownItemText,
                  selected === opt && { color: '#2563EB', fontWeight: '700' },
                ]}
              >
                {opt}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    marginBottom: 16,
    position: 'relative',
    zIndex: 20,
  },
  stepTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 8,
  },
  pillContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 9999,
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
    paddingLeft: 16,
    paddingRight: 14,
    height: 48,
    ...Platform.select({
      web: {
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.04)',
      },
      default: {
        elevation: 1,
      },
    }),
  },
  leftLabel: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#0F172A',
    marginRight: 8,
  },
  dropdownChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  appIconBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#6366F1',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  optionText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#1E293B',
  },
  actionArrowBtn: {
    marginLeft: 'auto',
    padding: 6,
  },
  dropdownMenu: {
    position: 'absolute',
    top: 76,
    left: 80,
    right: 40,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 6,
    zIndex: 50,
    ...Platform.select({
      web: {
        boxShadow: '0 12px 28px rgba(0, 0, 0, 0.12)',
      },
      default: {
        elevation: 6,
      },
    }),
  },
  dropdownItem: {
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  dropdownItemText: {
    fontSize: 13,
    color: '#1E293B',
  },
});
