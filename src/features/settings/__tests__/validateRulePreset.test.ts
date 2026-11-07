/**
 * =====================================================
 * FILE: validateRulePreset.test.ts
 * PURPOSE: Worked examples of checking the season year and
 *          an age class's rules.
 * USED BY: npm test
 * =====================================================
 */
import type { RulePresetFormValues } from '../types';
import { parseSeasonYear, validateRulePreset } from '../validateRulePreset';

const GOOD: RulePresetFormValues = {
  matchSeconds: '240',
  hasGoldenScore: true,
  goldenScoreMaxSeconds: '',
  isYukoEnabled: true,
  weightToleranceGrams: '200',
};

describe('parseSeasonYear', () => {
  it('accepts a real year', () => {
    expect(parseSeasonYear(' 2026 ')).toBe(2026);
  });

  it.each(['', '26', 'abcd', '20.5', '-2026', '3000'])('refuses "%s"', (text) => {
    expect(parseSeasonYear(text)).toBeNull();
  });
});

describe('validateRulePreset', () => {
  it('turns good values into rules, with empty meaning unlimited golden score', () => {
    expect(validateRulePreset(GOOD)).toEqual({
      rules: {
        matchSeconds: 240,
        hasGoldenScore: true,
        goldenScoreMaxSeconds: null,
        isYukoEnabled: true,
        weightToleranceGrams: 200,
      },
    });
  });

  it('keeps a golden score limit', () => {
    const checked = validateRulePreset({ ...GOOD, goldenScoreMaxSeconds: '60' });

    expect('rules' in checked && checked.rules.goldenScoreMaxSeconds).toBe(60);
  });

  it('ignores the limit when there is no golden score', () => {
    const checked = validateRulePreset({
      ...GOOD,
      hasGoldenScore: false,
      goldenScoreMaxSeconds: 'nonsense',
    });

    expect('rules' in checked && checked.rules.goldenScoreMaxSeconds).toBeNull();
  });

  it.each(['', '0', '29', '1201', 'abc', '-240', '2.5'])('refuses a match of "%s"', (text) => {
    expect(validateRulePreset({ ...GOOD, matchSeconds: text })).toEqual({
      errors: { matchSeconds: true },
    });
  });

  it.each(['0', 'abc', '1201'])('refuses a golden score limit of "%s"', (text) => {
    expect(validateRulePreset({ ...GOOD, goldenScoreMaxSeconds: text })).toEqual({
      errors: { goldenScoreMaxSeconds: true },
    });
  });

  it('accepts no weight tolerance, and refuses a silly one', () => {
    expect('rules' in validateRulePreset({ ...GOOD, weightToleranceGrams: '0' })).toBe(true);
    expect(validateRulePreset({ ...GOOD, weightToleranceGrams: '9999' })).toEqual({
      errors: { weightToleranceGrams: true },
    });
  });

  it('reports every wrong field at once', () => {
    const checked = validateRulePreset({ ...GOOD, matchSeconds: '', weightToleranceGrams: '' });

    expect(checked).toEqual({ errors: { matchSeconds: true, weightToleranceGrams: true } });
  });
});
