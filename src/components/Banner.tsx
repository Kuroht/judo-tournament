/**
 * =====================================================
 * FILE: Banner.tsx
 * PURPOSE: A message that needs noticing: a warning, an
 *          error or a success. Screen readers announce it
 *          as soon as it appears.
 * USED BY: screens with warnings or errors
 * =====================================================
 */
import { Text, View } from 'react-native';

import { AppIcon, type IconName, type IconTone } from './AppIcon';

type BannerTone = 'warning' | 'error' | 'success';

type BannerProps = {
  message: string;
  tone?: BannerTone;
};

// Full class names, because Tailwind can't find class names built from pieces.
const BANNER_CLASSES: Record<BannerTone, string> = {
  warning: 'bg-amber-100 dark:bg-amber-950',
  error: 'bg-red-100 dark:bg-red-950',
  success: 'bg-green-100 dark:bg-green-950',
};

const BANNER_TEXT_CLASSES: Record<BannerTone, string> = {
  warning: 'text-amber-900 dark:text-amber-100',
  error: 'text-red-900 dark:text-red-100',
  success: 'text-green-900 dark:text-green-100',
};

const BANNER_ICONS: Record<BannerTone, { name: IconName; tone: IconTone }> = {
  warning: { name: 'warning', tone: 'ink' },
  error: { name: 'alert-circle', tone: 'accent' },
  success: { name: 'checkmark-circle', tone: 'done' },
};

export function Banner({ message, tone = 'warning' }: BannerProps) {
  const icon = BANNER_ICONS[tone];

  return (
    <View className={`flex-row items-center gap-3 rounded-xl p-3 ${BANNER_CLASSES[tone]}`}>
      <AppIcon name={icon.name} tone={icon.tone} />
      <Text
        accessibilityLiveRegion="polite"
        className={`flex-1 text-base font-semibold ${BANNER_TEXT_CLASSES[tone]}`}
      >
        {message}
      </Text>
    </View>
  );
}
