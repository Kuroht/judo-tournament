/**
 * =====================================================
 * FILE: matchTick.test.ts
 * PURPOSE: Worked examples of what the match timers do
 *          by themselves.
 * USED BY: npm test
 * =====================================================
 */
import { applyMatchEvent, createMatchState } from '@/lib/rules/applyMatchEvent';
import { buildRuleSet } from '@/lib/rules/buildRuleSet';
import type { MatchEvent } from '@/lib/rules/types';

import { getClockAfterEvent, getDueAction } from '../matchTick';

const RULES = buildRuleSet(
  {
    hasWazaAriAwaseteIppon: true,
    shidosForHansokuMake: 3,
    osaekomiSecondsYuko: 5,
    osaekomiSecondsWazaAri: 10,
    osaekomiSecondsIppon: 20,
    goldenScoreWonByShido: false,
  },
  null,
);
const NO_HOLD = { side: null, startedAtMs: null };
const PAUSED = { elapsedSeconds: 0, startedAtMs: null };
const FRESH = createMatchState();

describe('getDueAction', () => {
  it('does nothing while time remains', () => {
    const clock = { elapsedSeconds: 0, startedAtMs: 0 };

    expect(getDueAction(clock, NO_HOLD, FRESH, RULES, 239_000)).toBe('none');
  });

  it('calls time-up when the running clock reaches the limit', () => {
    const clock = { elapsedSeconds: 0, startedAtMs: 0 };

    expect(getDueAction(clock, NO_HOLD, FRESH, RULES, 240_000)).toBe('timeUp');
  });

  it('waits for a paused clock, so undoing a time-up does not repeat it', () => {
    const clock = { elapsedSeconds: 240, startedAtMs: null };

    expect(getDueAction(clock, NO_HOLD, FRESH, RULES, 999_000)).toBe('none');
  });

  it('lets a hold finish after the time has run out', () => {
    const clock = { elapsedSeconds: 0, startedAtMs: 0 };
    const hold = { side: 'white' as const, startedAtMs: 235_000 };

    expect(getDueAction(clock, hold, FRESH, RULES, 245_000)).toBe('none');
  });

  it('ends a hold at 20 seconds', () => {
    const hold = { side: 'blue' as const, startedAtMs: 0 };

    expect(getDueAction(PAUSED, hold, FRESH, RULES, 19_000)).toBe('none');
    expect(getDueAction(PAUSED, hold, FRESH, RULES, 20_000)).toBe('endHold');
  });

  it('ends a hold at the first score in golden score', () => {
    const golden = { ...FRESH, period: 'goldenScore' as const };
    const hold = { side: 'blue' as const, startedAtMs: 0 };

    expect(getDueAction(PAUSED, hold, golden, RULES, 5_000)).toBe('endHold');
  });

  it('does nothing once the match has been decided', () => {
    const clock = { elapsedSeconds: 0, startedAtMs: 0 };
    const won = applyMatchEvent(FRESH, { type: 'score', side: 'white', score: 'ippon' }, RULES);

    expect(getDueAction(clock, NO_HOLD, won, RULES, 999_000)).toBe('none');
  });
});

describe('getClockAfterEvent', () => {
  function after(event: MatchEvent, clock: { elapsedSeconds: number; startedAtMs: number | null }) {
    const next = applyMatchEvent(FRESH, event, RULES);

    return getClockAfterEvent(clock, FRESH, next, event, RULES, 30_000);
  }

  it('keeps running after an ordinary score', () => {
    const clock = { elapsedSeconds: 0, startedAtMs: 0 };

    expect(after({ type: 'score', side: 'white', score: 'wazaAri' }, clock)).toEqual(clock);
  });

  it('stops and keeps the match length when the match is decided', () => {
    const clock = { elapsedSeconds: 0, startedAtMs: 0 };

    expect(after({ type: 'score', side: 'white', score: 'ippon' }, clock)).toEqual({
      elapsedSeconds: 30,
      startedAtMs: null,
    });
  });

  it('jumps to the end of the period on a hand-entered time-up, ready for golden score', () => {
    expect(after({ type: 'timeUp' }, PAUSED)).toEqual({ elapsedSeconds: 240, startedAtMs: null });
  });
});
