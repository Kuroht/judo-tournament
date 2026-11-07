/**
 * =====================================================
 * FILE: ClubsScreen.tsx
 * PURPOSE: The list of all clubs.
 * USED BY: src/app/clubs.tsx
 * =====================================================
 */
import { useRouter } from 'expo-router';
import { FlatList, View } from 'react-native';

import { Button } from '@/components/Button';
import { EmptyState } from '@/components/EmptyState';
import { FullScreenMessage } from '@/components/FullScreenMessage';
import { Screen } from '@/components/Screen';
import { useT } from '@/lib/i18n/useT';

import { useClubs } from '../hooks/useClubs';
import { ClubRow } from './ClubRow';

export function ClubsScreen() {
  const clubs = useClubs();
  const router = useRouter();
  const t = useT();

  function handleAdd() {
    router.push('/club/new');
  }

  if (clubs.type === 'loading') {
    return <FullScreenMessage title={t('common.loading')} />;
  }

  if (clubs.type === 'error') {
    return <FullScreenMessage title={t('common.loadError')} details={clubs.message} />;
  }

  if (clubs.data.length === 0) {
    return (
      <Screen>
        <EmptyState message={t('clubs.empty')} actionLabel={t('clubs.add')} onAction={handleAdd} />
      </Screen>
    );
  }

  return (
    <Screen>
      <View className="flex-1 gap-3">
        <FlatList
          className="flex-1"
          data={clubs.data}
          keyExtractor={(club) => club.id}
          contentContainerClassName="gap-2"
          renderItem={({ item }) => (
            <ClubRow
              club={item}
              onPress={() => router.push({ pathname: '/club/[id]', params: { id: item.id } })}
            />
          )}
        />
        <Button label={t('clubs.add')} onPress={handleAdd} />
      </View>
    </Screen>
  );
}
