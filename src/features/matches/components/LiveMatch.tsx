/**
 * =====================================================
 * FILE: LiveMatch.tsx
 * PURPOSE: The screen for a match in progress, laid out like
 *          a scoreboard. On a tablet, the clock sits between
 *          the two athletes, so a hold or a result appears in
 *          the middle and the scoring buttons never move.
 * USED BY: MatchScreen.tsx
 * =====================================================
 */
import { useKeepAwake } from 'expo-keep-awake';
import { useLocalSearchParams } from 'expo-router';
import { ScrollView, useWindowDimensions, View } from 'react-native';

import type { MatchEvent, Side } from '@/lib/rules/types';

import { useLiveMatch } from '../hooks/useLiveMatch';
import type { MatchData } from '../types';
import { MatchCenterColumn } from './MatchCenterColumn';
import { MatchFooter } from './MatchFooter';
import { MatchSidePanel } from './MatchSidePanel';
import { UpcomingMatches } from './UpcomingMatches';

// Below this, a clock between the athletes would squash their buttons.
const THREE_COLUMNS_MIN_WIDTH = 1000;
const TWO_COLUMNS_MIN_WIDTH = 560;

type LiveMatchProps = {
  data: MatchData;
  reload: () => Promise<void>;
};

export function LiveMatch({ data, reload }: LiveMatchProps) {
  // The tablet must not go to sleep while the trainer watches the mat.
  useKeepAwake();
  const { id, categoryId } = useLocalSearchParams<{ id: string; categoryId: string }>();
  const match = useLiveMatch(data, reload);
  const { width } = useWindowDimensions();
  const { white, blue, rules } = data;
  const { state, holdSide } = match;
  const isInProgress = state.outcome.type === 'inProgress';
  const hasThreeColumns = width >= THREE_COLUMNS_MIN_WIDTH;
  const hasTwoColumns = width >= TWO_COLUMNS_MIN_WIDTH;
  const onEvent = (event: MatchEvent) => void match.addEvent(event);
  const panelProps = {
    rules,
    isInProgress,
    isHoldRunning: holdSide !== null,
    isInRow: hasTwoColumns || hasThreeColumns,
    onEvent,
    onStartHold: (side: Side) => void match.startHold(side),
  };

  const whitePanel = (
    <MatchSidePanel side="white" athlete={white} score={state.white} {...panelProps} />
  );
  const bluePanel = (
    <MatchSidePanel side="blue" athlete={blue} score={state.blue} {...panelProps} />
  );
  const center = (
    <MatchCenterColumn
      data={data}
      match={match}
      isBetweenAthletes={hasThreeColumns}
      onEvent={onEvent}
    />
  );

  return (
    <View className="flex-1 bg-stone-100 dark:bg-stone-900">
      <ScrollView className="flex-1" contentContainerClassName="p-3">
        {hasThreeColumns ? (
          <View className="flex-row gap-3">
            {whitePanel}
            {center}
            {bluePanel}
          </View>
        ) : (
          <View className="gap-3">
            {center}
            <View className={hasTwoColumns ? 'flex-row gap-3' : 'gap-3'}>
              {whitePanel}
              {bluePanel}
            </View>
          </View>
        )}
        <View className="pt-3">
          <UpcomingMatches
            tournamentId={id}
            currentId={`${categoryId}:${data.contest.key}`}
            currentPair={[data.row.whiteEntryId, data.row.blueEntryId]}
          />
        </View>
      </ScrollView>
      {/* Outside the scrolling area, so that undo is always on screen. */}
      <View className="p-3 pt-0">
        <MatchFooter
          canUndo={match.canUndo}
          isInProgress={isInProgress}
          whiteName={white.name}
          blueName={blue.name}
          onUndo={() => void match.undo()}
          onEvent={onEvent}
        />
      </View>
    </View>
  );
}
