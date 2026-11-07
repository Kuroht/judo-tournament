/**
 * =====================================================
 * FILE: ResultsScreen.tsx
 * PURPOSE: A tournament's results: each category's places,
 *          and the medal table by club.
 * USED BY: src/app/tournament/[id]/results.tsx
 * =====================================================
 */
import { useState } from 'react';
import { FlatList, View } from 'react-native';

import { EmptyState } from '@/components/EmptyState';
import { FullScreenMessage } from '@/components/FullScreenMessage';
import { OptionButton } from '@/components/OptionButton';
import { Screen } from '@/components/Screen';
import { useT } from '@/lib/i18n/useT';

import { buildMedalTable } from '../buildResults';
import { useTournamentResults } from '../hooks/useTournamentResults';
import { CategoryResultCard } from './CategoryResultCard';
import { MedalRowCard } from './MedalRowCard';

type ResultsScreenProps = {
  tournamentId: string;
};

export function ResultsScreen({ tournamentId }: ResultsScreenProps) {
  const t = useT();
  const results = useTournamentResults(tournamentId);
  const [isShowingMedals, setIsShowingMedals] = useState(false);

  if (results.type === 'loading') {
    return <FullScreenMessage title={t('common.loading')} />;
  }

  if (results.type === 'error') {
    return <FullScreenMessage title={t('common.loadError')} details={results.message} />;
  }

  return (
    <Screen>
      <View className="flex-1 gap-3">
        <View className="flex-row gap-2">
          <OptionButton
            label={t('results.categories')}
            isSelected={!isShowingMedals}
            onPress={() => setIsShowingMedals(false)}
          />
          <OptionButton
            label={t('results.medals')}
            isSelected={isShowingMedals}
            onPress={() => setIsShowingMedals(true)}
          />
        </View>
        {isShowingMedals ? (
          <FlatList
            data={buildMedalTable(results.data)}
            keyExtractor={(row) => row.clubId ?? 'no-club'}
            contentContainerClassName="gap-2 flex-grow"
            ListEmptyComponent={<EmptyState message={t('results.noMedals')} />}
            renderItem={({ item }) => <MedalRowCard row={item} />}
          />
        ) : (
          <FlatList
            data={results.data}
            keyExtractor={(result) => result.categoryId}
            contentContainerClassName="gap-2 flex-grow"
            ListEmptyComponent={<EmptyState message={t('results.noCategories')} />}
            renderItem={({ item }) => <CategoryResultCard result={item} />}
          />
        )}
      </View>
    </Screen>
  );
}
