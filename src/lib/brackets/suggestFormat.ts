/**
 * =====================================================
 * FILE: suggestFormat.ts
 * PURPOSE: Suggests a competition format from the number
 *          of athletes, following FPJ Articles 38 and 39.
 * USED BY: CategoryDrawContent.tsx
 * =====================================================
 */

/**
 * Suggests a format. The trainer can always choose another.
 * @param athleteCount how many athletes are in the draw
 * @returns 'poule' for up to 5, 'twoPoules' for 6 to 8, otherwise 'doubleRepechage'
 */
export function suggestFormat(athleteCount: number): 'poule' | 'twoPoules' | 'doubleRepechage' {
  if (athleteCount <= 5) {
    return 'poule';
  }

  return athleteCount <= 8 ? 'twoPoules' : 'doubleRepechage';
}
