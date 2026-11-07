/**
 * =====================================================
 * FILE: AddFpjCategoriesScreen.tsx
 * PURPOSE: Chooses FPJ age classes to add to a tournament.
 * USED BY: src/app/tournament/[id]/add-categories.tsx
 * =====================================================
 */
import { ScrollView, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { FullScreenMessage } from '@/components/FullScreenMessage';
import { OptionButton } from '@/components/OptionButton';
import { Screen } from '@/components/Screen';
import { useGoBack } from '@/hooks/useGoBack';
import type { TranslationKey } from '@/lib/i18n/pt';
import { useT } from '@/lib/i18n/useT';

import { useAddFpjCategories } from '../hooks/useAddFpjCategories';
import { useAgeClasses } from '../hooks/useAgeClasses';

const STATUS_MESSAGES: Record<'nothingChosen' | 'nothingNew' | 'failed', TranslationKey> = {
  nothingChosen: 'categories.nothingChosen',
  nothingNew: 'categories.nothingNew',
  failed: 'common.saveError',
};

type AddFpjCategoriesScreenProps = {
  tournamentId: string;
};

export function AddFpjCategoriesScreen({ tournamentId }: AddFpjCategoriesScreenProps) {
  const t = useT();
  const ageClasses = useAgeClasses();
  const goBack = useGoBack({ pathname: '/tournament/[id]/categories', params: { id: tournamentId } });
  const form = useAddFpjCategories(tournamentId, goBack);

  if (ageClasses.type === 'loading') {
    return <FullScreenMessage title={t('common.loading')} />;
  }

  if (ageClasses.type === 'error') {
    return <FullScreenMessage title={t('common.loadError')} details={ageClasses.message} />;
  }

  return (
    <Screen>
      <ScrollView contentContainerClassName="gap-2 pb-6">
        <Text className="text-lg font-bold text-slate-900 dark:text-slate-100">
          {t('categories.chooseSex')}
        </Text>
        <View className="flex-row gap-2">
          <OptionButton
            label={t('categories.sex.both')}
            isSelected={form.sexChoice === 'both'}
            onPress={() => form.setSexChoice('both')}
          />
          <OptionButton
            label={t('categories.sex.male')}
            isSelected={form.sexChoice === 'male'}
            onPress={() => form.setSexChoice('male')}
          />
          <OptionButton
            label={t('categories.sex.female')}
            isSelected={form.sexChoice === 'female'}
            onPress={() => form.setSexChoice('female')}
          />
        </View>
        <Text className="mt-4 text-lg font-bold text-slate-900 dark:text-slate-100">
          {t('categories.chooseAgeClasses')}
        </Text>
        {ageClasses.data.map((ageClass) => {
          const notes = [
            ageClass.hasWeightCategories ? null : t('categories.freeGroupNote'),
            ageClass.isVerified ? null : t('categories.toVerify'),
          ].filter((note) => note !== null);

          return (
            <OptionButton
              key={ageClass.id}
              label={[ageClass.name, ...notes].join(' · ')}
              isSelected={form.chosenIds.includes(ageClass.id)}
              isInList
              onPress={() => form.toggleAgeClass(ageClass.id)}
            />
          );
        })}
        {form.status.type !== 'idle' && (
          <Text className="text-lg font-semibold text-red-700 dark:text-red-300">
            {t(STATUS_MESSAGES[form.status.type])}
          </Text>
        )}
      </ScrollView>
      <Button label={t('categories.add')} onPress={() => void form.add()} isDisabled={form.isBusy} />
    </Screen>
  );
}
