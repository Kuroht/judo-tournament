/**
 * =====================================================
 * FILE: OsaekomiBar.tsx
 * PURPOSE: A hold in progress: who is holding, for how
 *          long, what it's worth, and the button to end it.
 * USED BY: LiveMatch.tsx
 * =====================================================
 */
import { Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { useT } from '@/lib/i18n/useT';
import type { Score } from '@/lib/rules/types';

type OsaekomiBarProps = {
  athleteName: string;
  seconds: number;
  score: Score | null;
  onEnd: () => void;
};

export function OsaekomiBar({ athleteName, seconds, score, onEnd }: OsaekomiBarProps) {
  const t = useT();

  return (
    <View className="gap-1 rounded-2xl border-4 border-amber-600 bg-white p-3 dark:bg-stone-800">
      <Text className="text-center text-base font-bold text-stone-900 dark:text-stone-100">
        {`${t('matches.osaekomi')}: ${athleteName}`}
      </Text>
      <Text className="text-center text-5xl font-bold text-amber-800 dark:text-amber-300">
        {seconds}
      </Text>
      <Text className="pb-1 text-center text-base font-semibold text-stone-900 dark:text-stone-100">
        {score === null ? t('matches.holdNoScore') : t(`matches.${score}`)}
      </Text>
      <Button label={t('matches.toketa')} onPress={onEnd} />
    </View>
  );
}
