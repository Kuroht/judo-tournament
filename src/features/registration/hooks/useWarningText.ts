/**
 * =====================================================
 * FILE: useWarningText.ts
 * PURPOSE: Turns eligibility warnings into readable text.
 * USED BY: EligibilityWarnings.tsx, AddAthletesContent.tsx
 * =====================================================
 */
import { useT } from '@/lib/i18n/useT';

import type { EligibilityWarning } from '../types';

/**
 * Gives a function that describes one warning in the current language.
 * @returns the function
 * @example
 * const warningText = useWarningText();
 * warningText({ type: 'tooYoung', age: 14, minAge: 15 });
 * // "Tem 14 anos e o mínimo é 15"
 */
export function useWarningText() {
  const t = useT();

  return (warning: EligibilityWarning): string => {
    switch (warning.type) {
      case 'sex':
        return t('registration.warning.sex');
      case 'tooYoung':
        return t('registration.warning.tooYoung', { age: warning.age, minAge: warning.minAge });
      case 'tooOld':
        return t('registration.warning.tooOld', { age: warning.age, maxAge: warning.maxAge });
    }
  };
}
