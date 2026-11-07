/**
 * =====================================================
 * FILE: AthleteRow.tsx
 * PURPOSE: One athlete in the athletes list.
 * USED BY: AthletesScreen.tsx
 * =====================================================
 */
import { ListRow } from '@/components/ListRow';
import { useT } from '@/lib/i18n/useT';

import type { AthleteListItem } from '../types';

type AthleteRowProps = {
  athlete: AthleteListItem;
  onPress: () => void;
};

export function AthleteRow({ athlete, onPress }: AthleteRowProps) {
  const t = useT();
  const club = athlete.clubName ?? t('athletes.noClub');
  const sex = t(athlete.sex === 'male' ? 'athletes.sex.male' : 'athletes.sex.female');

  return (
    <ListRow
      title={athlete.name}
      subtitle={`${club} · ${athlete.birthYear} · ${sex}`}
      icon="person-circle-outline"
      onPress={onPress}
    />
  );
}
