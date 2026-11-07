/**
 * =====================================================
 * FILE: Button.tsx
 * PURPOSE: The app's standard big button. Use "primary" for
 *          the one main action on a screen, and "secondary"
 *          for everything else, so the next step stands out.
 * USED BY: all screens
 * =====================================================
 */
import { Pressable, Text } from 'react-native';

import { AppIcon, type IconName, type IconTone } from './AppIcon';

type ButtonVariant = 'primary' | 'secondary' | 'danger';

type ButtonProps = {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  isDisabled?: boolean;
  icon?: IconName;
};

// Full class names, because Tailwind can't find class names built from pieces.
const BUTTON_CLASSES: Record<ButtonVariant, string> = {
  primary: 'bg-accent',
  secondary: 'border border-stone-300 bg-white dark:border-stone-600 dark:bg-stone-800',
  // Outlined, so that it can't be mistaken for the main action.
  danger: 'border-2 border-accent bg-white dark:border-accent-light dark:bg-stone-800',
};

const TEXT_CLASSES: Record<ButtonVariant, string> = {
  primary: 'text-white',
  secondary: 'text-stone-900 dark:text-stone-100',
  danger: 'text-accent dark:text-accent-light',
};

const ICON_TONES: Record<ButtonVariant, IconTone> = {
  primary: 'white',
  secondary: 'ink',
  danger: 'accent',
};

export function Button(props: ButtonProps) {
  const { label, onPress, variant = 'primary', isDisabled = false, icon } = props;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled }}
      disabled={isDisabled}
      onPress={onPress}
      // min-h-14 is 56 dp, comfortably above the 48 dp minimum touch target.
      className={`min-h-14 flex-row items-center justify-center gap-2 rounded-xl px-4 py-2 ${BUTTON_CLASSES[variant]} ${isDisabled ? 'opacity-50' : ''}`}
    >
      {icon !== undefined && <AppIcon name={icon} tone={ICON_TONES[variant]} />}
      <Text className={`text-center text-lg font-semibold ${TEXT_CLASSES[variant]}`}>{label}</Text>
    </Pressable>
  );
}
