/**
 * =====================================================
 * FILE: TournamentOverviewScreen.tsx
 * PURPOSE: A tournament's home page: its details, and the
 *          journey through it with the next step first.
 * USED BY: src/app/tournament/[id]/overview.tsx
 * =====================================================
 */
import { useRouter } from 'expo-router';
import { ScrollView, Text, useWindowDimensions, View } from 'react-native';

import { Banner } from '@/components/Banner';
import { Button } from '@/components/Button';
import { FullScreenMessage } from '@/components/FullScreenMessage';
import { Screen } from '@/components/Screen';
import { useGoBack } from '@/hooks/useGoBack';
import { useT } from '@/lib/i18n/useT';

import { useTournamentOverview } from '../hooks/useTournamentOverview';
import { formatDisplayDate } from '../tournamentDate';
import { getTournamentSteps, type StepKey } from '../tournamentSteps';
import { TournamentManageOptions } from './TournamentManageOptions';
import { TournamentStepList } from './TournamentStepList';

// Wide enough for the details beside the steps.
const TWO_COLUMNS_MIN_WIDTH = 800;

const STEP_ROUTES = {
  categories: '/tournament/[id]/categories',
  registration: '/tournament/[id]/registration',
  weighIn: '/tournament/[id]/weigh-in',
  draw: '/tournament/[id]/draw',
  matches: '/tournament/[id]/matches',
  results: '/tournament/[id]/results',
} as const;

type TournamentOverviewScreenProps = {
  tournamentId: string;
};

export function TournamentOverviewScreen({ tournamentId }: TournamentOverviewScreenProps) {
  const t = useT();
  const router = useRouter();
  const goBack = useGoBack('/');
  const { width } = useWindowDimensions();
  const isWide = width >= TWO_COLUMNS_MIN_WIDTH;

  function handleDuplicated(id: string) {
    router.replace({ pathname: '/tournament/[id]/overview', params: { id } });
  }

  const overview = useTournamentOverview(tournamentId, handleDuplicated, goBack);
  const { tournament } = overview;

  if (tournament.type === 'loading') {
    return <FullScreenMessage title={t('common.loading')} />;
  }

  if (tournament.type === 'error') {
    return <FullScreenMessage title={t('common.loadError')} details={tournament.message} />;
  }

  if (tournament.data === null) {
    return <FullScreenMessage title={t('common.notFound')} />;
  }

  const { details, progress } = tournament.data;
  const next = getTournamentSteps(progress).find((step) => step.state === 'current');

  function openStep(key: StepKey) {
    router.push({ pathname: STEP_ROUTES[key], params: { id: tournamentId } });
  }

  const parts = [
    formatDisplayDate(details.date),
    details.place,
    t('tournaments.seasonLabel', { year: details.seasonYear }),
  ];

  const manageOptions = (
    <TournamentManageOptions
      isArchived={details.isArchived}
      isBusy={overview.isBusy}
      onEdit={() =>
        router.push({ pathname: '/tournament/[id]/edit', params: { id: tournamentId } })
      }
      onDuplicate={() => void overview.duplicate(details)}
      onSetArchived={(isArchived) => void overview.setArchived(isArchived)}
    />
  );

  return (
    <Screen>
      <ScrollView contentContainerClassName="gap-4 pb-6">
        <View className={isWide ? 'flex-row gap-6' : 'gap-3'}>
          <View className={isWide ? 'w-80 gap-3' : 'gap-3'}>
            <Text
              accessibilityRole="header"
              className="text-3xl font-bold text-stone-900 dark:text-stone-100"
            >
              {details.name}
            </Text>
            <Text className="text-lg text-stone-600 dark:text-stone-300">
              {parts.filter((part) => part !== null).join(' · ')}
            </Text>
            {details.isArchived && <Banner message={t('tournaments.isArchivedNote')} />}
            {overview.hasActionFailed && <Banner tone="error" message={t('common.saveError')} />}
            {next !== undefined && !details.isArchived && (
              <>
                <Button
                  label={t('steps.continue', { step: t(`steps.title.${next.key}`) })}
                  icon="arrow-forward"
                  onPress={() => openStep(next.key)}
                />
                <Text className="text-base text-stone-600 dark:text-stone-300">
                  {t(`steps.hint.${next.key}`)}
                </Text>
              </>
            )}
            {isWide && manageOptions}
          </View>
          {/* Only flex-1 in a row. In a scrolling column, Android collapses it to no
              height, and whatever comes next is drawn on top of the steps. */}
          <View className={isWide ? 'flex-1' : ''}>
            <TournamentStepList progress={progress} onOpen={openStep} />
          </View>
        </View>
        {!isWide && manageOptions}
      </ScrollView>
    </Screen>
  );
}
