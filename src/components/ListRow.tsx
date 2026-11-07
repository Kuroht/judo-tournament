/**
 * =====================================================
 * FILE: ListRow.tsx
 * PURPOSE: The app's standard row: an optional icon, a title,
 *          details, a status, and an arrow if it opens
 *          something.
 * USED BY: most lists
 * =====================================================
 */
import type { ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';

import { AppIcon, type IconName, type IconTone } from './AppIcon';
import { StatusBadge, type BadgeTone } from './StatusBadge';

type ListRowProps = {
  title: string;
  subtitle?: string;
  icon?: IconName;
  iconTone?: IconTone;
  badge?: string;
  badgeTone?: BadgeTone;
  // Draws attention to the row that matters most, such as the next match.
  isHighlighted?: boolean;
  // For a row that can't be pressed right now. It's dimmed, and announced as disabled.
  isDisabled?: boolean;
  isDimmed?: boolean;
  // Without this, the row is only information, so it has no arrow.
  onPress?: () => void;
  // For when an icon carries meaning, such as "add", that screen readers must hear too.
  accessibilityLabel?: string;
  // For anything extra under the details.
  children?: ReactNode;
};

export function ListRow(props: ListRowProps) {
  const { title, subtitle, icon, iconTone = 'soft', badge, badgeTone } = props;
  const { isHighlighted = false, isDisabled = false, isDimmed = false, onPress, children } = props;
  const borderClass = isHighlighted
    ? 'border-2 border-accent dark:border-accent-light'
    : 'border border-stone-200 dark:border-stone-700';

  return (
    <Pressable
      accessibilityRole={onPress === undefined ? undefined : 'button'}
      accessibilityLabel={props.accessibilityLabel}
      accessibilityState={{ disabled: isDisabled }}
      disabled={isDisabled || onPress === undefined}
      onPress={onPress}
      // min-h-16 is 64 dp, comfortably above the 48 dp minimum touch target.
      className={`min-h-16 flex-row items-center gap-3 rounded-xl bg-white px-4 py-3 dark:bg-stone-800 ${borderClass} ${isDimmed || isDisabled ? 'opacity-60' : ''}`}
    >
      {icon !== undefined && <AppIcon name={icon} tone={iconTone} size={26} />}
      <View className="flex-1 gap-1">
        <Text className="text-lg font-semibold text-stone-900 dark:text-stone-100">{title}</Text>
        {subtitle !== undefined && (
          <Text className="text-base text-stone-600 dark:text-stone-300">{subtitle}</Text>
        )}
        {children}
      </View>
      {badge !== undefined && <StatusBadge label={badge} tone={badgeTone} />}
      {onPress !== undefined && <AppIcon name="chevron-forward" tone="soft" size={20} />}
    </Pressable>
  );
}
