/**
 * =====================================================
 * FILE: ProgressBar.tsx
 * PURPOSE: Shows how much of a job is done, in a bar and
 *          in words.
 * USED BY: WeighInContent.tsx
 * =====================================================
 */
import { Text, View } from 'react-native';

type ProgressBarProps = {
  label: string;
  done: number;
  total: number;
};

export function ProgressBar({ label, done, total }: ProgressBarProps) {
  const percent = total === 0 ? 0 : Math.min(100, Math.round((done / total) * 100));

  return (
    <View className="gap-1">
      <Text className="text-lg font-semibold text-stone-900 dark:text-stone-100">{label}</Text>
      <View className="h-2 overflow-hidden rounded-full bg-stone-200 dark:bg-stone-700">
        {/* The width changes with the data, so it can't be a Tailwind class. */}
        <View className="h-full rounded-full bg-accent" style={{ width: `${percent}%` }} />
      </View>
    </View>
  );
}
