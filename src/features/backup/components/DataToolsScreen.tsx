/**
 * =====================================================
 * FILE: DataToolsScreen.tsx
 * PURPOSE: Exports data to a file, and imports it back.
 * USED BY: src/app/data-tools.tsx
 * =====================================================
 */
import { FlatList, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { EmptyState } from '@/components/EmptyState';
import { FullScreenMessage } from '@/components/FullScreenMessage';
import { Screen } from '@/components/Screen';
import { useT } from '@/lib/i18n/useT';

import { describeAutomaticBackup } from '../backupFileNames';
import { useDataTools } from '../hooks/useDataTools';
import { ImportPreviewCard } from './ImportPreviewCard';

export function DataToolsScreen() {
  const t = useT();
  const tools = useDataTools();
  const { tournaments, message, preview, isBusy } = tools;

  if (tournaments.type === 'loading') {
    return <FullScreenMessage title={t('common.loading')} />;
  }

  if (tournaments.type === 'error') {
    return <FullScreenMessage title={t('common.loadError')} details={tournaments.message} />;
  }

  const header = (
    <View className="gap-3 pb-2">
      {message !== null && (
        <Text
          accessibilityLiveRegion="polite"
          className={`text-lg font-semibold ${message.isError ? 'text-red-700 dark:text-red-300' : 'text-green-800 dark:text-green-300'}`}
        >
          {t(message.key, message.values)}
        </Text>
      )}
      {preview !== null && (
        <ImportPreviewCard
          preview={preview}
          isBusy={isBusy}
          onMerge={() => void tools.applyMerge()}
          onReplace={() => void tools.applyReplace()}
          onCancel={tools.cancelPreview}
        />
      )}
      <Text className="text-xl font-bold text-slate-900 dark:text-slate-100">
        {t('backup.importTitle')}
      </Text>
      <Button
        label={t('backup.pickFile')}
        isDisabled={isBusy}
        onPress={() => void tools.pickFile()}
      />
      <Button
        label={t('backup.restoreAutomatic')}
        variant="secondary"
        isDisabled={isBusy}
        onPress={() => void tools.showAutomaticBackups()}
      />
      {tools.automaticBackups?.map((name) => (
        <Button
          key={name}
          label={t('backup.restoreFrom', { date: describeAutomaticBackup(name) })}
          variant="secondary"
          isDisabled={isBusy}
          onPress={() => void tools.chooseAutomaticBackup(name)}
        />
      ))}
      <Text className="text-xl font-bold text-slate-900 dark:text-slate-100">
        {t('backup.exportTitle')}
      </Text>
      <Button
        label={t('backup.exportAll')}
        isDisabled={isBusy}
        onPress={() => void tools.exportAll()}
      />
    </View>
  );

  return (
    <Screen>
      <FlatList
        data={tournaments.data}
        keyExtractor={(tournament) => tournament.id}
        contentContainerClassName="gap-2 flex-grow"
        ListHeaderComponent={header}
        ListEmptyComponent={<EmptyState message={t('backup.noTournaments')} />}
        renderItem={({ item }) => (
          <Button
            label={t('backup.exportOne', { name: item.name })}
            variant="secondary"
            isDisabled={isBusy}
            onPress={() => void tools.exportTournament(item)}
          />
        )}
      />
    </Screen>
  );
}
