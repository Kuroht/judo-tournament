/**
 * =====================================================
 * FILE: MatchListScreen.tsx
 * PURPOSE: Every match of a tournament, with the next one
 *          highlighted and one big button to open it.
 * USED BY: src/app/tournament/[id]/matches.tsx
 * =====================================================
 */
import { router } from 'expo-router';
import { useState } from 'react';
import { FlatList, View } from 'react-native';

import { Button } from '@/components/Button';
import { EmptyState } from '@/components/EmptyState';
import { FullScreenMessage } from '@/components/FullScreenMessage';
import { OptionButton } from '@/components/OptionButton';
import { Screen } from '@/components/Screen';
import { SectionTitle } from '@/components/SectionTitle';
import { useT } from '@/lib/i18n/useT';

import { useTournamentMatches } from '../hooks/useTournamentMatches';
import {
  addCategoryHeadings,
  filterMatchList,
  findNextMatch,
  type MatchListFilter,
  type MatchListItem,
} from '../matchList';
import { ContestRow } from './ContestRow';

const FILTERS: readonly MatchListFilter[] = ['toDo', 'running', 'finished', 'all'];

type MatchListScreenProps = {
  tournamentId: string;
};

export function MatchListScreen({ tournamentId }: MatchListScreenProps) {
  const t = useT();
  const matches = useTournamentMatches(tournamentId);
  const [filter, setFilter] = useState<MatchListFilter>('toDo');

  if (matches.type === 'loading') {
    return <FullScreenMessage title={t('common.loading')} />;
  }

  if (matches.type === 'error') {
    return <FullScreenMessage title={t('common.loadError')} details={matches.message} />;
  }

  const next = findNextMatch(matches.data);
  const visible = filterMatchList(matches.data, filter);

  function openMatch(item: MatchListItem) {
    router.push({
      pathname: '/tournament/[id]/category-matches/[categoryId]/match/[matchKey]',
      params: { id: tournamentId, categoryId: item.categoryId, matchKey: item.contest.key },
    });
  }

  if (matches.data.length === 0) {
    return (
      <Screen>
        <EmptyState
          message={t('matches.noContests')}
          actionLabel={t('draw.title')}
          onAction={() =>
            router.push({ pathname: '/tournament/[id]/draw', params: { id: tournamentId } })
          }
        />
      </Screen>
    );
  }

  return (
    <Screen>
      <View className="flex-1 gap-3">
        {next !== null && (
          <Button
            label={t('matches.openNext', {
              white: next.contest.white?.name ?? '',
              blue: next.contest.blue?.name ?? '',
            })}
            icon="play"
            onPress={() => openMatch(next)}
          />
        )}
        <View className="flex-row flex-wrap gap-2">
          {FILTERS.map((option) => (
            <OptionButton
              key={option}
              label={t(`matches.filter.${option}`)}
              isSelected={filter === option}
              onPress={() => setFilter(option)}
            />
          ))}
        </View>
        <FlatList
          data={addCategoryHeadings(visible)}
          keyExtractor={(line) => line.id}
          contentContainerClassName="gap-2 flex-grow"
          ListEmptyComponent={<EmptyState message={t('matches.noneInFilter')} />}
          renderItem={({ item: line }) =>
            line.type === 'heading' ? (
              <SectionTitle title={line.title} />
            ) : (
              <ContestRow
                contest={line.item.contest}
                status={line.item.status}
                isNext={line.id === next?.id}
                onOpen={() => openMatch(line.item)}
              />
            )
          }
        />
      </View>
    </Screen>
  );
}
