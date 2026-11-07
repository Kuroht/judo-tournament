/**
 * =====================================================
 * FILE: DrawResult.tsx
 * PURPOSE: A finished draw: its seed, any clubmates who
 *          meet first, swaps, and locking.
 * USED BY: CategoryDrawContent.tsx
 * =====================================================
 */
import { useState } from 'react';
import { Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { findClubConflicts } from '@/lib/brackets/assignDrawPositions';
import { useT } from '@/lib/i18n/useT';

import type { DrawEntry } from '../types';
import { BracketPreview } from './BracketPreview';

type DrawResultProps = {
  entries: readonly DrawEntry[];
  seed: string;
  isLocked: boolean;
  isBusy: boolean;
  onSwap: (first: DrawEntry, second: DrawEntry) => void;
  onRedraw: () => void;
  onChangeSeeds: () => void;
  onSetLocked: (isLocked: boolean) => void;
};

export function DrawResult(props: DrawResultProps) {
  const { entries, seed, isLocked, isBusy, onSwap, onSetLocked } = props;
  const t = useT();
  const [selected, setSelected] = useState<DrawEntry | null>(null);
  const [isConfirmingUnlock, setIsConfirmingUnlock] = useState(false);

  // Worked out each time, so that it stays right after a swap.
  const positions = new Map(entries.map((entry) => [entry.entryId, entry.drawPosition ?? 0]));
  const conflicts = findClubConflicts(entries, positions);
  const nameOf = (entryId: string) => entries.find((entry) => entry.entryId === entryId)?.name;

  function handleSelect(entry: DrawEntry) {
    if (selected === null) {
      setSelected(entry);
      return;
    }

    // Tapping the same athlete again cancels the selection.
    if (selected.entryId !== entry.entryId) {
      onSwap(selected, entry);
    }
    setSelected(null);
  }

  return (
    <View className="flex-1 gap-3">
      <Text className="text-lg font-semibold text-slate-900 dark:text-slate-100">
        {`${t('draw.seedLabel', { seed })} · ${t(isLocked ? 'draw.isLocked' : 'draw.isDraft')}`}
      </Text>
      {conflicts.map(([first, second]) => (
        <Text key={first} className="text-base font-semibold text-amber-800 dark:text-amber-300">
          {`⚠ ${t('draw.conflict', { first: nameOf(first) ?? '', second: nameOf(second) ?? '' })}`}
        </Text>
      ))}
      {!isLocked && (
        <Text className="text-base text-slate-700 dark:text-slate-200">{t('draw.swapHelp')}</Text>
      )}
      <View className="flex-1">
        <BracketPreview
          entries={entries}
          selectedEntryId={selected?.entryId ?? null}
          onSelect={isLocked || isBusy ? null : handleSelect}
        />
      </View>
      {isLocked ? (
        <Button
          label={t('draw.unlock')}
          variant="secondary"
          onPress={() => setIsConfirmingUnlock(true)}
          isDisabled={isBusy}
        />
      ) : (
        <>
          <Button label={t('draw.lock')} onPress={() => onSetLocked(true)} isDisabled={isBusy} />
          <View className="flex-row gap-2">
            <View className="flex-1">
              <Button
                label={t('draw.redraw')}
                variant="secondary"
                onPress={props.onRedraw}
                isDisabled={isBusy}
              />
            </View>
            <View className="flex-1">
              <Button
                label={t('draw.changeSeeds')}
                variant="secondary"
                onPress={props.onChangeSeeds}
                isDisabled={isBusy}
              />
            </View>
          </View>
        </>
      )}
      <ConfirmDialog
        isVisible={isConfirmingUnlock}
        title={t('draw.unlockTitle')}
        message={t('draw.unlockMessage')}
        confirmLabel={t('draw.unlock')}
        cancelLabel={t('common.cancel')}
        onConfirm={() => {
          setIsConfirmingUnlock(false);
          onSetLocked(false);
        }}
        onCancel={() => setIsConfirmingUnlock(false)}
      />
    </View>
  );
}
