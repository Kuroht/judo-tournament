/**
 * =====================================================
 * FILE: Button.tsx
 * PURPOSE: The app's standard big button.
 * USED BY: all screens
 * =====================================================
 */
import { Pressable, Text } from 'react-native';

type ButtonVariant = 'primary' | 'secondary' | 'danger';

type ButtonProps = {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  isDisabled?: boolean;
};

// Full class names, because Tailwind can't find class names built from pieces.
const BUTTON_CLASSES: Record<ButtonVariant, string> = {
  primary: 'bg-judo-blue',
  secondary: 'border border-slate-400 bg-white dark:border-slate-500 dark:bg-slate-800',
  danger: 'bg-red-700',
};

const TEXT_CLASSES: Record<ButtonVariant, string> = {
  primary: 'text-white',
  secondary: 'text-slate-900 dark:text-slate-100',
  danger: 'text-white',
};

export function Button({ label, onPress, variant = 'primary', isDisabled = false }: ButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled }}
      disabled={isDisabled}
      onPress={onPress}
      // min-h-14 is 56 dp, comfortably above the 48 dp minimum touch target.
      className={`min-h-14 items-center justify-center rounded-lg px-4 ${BUTTON_CLASSES[variant]} ${isDisabled ? 'opacity-50' : ''}`}
    >
      <Text className={`text-center text-lg font-semibold ${TEXT_CLASSES[variant]}`}>{label}</Text>
    </Pressable>
  );
}
