import React from 'react';
import { ScrollView, StyleSheet, ViewStyle } from 'react-native';
import { ButtonChip, ChipSize } from '../atoms/Chip';

export interface FilterItem<T extends string = string> {
  key: T;
  label: string;
  icon?: any;
  count?: number;
}

interface FilterChipBarProps<T extends string = string> {
  items: FilterItem<T>[];
  selectedKey: T;
  onSelect: (key: T) => void;
  size?: ChipSize;
  style?: ViewStyle;
}

export function FilterChipBar<T extends string = string>({
  items,
  selectedKey,
  onSelect,
  size = 'md',
  style,
}: FilterChipBarProps<T>) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      nestedScrollEnabled={true}
      directionalLockEnabled={true}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={[styles.container, style]}
    >
      {items.map((item) => (
        <ButtonChip
          key={item.key}
          label={item.label}
          selected={selectedKey === item.key}
          onPress={() => onSelect(item.key)}
          size={size}
          icon={item.icon}
          count={item.count}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 4,
    alignItems: 'center',
  },
});
