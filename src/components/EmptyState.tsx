/**
 * =====================================================
 * FILE: EmptyState.tsx
 * PURPOSE: A helpful message for lists with nothing in
 *          them, so a screen is never blank.
 * USED BY: tournaments, categories, athletes and clubs screens
 * =====================================================
 */
import { Text, View } from 'react-native';

import { Button } from './Button';

type EmptyStateProps = {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function EmptyState({ message, actionLabel, onAction }: EmptyStateProps) {
  return (
    <View className="flex-1 items-center justify-center gap-6 p-6">
      <Text className="text-center text-xl text-slate-700 dark:text-slate-200">{message}</Text>
      {actionLabel !== undefined && onAction !== undefined && (
        <Button label={actionLabel} onPress={onAction} />
      )}
    </View>
  );
}
