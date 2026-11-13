/**
 * =====================================================
 * FILE: FinishedMatch.tsx
 * PURPOSE: A finished match's result, read-only.
 * USED BY: MatchScreen.tsx
 * =====================================================
 */
import { router, useLocalSearchParams } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { Screen } from '@/components/Screen';
import { useT } from '@/lib/i18n/useT';
import { formatClock } from '@/lib/rules/matchClock';

import { getOutcomeText } from '../getOutcomeText';
import { getMatchDuration, getMatchState } from '../matchTick';
import type { MatchData } from '../types';
import { MatchScoreTiles } from './MatchScoreTiles';
import { NextMatchButton } from './NextMatchButton';
import { ReopenMatchButton } from './ReopenMatchButton';

type FinishedMatchProps = {
  data: MatchData;
  reload: () => Promise<void>;
};

export function FinishedMatch({ data, reload }: FinishedMatchProps) {
  const t = useT();
  const { id, categoryId } = useLocalSearchParams<{ id: string; categoryId: string }>();
  const { white, blue, row, rules } = data;
  const state = getMatchState(data);

  // After reopening the app there may be no screen to go back to, so open the list.
  function handleBack() {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace({
      pathname: '/tournament/[id]/category-matches/[categoryId]/list',
      params: { id, categoryId },
    });
  }

  return (
    <Screen>
      <ScrollView contentContainerClassName="gap-4 pb-6">
        <Text
          accessibilityRole="header"
          className="text-3xl font-bold text-stone-900 dark:text-stone-100"
        >
          {getOutcomeText(state.outcome, white.name, blue.name, t)}
        </Text>
        <Text className="text-lg text-stone-600 dark:text-stone-300">
          {t('matches.duration', {
            time: formatClock(getMatchDuration(data, row.clockElapsedSeconds)),
          })}
        </Text>
        <View className="flex-row flex-wrap gap-3">
          <View className="min-w-64 flex-1 gap-2 rounded-2xl border-2 border-stone-300 bg-judo-white p-4">
            <Text className="text-xl font-bold text-stone-900">{white.name}</Text>
            <MatchScoreTiles score={state.white} hasYuko={rules.isYukoEnabled} isOnBlue={false} />
          </View>
          <View className="min-w-64 flex-1 gap-2 rounded-2xl bg-judo-blue p-4">
            <Text className="text-xl font-bold text-white">{blue.name}</Text>
            <MatchScoreTiles score={state.blue} hasYuko={rules.isYukoEnabled} isOnBlue />
          </View>
        </View>
        <NextMatchButton
          tournamentId={id}
          currentId={`${categoryId}:${data.contest.key}`}
          currentPair={[row.whiteEntryId, row.blueEntryId]}
        />
        <Button
          label={t('matches.backToList')}
          icon="arrow-back"
          variant="secondary"
          onPress={handleBack}
        />
        <ReopenMatchButton matchId={row.id} dependentCount={data.dependentCount} reload={reload} />
      </ScrollView>
    </Screen>
  );
}
