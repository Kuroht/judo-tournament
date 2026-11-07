/**
 * =====================================================
 * FILE: useRulePresetForm.ts
 * PURPOSE: Loads, checks and saves one age class's rules.
 * USED BY: RulePresetFormScreen.tsx
 * =====================================================
 */
import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useState } from 'react';

import { getRulePreset, updateRulePreset } from '../db/rulePresetQueries';
import type { RulePresetFormValues } from '../types';
import { validateRulePreset, type RulePresetErrors } from '../validateRulePreset';

type FormStatus = 'loading' | 'ready' | 'notFound' | 'loadError';

/**
 * Gives a screen the form for one age class.
 * @param id the age class
 * @param onSaved called after saving
 */
export function useRulePresetForm(id: string, onSaved: () => void) {
  const db = useSQLiteContext();
  const [status, setStatus] = useState<FormStatus>('loading');
  const [name, setName] = useState('');
  const [values, setValues] = useState<RulePresetFormValues>({
    matchSeconds: '',
    hasGoldenScore: true,
    goldenScoreMaxSeconds: '',
    isYukoEnabled: true,
    weightToleranceGrams: '',
  });
  const [errors, setErrors] = useState<RulePresetErrors>({});
  const [hasSaveFailed, setHasSaveFailed] = useState(false);

  useEffect(() => {
    getRulePreset(db, id)
      .then((preset) => {
        if (preset === null) {
          setStatus('notFound');
          return;
        }
        setName(preset.name);
        setValues({
          matchSeconds: String(preset.matchSeconds),
          hasGoldenScore: preset.hasGoldenScore,
          goldenScoreMaxSeconds:
            preset.goldenScoreMaxSeconds === null ? '' : String(preset.goldenScoreMaxSeconds),
          isYukoEnabled: preset.isYukoEnabled,
          weightToleranceGrams: String(preset.weightToleranceGrams),
        });
        setStatus('ready');
      })
      .catch(() => setStatus('loadError'));
  }, [db, id]);

  async function save() {
    const checked = validateRulePreset(values);
    if ('errors' in checked) {
      setErrors(checked.errors);
      return;
    }

    setErrors({});
    setHasSaveFailed(false);
    try {
      await updateRulePreset(db, id, checked.rules);
      onSaved();
    } catch {
      setHasSaveFailed(true);
    }
  }

  function setField<Field extends keyof RulePresetFormValues>(
    field: Field,
    value: RulePresetFormValues[Field],
  ) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  return { status, name, values, errors, hasSaveFailed, setField, save };
}
