/**
 * =====================================================
 * FILE: CategoryRegistrationContent.tsx
 * PURPOSE: The list of athletes in a category, with a way
 *          to remove them or add more.
 * USED BY: CategoryRegistrationScreen.tsx
 * =====================================================
 */
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { FlatList, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { EmptyState } from '@/components/EmptyState';
import { Screen } from '@/components/Screen';
import type { TranslationKey } from '@/lib/i18n/pt';
import { useT } from '@/lib/i18n/useT';

import type { CategoryRegistration, RegisteredAthlete } from '../types';
import { RegisteredAthleteRow } from './RegisteredAthleteRow';

type CategoryRegistrationContentProps = {
  tournamentId: string;
  data: CategoryRegistration;
  isBusy: boolean;
  errorKey: TranslationKey | null;
  onRemove: (entryId: string) => void;
};

export function CategoryRegistrationContent({
  tournamentId,
  data,
  isBusy,
  errorKey,
  onRemove,
}: CategoryRegistrationContentProps) {
  const t = useT();
  const router = useRouter();
  const [athleteToRemove, setAthleteToRemove] = useState<RegisteredAthlete | null>(null);

  const { category, registered } = data;
  const title = [category.ageClassName, t(`categories.sex.${category.sex}`), category.label];

  function handleConfirmRemove() {
    if (athleteToRemove !== null) {
      onRemove(athleteToRemove.entryId);
    }
    setAthleteToRemove(null);
  }

  return (
    <Screen>
      <View className="flex-1 gap-3">
        <Text className="text-xl font-bold text-stone-900 dark:text-stone-100">
          {title.filter((part) => part !== null).join(' · ')}
        </Text>
        <Text className="text-lg text-stone-700 dark:text-stone-200">
          {t('registration.entryCount', { count: registered.length })}
        </Text>
        <FlatList
          className="flex-1"
          data={registered}
          keyExtractor={(athlete) => athlete.entryId}
          contentContainerClassName="gap-2"
          ListEmptyComponent={<EmptyState message={t('registration.noEntries')} />}
          renderItem={({ item }) => (
            <RegisteredAthleteRow
              athlete={item}
              category={category}
              isDisabled={isBusy}
              onRemove={() => setAthleteToRemove(item)}
            />
          )}
        />
        {errorKey !== null && (
          <Text className="text-lg font-semibold text-red-700 dark:text-red-300">{t(errorKey)}</Text>
        )}
        <Button
          label={t('registration.addAthletes')}
          onPress={() =>
            router.push({
              pathname: '/tournament/[id]/category-registration/[categoryId]/add',
              params: { id: tournamentId, categoryId: category.id },
            })
          }
        />
      </View>
      <ConfirmDialog
        isVisible={athleteToRemove !== null}
        title={t('registration.removeTitle')}
        message={t('registration.removeMessage', { name: athleteToRemove?.name ?? '' })}
        confirmLabel={t('registration.remove')}
        cancelLabel={t('common.cancel')}
        onConfirm={handleConfirmRemove}
        onCancel={() => setAthleteToRemove(null)}
      />
    </Screen>
  );
}
