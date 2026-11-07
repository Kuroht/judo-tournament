/**
 * =====================================================
 * FILE: StatusBadge.tsx
 * PURPOSE: A small colored label for how something stands.
 *          The word carries the meaning, so it doesn't
 *          depend on color alone.
 * USED BY: ListRow.tsx, CategoryTile.tsx and others
 * =====================================================
 */
import { Text, View } from 'react-native';

export type BadgeTone = 'neutral' | 'active' | 'done' | 'warning';

type StatusBadgeProps = {
  label: string;
  tone?: BadgeTone;
};

// Full class names, because Tailwind can't find class names built from pieces.
const BADGE_CLASSES: Record<BadgeTone, string> = {
  neutral: 'bg-stone-200 dark:bg-stone-700',
  active: 'bg-red-100 dark:bg-red-950',
  done: 'bg-green-100 dark:bg-green-950',
  warning: 'bg-amber-100 dark:bg-amber-950',
};

const BADGE_TEXT_CLASSES: Record<BadgeTone, string> = {
  neutral: 'text-stone-700 dark:text-stone-200',
  active: 'text-red-800 dark:text-red-200',
  done: 'text-green-800 dark:text-green-200',
  warning: 'text-amber-900 dark:text-amber-200',
};

export function StatusBadge({ label, tone = 'neutral' }: StatusBadgeProps) {
  return (
    <View className={`self-start rounded-full px-3 py-1 ${BADGE_CLASSES[tone]}`}>
      <Text className={`text-sm font-semibold ${BADGE_TEXT_CLASSES[tone]}`}>{label}</Text>
    </View>
  );
}
