/**
 * =====================================================
 * FILE: AthleteFormFields.tsx
 * PURPOSE: The input fields of the athlete form.
 * USED BY: AthleteFormScreen.tsx
 * =====================================================
 */
import { useRouter } from 'expo-router';
import { Text, View } from 'react-native';

import { OptionButton } from '@/components/OptionButton';
import { SelectField } from '@/components/SelectField';
import { TextField } from '@/components/TextField';
import { useT } from '@/lib/i18n/useT';

import { NO_CLUB } from '../filterAthletes';
import { useClubOptions } from '../hooks/useClubOptions';
import type { AthleteFormValues } from '../types';
import { MIN_BIRTH_YEAR, type AthleteFormErrors } from '../validateAthleteForm';

type AthleteFormFieldsProps = {
  values: AthleteFormValues;
  errors: AthleteFormErrors;
  onChange: <K extends keyof AthleteFormValues>(field: K, value: AthleteFormValues[K]) => void;
};

export function AthleteFormFields({ values, errors, onChange }: AthleteFormFieldsProps) {
  const t = useT();
  const router = useRouter();
  const clubOptions = useClubOptions();
  const birthYearError = t('athletes.birthYearInvalid', {
    min: MIN_BIRTH_YEAR,
    max: new Date().getFullYear(),
  });

  return (
    <View className="gap-4">
      <TextField
        label={t('athletes.name')}
        value={values.name}
        onChangeText={(text) => onChange('name', text)}
        error={errors.name ? t('athletes.nameRequired') : undefined}
        autoCapitalize="words"
        maxLength={100}
      />
      <TextField
        label={t('athletes.birthYear')}
        value={values.birthYear}
        onChangeText={(text) => onChange('birthYear', text)}
        error={errors.birthYear ? birthYearError : undefined}
        keyboardType="number-pad"
        maxLength={4}
      />
      <View className="gap-1">
        <Text className="text-lg font-bold text-stone-900 dark:text-stone-100">
          {t('athletes.sex')}
        </Text>
        <View className="flex-row gap-2">
          <OptionButton
            label={t('athletes.sex.male')}
            isSelected={values.sex === 'male'}
            onPress={() => onChange('sex', 'male')}
          />
          <OptionButton
            label={t('athletes.sex.female')}
            isSelected={values.sex === 'female'}
            onPress={() => onChange('sex', 'female')}
          />
        </View>
        {errors.sex && (
          <Text className="text-base font-semibold text-red-700 dark:text-red-300">
            {t('athletes.sexRequired')}
          </Text>
        )}
      </View>
      <SelectField
        label={t('athletes.club')}
        value={values.clubId ?? NO_CLUB}
        options={[{ value: NO_CLUB, label: t('athletes.noClub') }, ...clubOptions]}
        searchLabel={t('common.search')}
        closeLabel={t('common.close')}
        onChange={(value) => onChange('clubId', value === NO_CLUB ? null : value)}
        extraActionLabel={t('athletes.addNewClub')}
        onExtraAction={() => router.push('/club/new')}
      />
      <TextField
        label={t('athletes.belt')}
        value={values.belt}
        onChangeText={(text) => onChange('belt', text)}
        maxLength={50}
      />
      <TextField
        label={t('athletes.notes')}
        value={values.notes}
        onChangeText={(text) => onChange('notes', text)}
        isMultiline
        maxLength={500}
      />
    </View>
  );
}
