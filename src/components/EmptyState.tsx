/**
 * =====================================================
 * FILE: EmptyState.tsx
 * PURPOSE: Shown instead of an empty list, saying what to
 *          do next.
 * USED BY: all lists
 * =====================================================
 */
import { Text, View } from 'react-native';

import { AppIcon, type IconName } from './AppIcon';
import { Button } from './Button';

type EmptyStateProps = {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: IconName;
};

export function EmptyState({
  message,
  actionLabel,
  onAction,
  icon = 'leaf-outline',
}: EmptyStateProps) {
  return (
    <View className="flex-1 items-center justify-center gap-5 p-6">
      <AppIcon name={icon} tone="soft" size={44} />
      <Text className="max-w-md text-center text-lg text-stone-600 dark:text-stone-300">
        {message}
      </Text>
      {actionLabel !== undefined && onAction !== undefined && (
        <Button label={actionLabel} onPress={onAction} />
      )}
    </View>
  );
}
