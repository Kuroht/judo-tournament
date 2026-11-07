/**
 * =====================================================
 * FILE: ReopenMatchButton.tsx
 * PURPOSE: Reopens a finished match to correct it, first
 *          saying clearly which results could be lost.
 * USED BY: FinishedMatch.tsx
 * =====================================================
 */
import { useState } from 'react';
import { Text } from 'react-native';

import { Button } from '@/components/Button';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { useT } from '@/lib/i18n/useT';

import { useReopenMatch } from '../hooks/useReopenMatch';

type ReopenMatchButtonProps = {
  matchId: string;
  dependentCount: number;
  reload: () => Promise<void>;
};

export function ReopenMatchButton({ matchId, dependentCount, reload }: ReopenMatchButtonProps) {
  const t = useT();
  const { reopen, hasFailed } = useReopenMatch(matchId, reload);
  const [isConfirming, setIsConfirming] = useState(false);
  const message =
    dependentCount === 0
      ? t('matches.reopenMessage')
      : t('matches.reopenWithDependents', { count: dependentCount });

  return (
    <>
      {hasFailed && (
        <Text className="text-lg font-semibold text-red-700 dark:text-red-300">
          {t('common.saveError')}
        </Text>
      )}
      <Button
        label={t('matches.reopen')}
        variant="secondary"
        onPress={() => setIsConfirming(true)}
      />
      <ConfirmDialog
        isVisible={isConfirming}
        title={t('matches.reopenTitle')}
        message={message}
        confirmLabel={t('matches.reopen')}
        cancelLabel={t('common.cancel')}
        onConfirm={() => {
          setIsConfirming(false);
          void reopen();
        }}
        onCancel={() => setIsConfirming(false)}
      />
    </>
  );
}
