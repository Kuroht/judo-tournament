/**
 * =====================================================
 * FILE: DrawSetup.tsx
 * PURPOSE: The step before a draw: choosing seeds, then
 *          running it.
 * USED BY: CategoryDrawContent.tsx
 * =====================================================
 */
import { useState } from 'react';
import { FlatList, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { OptionButton } from '@/components/OptionButton';
import { TextField } from '@/components/TextField';
import { useT } from '@/lib/i18n/useT';

import type { DrawEntry } from '../types';

type DrawSetupProps = {
  entries: readonly DrawEntry[];
  isBusy: boolean;
  onToggleSeed: (entry: DrawEntry) => void;
  onRunDraw: (typedSeed: string) => void;
};

export function DrawSetup({ entries, isBusy, onToggleSeed, onRunDraw }: DrawSetupProps) {
  const t = useT();
  const [typedSeed, setTypedSeed] = useState('');

  return (
    <View className="flex-1 gap-3">
      <Text className="text-lg font-bold text-stone-900 dark:text-stone-100">
        {t('draw.chooseSeeds')}
      </Text>
      <FlatList
        className="flex-1"
        data={entries}
        keyExtractor={(entry) => entry.entryId}
        keyboardShouldPersistTaps="handled"
        contentContainerClassName="gap-2"
        renderItem={({ item }) => (
          <OptionButton
            label={item.seed === null ? item.name : `${item.seed}. ${item.name}`}
            isSelected={item.seed !== null}
            isInList
            onPress={() => onToggleSeed(item)}
          />
        )}
      />
      <TextField label={t('draw.repeatSeed')} value={typedSeed} onChangeText={setTypedSeed} />
      <Button label={t('draw.run')} onPress={() => onRunDraw(typedSeed)} isDisabled={isBusy} />
    </View>
  );
}
