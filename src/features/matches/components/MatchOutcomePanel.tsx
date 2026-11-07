/**
 * =====================================================
 * FILE: MatchOutcomePanel.tsx
 * PURPOSE: Appears when the rules have decided the match, or
 *          need a decision. Nothing is final until the
 *          trainer confirms here, so a wrong tap can be undone.
 * USED BY: LiveMatch.tsx
 * =====================================================
 */
import { Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { useT } from '@/lib/i18n/useT';
import type { MatchOutcome, Side } from '@/lib/rules/types';

import { getOutcomeText } from '../getOutcomeText';

type MatchOutcomePanelProps = {
  outcome: MatchOutcome;
  whiteName: string;
  blueName: string;
  onDecide: (winner: Side) => void;
  onFinish: () => void;
};

export function MatchOutcomePanel(props: MatchOutcomePanelProps) {
  const { outcome, whiteName, blueName, onDecide, onFinish } = props;
  const t = useT();

  return (
    <View className="gap-3 rounded-2xl border-4 border-accent bg-white p-3 dark:border-accent-light dark:bg-stone-800">
      {/* Announced by screen readers as soon as it appears. */}
      <Text
        accessibilityLiveRegion="polite"
        className="text-center text-xl font-bold text-stone-900 dark:text-stone-100"
      >
        {getOutcomeText(outcome, whiteName, blueName, t)}
      </Text>
      {outcome.type === 'needsDecision' ? (
        <>
          <Button
            label={t('matches.decideFor', { name: whiteName })}
            onPress={() => onDecide('white')}
          />
          <Button
            label={t('matches.decideFor', { name: blueName })}
            onPress={() => onDecide('blue')}
          />
        </>
      ) : (
        <Button label={t('matches.confirmFinish')} onPress={onFinish} />
      )}
    </View>
  );
}
