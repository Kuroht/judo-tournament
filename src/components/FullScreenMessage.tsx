/**
 * =====================================================
 * FILE: FullScreenMessage.tsx
 * PURPOSE: A centered message that fills the screen, for
 *          while the app is opening or if that failed.
 * USED BY: DatabaseProvider.tsx, SettingsRoot.tsx
 * =====================================================
 */
import { Text, View } from 'react-native';

type FullScreenMessageProps = {
  title: string;
  details?: string;
};

export function FullScreenMessage({ title, details }: FullScreenMessageProps) {
  return (
    <View className="flex-1 items-center justify-center gap-4 bg-stone-100 p-6 dark:bg-stone-900">
      <Text className="text-center text-xl font-bold text-stone-900 dark:text-stone-100">
        {title}
      </Text>
      {details !== undefined && (
        <Text className="text-center text-base text-stone-700 dark:text-stone-200">{details}</Text>
      )}
    </View>
  );
}
