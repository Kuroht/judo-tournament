/**
 * =====================================================
 * FILE: ClubRow.tsx
 * PURPOSE: One club in the clubs list.
 * USED BY: ClubsScreen.tsx
 * =====================================================
 */
import { ListRow } from '@/components/ListRow';
import { useT } from '@/lib/i18n/useT';

import type { ClubListItem } from '../types';

type ClubRowProps = {
  club: ClubListItem;
  onPress: () => void;
};

export function ClubRow({ club, onPress }: ClubRowProps) {
  const t = useT();

  return (
    <ListRow
      title={club.name}
      subtitle={t('clubs.athleteCount', { count: club.athleteCount })}
      icon="shield-outline"
      onPress={onPress}
    />
  );
}
