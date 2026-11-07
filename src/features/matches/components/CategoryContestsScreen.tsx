/**
 * =====================================================
 * FILE: CategoryContestsScreen.tsx
 * PURPOSE: One category's contests, opened from its draw.
 *          MatchListScreen.tsx shows the whole tournament.
 * USED BY: src/app/tournament/[id]/category-matches/
 *          [categoryId]/list.tsx
 * =====================================================
 */
import { router } from 'expo-router';
import { FlatList } from 'react-native';

import { EmptyState } from '@/components/EmptyState';
import { FullScreenMessage } from '@/components/FullScreenMessage';
import { Screen } from '@/components/Screen';
import { useT } from '@/lib/i18n/useT';

import { useCategoryContests } from '../hooks/useCategoryContests';
import { getContestStatus } from '../matchList';
import { ContestRow } from './ContestRow';

type CategoryContestsScreenProps = {
  tournamentId: string;
  categoryId: string;
};

export function CategoryContestsScreen({ tournamentId, categoryId }: CategoryContestsScreenProps) {
  const t = useT();
  const { state } = useCategoryContests(categoryId);

  if (state.type === 'loading') {
    return <FullScreenMessage title={t('common.loading')} />;
  }

  if (state.type === 'error') {
    return <FullScreenMessage title={t('common.loadError')} details={state.message} />;
  }

  if (state.data === null) {
    return <FullScreenMessage title={t('common.notFound')} />;
  }

  const { contests, runningKeys } = state.data;

  return (
    <Screen>
      <FlatList
        data={contests}
        keyExtractor={(contest) => contest.key}
        contentContainerClassName="gap-2"
        ListEmptyComponent={
          <EmptyState
            message={t('matches.drawNotReady')}
            actionLabel={t('draw.title')}
            onAction={() =>
              router.push({
                pathname: '/tournament/[id]/category-draw/[categoryId]/details',
                params: { id: tournamentId, categoryId },
              })
            }
          />
        }
        renderItem={({ item }) => (
          <ContestRow
            contest={item}
            status={getContestStatus(item, runningKeys.includes(item.key))}
            onOpen={() =>
              router.push({
                pathname: '/tournament/[id]/category-matches/[categoryId]/match/[matchKey]',
                params: { id: tournamentId, categoryId, matchKey: item.key },
              })
            }
          />
        )}
      />
    </Screen>
  );
}
