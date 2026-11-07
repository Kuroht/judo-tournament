/**
 * =====================================================
 * FILE: AddAthletesContent.tsx
 * PURPOSE: The searchable list for adding athletes. One tap
 *          adds an athlete, and it stays open for the next.
 * USED BY: AddAthletesScreen.tsx
 * =====================================================
 */
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { FlatList, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { EmptyState } from '@/components/EmptyState';
import { Screen } from '@/components/Screen';
import { TextField } from '@/components/TextField';
import type { TranslationKey } from '@/lib/i18n/pt';
import { useT } from '@/lib/i18n/useT';

import { checkEligibility } from '../checkEligibility';
import { filterRegistrationAthletes } from '../filterRegistrationAthletes';
import { useWarningText } from '../hooks/useWarningText';
import type { CategoryRegistration, RegistrationAthlete } from '../types';
import { AthleteOptionRow } from './AthleteOptionRow';

type AddAthletesContentProps = {
  data: CategoryRegistration;
  isBusy: boolean;
  errorKey: TranslationKey | null;
  onAdd: (athleteId: string) => void;
};

export function AddAthletesContent({
  data,
  isBusy,
  errorKey,
  onAdd,
}: AddAthletesContentProps) {
  const t = useT();
  const router = useRouter();
  const warningText = useWarningText();
  const [search, setSearch] = useState('');
  const [athleteToConfirm, setAthleteToConfirm] = useState<RegistrationAthlete | null>(null);

  const { category, available, registered } = data;
  const visibleAthletes = filterRegistrationAthletes(available, search);
  const confirmWarnings =
    athleteToConfirm === null ? [] : checkEligibility(athleteToConfirm, category);

  function handleSelect(athlete: RegistrationAthlete) {
    // An athlete who fits needs only one tap. One who doesn't needs a decision.
    if (checkEligibility(athlete, category).length > 0) {
      setAthleteToConfirm(athlete);
    } else {
      onAdd(athlete.athleteId);
    }
  }

  function handleConfirm() {
    if (athleteToConfirm !== null) {
      onAdd(athleteToConfirm.athleteId);
    }
    setAthleteToConfirm(null);
  }

  return (
    <Screen>
      <View className="flex-1 gap-3">
        <Text className="text-lg text-stone-700 dark:text-stone-200">
          {`${category.label} · ${t('registration.entryCount', { count: registered.length })}`}
        </Text>
        <TextField label={t('common.search')} value={search} onChangeText={setSearch} />
        <FlatList
          className="flex-1"
          data={visibleAthletes}
          keyExtractor={(athlete) => athlete.athleteId}
          keyboardShouldPersistTaps="handled"
          contentContainerClassName="gap-2"
          ListEmptyComponent={
            <EmptyState
              message={t(available.length === 0 ? 'registration.noAthletes' : 'common.noResults')}
            />
          }
          renderItem={({ item }) => (
            <AthleteOptionRow
              athlete={item}
              category={category}
              isDisabled={isBusy}
              onPress={() => handleSelect(item)}
            />
          )}
        />
        {errorKey !== null && (
          <Text className="text-lg font-semibold text-red-700 dark:text-red-300">{t(errorKey)}</Text>
        )}
        <Button
          label={t('registration.createAthlete')}
          variant="secondary"
          onPress={() => router.push('/athlete/new')}
        />
      </View>
      <ConfirmDialog
        isVisible={athleteToConfirm !== null}
        title={t('registration.mismatchTitle')}
        message={[athleteToConfirm?.name ?? '', ...confirmWarnings.map(warningText)].join('\n')}
        confirmLabel={t('registration.mismatchConfirm')}
        cancelLabel={t('common.cancel')}
        onConfirm={handleConfirm}
        onCancel={() => setAthleteToConfirm(null)}
      />
    </Screen>
  );
}
