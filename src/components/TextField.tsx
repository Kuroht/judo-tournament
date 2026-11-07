/**
 * =====================================================
 * FILE: TextField.tsx
 * PURPOSE: A labelled text input with room for an error.
 * USED BY: form screens, search boxes
 * =====================================================
 */
import { Text, TextInput, View, type TextInputProps } from 'react-native';

type TextFieldProps = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  isMultiline?: boolean;
  keyboardType?: TextInputProps['keyboardType'];
  autoCapitalize?: TextInputProps['autoCapitalize'];
  maxLength?: number;
};

export function TextField({
  label,
  value,
  onChangeText,
  error,
  isMultiline = false,
  keyboardType,
  autoCapitalize,
  maxLength,
}: TextFieldProps) {
  const borderClass =
    error === undefined ? 'border-stone-300 dark:border-stone-600' : 'border-red-700';

  return (
    <View className="gap-1">
      <Text className="text-base font-semibold text-stone-700 dark:text-stone-200">{label}</Text>
      <TextInput
        // Screen readers announce this, because the Text above isn't linked to the input.
        accessibilityLabel={label}
        value={value}
        onChangeText={onChangeText}
        multiline={isMultiline}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        maxLength={maxLength}
        className={`min-h-12 rounded-xl border bg-white px-3 py-2 text-lg text-stone-900 dark:bg-stone-800 dark:text-stone-100 ${borderClass}`}
      />
      {error !== undefined && (
        <Text
          accessibilityLiveRegion="polite"
          className="text-base font-semibold text-red-700 dark:text-red-300"
        >
          {error}
        </Text>
      )}
    </View>
  );
}
