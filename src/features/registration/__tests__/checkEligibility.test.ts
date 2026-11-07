/**
 * =====================================================
 * FILE: checkEligibility.test.ts
 * PURPOSE: Worked examples of the registration warnings.
 * USED BY: npm test
 * =====================================================
 */
import { checkEligibility } from '../checkEligibility';

// Cadetes in the 2026 season: aged 15 to 17 on 31 December.
const CADETES = { sex: 'male', minAge: 15, maxAge: 17, seasonYear: 2026 } as const;

describe('checkEligibility', () => {
  it('finds nothing wrong at either edge of the age range', () => {
    expect(checkEligibility({ birthYear: 2011, sex: 'male' }, CADETES)).toEqual([]);
    expect(checkEligibility({ birthYear: 2009, sex: 'male' }, CADETES)).toEqual([]);
  });

  it('warns one year outside each edge', () => {
    expect(checkEligibility({ birthYear: 2012, sex: 'male' }, CADETES)).toEqual([
      { type: 'tooYoung', age: 14, minAge: 15 },
    ]);
    expect(checkEligibility({ birthYear: 2008, sex: 'male' }, CADETES)).toEqual([
      { type: 'tooOld', age: 18, maxAge: 17 },
    ]);
  });

  it('warns about sex, except in a mixed category', () => {
    expect(checkEligibility({ birthYear: 2010, sex: 'female' }, CADETES)).toEqual([{ type: 'sex' }]);
    expect(
      checkEligibility({ birthYear: 2010, sex: 'female' }, { ...CADETES, sex: 'mixed' }),
    ).toEqual([]);
  });

  it('reports both problems together', () => {
    expect(checkEligibility({ birthYear: 2000, sex: 'female' }, CADETES)).toHaveLength(2);
  });

  it('does not check age when the category has no age limits', () => {
    const noLimits = { ...CADETES, minAge: null, maxAge: null };

    expect(checkEligibility({ birthYear: 1950, sex: 'male' }, noLimits)).toEqual([]);
  });

  it('uses the season year, not today', () => {
    const nextSeason = { ...CADETES, seasonYear: 2027 };

    expect(checkEligibility({ birthYear: 2012, sex: 'male' }, nextSeason)).toEqual([]);
  });
});
