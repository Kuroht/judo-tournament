/**
 * =====================================================
 * FILE: AthleteOptionRow.tsx
 * PURPOSE: One athlete that can be added to a category.
 * USED BY: AddAthletesScreen.tsx
 * =====================================================
 */
import { ListRow } from '@/components/ListRow';
import { useT } from '@/lib/i18n/useT';

import { checkEligibility } from '../checkEligibility';
import type { CategoryRules, RegistrationAthlete } from '../types';
import { EligibilityWarnings } from './EligibilityWarnings';

type AthleteOptionRowProps = {
  athlete: RegistrationAthlete;
  category: CategoryRules;
  isDisabled: boolean;
  onPress: () => void;
};

export function AthleteOptionRow({
  athlete,
  category,
  isDisabled,
  onPress,
}: AthleteOptionRowProps) {
  const t = useT();
  const club = athlete.clubName ?? t('athletes.noClub');

  return (
    <ListRow
      title={athlete.name}
      subtitle={`${club} · ${athlete.birthYear}`}
      icon="add-circle"
      iconTone="accent"
      accessibilityLabel={t('registration.addLabel', { name: athlete.name })}
      isDisabled={isDisabled}
      onPress={onPress}
    >
      <EligibilityWarnings warnings={checkEligibility(athlete, category)} />
    </ListRow>
  );
}
