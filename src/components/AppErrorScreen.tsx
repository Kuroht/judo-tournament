/**
 * =====================================================
 * FILE: AppErrorScreen.tsx
 * PURPOSE: Replaces a blank screen when something goes
 *          unexpectedly wrong, and offers a way to retry.
 * USED BY: src/app/_layout.tsx
 * =====================================================
 */
import { Text, View } from 'react-native';

import { Button } from './Button';

type AppErrorScreenProps = {
  message: string;
  onRetry: () => void;
};

// The text uses both languages and never uses useT, because the saved language
// comes from the database, and the database may be the very thing that failed.
export function AppErrorScreen({ message, onRetry }: AppErrorScreenProps) {
  return (
    <View className="flex-1 items-center justify-center gap-4 bg-slate-100 p-6 dark:bg-slate-900">
      <Text className="text-center text-xl font-bold text-slate-900 dark:text-slate-100">
        Ocorreu um erro / Something went wrong
      </Text>
      <Text className="text-center text-base text-slate-700 dark:text-slate-200">{message}</Text>
      <Button label="Tentar novamente / Try again" onPress={onRetry} />
    </View>
  );
}
