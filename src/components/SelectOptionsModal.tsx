/**
 * =====================================================
 * FILE: SelectOptionsModal.tsx
 * PURPOSE: The searchable list of options that a
 *          SelectField opens.
 * USED BY: SelectField.tsx
 * =====================================================
 */
import { useState } from 'react';
import { FlatList, KeyboardAvoidingView, Modal, View } from 'react-native';

import { matchesSearch } from '@/lib/text/matchesSearch';

import { Button } from './Button';
import { OptionButton } from './OptionButton';
import type { SelectOption } from './SelectField';
import { TextField } from './TextField';

type SelectOptionsModalProps = {
  isVisible: boolean;
  value: string;
  options: readonly SelectOption[];
  searchLabel: string;
  closeLabel: string;
  onSelect: (value: string) => void;
  onClose: () => void;
  extraActionLabel?: string;
  onExtraAction?: () => void;
};

export function SelectOptionsModal({
  isVisible,
  value,
  options,
  searchLabel,
  closeLabel,
  onSelect,
  onClose,
  extraActionLabel,
  onExtraAction,
}: SelectOptionsModalProps) {
  const [search, setSearch] = useState('');
  const visibleOptions = options.filter((option) => matchesSearch(option.label, search));

  // Every way of leaving clears the search, so the list opens complete next time.
  function leaveThen(action: () => void) {
    setSearch('');
    action();
  }

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      onRequestClose={() => leaveThen(onClose)}
    >
      {/* Moves the list up so that the on-screen keyboard does not cover it. */}
      <KeyboardAvoidingView
        behavior="height"
        className="flex-1 items-center justify-center bg-black/60 p-4"
      >
        <View className="max-h-full w-full max-w-lg gap-3 rounded-xl bg-slate-100 p-4 dark:bg-slate-900">
          <TextField label={searchLabel} value={search} onChangeText={setSearch} />
          <FlatList
            data={visibleOptions}
            keyExtractor={(option) => option.value}
            keyboardShouldPersistTaps="handled"
            contentContainerClassName="gap-2"
            renderItem={({ item }) => (
              <OptionButton
                label={item.label}
                isSelected={item.value === value}
                isInList
                onPress={() => leaveThen(() => onSelect(item.value))}
              />
            )}
          />
          {extraActionLabel !== undefined && onExtraAction !== undefined && (
            <Button
              label={extraActionLabel}
              variant="secondary"
              onPress={() => leaveThen(onExtraAction)}
            />
          )}
          <Button label={closeLabel} variant="secondary" onPress={() => leaveThen(onClose)} />
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
