/**
 * =====================================================
 * FILE: SeasonYearField.tsx
 * PURPOSE: The season year that new tournaments start with.
 * USED BY: SettingsScreen.tsx
 * =====================================================
 */
import { TextField } from '@/components/TextField';
import { useT } from '@/lib/i18n/useT';

import { useSeasonYear } from '../hooks/useSeasonYear';

export function SeasonYearField() {
  const t = useT();
  const season = useSeasonYear();

  return (
    <TextField
      label={t('settings.seasonYear')}
      value={season.text}
      onChangeText={season.change}
      keyboardType="number-pad"
      maxLength={4}
      error={season.isInvalid ? t('settings.seasonYearInvalid') : undefined}
    />
  );
}
