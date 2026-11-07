/**
 * =====================================================
 * FILE: FinishedMatch.tsx
 * PURPOSE: A finished match's result, read-only.
 * USED BY: MatchScreen.tsx
 * =====================================================
 */
import { router, useLocalSearchParams } from 'expo-router';
import { Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { Screen } from '@/components/Screen';
import { useT } from '@/lib/i18n/useT';
import { replayMatchEvents } from '@/lib/rules/applyMatchEvent';
import { formatClock } from '@/lib/rules/matchClock';

import { getOutcomeText } from '../getOutcomeText';
import type { MatchData } from '../types';

type FinishedMatchProps = {
  data: MatchData;
};

export function FinishedMatch({ data }: FinishedMatchProps) {
  const t = useT();
  const { id, categoryId } = useLocalSearchParams<{ id: string; categoryId: string }>();
  const { white, blue, rules, row } = data;
  const state = replayMatchEvents(
    data.events.map((saved) => saved.event),
    rules,
  );
  const scoreLine = (name: string, side: 'white' | 'blue') =>
    `${name}: ${t('matches.ippon')} ${state[side].ippons} · ${t('matches.wazaAri')} ${state[side].wazaAris} · ${t('matches.yuko')} ${state[side].yukos} · ${t('matches.shido')} ${state[side].shidos}`;

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
      <View className="gap-4">
        <Text className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          {getOutcomeText(state.outcome, white.name, blue.name, t)}
        </Text>
        <Text className="text-lg text-slate-700 dark:text-slate-200">
          {scoreLine(white.name, 'white')}
        </Text>
        <Text className="text-lg text-slate-700 dark:text-slate-200">
          {scoreLine(blue.name, 'blue')}
        </Text>
        <Text className="text-lg text-slate-700 dark:text-slate-200">
          {t('matches.duration', { time: formatClock(row.clockElapsedSeconds) })}
        </Text>
        <Button label={t('matches.backToList')} onPress={handleBack} />
      </View>
    </Screen>
  );
}
