/**
 * =====================================================
 * FILE: Screen.tsx
 * PURPOSE: The background every screen sits on, in light
 *          and dark mode.
 * USED BY: all screens
 * =====================================================
 */
import type { ReactNode } from 'react';
import { View } from 'react-native';

type ScreenProps = {
  children: ReactNode;
};

export function Screen({ children }: ScreenProps) {
  return <View className="flex-1 bg-slate-100 p-4 dark:bg-slate-900">{children}</View>;
}
