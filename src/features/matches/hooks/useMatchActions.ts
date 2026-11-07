/**
 * =====================================================
 * FILE: useMatchActions.ts
 * PURPOSE: Saves each thing that happens in a match.
 * USED BY: useLiveMatch.ts
 * =====================================================
 */
import { useSQLiteContext } from 'expo-sqlite';
import { useRef, useState } from 'react';

import { applyMatchEvent } from '@/lib/rules/applyMatchEvent';
import { getElapsedSeconds } from '@/lib/rules/matchClock';
import { osaekomiResult } from '@/lib/rules/osaekomi';
import type { MatchEvent, MatchState, Side } from '@/lib/rules/types';

import {
  finishMatch,
  removeLastEvent,
  saveClock,
  saveHold,
  saveMatchEvent,
} from '../db/matchQueries';
import { getClockAfterEvent, getHoldSeconds, getMatchDuration } from '../matchTick';
import type { MatchData } from '../types';

/**
 * Gives the match screen its actions.
 * @param data the saved match
 * @param state the match's scores, worked out from its events
 * @param reload reads the saved match again
 */
export function useMatchActions(
  data: MatchData,
  state: MatchState,
  reload: () => Promise<void>,
) {
  const db = useSQLiteContext();
  const { row, rules } = data;
  const [hasActionFailed, setHasActionFailed] = useState(false);
  // A ref changes at once, so a fast second tap can't save something twice.
  const isActionRunning = useRef(false);
  const clock = { elapsedSeconds: row.clockElapsedSeconds, startedAtMs: row.clockStartedAtMs };
  const hold = { side: row.osaekomiSide, startedAtMs: row.osaekomiStartedAtMs };
  const isGoldenScore = state.period === 'goldenScore';

  async function run(action: () => Promise<void>) {
    // A tap during a save can't be saved, so say so: the trainer must not believe
    // it was scored. The timers check first, so this only ever happens to a tap.
    if (isActionRunning.current) {
      setHasActionFailed(true);
      return;
    }

    isActionRunning.current = true;
    setHasActionFailed(false);
    try {
      await action();
      // Waits for fresh data, so that a tick can't act on the match as it was before.
      await reload();
    } catch {
      setHasActionFailed(true);
    } finally {
      isActionRunning.current = false;
    }
  }

  function addEvent(event: MatchEvent, shouldEndHold = false) {
    return run(async () => {
      const next = applyMatchEvent(state, event, rules);
      if (next === state) {
        return;
      }

      const now = Date.now();
      const newClock = getClockAfterEvent(clock, state, next, event, rules, now);
      const isOver = next.outcome.type !== 'inProgress';

      await saveMatchEvent(
        db,
        row.id,
        event,
        newClock,
        getElapsedSeconds(clock, now),
        shouldEndHold || isOver,
      );
    });
  }

  /** Ends the hold, and gives its athlete whatever it has earned at this very moment. */
  function endHold() {
    if (hold.side === null) {
      return Promise.resolve();
    }

    const seconds = getHoldSeconds(hold, Date.now());
    const { score } = osaekomiResult(seconds, state[hold.side], isGoldenScore, rules);

    return score === null
      ? run(() => saveHold(db, row.id, null, null))
      : addEvent({ type: 'score', side: hold.side, score }, true);
  }

  function setClockRunning(isRunning: boolean) {
    const now = Date.now();
    const elapsedSeconds = getElapsedSeconds(clock, now);

    return run(() =>
      saveClock(db, row.id, { elapsedSeconds, startedAtMs: isRunning ? now : null }),
    );
  }

  /** Puts the clock back to the start of the period, keeping any golden score. */
  function resetClock() {
    const start = isGoldenScore ? rules.matchSeconds : 0;

    return run(() => saveClock(db, row.id, { elapsedSeconds: start, startedAtMs: null }));
  }

  /** Saves the final result, once the trainer has confirmed it. */
  function finish() {
    const { outcome } = state;
    if (outcome.type !== 'won' && outcome.type !== 'bothLost') {
      return Promise.resolve();
    }

    const isWon = outcome.type === 'won';
    let winnerEntryId: string | null = null;
    if (isWon) {
      winnerEntryId = outcome.winner === 'white' ? row.whiteEntryId : row.blueEntryId;
    }

    return run(() =>
      finishMatch(db, row.id, {
        winnerEntryId,
        // When both lose, it's by hansoku-make: nothing else can cause it.
        resultType: isWon ? outcome.resultType : 'hansokuMake',
        isGoldenScore,
        white: state.white,
        blue: state.blue,
        durationSeconds: getMatchDuration(data, getElapsedSeconds(clock, Date.now())),
      }),
    );
  }

  return {
    hasActionFailed,
    isActionRunning,
    addEvent,
    endHold,
    setClockRunning,
    resetClock,
    finish,
    startHold: (side: Side) => run(() => saveHold(db, row.id, side, Date.now())),
    undo: () => run(() => removeLastEvent(db, row.id)),
  };
}
