/**
 * =====================================================
 * FILE: CategoriesScreen.tsx
 * PURPOSE: The categories of one tournament.
 * USED BY: src/app/tournament/[id]/categories.tsx
 * =====================================================
 */
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { Button } from '@/components/Button';
import { EmptyState } from '@/components/EmptyState';
import { FullScreenMessage } from '@/components/FullScreenMessage';
import { Screen } from '@/components/Screen';
import { SearchField } from '@/components/SearchField';
import { TileGroups } from '@/components/TileGroups';
import { useT } from '@/lib/i18n/useT';

import { CATEGORY_FORMAT_LABELS } from '../categoryFormats';

import { filterCategories } from '../filterCategories';
import { useCategories } from '../hooks/useCategories';

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
            <View className="flex-row">
              <SearchField label={t('common.search')} value={search} onChangeText={setSearch} />
            </View>
            <TileGroups
              tiles={visibleCategories.map((item) => ({
                id: item.id,
                group: [item.ageClassName, t(`categories.sex.${item.sex}`)]
                  .filter((part) => part !== null)
                  .join(' · '),
                title: item.label,
                detail: t(CATEGORY_FORMAT_LABELS[item.format]),
                onPress: () =>
                  router.push({
                    pathname: '/tournament/[id]/category/[categoryId]',
                    params: { id: tournamentId, categoryId: item.id },
                  }),
              }))}
              emptyComponent={<EmptyState message={t('common.noResults')} />}
            />
          </>
        )}
        <Button label={t('categories.addFromFpj')} icon="add" onPress={handleAddFromFpj} />
        <Button
          label={t('categories.addManually')}
          variant="secondary"
          onPress={handleAddManually}
        />
      </View>
    </Screen>
  );
}
