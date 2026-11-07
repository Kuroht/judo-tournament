/**
 * =====================================================
 * FILE: DrawActions.tsx
 * PURPOSE: The buttons under a finished draw: lock, unlock,
 *          draw again and change seeds.
 * USED BY: DrawResult.tsx
 * =====================================================
 */
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { Button } from '@/components/Button';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { useT } from '@/lib/i18n/useT';

type DrawActionsProps = {
  isLocked: boolean;
  isBusy: boolean;
  onRedraw: () => void;
  onChangeSeeds: () => void;
  onSetLocked: (isLocked: boolean) => void;
};

export function DrawActions({
  isLocked,
  isBusy,
  onRedraw,
  onChangeSeeds,
  onSetLocked,
}: DrawActionsProps) {
  const t = useT();
  const { id, categoryId } = useLocalSearchParams<{ id: string; categoryId: string }>();
  const [isConfirmingUnlock, setIsConfirmingUnlock] = useState(false);

  return (
    <>
      {isLocked ? (
        <>
          <Button
            label={t('matches.title')}
            onPress={() =>
              router.push({
                pathname: '/tournament/[id]/category-matches/[categoryId]/list',
                params: { id, categoryId },
              })
            }
          />
          <Button
            label={t('draw.unlock')}
            variant="secondary"
            onPress={() => setIsConfirmingUnlock(true)}
            isDisabled={isBusy}
          />
        </>
      ) : (
        <>
          <Button label={t('draw.lock')} onPress={() => onSetLocked(true)} isDisabled={isBusy} />
          <View className="flex-row gap-2">
            <View className="flex-1">
              <Button
                label={t('draw.redraw')}
                variant="secondary"
                onPress={onRedraw}
                isDisabled={isBusy}
              />
            </View>
            <View className="flex-1">
              <Button
                label={t('draw.changeSeeds')}
                variant="secondary"
                onPress={onChangeSeeds}
                isDisabled={isBusy}
              />
            </View>
          </View>
        </>
      )}
      <ConfirmDialog
        isVisible={isConfirmingUnlock}
        title={t('draw.unlockTitle')}
        message={t('draw.unlockMessage')}
        confirmLabel={t('draw.unlock')}
        cancelLabel={t('common.cancel')}
        onConfirm={() => {
          setIsConfirmingUnlock(false);
          onSetLocked(false);
        }}
        onCancel={() => setIsConfirmingUnlock(false)}
      />
    </>
  );
}
