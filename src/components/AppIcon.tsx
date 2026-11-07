/**
 * =====================================================
 * FILE: AppIcon.tsx
 * PURPOSE: One icon, in a color that suits the theme.
 *          Icons are hidden from screen readers, so that
 *          anything they mean must also be written in words.
 * USED BY: Button.tsx, ListRow.tsx and others
 * =====================================================
 */
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from 'nativewind';
import type { ComponentProps } from 'react';

export type IconName = ComponentProps<typeof Ionicons>['name'];

export type IconTone = 'ink' | 'soft' | 'accent' | 'done' | 'white';

type AppIconProps = {
  name: IconName;
  tone?: IconTone;
  size?: number;
};

// Icons take a color value, not a Tailwind class. Each pair is [light, dark].
const ICON_COLORS: Record<IconTone, [string, string]> = {
  ink: ['#1A1612', '#F6F1E7'],
  soft: ['#7E7364', '#A99D8A'],
  accent: ['#B3261E', '#F2A79F'],
  done: ['#15803D', '#86EFAC'],
  white: ['#FFFFFF', '#FFFFFF'],
};

export function AppIcon({ name, tone = 'ink', size = 22 }: AppIconProps) {
  const { colorScheme } = useColorScheme();
  const [light, dark] = ICON_COLORS[tone];

  return (
    <Ionicons
      name={name}
      size={size}
      color={colorScheme === 'dark' ? dark : light}
      accessibilityElementsHidden
      importantForAccessibility="no"
    />
  );
}
