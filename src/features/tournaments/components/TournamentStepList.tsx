/**
 * =====================================================
 * FILE: TournamentStepList.tsx
 * PURPOSE: The journey through a tournament: what's done,
 *          what's next, and what comes after. Any step can
 *          be opened at any time.
 * USED BY: TournamentOverviewScreen.tsx
 * =====================================================
 */
import { View } from 'react-native';

import type { IconName, IconTone } from '@/components/AppIcon';
import { ListRow } from '@/components/ListRow';
import { useT } from '@/lib/i18n/useT';

import {
  getTournamentSteps,
  type StepKey,
  type StepState,
  type TournamentProgress,
} from '../tournamentSteps';

type TournamentStepListProps = {
  progress: TournamentProgress;
  onOpen: (key: StepKey) => void;
};

const STATE_ICONS: Record<StepState, { name: IconName; tone: IconTone }> = {
  done: { name: 'checkmark-circle', tone: 'done' },
  current: { name: 'arrow-forward-circle', tone: 'accent' },
  upcoming: { name: 'ellipse-outline', tone: 'soft' },
};

export function TournamentStepList({ progress, onOpen }: TournamentStepListProps) {
  const t = useT();

  /** Says how far each step has got, in the words that suit it. */
  function summaryOf(key: StepKey): string {
    switch (key) {
      case 'categories':
        return t('steps.summary.categories', { count: progress.categoryCount });
      case 'registration':
        return t('steps.summary.registration', { count: progress.entryCount });
      case 'weighIn':
        return t('steps.summary.weighIn', {
          done: progress.weighInDoneCount,
          total: progress.entryCount,
        });
      case 'draw':
        return t('steps.summary.draw', {
          done: progress.lockedDrawCount,
          total: progress.drawableCount,
        });
      case 'matches':
        return t('steps.summary.matches', {
          done: progress.finishedMatchCount,
          total: progress.totalMatchCount,
        });
      case 'results':
        return t('steps.summary.results');
    }
  }

  return (
    <View className="gap-2">
      {getTournamentSteps(progress).map(({ key, state }) => (
        <ListRow
          key={key}
          title={t(`steps.title.${key}`)}
          subtitle={summaryOf(key)}
          icon={STATE_ICONS[state].name}
          iconTone={STATE_ICONS[state].tone}
          badge={state === 'upcoming' ? undefined : t(`steps.state.${state}`)}
          badgeTone={state === 'done' ? 'done' : 'active'}
          isHighlighted={state === 'current'}
          onPress={() => onOpen(key)}
        />
      ))}
    </View>
  );
}
