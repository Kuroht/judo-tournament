/**
 * =====================================================
 * FILE: DrawResult.tsx
 * PURPOSE: A finished draw: its code, any clubmates who
 *          meet first, swaps, and locking.
 * USED BY: DrawStage.tsx
 * =====================================================
 */
import { useState } from 'react';
import { Text, View } from 'react-native';

import type { CategoryFormat } from '@/features/categories';
import { findClubConflicts } from '@/lib/brackets/assignDrawPositions';
import { useT } from '@/lib/i18n/useT';

import { isEliminationFormat } from '../drawRules';
import type { DrawEntry } from '../types';
import { BracketPreview } from './BracketPreview';
import { DrawActions } from './DrawActions';
import { PoulePreview } from './PoulePreview';

type DrawResultProps = {
  entries: readonly DrawEntry[];
  format: CategoryFormat;
  seed: string;
  isLocked: boolean;
  isBusy: boolean;
  onSwap: (first: DrawEntry, second: DrawEntry) => void;
  onRedraw: () => void;
  onChangeSeeds: () => void;
  onSetLocked: (isLocked: boolean) => void;
};

export function DrawResult(props: DrawResultProps) {
  const { entries, format, seed, isLocked, isBusy, onSwap } = props;
  const t = useT();
  const [selected, setSelected] = useState<DrawEntry | null>(null);

  // Worked out each time, so that it stays right after a swap. In a poule everyone
  // meets everyone, so clubmates can't be avoided and their matches simply go first.
  const isElimination = isEliminationFormat(format);
  const positions = new Map(entries.map((entry) => [entry.entryId, entry.drawPosition ?? 0]));
  const conflicts = isElimination ? findClubConflicts(entries, positions) : [];
  const nameOf = (entryId: string) => entries.find((entry) => entry.entryId === entryId)?.name;
  const selectedEntryId = selected?.entryId ?? null;

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

  const onSelect = isLocked || isBusy ? null : handleSelect;

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
        {isElimination ? (
          <BracketPreview entries={entries} selectedEntryId={selectedEntryId} onSelect={onSelect} />
        ) : (
          <PoulePreview
            entries={entries}
            hasTwoPoules={format === 'twoPoules'}
            selectedEntryId={selectedEntryId}
            onSelect={onSelect}
          />
        )}
      </View>
      <DrawActions
        isLocked={isLocked}
        isBusy={isBusy}
        onRedraw={props.onRedraw}
        onChangeSeeds={props.onChangeSeeds}
        onSetLocked={props.onSetLocked}
      />
    </View>
  );
}
