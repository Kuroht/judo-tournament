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
    <View className="flex-1 items-center justify-center gap-4 bg-slate-100 p-6 dark:bg-slate-900">
      <Text className="text-center text-xl font-bold text-slate-900 dark:text-slate-100">
        {title}
      </Text>
      {details !== undefined && (
        <Text className="text-center text-base text-slate-700 dark:text-slate-200">{details}</Text>
      )}
    </View>
  );
}
