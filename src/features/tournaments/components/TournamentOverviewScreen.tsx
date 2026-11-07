/**
 * =====================================================
 * FILE: TournamentOverviewScreen.tsx
 * PURPOSE: The home of one tournament: its details, and
 *          where to go next.
 * USED BY: src/app/tournament/[id]/overview.tsx
 * =====================================================
 */
import { useRouter } from 'expo-router';
import { ScrollView, Text } from 'react-native';

import { Button } from '@/components/Button';
import { FullScreenMessage } from '@/components/FullScreenMessage';
import { Screen } from '@/components/Screen';
import { useGoBack } from '@/hooks/useGoBack';
import { useT } from '@/lib/i18n/useT';

import { useTournamentOverview } from '../hooks/useTournamentOverview';
import { formatDisplayDate } from '../tournamentDate';

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

  const details = tournament.data;
  const parts = [
    formatDisplayDate(details.date),
    details.place,
    t('tournaments.seasonLabel', { year: details.seasonYear }),
  ];

  return (
    <Screen>
      <ScrollView contentContainerClassName="gap-3 pb-6">
        <Text className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          {details.name}
        </Text>
        <Text className="text-lg text-slate-700 dark:text-slate-200">
          {parts.filter((part) => part !== null).join(' · ')}
        </Text>
        {details.isArchived && (
          <Text className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            {t('tournaments.isArchivedNote')}
          </Text>
        )}
        <Button
          label={t('tournaments.openCategories', { count: details.categoryCount })}
          onPress={() =>
            router.push({ pathname: '/tournament/[id]/categories', params: { id: tournamentId } })
          }
        />
        <Button
          label={t('tournaments.edit')}
          variant="secondary"
          onPress={() =>
            router.push({ pathname: '/tournament/[id]/edit', params: { id: tournamentId } })
          }
        />
        <Button
          label={t('tournaments.duplicate')}
          variant="secondary"
          onPress={() => void overview.duplicate(details)}
          isDisabled={overview.isBusy}
        />
        <Button
          label={t(details.isArchived ? 'tournaments.restore' : 'tournaments.archive')}
          variant="secondary"
          onPress={() => void overview.setArchived(!details.isArchived)}
          isDisabled={overview.isBusy}
        />
        {overview.hasActionFailed && (
          <Text className="text-lg font-semibold text-red-700 dark:text-red-300">
            {t('common.saveError')}
          </Text>
        )}
      </ScrollView>
    </Screen>
  );
}
