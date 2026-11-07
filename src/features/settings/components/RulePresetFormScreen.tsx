/**
 * =====================================================
 * FILE: RulePresetFormScreen.tsx
 * PURPOSE: Edits one age class's rules.
 * USED BY: src/app/rule-preset/[id].tsx
 * =====================================================
 */
import { ScrollView, Text } from 'react-native';

import { Button } from '@/components/Button';
import { FullScreenMessage } from '@/components/FullScreenMessage';
import { Screen } from '@/components/Screen';
import { TextField } from '@/components/TextField';
import { useGoBack } from '@/hooks/useGoBack';
import { useT } from '@/lib/i18n/useT';

import { useRulePresetForm } from '../hooks/useRulePresetForm';
import { YesNoField } from './YesNoField';

type RulePresetFormScreenProps = {
  id: string;
};

export function RulePresetFormScreen({ id }: RulePresetFormScreenProps) {
  const t = useT();
  const goBack = useGoBack('/rule-presets');
  const form = useRulePresetForm(id, goBack);
  const { values, errors } = form;

  if (form.status === 'loading') {
    return <FullScreenMessage title={t('common.loading')} />;
  }

  if (form.status === 'notFound' || form.status === 'loadError') {
    return (
      <FullScreenMessage
        title={t(form.status === 'notFound' ? 'common.notFound' : 'common.loadError')}
      />
    );
  }

  return (
    <Screen>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerClassName="gap-4 pb-6">
        <Text className="text-2xl font-bold text-stone-900 dark:text-stone-100">{form.name}</Text>
        {/* Rules aren't copied into tournaments, so a change reaches all of them. */}
        <Text className="text-base font-semibold text-amber-800 dark:text-amber-300">
          {`⚠ ${t('settings.rulePresetWarning')}`}
        </Text>
        <TextField
          label={t('settings.matchSeconds')}
          value={values.matchSeconds}
          onChangeText={(text) => form.setField('matchSeconds', text)}
          keyboardType="number-pad"
          error={errors.matchSeconds ? t('settings.matchSecondsInvalid') : undefined}
        />
        <YesNoField
          label={t('settings.isYukoEnabled')}
          value={values.isYukoEnabled}
          onChange={(value) => form.setField('isYukoEnabled', value)}
        />
        <YesNoField
          label={t('settings.hasGoldenScore')}
          value={values.hasGoldenScore}
          onChange={(value) => form.setField('hasGoldenScore', value)}
        />
        {values.hasGoldenScore && (
          <TextField
            label={t('settings.goldenScoreMaxSeconds')}
            value={values.goldenScoreMaxSeconds}
            onChangeText={(text) => form.setField('goldenScoreMaxSeconds', text)}
            keyboardType="number-pad"
            error={errors.goldenScoreMaxSeconds ? t('settings.goldenScoreMaxInvalid') : undefined}
          />
        )}
        <TextField
          label={t('settings.weightToleranceGrams')}
          value={values.weightToleranceGrams}
          onChangeText={(text) => form.setField('weightToleranceGrams', text)}
          keyboardType="number-pad"
          error={errors.weightToleranceGrams ? t('settings.toleranceInvalid') : undefined}
        />
        {form.hasSaveFailed && (
          <Text
            accessibilityLiveRegion="polite"
            className="text-lg font-semibold text-red-700 dark:text-red-300"
          >
            {t('common.saveError')}
          </Text>
        )}
        <Button label={t('common.save')} onPress={() => void form.save()} />
      </ScrollView>
    </Screen>
  );
}
