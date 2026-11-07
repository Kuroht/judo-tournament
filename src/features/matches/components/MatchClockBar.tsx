/**
 * =====================================================
 * FILE: MatchClockBar.tsx
 * PURPOSE: The match clock with start, pause and reset.
 *          A trainer who prefers can ignore it and only
 *          enter the result.
 * USED BY: LiveMatch.tsx
 * =====================================================
 */
import { useState } from 'react';
import { Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { useT } from '@/lib/i18n/useT';
import { formatClock, getDisplaySeconds } from '@/lib/rules/matchClock';
import type { MatchState, RuleSet } from '@/lib/rules/types';

type MatchClockBarProps = {
  elapsedSeconds: number;
  period: MatchState['period'];
  rules: RuleSet;
  isRunning: boolean;
  isInProgress: boolean;
  onSetRunning: (isRunning: boolean) => void;
  onReset: () => void;
};

export function MatchClockBar(props: MatchClockBarProps) {
  const { elapsedSeconds, period, rules, isRunning, isInProgress, onSetRunning, onReset } = props;
  const t = useT();
  const [isConfirmingReset, setIsConfirmingReset] = useState(false);
  const isGoldenScore = period === 'goldenScore';
  const clockText = formatClock(getDisplaySeconds(elapsedSeconds, period, rules));

  return (
    <View className="gap-2 rounded-2xl bg-stone-800 p-3">
      {isGoldenScore && (
        <Text className="text-center text-xl font-bold text-amber-300">
          {t('matches.goldenScore')}
        </Text>
      )}
      {/* Dark in both themes, like the clock on a real scoreboard. */}
      <Text
        accessibilityLabel={`${t('matches.clockLabel')}: ${clockText}`}
        className="text-center text-7xl font-bold text-white"
      >
        {clockText}
      </Text>
      <View className="flex-row gap-2">
        <View className="flex-[2]">
          <Button
            label={t(isRunning ? 'matches.pause' : 'matches.start')}
            variant={isRunning ? 'secondary' : 'primary'}
            isDisabled={!isInProgress}
            onPress={() => onSetRunning(!isRunning)}
          />
        </View>
        <View className="flex-1">
          <Button
            label={t('matches.reset')}
            variant="secondary"
            isDisabled={!isInProgress}
            onPress={() => setIsConfirmingReset(true)}
          />
        </View>
      </View>
      <ConfirmDialog
        isVisible={isConfirmingReset}
        title={t('matches.resetTitle')}
        message={t('matches.resetMessage')}
        confirmLabel={t('matches.reset')}
        cancelLabel={t('common.cancel')}
        onConfirm={() => {
          setIsConfirmingReset(false);
          onReset();
        }}
        onCancel={() => setIsConfirmingReset(false)}
      />
    </View>
  );
}
