/**
 * =====================================================
 * FILE: useLiveMatch.ts
 * PURPOSE: Runs a match in progress: where it stands right
 *          now, and what its timers must do by themselves.
 * USED BY: LiveMatch.tsx
 * =====================================================
 */
import { useEffect, useState } from 'react';
import { Vibration } from 'react-native';

import { replayMatchEvents } from '@/lib/rules/applyMatchEvent';
import { getElapsedSeconds } from '@/lib/rules/matchClock';
import { osaekomiResult } from '@/lib/rules/osaekomi';

import { getDueAction, getHoldSeconds } from '../matchTick';
import type { MatchData } from '../types';
import { useMatchActions } from './useMatchActions';

// Four times a second, so that a displayed second is never visibly late.
const TICK_MS = 250;
const SHORT_VIBRATION_MS = 200;
const LONG_VIBRATION_MS = 800;

/**
 * Gives the match screen the live match and its actions.
 * @param data the saved match
 * @param reload reads the saved match again
 */
export function useLiveMatch(data: MatchData, reload: () => Promise<void>) {
  const { row, rules } = data;
  const [nowMs, setNowMs] = useState(() => Date.now());
  const state = replayMatchEvents(
    data.events.map((saved) => saved.event),
    rules,
  );
  const actions = useMatchActions(data, state, reload);
  const { isActionRunning, addEvent, endHold } = actions;

  const clock = { elapsedSeconds: row.clockElapsedSeconds, startedAtMs: row.clockStartedAtMs };
  const hold = { side: row.osaekomiSide, startedAtMs: row.osaekomiStartedAtMs };
  const holdSeconds = getHoldSeconds(hold, nowMs);
  const isGoldenScore = state.period === 'goldenScore';
  const holdScore =
    hold.side === null
      ? null
      : osaekomiResult(holdSeconds, state[hold.side], isGoldenScore, rules).score;

  // The trainer can't watch the tablet all the time, so a hold's new score is felt too.
  useEffect(() => {
    if (holdScore !== null) {
      Vibration.vibrate(SHORT_VIBRATION_MS);
    }
  }, [holdScore]);

  // Each tick causes a new render, which sets up the next tick with up-to-date values.
  // If saving fails, the next tick simply tries again.
  useEffect(() => {
    const timer = setTimeout(() => {
      const now = Date.now();
      const dueAction = getDueAction(clock, hold, state, rules, now);

      setNowMs(now);
      if (dueAction === 'none' || isActionRunning.current) {
        return;
      }

      // While saving keeps failing, it retries each tick, but must not buzz each time.
      if (!actions.hasActionFailed) {
        Vibration.vibrate(LONG_VIBRATION_MS);
      }
      void (dueAction === 'timeUp' ? addEvent({ type: 'timeUp' }) : endHold());
    }, TICK_MS);

    return () => clearTimeout(timer);
  });

  return {
    ...actions,
    state,
    elapsedSeconds: getElapsedSeconds(clock, nowMs),
    holdSide: hold.side,
    holdSeconds,
    holdScore,
    isClockRunning: clock.startedAtMs !== null,
    canUndo: data.events.length > 0,
  };
}
