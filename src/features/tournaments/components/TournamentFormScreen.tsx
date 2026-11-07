/**
 * =====================================================
 * FILE: TournamentFormScreen.tsx
 * PURPOSE: Adds a new tournament, or edits its details.
 * USED BY: src/app/tournament/new.tsx,
 *          src/app/tournament/[id]/edit.tsx
 * =====================================================
 */
import { useRouter } from 'expo-router';
import { ScrollView, Text } from 'react-native';

import { Button } from '@/components/Button';
import { FullScreenMessage } from '@/components/FullScreenMessage';
import { Screen } from '@/components/Screen';
import { TextField } from '@/components/TextField';
import { useGoBack } from '@/hooks/useGoBack';
import { useT } from '@/lib/i18n/useT';

import { useTournamentForm } from '../hooks/useTournamentForm';
import { MAX_SEASON_YEAR, MIN_SEASON_YEAR } from '../validateTournamentForm';

type TournamentFormScreenProps = {
  tournamentId: string | null;
};

export function TournamentFormScreen({ tournamentId }: TournamentFormScreenProps) {
  const t = useT();
  const router = useRouter();
  const goBack = useGoBack('/');

  function handleSaved(id: string) {
    // A new tournament opens straight away, because categories are the next step.
    if (tournamentId === null) {
      router.replace({ pathname: '/tournament/[id]/overview', params: { id } });
    } else {
      goBack();
    }
  }

  const form = useTournamentForm(tournamentId, handleSaved);

  if (form.status === 'loading') {
    return <FullScreenMessage title={t('common.loading')} />;
  }

  if (form.status === 'notFound' || form.status === 'loadError') {
    const key = form.status === 'notFound' ? 'common.notFound' : 'common.loadError';
    return <FullScreenMessage title={t(key)} />;
  }

  return (
    <Screen>
      {/* "handled" lets the first tap press a button instead of only closing the keyboard. */}
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerClassName="gap-4 pb-6">
        <TextField
          label={t('tournaments.name')}
          value={form.values.name}
          onChangeText={(text) => form.setField('name', text)}
          error={form.errors.name ? t('tournaments.nameRequired') : undefined}
          autoCapitalize="sentences"
          maxLength={100}
        />
        <TextField
          label={t('tournaments.date')}
          value={form.values.date}
          onChangeText={(text) => form.setField('date', text)}
          error={form.errors.date ? t('tournaments.dateInvalid') : undefined}
          keyboardType="numbers-and-punctuation"
          maxLength={10}
        />
        <TextField
          label={t('tournaments.place')}
          value={form.values.place}
          onChangeText={(text) => form.setField('place', text)}
          autoCapitalize="words"
          maxLength={100}
        />
        <TextField
          label={t('tournaments.seasonYear')}
          value={form.values.seasonYear}
          onChangeText={(text) => form.setField('seasonYear', text)}
          error={
            form.errors.seasonYear
              ? t('tournaments.seasonYearInvalid', { min: MIN_SEASON_YEAR, max: MAX_SEASON_YEAR })
              : undefined
          }
          keyboardType="number-pad"
          maxLength={4}
        />
        {form.hasSaveFailed && (
          <Text className="text-lg font-semibold text-red-700 dark:text-red-300">
            {t('common.saveError')}
          </Text>
        )}
        <Button
          label={t('common.save')}
          onPress={() => void form.save()}
          isDisabled={form.isBusy}
        />
      </ScrollView>
    </Screen>
  );
}
