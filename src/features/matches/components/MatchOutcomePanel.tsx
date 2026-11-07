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
    <View className="gap-3 rounded-xl border-4 border-green-700 bg-white p-4 dark:bg-slate-800">
      <Text className="text-center text-2xl font-bold text-slate-900 dark:text-slate-100">
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
