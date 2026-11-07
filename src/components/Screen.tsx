/**
 * =====================================================
 * FILE: Screen.tsx
 * PURPOSE: The background and margins of a normal screen.
 *          On a tablet, the content stays a comfortable
 *          width instead of stretching across the whole screen.
 * USED BY: most screens
 * =====================================================
 */
import type { ReactNode } from 'react';
import { View } from 'react-native';

type ScreenProps = {
  children: ReactNode;
};

export function Screen({ children }: ScreenProps) {
  return (
    <View className="flex-1 items-center bg-stone-100 dark:bg-stone-900">
      <View className="w-full max-w-4xl flex-1 p-4">{children}</View>
    </View>
  );
}
