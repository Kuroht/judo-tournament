/**
 * =====================================================
 * FILE: TournamentsScreen.tsx
 * PURPOSE: The tournaments tab: active and archived lists.
 * USED BY: src/app/(tabs)/index.tsx
 * =====================================================
 */
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { FlatList, View } from 'react-native';

import { Button } from '@/components/Button';
import { EmptyState } from '@/components/EmptyState';
import { FullScreenMessage } from '@/components/FullScreenMessage';
import { OptionButton } from '@/components/OptionButton';
import { Screen } from '@/components/Screen';
import { useT } from '@/lib/i18n/useT';

import { useTournaments } from '../hooks/useTournaments';
import { TournamentRow } from './TournamentRow';

export function TournamentsScreen() {
  const tournaments = useTournaments();
  const router = useRouter();
  const t = useT();
  const [isShowingArchived, setIsShowingArchived] = useState(false);

  function handleAdd() {
    router.push('/tournament/new');
  }

  if (tournaments.type === 'loading') {
    return <FullScreenMessage title={t('common.loading')} />;
  }

  if (tournaments.type === 'error') {
    return <FullScreenMessage title={t('common.loadError')} details={tournaments.message} />;
  }

  if (tournaments.data.length === 0) {
    return (
      <Screen>
        <EmptyState
          message={t('tournaments.empty')}
          actionLabel={t('tournaments.add')}
          onAction={handleAdd}
        />
      </Screen>
    );
  }

  // Calculated on each render rather than stored, so it can never be out of date.
  const visibleTournaments = tournaments.data.filter(
    (tournament) => tournament.isArchived === isShowingArchived,
  );

  return (
    <Screen>
      <View className="flex-1 gap-3">
        <View className="flex-row gap-2">
          <OptionButton
            label={t('tournaments.active')}
            isSelected={!isShowingArchived}
            onPress={() => setIsShowingArchived(false)}
          />
          <OptionButton
            label={t('tournaments.archived')}
            isSelected={isShowingArchived}
            onPress={() => setIsShowingArchived(true)}
          />
        </View>
        <FlatList
          className="flex-1"
          data={visibleTournaments}
          keyExtractor={(tournament) => tournament.id}
          contentContainerClassName="gap-2"
          ListEmptyComponent={<EmptyState message={t('tournaments.noneInThisList')} />}
          renderItem={({ item }) => (
            <TournamentRow
              tournament={item}
              onPress={() =>
                router.push({ pathname: '/tournament/[id]/overview', params: { id: item.id } })
              }
            />
          )}
        />
        <Button label={t('tournaments.add')} onPress={handleAdd} />
      </View>
    </Screen>
  );
}
