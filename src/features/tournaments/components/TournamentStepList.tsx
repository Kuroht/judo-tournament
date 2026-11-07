/**
 * =====================================================
 * FILE: TournamentStepList.tsx
 * PURPOSE: The journey through a tournament: what's done,
 *          what's next, and what comes after. Any step can
 *          be opened at any time.
 * USED BY: TournamentOverviewScreen.tsx
 * =====================================================
 */
import { useRouter } from 'expo-router';
import { View } from 'react-native';

import type { IconName, IconTone } from '@/components/AppIcon';
import { Button } from '@/components/Button';
import { ListRow } from '@/components/ListRow';
import { SectionTitle } from '@/components/SectionTitle';
import { useT } from '@/lib/i18n/useT';

import {
  getTournamentSteps,
  type StepKey,
  type StepState,
  type TournamentProgress,
} from '../tournamentSteps';

type TournamentStepListProps = {
  tournamentId: string;
  progress: TournamentProgress;
};

const STEP_ROUTES = {
  categories: '/tournament/[id]/categories',
  registration: '/tournament/[id]/registration',
  weighIn: '/tournament/[id]/weigh-in',
  draw: '/tournament/[id]/draw',
  matches: '/tournament/[id]/matches',
  results: '/tournament/[id]/results',
} as const;

const STATE_ICONS: Record<StepState, { name: IconName; tone: IconTone }> = {
  done: { name: 'checkmark-circle', tone: 'done' },
  current: { name: 'arrow-forward-circle', tone: 'accent' },
  upcoming: { name: 'ellipse-outline', tone: 'soft' },
};

export function TournamentStepList({ tournamentId, progress }: TournamentStepListProps) {
  const t = useT();
  const router = useRouter();
  const steps = getTournamentSteps(progress);
  const current = steps.find((step) => step.state === 'current');

  function openStep(key: StepKey) {
    router.push({ pathname: STEP_ROUTES[key], params: { id: tournamentId } });
  }

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
      {current !== undefined && (
        <View className="gap-2 pb-2">
          <Button
            label={t('steps.continue', { step: t(`steps.title.${current.key}`) })}
            icon="arrow-forward"
            onPress={() => openStep(current.key)}
          />
          <SectionTitle title={t(`steps.hint.${current.key}`)} />
        </View>
      )}
      {steps.map(({ key, state }) => (
        <ListRow
          key={key}
          title={t(`steps.title.${key}`)}
          subtitle={summaryOf(key)}
          icon={STATE_ICONS[state].name}
          iconTone={STATE_ICONS[state].tone}
          badge={state === 'upcoming' ? undefined : t(`steps.state.${state}`)}
          badgeTone={state === 'done' ? 'done' : 'active'}
          isHighlighted={state === 'current'}
          onPress={() => openStep(key)}
        />
      ))}
    </View>
  );
}
