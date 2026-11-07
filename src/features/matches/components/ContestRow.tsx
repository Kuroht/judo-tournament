/**
 * =====================================================
 * FILE: ContestRow.tsx
 * PURPOSE: One contest in a list. A contest whose athletes
 *          aren't known yet can't be opened.
 * USED BY: CategoryContestsScreen.tsx, MatchListScreen.tsx
 * =====================================================
 */
import { Pressable, Text } from 'react-native';

import { useT } from '@/lib/i18n/useT';

import type { ContestStatus } from '../matchList';
import type { Contest } from '../types';

type ContestRowProps = {
  contest: Contest;
  status: ContestStatus;
  // Only in the tournament's list, which mixes categories.
  categoryTitle?: string;
  isNext?: boolean;
  onOpen: () => void;
};

export function ContestRow(props: ContestRowProps) {
  const { contest, status, categoryTitle, isNext = false, onOpen } = props;
  const t = useT();
  const { white, blue } = contest;
  const isWaiting = status === 'waiting';

  let partLabel = t(`matches.part.${contest.part}`);
  if (contest.pouleName !== null) {
    partLabel = t('draw.poule', { poule: contest.pouleName });
  }

  // Each part is written out, so that the status doesn't depend on color alone.
  const details = [
    categoryTitle,
    partLabel,
    contest.isPlayoff ? t('matches.playoff') : undefined,
    t(`matches.status.${status}`),
    isNext ? t('matches.next') : undefined,
  ];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isWaiting }}
      disabled={isWaiting}
      onPress={onOpen}
      className={`min-h-14 gap-1 rounded-lg bg-white p-3 dark:bg-slate-800 ${isNext ? 'border-4 border-green-700' : ''} ${isWaiting ? 'opacity-60' : ''}`}
    >
      <Text className="text-base text-slate-700 dark:text-slate-200">
        {details.filter((part) => part !== undefined).join(' · ')}
      </Text>
      <Text className="text-lg font-semibold text-slate-900 dark:text-slate-100">
        {`${white?.name ?? '—'} x ${blue?.name ?? '—'}`}
      </Text>
    </Pressable>
  );
}
