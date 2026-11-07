/**
 * =====================================================
 * FILE: CategoriesScreen.tsx
 * PURPOSE: The categories of one tournament.
 * USED BY: src/app/tournament/[id]/categories.tsx
 * =====================================================
 */
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { FlatList, View } from 'react-native';

import { Button } from '@/components/Button';
import { EmptyState } from '@/components/EmptyState';
import { FullScreenMessage } from '@/components/FullScreenMessage';
import { Screen } from '@/components/Screen';
import { TextField } from '@/components/TextField';
import { useT } from '@/lib/i18n/useT';

import { filterCategories } from '../filterCategories';
import { useCategories } from '../hooks/useCategories';
import { CategoryRow } from './CategoryRow';

type CategoriesScreenProps = {
  tournamentId: string;
};

export function CategoriesScreen({ tournamentId }: CategoriesScreenProps) {
  const categories = useCategories(tournamentId);
  const router = useRouter();
  const t = useT();
  const [search, setSearch] = useState('');

  function handleAddFromFpj() {
    router.push({ pathname: '/tournament/[id]/add-categories', params: { id: tournamentId } });
  }

  function handleAddManually() {
    router.push({ pathname: '/tournament/[id]/category/new', params: { id: tournamentId } });
  }

  if (categories.type === 'loading') {
    return <FullScreenMessage title={t('common.loading')} />;
  }

  if (categories.type === 'error') {
    return <FullScreenMessage title={t('common.loadError')} details={categories.message} />;
  }

  // Calculated on each render rather than stored, so it can never be out of date.
  const visibleCategories = filterCategories(categories.data, search);

  return (
    <Screen>
      <View className="flex-1 gap-3">
        {categories.data.length === 0 ? (
          <EmptyState message={t('categories.empty')} />
        ) : (
          <>
            <TextField label={t('common.search')} value={search} onChangeText={setSearch} />
            <FlatList
              className="flex-1"
              data={visibleCategories}
              keyExtractor={(category) => category.id}
              keyboardShouldPersistTaps="handled"
              contentContainerClassName="gap-2"
              ListEmptyComponent={<EmptyState message={t('common.noResults')} />}
              renderItem={({ item }) => (
                <CategoryRow
                  category={item}
                  onPress={() =>
                    router.push({
                      pathname: '/tournament/[id]/category/[categoryId]',
                      params: { id: tournamentId, categoryId: item.id },
                    })
                  }
                />
              )}
            />
          </>
        )}
        <Button label={t('categories.addFromFpj')} onPress={handleAddFromFpj} />
        <Button label={t('categories.addManually')} variant="secondary" onPress={handleAddManually} />
      </View>
    </Screen>
  );
}
