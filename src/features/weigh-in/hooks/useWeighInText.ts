/**
 * =====================================================
 * FILE: useWeighInText.ts
 * PURPOSE: Turns weigh-in data into readable text.
 * USED BY: WeighInRow.tsx, WeighDialog.tsx
 * =====================================================
 */
import { useLanguage } from '@/lib/i18n/useLanguage';
import { useT } from '@/lib/i18n/useT';

import type { WeighInEntry } from '../types';
import { evaluateWeight, formatKg } from '../weightRules';

/**
 * Gives functions that describe an entry in the current language.
 * @returns statusText for the athlete's result, and limitText for the category's limits
 */
export function useWeighInText() {
  const t = useT();
  const { language } = useLanguage();

  // The ✓ and ✗ signs mean the result isn't shown by color alone.
  function statusText(entry: WeighInEntry): string {
    switch (entry.status) {
      case 'noShow':
        return t('weighIn.status.noShow');
      case 'withdrawn':
        return t('weighIn.status.withdrawn');
      case 'registered':
        return t('weighIn.status.pending');
      case 'passed':
        return `✓ ${formatKg(entry.weighedKg ?? 0, language)} kg`;
      case 'failed': {
        const kg = entry.weighedKg ?? 0;
        const isOver = evaluateWeight(kg, entry) === 'over';
        const reason = t(isOver ? 'weighIn.status.over' : 'weighIn.status.under');
        return `✗ ${formatKg(kg, language)} kg · ${reason}`;
      }
    }
  }

  function limitText(entry: WeighInEntry): string {
    if (entry.isFreeGrouping) {
      return t('weighIn.limit.free');
    }

    const tolerance =
      entry.toleranceGrams > 0
        ? ` ${t('weighIn.limit.tolerance', { grams: entry.toleranceGrams })}`
        : '';

    return `${entry.categoryLabel}${tolerance}`;
  }

  return { statusText, limitText };
}
