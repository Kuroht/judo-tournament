/**
 * =====================================================
 * FILE: CategoryFormFields.tsx
 * PURPOSE: The input fields of the category form.
 * USED BY: CategoryFormScreen.tsx
 * =====================================================
 */
import { View } from 'react-native';

import { SelectField } from '@/components/SelectField';
import { TextField } from '@/components/TextField';
import { useT } from '@/lib/i18n/useT';

import { CATEGORY_FORMAT_LABELS, isCategoryFormat } from '../categoryFormats';
import { useAgeClasses } from '../hooks/useAgeClasses';
import type { CategoryFormValues, CategorySex } from '../types';
import type { CategoryFormErrors } from '../validateCategoryForm';
import { CategoryOptionRow } from './CategoryOptionRow';
import { CategoryWeightFields } from './CategoryWeightFields';

const NO_AGE_CLASS = 'none';

type CategoryFormFieldsProps = {
  values: CategoryFormValues;
  errors: CategoryFormErrors;
  onChange: <K extends keyof CategoryFormValues>(field: K, value: CategoryFormValues[K]) => void;
};

export function CategoryFormFields({ values, errors, onChange }: CategoryFormFieldsProps) {
  const t = useT();
  const ageClasses = useAgeClasses();
  const ageClassOptions = ageClasses.type === 'ready' ? ageClasses.data : [];
  const formats = Object.keys(CATEGORY_FORMAT_LABELS).filter(isCategoryFormat);

  function sexOption(sex: CategorySex, label: string) {
    return { label, isSelected: values.sex === sex, onPress: () => onChange('sex', sex) };
  }

  function groupingOption(isFreeGrouping: boolean, label: string) {
    return {
      label,
      isSelected: values.isFreeGrouping === isFreeGrouping,
      onPress: () => onChange('isFreeGrouping', isFreeGrouping),
    };
  }

  return (
    <View className="gap-4">
      <TextField
        label={t('categories.label')}
        value={values.label}
        onChangeText={(text) => onChange('label', text)}
        error={errors.label ? t('categories.labelRequired') : undefined}
        maxLength={100}
      />
      <SelectField
        label={t('categories.ageClass')}
        value={values.ageClassId ?? NO_AGE_CLASS}
        options={[
          { value: NO_AGE_CLASS, label: t('categories.noAgeClass') },
          ...ageClassOptions.map((ageClass) => ({ value: ageClass.id, label: ageClass.name })),
        ]}
        searchLabel={t('common.search')}
        closeLabel={t('common.close')}
        onChange={(value) => onChange('ageClassId', value === NO_AGE_CLASS ? null : value)}
      />
      <CategoryOptionRow
        label={t('categories.sex')}
        options={[
          sexOption('male', t('categories.sex.male')),
          sexOption('female', t('categories.sex.female')),
          sexOption('mixed', t('categories.sex.mixed')),
        ]}
      />
      <CategoryOptionRow
        label={t('categories.grouping')}
        options={[
          groupingOption(false, t('categories.grouping.byWeight')),
          groupingOption(true, t('categories.grouping.free')),
        ]}
      />
      {/* A free group has no limits, so hiding these avoids asking for them. */}
      {!values.isFreeGrouping && (
        <CategoryWeightFields
          minKg={values.minKg}
          maxKg={values.maxKg}
          errors={errors}
          onMinKgChange={(text) => onChange('minKg', text)}
          onMaxKgChange={(text) => onChange('maxKg', text)}
        />
      )}
      <SelectField
        label={t('categories.format')}
        value={values.format}
        options={formats.map((format) => ({
          value: format,
          label: t(CATEGORY_FORMAT_LABELS[format]),
        }))}
        searchLabel={t('common.search')}
        closeLabel={t('common.close')}
        onChange={(value) => {
          if (isCategoryFormat(value)) {
            onChange('format', value);
          }
        }}
      />
    </View>
  );
}
