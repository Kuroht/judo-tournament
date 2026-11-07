/**
 * =====================================================
 * FILE: DrawStage.tsx
 * PURPOSE: Chooses what a category's draw needs next: a
 *          message, choosing seeds, or the finished draw.
 * USED BY: CategoryDrawContent.tsx
 * =====================================================
 */
import { EmptyState } from '@/components/EmptyState';
import { useT } from '@/lib/i18n/useT';

import type { useCategoryDraw } from '../hooks/useCategoryDraw';
import type { CategoryDraw } from '../types';
import { DrawResult } from './DrawResult';
import { DrawSetup } from './DrawSetup';

const MIN_ATHLETES_FOR_DRAW = 2;
const MIN_ATHLETES_FOR_TWO_POULES = 4;

type DrawStageProps = {
  data: CategoryDraw;
  draw: ReturnType<typeof useCategoryDraw>;
  isCurrent: boolean;
};

export function DrawStage({ data, draw, isCurrent }: DrawStageProps) {
  const t = useT();
  const { entries, format, seed } = data;

  if (data.isLocked && !isCurrent) {
    // Running a new draw would silently replace a locked one, so it must be unlocked first.
    return (
      <EmptyState
        message={t('draw.lockedMessage')}
        actionLabel={t('draw.unlock')}
        onAction={() => void draw.setLocked(false)}
      />
    );
  }

  if (entries.length < MIN_ATHLETES_FOR_DRAW) {
    return <EmptyState message={t('draw.tooFewAthletes')} />;
  }

  if (isCurrent && seed !== null) {
    return (
      <DrawResult
        entries={entries}
        format={format}
        seed={seed}
        isLocked={data.isLocked}
        isBusy={draw.isBusy}
        onSwap={(first, second) => void draw.swap(first, second)}
        onRedraw={() => void draw.runDraw(entries, format, '')}
        onChangeSeeds={() => void draw.clear()}
        onSetLocked={(isLocked) => void draw.setLocked(isLocked)}
      />
    );
  }

  if (format === 'twoPoules' && entries.length < MIN_ATHLETES_FOR_TWO_POULES) {
    return <EmptyState message={t('draw.tooFewForTwoPoules')} />;
  }

  return (
    <DrawSetup
      entries={entries}
      isBusy={draw.isBusy}
      onToggleSeed={(entry) => void draw.toggleSeed(entry, entries)}
      onRunDraw={(typedSeed) => void draw.runDraw(entries, format, typedSeed)}
    />
  );
}
