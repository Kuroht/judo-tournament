/**
 * =====================================================
 * FILE: getOutcomeText.ts
 * PURPOSE: Words a match's outcome for the screen.
 * USED BY: MatchOutcomePanel.tsx, FinishedMatch.tsx
 * =====================================================
 */
import type { useT } from '@/lib/i18n/useT';
import type { MatchOutcome } from '@/lib/rules/types';

/**
 * Describes how a match stands.
 * @param t the translation function
 * @example
 * getOutcomeText({ type: 'won', winner: 'blue', resultType: 'ippon' }, 'Ana', 'Rui', t);
 * // "Rui ganha por Ippon"
 */
export function getOutcomeText(
  outcome: MatchOutcome,
  whiteName: string,
  blueName: string,
  t: ReturnType<typeof useT>,
): string {
  switch (outcome.type) {
    case 'won':
      return t('matches.wonBy', {
        name: outcome.winner === 'white' ? whiteName : blueName,
        result: t(`matches.result.${outcome.resultType}`),
      });
    case 'bothLost':
      return t('matches.bothLost');
    case 'needsDecision':
      return t('matches.needsDecision');
    case 'inProgress':
      return '';
  }
}
