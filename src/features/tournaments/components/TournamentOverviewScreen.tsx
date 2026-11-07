/**
 * =====================================================
 * FILE: TournamentOverviewScreen.tsx
 * PURPOSE: A tournament's home page: its details, and the
 *          journey through it with the next step first.
 * USED BY: src/app/tournament/[id]/overview.tsx
 * =====================================================
 */
import { useRouter } from 'expo-router';
import { ScrollView, Text } from 'react-native';

import { Banner } from '@/components/Banner';
import { FullScreenMessage } from '@/components/FullScreenMessage';
import { Screen } from '@/components/Screen';
import { useGoBack } from '@/hooks/useGoBack';
import { useT } from '@/lib/i18n/useT';

import { useTournamentOverview } from '../hooks/useTournamentOverview';
import { formatDisplayDate } from '../tournamentDate';
import { TournamentManageOptions } from './TournamentManageOptions';
import { TournamentStepList } from './TournamentStepList';

type TournamentOverviewScreenProps = {
  tournamentId: string;
};

export function TournamentOverviewScreen({ tournamentId }: TournamentOverviewScreenProps) {
  const t = useT();
  const router = useRouter();
  const goBack = useGoBack('/');

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
  const parts = [
    formatDisplayDate(details.date),
    details.place,
    t('tournaments.seasonLabel', { year: details.seasonYear }),
  ];

  return (
    <Screen>
      <ScrollView contentContainerClassName="gap-3 pb-6">
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
        <TournamentStepList tournamentId={tournamentId} progress={progress} />
        <TournamentManageOptions
          isArchived={details.isArchived}
          isBusy={overview.isBusy}
          onEdit={() =>
            router.push({ pathname: '/tournament/[id]/edit', params: { id: tournamentId } })
          }
          onDuplicate={() => void overview.duplicate(details)}
          onSetArchived={(isArchived) => void overview.setArchived(isArchived)}
        />
      </ScrollView>
    </Screen>
  );
}
