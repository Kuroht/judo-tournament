/**
 * =====================================================
 * FILE: OptionButton.tsx
 * PURPOSE: One choice among several options, in a row or
 *          in a list.
 * USED BY: LanguageSelector.tsx, ThemeSelector.tsx,
 *          AthleteFormFields.tsx, SelectField.tsx,
 *          TournamentsScreen.tsx, AddFpjCategoriesScreen.tsx,
 *          CategoryOptionRow.tsx
 * =====================================================
 */
import { Pressable, Text } from 'react-native';

type OptionButtonProps = {
  label: string;
  isSelected: boolean;
  onPress: () => void;
  // True in a vertical list, where flex-1 would squash the row and clip long text.
  isInList?: boolean;
};

export function OptionButton({ label, isSelected, onPress, isInList = false }: OptionButtonProps) {
  // The check mark means the selected option isn't shown by color alone.
  const text = isSelected ? `✓ ${label}` : label;
  const backgroundClass = isSelected ? 'bg-judo-blue' : 'bg-white dark:bg-slate-800';
  const textClass = isSelected ? 'text-white' : 'text-slate-900 dark:text-slate-100';
  const sizeClass = isInList ? 'py-2' : 'flex-1';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: isSelected }}
      onPress={onPress}
      // min-h-12 is 48 dp, the smallest touch target the app allows.
      className={`min-h-12 items-center justify-center rounded-lg border border-slate-300 px-3 dark:border-slate-600 ${sizeClass} ${backgroundClass}`}
    >
      <Text className={`text-lg font-semibold ${textClass}`}>{text}</Text>
    </Pressable>
  );
}
