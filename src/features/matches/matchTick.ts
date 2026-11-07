/**
 * =====================================================
 * FILE: matchTick.ts
 * PURPOSE: Decides what the timers must do by themselves,
 *          and where the clock stands after an event.
 *          Pure functions, so they're easy to test.
 * USED BY: useLiveMatch.ts
 * =====================================================
 */
import { replayMatchEvents } from '@/lib/rules/applyMatchEvent';
import { getElapsedSeconds, getPeriodLimit, type MatchClock } from '@/lib/rules/matchClock';
import { osaekomiResult } from '@/lib/rules/osaekomi';
import type { MatchEvent, MatchState, RuleSet, Side } from '@/lib/rules/types';

import type { MatchData } from './types';

export type RunningHold = {
  side: Side | null;
  startedAtMs: number | null;
};

/**
 * Works out how a saved match stands. A tie's new contest is fought in golden score
 * from the start (FPJ Article 47.2).
 */
export function getMatchState(data: MatchData): MatchState {
  return replayMatchEvents(
    data.events.map((saved) => saved.event),
    data.rules,
    data.contest.isPlayoff ? 'goldenScore' : 'regular',
  );
}

/** Finds how long a match lasted. A tie's new contest has no regular time to count. */
export function getMatchDuration(data: MatchData, elapsedSeconds: number): number {
  return data.contest.isPlayoff
    ? Math.max(0, elapsedSeconds - data.rules.matchSeconds)
    : elapsedSeconds;
}

/** Finds how many seconds the current hold has lasted. */
export function getHoldSeconds(hold: RunningHold, nowMs: number): number {
  return getElapsedSeconds({ elapsedSeconds: 0, startedAtMs: hold.startedAtMs }, nowMs);
}

/**
 * Finds what is due right now.
 * @returns 'endHold' when a hold has earned all it can, 'timeUp' when the time has run
 *          out, or 'none'. Time can't run out during a hold: IJF lets a hold finish first.
 */
export function getDueAction(
  clock: MatchClock,
  hold: RunningHold,
  state: MatchState,
  rules: RuleSet,
  nowMs: number,
): 'none' | 'endHold' | 'timeUp' {
  if (state.outcome.type !== 'inProgress') {
    return 'none';
  }

  if (hold.side !== null) {
    const isGoldenScore = state.period === 'goldenScore';
    const seconds = getHoldSeconds(hold, nowMs);
    const result = osaekomiResult(seconds, state[hold.side], isGoldenScore, rules);

    return result.isFinished ? 'endHold' : 'none';
  }

  const limit = getPeriodLimit(state.period, rules);
  const isTimeOver = limit !== null && getElapsedSeconds(clock, nowMs) >= limit;

  return clock.startedAtMs !== null && isTimeOver ? 'timeUp' : 'none';
}

/**
 * Finds where the clock stands after an event.
 * @param before the match before the event
 * @param after the match after the event
 * @returns the clock to save. It stops when the match ends. It also stops on time-up,
 *          because golden score only begins when the referee says hajime.
 */
export function getClockAfterEvent(
  clock: MatchClock,
  before: MatchState,
  after: MatchState,
  event: MatchEvent,
  rules: RuleSet,
  nowMs: number,
): MatchClock {
  const elapsedSeconds = getElapsedSeconds(clock, nowMs);

  if (event.type === 'timeUp') {
    // Time-up can be entered by hand, so the clock jumps to the end of the period.
    return {
      elapsedSeconds: getPeriodLimit(before.period, rules) ?? elapsedSeconds,
      startedAtMs: null,
    };
  }

  return after.outcome.type === 'inProgress' ? clock : { elapsedSeconds, startedAtMs: null };
}
