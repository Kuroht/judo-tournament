/**
 * =====================================================
 * FILE: matchClock.ts
 * PURPOSE: The match clock. Pure functions, so they're easy
 *          to test without waiting for real time to pass.
 * USED BY: useMatch.ts, MatchClockBar.tsx
 * =====================================================
 */
import type { MatchState, RuleSet } from './types';

/**
 * The clock as it's saved: seconds already used, plus when it last started. Saving
 * this, rather than a counter, is what lets the time survive closing the app.
 */
export type MatchClock = {
  elapsedSeconds: number;
  // Null while the clock is paused.
  startedAtMs: number | null;
};

/**
 * Finds how many seconds a clock has used. A clock left running keeps counting while
 * the app is closed, because the real match carries on too.
 * @param clock the saved clock
 * @param nowMs the current time
 */
export function getElapsedSeconds(clock: MatchClock, nowMs: number): number {
  if (clock.startedAtMs === null) {
    return clock.elapsedSeconds;
  }

  // The tablet's time could have been changed, so never count backward.
  const runningSeconds = Math.max(0, Math.floor((nowMs - clock.startedAtMs) / 1000));

  return clock.elapsedSeconds + runningSeconds;
}

/**
 * Finds when this period's time runs out.
 * @returns the elapsed seconds at which it ends, or null if golden score is unlimited
 */
export function getPeriodLimit(period: MatchState['period'], rules: RuleSet): number | null {
  if (period === 'regular') {
    return rules.matchSeconds;
  }

  return rules.goldenScoreMaxSeconds === null
    ? null
    : rules.matchSeconds + rules.goldenScoreMaxSeconds;
}

/**
 * Finds the seconds to show: regular time counts down, and golden score counts up.
 * @example
 * getDisplaySeconds(60, 'regular', rules);      // 180 with a 4-minute match
 * getDisplaySeconds(250, 'goldenScore', rules); // 10 with a 4-minute match
 */
export function getDisplaySeconds(
  elapsedSeconds: number,
  period: MatchState['period'],
  rules: RuleSet,
): number {
  return period === 'regular'
    ? Math.max(0, rules.matchSeconds - elapsedSeconds)
    : Math.max(0, elapsedSeconds - rules.matchSeconds);
}

/**
 * Formats seconds for the clock.
 * @example
 * formatClock(65); // "1:05"
 */
export function formatClock(seconds: number): string {
  const wholeMinutes = Math.floor(seconds / 60);

  return `${wholeMinutes}:${String(seconds % 60).padStart(2, '0')}`;
}
