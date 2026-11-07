/**
 * =====================================================
 * FILE: AthletesScreen.tsx
 * PURPOSE: The athletes tab: search, filter and the list.
 * USED BY: src/app/(tabs)/athletes.tsx
 * =====================================================
 */
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { FlatList, View } from 'react-native';

import { Button } from '@/components/Button';
import { EmptyState } from '@/components/EmptyState';
import { FullScreenMessage } from '@/components/FullScreenMessage';
import { Screen } from '@/components/Screen';
import { useT } from '@/lib/i18n/useT';

import { ALL_CLUBS, filterAthletes, NO_CLUB } from '../filterAthletes';
import { useAthletes } from '../hooks/useAthletes';
import { useClubOptions } from '../hooks/useClubOptions';
import { AthleteFilters } from './AthleteFilters';
import { AthleteRow } from './AthleteRow';

export function AthletesScreen() {
  const athletes = useAthletes();
  const clubOptions = useClubOptions();
  const router = useRouter();
  const t = useT();
  const [search, setSearch] = useState('');
  const [chosenClubFilter, setClubFilter] = useState(ALL_CLUBS);

  // If the chosen club has since been deleted, show everyone rather than an empty list.
  const isChosenFilterValid =
    chosenClubFilter === ALL_CLUBS ||
    chosenClubFilter === NO_CLUB ||
    clubOptions.some((option) => option.value === chosenClubFilter);
  const clubFilter = isChosenFilterValid ? chosenClubFilter : ALL_CLUBS;

  function handleAdd() {
    router.push('/athlete/new');
  }

  if (athletes.type === 'loading') {
    return <FullScreenMessage title={t('common.loading')} />;
  }

  if (athletes.type === 'error') {
    return <FullScreenMessage title={t('common.loadError')} details={athletes.message} />;
  }

  // Calculated on each render rather than stored, so it can never be out of date.
  const visibleAthletes = filterAthletes(athletes.data, search, clubFilter);

  return (
    <Screen>
      <View className="flex-1 gap-3">
        {athletes.data.length === 0 ? (
          <EmptyState
            message={t('athletes.empty')}
            actionLabel={t('athletes.add')}
            onAction={handleAdd}
          />
        ) : (
          <>
            <AthleteFilters
              search={search}
              clubFilter={clubFilter}
              clubOptions={clubOptions}
              onSearchChange={setSearch}
              onClubFilterChange={setClubFilter}
            />
            <FlatList
              className="flex-1"
              data={visibleAthletes}
              keyExtractor={(athlete) => athlete.id}
              keyboardShouldPersistTaps="handled"
              contentContainerClassName="gap-2"
              ListEmptyComponent={<EmptyState message={t('common.noResults')} />}
              renderItem={({ item }) => (
                <AthleteRow
                  athlete={item}
                  onPress={() =>
                    router.push({ pathname: '/athlete/[id]', params: { id: item.id } })
                  }
                />
              )}
            />
          </>
        )}
        <View className="flex-row gap-2">
          <View className="flex-1">
            <Button
              label={t('athletes.manageClubs')}
              icon="shield-outline"
              variant="secondary"
              onPress={() => router.push('/clubs')}
            />
          </View>
          {athletes.data.length > 0 && (
            <View className="flex-1">
              <Button label={t('athletes.add')} icon="person-add" onPress={handleAdd} />
            </View>
          )}
        </View>
      </View>
    </Screen>
  );
}
