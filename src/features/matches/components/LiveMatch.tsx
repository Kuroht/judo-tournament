/**
 * =====================================================
 * FILE: LiveMatch.tsx
 * PURPOSE: The screen for a match in progress. The side
 *          panels sit next to each other on a tablet, and
 *          above each other on a phone.
 * USED BY: MatchScreen.tsx
 * =====================================================
 */
import { useKeepAwake } from 'expo-keep-awake';
import { ScrollView, Text, useWindowDimensions, View } from 'react-native';

import { useT } from '@/lib/i18n/useT';
import type { MatchEvent, Side } from '@/lib/rules/types';

import { useLiveMatch } from '../hooks/useLiveMatch';
import type { MatchData } from '../types';
import { MatchClockBar } from './MatchClockBar';
import { MatchFooter } from './MatchFooter';
import { MatchOutcomePanel } from './MatchOutcomePanel';
import { MatchSidePanel } from './MatchSidePanel';
import { OsaekomiBar } from './OsaekomiBar';

const SIDE_BY_SIDE_MIN_WIDTH = 700;

type LiveMatchProps = {
  data: MatchData;
  reload: () => Promise<void>;
};

export function LiveMatch({ data, reload }: LiveMatchProps) {
  // The tablet must not go to sleep while the trainer watches the mat.
  useKeepAwake();
  const t = useT();
  const match = useLiveMatch(data, reload);
  const { width } = useWindowDimensions();
  const { white, blue, rules } = data;
  const { state, holdSide } = match;
  const isInProgress = state.outcome.type === 'inProgress';
  const onEvent = (event: MatchEvent) => void match.addEvent(event);
  const panelProps = {
    rules,
    isInProgress,
    isHoldRunning: holdSide !== null,
    onEvent,
    onStartHold: (side: Side) => void match.startHold(side),
  };

  return (
    <View className="flex-1 bg-stone-100 dark:bg-stone-900">
      <ScrollView className="flex-1" contentContainerClassName="gap-3 p-3">
        {match.hasActionFailed && (
          <Text className="text-lg font-semibold text-red-700 dark:text-red-300">
            {t('common.saveError')}
          </Text>
        )}
        {!isInProgress && (
          <MatchOutcomePanel
            outcome={state.outcome}
            whiteName={white.name}
            blueName={blue.name}
            onDecide={(winner) => onEvent({ type: 'decision', winner })}
            onFinish={() => void match.finish()}
          />
        )}
        <MatchClockBar
          elapsedSeconds={match.elapsedSeconds}
          period={state.period}
          rules={rules}
          isRunning={match.isClockRunning}
          isInProgress={isInProgress}
          onSetRunning={(isRunning) => void match.setClockRunning(isRunning)}
          onReset={() => void match.resetClock()}
        />
        {holdSide !== null && (
          <OsaekomiBar
            athleteName={holdSide === 'white' ? white.name : blue.name}
            seconds={match.holdSeconds}
            score={match.holdScore}
            onEnd={() => void match.endHold()}
          />
        )}
        <View className={width >= SIDE_BY_SIDE_MIN_WIDTH ? 'flex-row gap-3' : 'gap-3'}>
          <MatchSidePanel side="white" athlete={white} score={state.white} {...panelProps} />
          <MatchSidePanel side="blue" athlete={blue} score={state.blue} {...panelProps} />
        </View>
      </ScrollView>
      {/* Outside the scrolling area, so that undo is always on screen. */}
      <View className="p-3">
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
