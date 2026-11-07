/**
 * =====================================================
 * FILE: matchClock.test.ts
 * PURPOSE: Worked examples of the match clock.
 * USED BY: npm test
 * =====================================================
 */
import { buildRuleSet } from '../buildRuleSet';
import { formatClock, getDisplaySeconds, getElapsedSeconds, getPeriodLimit } from '../matchClock';

const BASE = {
  hasWazaAriAwaseteIppon: true,
  shidosForHansokuMake: 3,
  osaekomiSecondsYuko: 5,
  osaekomiSecondsWazaAri: 10,
  osaekomiSecondsIppon: 20,
  goldenScoreWonByShido: false,
};
const RULES = buildRuleSet(BASE, null);

describe('getElapsedSeconds', () => {
  it('stays still while paused', () => {
    expect(getElapsedSeconds({ elapsedSeconds: 30, startedAtMs: null }, 999999)).toBe(30);
  });

  it('adds the running time, in whole seconds', () => {
    expect(getElapsedSeconds({ elapsedSeconds: 30, startedAtMs: 1000 }, 6900)).toBe(35);
  });

  it('survives closing the app, by counting from the saved start time', () => {
    const saved = { elapsedSeconds: 0, startedAtMs: 1000 };

    expect(getElapsedSeconds(saved, 1000 + 90_000)).toBe(90);
  });

  it('never runs backward if the tablet time changes', () => {
    expect(getElapsedSeconds({ elapsedSeconds: 30, startedAtMs: 5000 }, 1000)).toBe(30);
  });
});

describe('getPeriodLimit', () => {
  it('ends regular time at the match length', () => {
    expect(getPeriodLimit('regular', RULES)).toBe(240);
  });

  it('never ends an unlimited golden score', () => {
    expect(getPeriodLimit('goldenScore', RULES)).toBeNull();
  });

  it('ends a limited golden score after its own time', () => {
    const veterans = { ...RULES, matchSeconds: 150, goldenScoreMaxSeconds: 60 };

    expect(getPeriodLimit('goldenScore', veterans)).toBe(210);
  });
});

describe('getDisplaySeconds', () => {
  it('counts regular time down, and stops at zero', () => {
    expect(getDisplaySeconds(60, 'regular', RULES)).toBe(180);
    expect(getDisplaySeconds(300, 'regular', RULES)).toBe(0);
  });

  it('counts golden score up from zero', () => {
    expect(getDisplaySeconds(240, 'goldenScore', RULES)).toBe(0);
    expect(getDisplaySeconds(250, 'goldenScore', RULES)).toBe(10);
  });
});

describe('formatClock', () => {
  it.each([
    [0, '0:00'],
    [5, '0:05'],
    [65, '1:05'],
    [240, '4:00'],
  ])('shows %i seconds as %s', (seconds, text) => {
    expect(formatClock(seconds)).toBe(text);
  });
});
