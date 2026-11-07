/**
 * =====================================================
 * FILE: WeighDialog.tsx
 * PURPOSE: Weighs one athlete, and shows their result and
 *          what can be done next.
 * USED BY: WeighInContent.tsx
 * =====================================================
 */
import { KeyboardAvoidingView, Modal, ScrollView, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import type { TranslationKey } from '@/lib/i18n/pt';
import { useT } from '@/lib/i18n/useT';

import { useWeighInText } from '../hooks/useWeighInText';
import type { WeighInCategory, WeighInEntry } from '../types';
import { WeighMoveOptions } from './WeighMoveOptions';
import { WeightInput } from './WeightInput';

type WeighDialogProps = {
  entry: WeighInEntry;
  categories: readonly WeighInCategory[];
  isBusy: boolean;
  errorKey: TranslationKey | null;
  onSaveWeight: (kg: number) => void;
  onNoShow: () => void;
  onClear: () => void;
  onMove: (target: WeighInCategory) => void;
  onCreateGroup: (label: string) => void;
  onClose: () => void;
};

export function WeighDialog(props: WeighDialogProps) {
  const { entry, isBusy, errorKey, onNoShow, onClear, onClose } = props;
  const t = useT();
  const { statusText, limitText } = useWeighInText();

  // A failed athlete needs a new category. A free group athlete gets grouped by weight.
  const canMove = entry.status === 'failed' || (entry.isFreeGrouping && entry.status === 'passed');

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      {/* Moves the dialog up so that the on-screen keyboard does not cover it. */}
      <KeyboardAvoidingView
        behavior="height"
        className="flex-1 items-center justify-center bg-black/60 p-4"
      >
        <View className="max-h-full w-full max-w-lg rounded-xl bg-stone-100 p-4 dark:bg-stone-900">
          <ScrollView keyboardShouldPersistTaps="handled" contentContainerClassName="gap-3">
            <Text className="text-2xl font-bold text-stone-900 dark:text-stone-100">{entry.name}</Text>
            <Text className="text-lg text-stone-700 dark:text-stone-200">{limitText(entry)}</Text>
            <Text className="text-lg font-semibold text-stone-900 dark:text-stone-100">
              {statusText(entry)}
            </Text>
            <WeightInput
              // A new key resets the input when the saved result changes, such as after
              // "back to still to weigh", so that it can't disagree with the status.
              key={`${entry.status}-${entry.weighedKg}`}
              savedKg={entry.weighedKg}
              isBusy={isBusy}
              onSave={props.onSaveWeight}
            />
            {errorKey !== null && (
              <Text className="text-base font-semibold text-red-700 dark:text-red-300">
                {t(errorKey)}
              </Text>
            )}
            {canMove && (
              <WeighMoveOptions
                entry={entry}
                categories={props.categories}
                isBusy={isBusy}
                onMove={props.onMove}
                onCreateGroup={props.onCreateGroup}
              />
            )}
            {entry.status !== 'noShow' && (
              <Button
                label={t('weighIn.markNoShow')}
                variant="secondary"
                onPress={onNoShow}
                isDisabled={isBusy}
              />
            )}
            {entry.status !== 'registered' && (
              <Button
                label={t('weighIn.clear')}
                variant="secondary"
                onPress={onClear}
                isDisabled={isBusy}
              />
            )}
            <Button
              label={t('common.close')}
              variant="secondary"
              onPress={onClose}
              isDisabled={isBusy}
            />
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
