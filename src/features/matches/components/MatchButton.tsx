/**
 * =====================================================
 * FILE: MatchButton.tsx
 * PURPOSE: The extra big button used while scoring, sized
 *          for one hand at a table.
 * USED BY: MatchSidePanel.tsx
 * =====================================================
 */
import { Pressable, Text } from 'react-native';

type MatchButtonProps = {
  label: string;
  // Blue buttons sit on the blue side, so they need their own colors.
  isOnBlue: boolean;
  isDisabled?: boolean;
  onPress: () => void;
};

export function MatchButton({ label, isOnBlue, isDisabled = false, onPress }: MatchButtonProps) {
  const colorClasses = isOnBlue ? 'bg-white' : 'bg-slate-800';
  const textClasses = isOnBlue ? 'text-judo-blue' : 'text-white';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled }}
      disabled={isDisabled}
      onPress={onPress}
      // min-h-20 is 80 dp, well above the 48 dp minimum, for tapping without looking.
      className={`min-h-20 flex-1 basis-[45%] items-center justify-center rounded-xl px-2 ${colorClasses} ${isDisabled ? 'opacity-40' : ''}`}
    >
      <Text className={`text-center text-xl font-bold ${textClasses}`}>{label}</Text>
    </Pressable>
  );
}
