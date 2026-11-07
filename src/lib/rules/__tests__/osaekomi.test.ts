/**
 * =====================================================
 * FILE: osaekomi.test.ts
 * PURPOSE: Worked examples of what a hold-down is worth.
 * USED BY: npm test
 * =====================================================
 */
import { buildRuleSet, DEFAULT_AGE_CLASS_RULES } from '../buildRuleSet';
import { osaekomiResult } from '../osaekomi';
import type { RuleSet, SideScore } from '../types';

const BASE = {
  hasWazaAriAwaseteIppon: true,
  shidosForHansokuMake: 3,
  osaekomiSecondsYuko: 5,
  osaekomiSecondsWazaAri: 10,
  osaekomiSecondsIppon: 20,
  goldenScoreWonByShido: false,
};
const RULES: RuleSet = buildRuleSet(BASE, null);
const NO_SCORE: SideScore = { ippons: 0, wazaAris: 0, yukos: 0, shidos: 0 };
const ONE_WAZA_ARI: SideScore = { ...NO_SCORE, wazaAris: 1 };

describe('osaekomi in regular time', () => {
  it.each([
    [0, null],
    [4, null],
    [5, 'yuko'],
    [9, 'yuko'],
    [10, 'wazaAri'],
    [19, 'wazaAri'],
    [20, 'ippon'],
    [25, 'ippon'],
  ])('after %i seconds is worth %s', (seconds, score) => {
    expect(osaekomiResult(seconds, NO_SCORE, false, RULES).score).toBe(score);
  });

  it('carries on past yuko and waza-ari, trying for more', () => {
    expect(osaekomiResult(5, NO_SCORE, false, RULES).isFinished).toBe(false);
    expect(osaekomiResult(10, NO_SCORE, false, RULES).isFinished).toBe(false);
  });

  it('finishes at ippon', () => {
    expect(osaekomiResult(20, NO_SCORE, false, RULES).isFinished).toBe(true);
  });

  it('finishes at 10 seconds if that waza-ari is the second', () => {
    expect(osaekomiResult(10, ONE_WAZA_ARI, false, RULES).isFinished).toBe(true);
  });

  it('carries on after a second waza-ari if the rules turn awasete off', () => {
    const rules = { ...RULES, hasWazaAriAwaseteIppon: false };

    expect(osaekomiResult(10, ONE_WAZA_ARI, false, rules).isFinished).toBe(false);
  });
});

describe('osaekomi in golden score', () => {
  it('ends at the first score, which is 5 seconds with yuko on', () => {
    expect(osaekomiResult(5, NO_SCORE, true, RULES)).toEqual({ score: 'yuko', isFinished: true });
  });

  it('ends at 10 seconds with yuko off', () => {
    const rules = buildRuleSet(BASE, { ...DEFAULT_AGE_CLASS_RULES, isYukoEnabled: false });

    expect(osaekomiResult(5, NO_SCORE, true, rules).score).toBeNull();
    expect(osaekomiResult(10, NO_SCORE, true, rules)).toEqual({
      score: 'wazaAri',
      isFinished: true,
    });
  });
});

describe('buildRuleSet', () => {
  it('uses the age class values', () => {
    const rules = buildRuleSet(BASE, {
      isYukoEnabled: true,
      hasGoldenScore: true,
      matchSeconds: 150,
      goldenScoreMaxSeconds: 60,
    });

    expect(rules.matchSeconds).toBe(150);
    expect(rules.goldenScoreMaxSeconds).toBe(60);
    expect(rules.shidosForHansokuMake).toBe(3);
  });

  it('removes the yuko hold time when the age class turns yuko off', () => {
    const rules = buildRuleSet(BASE, { ...DEFAULT_AGE_CLASS_RULES, isYukoEnabled: false });

    expect(rules.osaekomiSecondsYuko).toBeNull();
  });

  it('falls back to defaults for a category with no age class', () => {
    expect(buildRuleSet(BASE, null).matchSeconds).toBe(240);
  });
});
