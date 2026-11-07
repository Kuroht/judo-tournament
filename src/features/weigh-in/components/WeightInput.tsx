/**
 * =====================================================
 * FILE: WeightInput.tsx
 * PURPOSE: The big number input and its save button, big
 *          enough to read at arm's length.
 * USED BY: WeighDialog.tsx
 * =====================================================
 */
import { useEffect, useRef, useState } from 'react';
import { Text, TextInput } from 'react-native';

import { Button } from '@/components/Button';
import { useLanguage } from '@/lib/i18n/useLanguage';
import { useT } from '@/lib/i18n/useT';

import { formatKg, parseWeightInput } from '../weightRules';

// Long enough for an Android dialog to finish opening, but too short to notice.
const FOCUS_DELAY_MS = 300;

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
  const inputRef = useRef<TextInput>(null);

  // Ready to type straight away, but not when reviewing an existing result. The
  // autoFocus prop doesn't open the keyboard inside a Modal on Android, because the
  // dialog's window isn't ready yet, so we wait a moment and then focus the input.
  useEffect(() => {
    if (savedKg !== null) {
      return;
    }

    const timer = setTimeout(() => inputRef.current?.focus(), FOCUS_DELAY_MS);

    return () => clearTimeout(timer);
  }, [savedKg]);

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
        ref={inputRef}
        accessibilityLabel={t('weighIn.weightLabel')}
        value={text}
        onChangeText={setText}
        keyboardType="decimal-pad"
        maxLength={7}
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
