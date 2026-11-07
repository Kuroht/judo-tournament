/**
 * =====================================================
 * FILE: WeighInContent.tsx
 * PURPOSE: The weigh-in list with its filters. Tapping an
 *          athlete opens the dialog for weighing them.
 * USED BY: WeighInScreen.tsx
 * =====================================================
 */
import { useState } from 'react';
import { FlatList, View } from 'react-native';

import { EmptyState } from '@/components/EmptyState';
import { ProgressBar } from '@/components/ProgressBar';
import { Screen } from '@/components/Screen';
import { useT } from '@/lib/i18n/useT';

import type { useWeighIn } from '../hooks/useWeighIn';
import type { WeighInData } from '../types';
import { ALL_CATEGORIES, filterWeighInEntries, findNextPendingEntry } from '../weighInList';
import { WeighDialog } from './WeighDialog';
import { WeighInFilters } from './WeighInFilters';
import { WeighInRow } from './WeighInRow';

type WeighInContentProps = {
  data: WeighInData;
  weighIn: ReturnType<typeof useWeighIn>;
};

export function WeighInContent({ data, weighIn }: WeighInContentProps) {
  const t = useT();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState(ALL_CATEGORIES);
  const [isPendingOnly, setIsPendingOnly] = useState(false);
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);

  // Calculated on each render rather than stored, so they can never be out of date.
  const { entries, categories } = data;
  const doneCount = entries.filter((entry) => entry.status !== 'registered').length;
  const visibleEntries = filterWeighInEntries(entries, search, categoryFilter, isPendingOnly);
  const selectedEntry = entries.find((entry) => entry.entryId === selectedEntryId) ?? null;

  // Clearing the error here stops one athlete's error showing on the next athlete.
  function selectEntry(entryId: string | null) {
    weighIn.clearError();
    setSelectedEntryId(entryId);
  }

  function handleClose() {
    // Android's back button can't be disabled, and closing mid-save could reopen
    // the dialog on the next athlete when the save finishes.
    if (!weighIn.isBusy) {
      selectEntry(null);
    }
  }

  async function handleSaveWeight(kg: number) {
    if (selectedEntry === null) {
      return;
    }

    const result = await weighIn.recordWeight(selectedEntry, kg);

    // A pass moves straight to the next athlete. A fail stays open, so that the
    // trainer can decide what to do about it.
    if (result === 'pass') {
      const next = findNextPendingEntry(visibleEntries, selectedEntry.entryId);
      selectEntry(next?.entryId ?? null);
    }
  }

  return (
    <Screen>
      <View className="flex-1 gap-3">
        <ProgressBar
          label={t('weighIn.progress', { done: doneCount, total: entries.length })}
          done={doneCount}
          total={entries.length}
        />
        <WeighInFilters
          categories={categories}
          search={search}
          categoryFilter={categoryFilter}
          isPendingOnly={isPendingOnly}
          onSearchChange={setSearch}
          onCategoryFilterChange={setCategoryFilter}
          onPendingOnlyChange={setIsPendingOnly}
        />
        <FlatList
          className="flex-1"
          data={visibleEntries}
          keyExtractor={(entry) => entry.entryId}
          keyboardShouldPersistTaps="handled"
          contentContainerClassName="gap-2"
          ListEmptyComponent={<EmptyState message={t('common.noResults')} />}
          renderItem={({ item }) => (
            <WeighInRow entry={item} onPress={() => selectEntry(item.entryId)} />
          )}
        />
      </View>
      {selectedEntry !== null && (
        <WeighDialog
          // A new key resets the typed weight when moving on to the next athlete.
          key={selectedEntry.entryId}
          entry={selectedEntry}
          categories={categories}
          isBusy={weighIn.isBusy}
          errorKey={weighIn.errorKey}
          onSaveWeight={(kg) => void handleSaveWeight(kg)}
          onNoShow={() => void weighIn.setNoShow(selectedEntry)}
          onClear={() => void weighIn.clear(selectedEntry)}
          onMove={(target) => void weighIn.moveTo(selectedEntry, target)}
          onCreateGroup={(label) => void weighIn.createGroup(selectedEntry, label)}
          onClose={handleClose}
        />
      )}
    </Screen>
  );
}
