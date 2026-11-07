/**
 * =====================================================
 * FILE: ConfirmDialog.tsx
 * PURPOSE: Asks before a destructive action and says what
 *          will be lost.
 * USED BY: form screens
 * =====================================================
 */
import { Modal, Text, View } from 'react-native';

import { Button } from './Button';

type ConfirmDialogProps = {
  isVisible: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
};

// We don't use React Native's Alert because it does nothing on web, where
// the app is also tested. A Modal behaves the same everywhere.
export function ConfirmDialog({
  isVisible,
  title,
  message,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal visible={isVisible} transparent animationType="fade" onRequestClose={onCancel}>
      <View className="flex-1 items-center justify-center bg-black/60 p-6">
        <View className="w-full max-w-lg gap-4 rounded-xl bg-white p-6 dark:bg-slate-800">
          <Text className="text-2xl font-bold text-slate-900 dark:text-slate-100">{title}</Text>
          <Text className="text-lg text-slate-700 dark:text-slate-200">{message}</Text>
          <Button label={cancelLabel} variant="secondary" onPress={onCancel} />
          <Button label={confirmLabel} variant="danger" onPress={onConfirm} />
        </View>
      </View>
    </Modal>
  );
}
