/**
 * =====================================================
 * FILE: MatchCenterColumn.tsx
 * PURPOSE: The middle of the scoreboard: the clock, a hold in
 *          progress, the result to confirm, and any error.
 *          Kept together, so none of them moves the scoring
 *          buttons.
 * USED BY: LiveMatch.tsx
 * =====================================================
 */
import { View } from 'react-native';

import { Banner } from '@/components/Banner';
import { useT } from '@/lib/i18n/useT';
import type { MatchEvent } from '@/lib/rules/types';

import type { useLiveMatch } from '../hooks/useLiveMatch';
import type { MatchData } from '../types';
import { MatchClockBar } from './MatchClockBar';
import { MatchOutcomePanel } from './MatchOutcomePanel';
import { OsaekomiBar } from './OsaekomiBar';

type MatchCenterColumnProps = {
  data: MatchData;
  match: ReturnType<typeof useLiveMatch>;
  // A fixed width between the athletes, or the full width above them.
  isBetweenAthletes: boolean;
  onEvent: (event: MatchEvent) => void;
};

export function MatchCenterColumn(props: MatchCenterColumnProps) {
  const { data, match, isBetweenAthletes, onEvent } = props;
  const t = useT();
  const { white, blue, rules } = data;
  const { state, holdSide } = match;
  const isInProgress = state.outcome.type === 'inProgress';

  return (
    <View className={isBetweenAthletes ? 'w-72 gap-3' : 'gap-3'}>
      {match.hasActionFailed && <Banner tone="error" message={t('common.saveError')} />}
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
    </View>
  );
}
