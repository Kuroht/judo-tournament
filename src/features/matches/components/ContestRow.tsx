/**
 * =====================================================
 * FILE: ContestRow.tsx
 * PURPOSE: One contest in a category's list. A contest
 *          whose athletes aren't known yet can't be opened.
 * USED BY: CategoryContestsScreen.tsx
 * =====================================================
 */
import { Pressable, Text } from 'react-native';

import { useT } from '@/lib/i18n/useT';

import type { Contest } from '../types';

type ContestRowProps = {
  contest: Contest;
  isRunning: boolean;
  onOpen: () => void;
};

export function ContestRow({ contest, isRunning, onOpen }: ContestRowProps) {
  const t = useT();
  const { white, blue } = contest;
  const isReady = white !== null && blue !== null;

  let status = t('matches.status.waiting');
  if (isReady) {
    status = t('matches.status.pending');
  }
  if (isRunning) {
    status = t('matches.status.running');
  }
  if (contest.isFinished) {
    status = t('matches.status.finished');
  }

  const partLabel =
    contest.pouleName === null
      ? t(`matches.part.${contest.part}`)
      : t('draw.poule', { poule: contest.pouleName });

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !isReady }}
      disabled={!isReady}
      onPress={onOpen}
      className={`min-h-14 gap-1 rounded-lg bg-white p-3 dark:bg-slate-800 ${isReady ? '' : 'opacity-60'}`}
    >
      <Text className="text-base text-slate-700 dark:text-slate-200">
        {`${partLabel} · ${status}`}
      </Text>
      <Text className="text-lg font-semibold text-slate-900 dark:text-slate-100">
        {`${white?.name ?? '—'} x ${blue?.name ?? '—'}`}
      </Text>
    </Pressable>
  );
}
