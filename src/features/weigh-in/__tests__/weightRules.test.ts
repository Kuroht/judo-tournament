/**
 * =====================================================
 * FILE: weightRules.test.ts
 * PURPOSE: Worked examples of the weigh-in limits, because
 *          these decide whether someone gets to compete.
 * USED BY: npm test
 * =====================================================
 */
import type { WeightLimits } from '../types';
import { evaluateWeight, formatKg, parseWeightInput } from '../weightRules';

function limits(minKg: number | null, maxKg: number | null, toleranceGrams = 0): WeightLimits {
  return { minKg, maxKg, toleranceGrams, isFreeGrouping: false };
}

describe('evaluateWeight', () => {
  it('includes exactly 200 g of tolerance, and nothing more (FPJ Article 17)', () => {
    const cadetes60 = limits(55, 60, 200);

    expect(evaluateWeight(60.2, cadetes60)).toBe('pass');
    expect(evaluateWeight(60.201, cadetes60)).toBe('over');
  });

  it('fails one gram over with no tolerance', () => {
    expect(evaluateWeight(66, limits(60, 66))).toBe('pass');
    expect(evaluateWeight(66.001, limits(60, 66))).toBe('over');
  });

  it('treats the lower limit as belonging to the lighter category', () => {
    expect(evaluateWeight(60, limits(60, 66))).toBe('under');
    expect(evaluateWeight(60.001, limits(60, 66))).toBe('pass');
  });

  it('never lets tolerance help someone who is under', () => {
    expect(evaluateWeight(60, limits(60, 66, 200))).toBe('under');
  });

  it('handles categories with no lower or upper limit', () => {
    expect(evaluateWeight(30, limits(null, 50))).toBe('pass');
    expect(evaluateWeight(150, limits(90, null))).toBe('pass');
  });

  it('always passes a free group', () => {
    expect(evaluateWeight(150, { ...limits(null, null), isFreeGrouping: true })).toBe('pass');
  });

  it('is not fooled by decimal errors', () => {
    expect(evaluateWeight(60 + 0.1 + 0.2, limits(null, 60.3))).toBe('pass');
  });
});

describe('parseWeightInput', () => {
  it('accepts a comma or a point', () => {
    expect(parseWeightInput('60,5')).toBe(60.5);
    expect(parseWeightInput(' 60.25 ')).toBe(60.25);
  });

  it.each(['', 'abc', '605', '4.9', '300.1', '-5', '60,5,5', '60.1234'])('refuses "%s"', (text) => {
    expect(parseWeightInput(text)).toBeNull();
  });
});

describe('formatKg', () => {
  it('uses the decimal mark of the language', () => {
    expect(formatKg(60.5, 'pt')).toBe('60,5');
    expect(formatKg(60.5, 'en')).toBe('60.5');
  });
});
