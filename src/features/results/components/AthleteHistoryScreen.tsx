/**
 * =====================================================
 * FILE: AthleteHistoryScreen.tsx
 * PURPOSE: One athlete's matches and places in every
 *          tournament.
 * USED BY: src/app/athlete-history/[id].tsx
 * =====================================================
 */
import { FlatList, Text, View } from 'react-native';

import { EmptyState } from '@/components/EmptyState';
import { FullScreenMessage } from '@/components/FullScreenMessage';
import { Screen } from '@/components/Screen';
import { useT } from '@/lib/i18n/useT';

import { useAthleteHistory } from '../hooks/useAthleteHistory';
import type { HistoryMatch } from '../types';

type AthleteHistoryScreenProps = {
  athleteId: string;
};

export function AthleteHistoryScreen({ athleteId }: AthleteHistoryScreenProps) {
  const t = useT();
  const history = useAthleteHistory(athleteId);

  if (history.type === 'loading') {
    return <FullScreenMessage title={t('common.loading')} />;
  }

  if (history.type === 'error') {
    return <FullScreenMessage title={t('common.loadError')} details={history.message} />;
  }

  function describeMatch(match: HistoryMatch) {
    const outcome = t(match.didWin ? 'results.won' : 'results.lost', {
      name: match.opponentName,
    });
    const how = match.resultType === null ? null : t(`matches.result.${match.resultType}`);

    return [outcome, how].filter((part) => part !== null).join(' · ');
  }

  return (
    <Screen>
      <FlatList
        data={history.data}
        keyExtractor={(category) => category.entryId}
        contentContainerClassName="gap-2 flex-grow"
        ListEmptyComponent={<EmptyState message={t('results.noHistory')} />}
        renderItem={({ item }) => (
          <View className="gap-1 rounded-lg bg-white p-4 dark:bg-stone-800">
            <Text className="text-xl font-bold text-stone-900 dark:text-stone-100">
              {item.tournamentName}
            </Text>
            <Text className="text-lg font-semibold text-stone-900 dark:text-stone-100">
              {item.place === null
                ? item.categoryTitle
                : `${item.categoryTitle} · ${t('results.place', { place: item.place })}`}
            </Text>
            {/* A few matches at most, so a plain list inside the row is fine. */}
            {item.matches.map((match) => (
              <Text key={match.key} className="text-base text-stone-700 dark:text-stone-200">
                {describeMatch(match)}
              </Text>
            ))}
          </View>
        )}
      />
    </Screen>
  );
}
