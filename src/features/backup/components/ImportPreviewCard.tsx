/**
 * =====================================================
 * FILE: ImportPreviewCard.tsx
 * PURPOSE: Shows what a file contains and what each choice
 *          would do, before anything is changed.
 * USED BY: DataToolsScreen.tsx
 * =====================================================
 */
import { useState } from 'react';
import { Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { useT } from '@/lib/i18n/useT';

import type { ImportPreview } from '../hooks/useDataTools';

type ImportPreviewCardProps = {
  preview: ImportPreview;
  isBusy: boolean;
  onMerge: () => void;
  onReplace: () => void;
  onCancel: () => void;
};

export function ImportPreviewCard(props: ImportPreviewCardProps) {
  const { preview, isBusy, onMerge, onReplace, onCancel } = props;
  const t = useT();
  const [isConfirmingReplace, setIsConfirmingReplace] = useState(false);
  const { backup, mergePlan } = preview;
  const canReplace = backup.scope === 'all';

  return (
    <View className="gap-3 rounded-xl border-4 border-amber-600 bg-white p-4 dark:bg-stone-800">
      <Text className="text-xl font-bold text-stone-900 dark:text-stone-100">
        {t('backup.previewTitle', { date: backup.exportedAt.slice(0, 10) })}
      </Text>
      <Text className="text-lg text-stone-900 dark:text-stone-100">
        {t('backup.fileHas', {
          clubs: backup.data.clubs.length,
          athletes: backup.data.athletes.length,
          tournaments: backup.data.tournaments.length,
        })}
      </Text>
      <Text className="text-base text-stone-700 dark:text-stone-200">
        {t('backup.mergeExplain', {
          clubs: mergePlan.toAdd.clubs.length,
          athletes: mergePlan.toAdd.athletes.length,
          tournaments: mergePlan.toAdd.tournaments.length,
          skipped: mergePlan.skippedTournaments,
        })}
      </Text>
      <Button label={t('backup.merge')} isDisabled={isBusy} onPress={onMerge} />
      {canReplace ? (
        <Button
          label={t('backup.replace')}
          variant="danger"
          isDisabled={isBusy}
          onPress={() => setIsConfirmingReplace(true)}
        />
      ) : (
        <Text className="text-base text-stone-700 dark:text-stone-200">
          {t('backup.tournamentMergeOnly')}
        </Text>
      )}
      <Button
        label={t('common.cancel')}
        variant="secondary"
        isDisabled={isBusy}
        onPress={onCancel}
      />
      <ConfirmDialog
        isVisible={isConfirmingReplace}
        title={t('backup.replaceTitle')}
        message={t('backup.replaceMessage', {
          clubs: preview.current.clubs.length,
          athletes: preview.current.athletes.length,
          tournaments: preview.current.tournaments.length,
          matches: preview.current.matches.length,
        })}
        confirmLabel={t('backup.replace')}
        cancelLabel={t('common.cancel')}
        onConfirm={() => {
          setIsConfirmingReplace(false);
          onReplace();
        }}
        onCancel={() => setIsConfirmingReplace(false)}
      />
    </View>
  );
}
