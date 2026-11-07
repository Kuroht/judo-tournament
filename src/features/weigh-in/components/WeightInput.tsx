/**
 * =====================================================
 * FILE: WeightInput.tsx
 * PURPOSE: The big number input and its save button, big
 *          enough to read at arm's length.
 * USED BY: WeighDialog.tsx
 * =====================================================
 */
import { useState } from 'react';
import { Text, TextInput } from 'react-native';

import { Button } from '@/components/Button';
import { useLanguage } from '@/lib/i18n/useLanguage';
import { useT } from '@/lib/i18n/useT';

import { formatKg, parseWeightInput } from '../weightRules';

type WeightInputProps = {
  savedKg: number | null;
  isBusy: boolean;
  onSave: (kg: number) => void;
};

export function WeightInput({ savedKg, isBusy, onSave }: WeightInputProps) {
  const t = useT();
  const { language } = useLanguage();
  const [text, setText] = useState(savedKg === null ? '' : formatKg(savedKg, language));
  const [isInvalid, setIsInvalid] = useState(false);

  function handleSave() {
    const kg = parseWeightInput(text);
    setIsInvalid(kg === null);
    if (kg !== null) {
      onSave(kg);
    }
  }

  return (
    <>
      <TextInput
        accessibilityLabel={t('weighIn.weightLabel')}
        value={text}
        onChangeText={setText}
        keyboardType="decimal-pad"
        maxLength={7}
        // Ready to type straight away, but not when reviewing an existing result.
        autoFocus={savedKg === null}
        className="min-h-20 rounded-lg border border-slate-400 bg-white text-center text-5xl font-bold text-slate-900 dark:border-slate-500 dark:bg-slate-800 dark:text-slate-100"
      />
      {isInvalid && (
        <Text className="text-base font-semibold text-red-700 dark:text-red-300">
          {t('weighIn.weightInvalid')}
        </Text>
      )}
      <Button label={t('weighIn.saveWeight')} onPress={handleSave} isDisabled={isBusy} />
    </>
  );
}
