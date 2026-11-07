/**
 * =====================================================
 * FILE: SelectField.tsx
 * PURPOSE: A labelled field that opens a searchable list
 *          of options. React Native has no built-in one.
 * USED BY: AthleteFilters.tsx, AthleteFormFields.tsx,
 *          CategoryFormFields.tsx
 * =====================================================
 */
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { SelectOptionsModal } from './SelectOptionsModal';

export type SelectOption = {
  value: string;
  label: string;
};

type SelectFieldProps = {
  label: string;
  value: string;
  options: readonly SelectOption[];
  searchLabel: string;
  closeLabel: string;
  onChange: (value: string) => void;
  extraActionLabel?: string;
  onExtraAction?: () => void;
};

export function SelectField({
  label,
  value,
  options,
  searchLabel,
  closeLabel,
  onChange,
  extraActionLabel,
  onExtraAction,
}: SelectFieldProps) {
  const [isOpen, setIsOpen] = useState(false);

  // The dots show briefly if the options are still loading.
  const selectedLabel = options.find((option) => option.value === value)?.label ?? '…';

  function handleSelect(newValue: string) {
    onChange(newValue);
    setIsOpen(false);
  }

  function handleExtraAction() {
    setIsOpen(false);
    onExtraAction?.();
  }

  return (
    <View className="gap-1">
      <Text className="text-lg font-bold text-slate-900 dark:text-slate-100">{label}</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${selectedLabel}`}
        onPress={() => setIsOpen(true)}
        className="min-h-12 justify-center rounded-lg border border-slate-400 bg-white px-3 dark:border-slate-500 dark:bg-slate-800"
      >
        <Text className="text-lg text-slate-900 dark:text-slate-100">{`${selectedLabel}  ▾`}</Text>
      </Pressable>
      <SelectOptionsModal
        isVisible={isOpen}
        value={value}
        options={options}
        searchLabel={searchLabel}
        closeLabel={closeLabel}
        onSelect={handleSelect}
        onClose={() => setIsOpen(false)}
        extraActionLabel={extraActionLabel}
        onExtraAction={extraActionLabel === undefined ? undefined : handleExtraAction}
      />
    </View>
  );
}
