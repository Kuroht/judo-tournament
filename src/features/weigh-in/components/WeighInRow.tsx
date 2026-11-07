/**
 * =====================================================
 * FILE: WeighInRow.tsx
 * PURPOSE: One athlete in the weigh-in list.
 * USED BY: WeighInContent.tsx
 * =====================================================
 */
import type { IconName } from '@/components/AppIcon';
import { ListRow } from '@/components/ListRow';
import type { BadgeTone } from '@/components/StatusBadge';
import { useT } from '@/lib/i18n/useT';

import { useWeighInText } from '../hooks/useWeighInText';
import type { EntryStatus, WeighInEntry } from '../types';

// The word in the badge carries the meaning, so that it doesn't depend on color alone.
const STATUS_TONES: Record<EntryStatus, BadgeTone> = {
  registered: 'neutral',
  passed: 'done',
  failed: 'warning',
  noShow: 'warning',
  withdrawn: 'warning',
};

const STATUS_ICONS: Record<EntryStatus, IconName> = {
  registered: 'scale-outline',
  passed: 'checkmark-circle',
  failed: 'close-circle-outline',
  noShow: 'remove-circle-outline',
  withdrawn: 'remove-circle-outline',
};

type WeighInRowProps = {
  entry: WeighInEntry;
  onPress: () => void;
};

export function WeighInRow({ entry, onPress }: WeighInRowProps) {
  const t = useT();
  const { statusText } = useWeighInText();
  const club = entry.clubName ?? t('athletes.noClub');
  const category = [entry.ageClassName, entry.categoryLabel].filter((part) => part !== null);

  return (
    <ListRow
      title={entry.name}
      subtitle={`${category.join(' · ')} · ${club}`}
      icon={STATUS_ICONS[entry.status]}
      iconTone={entry.status === 'passed' ? 'done' : 'soft'}
      badge={statusText(entry)}
      badgeTone={STATUS_TONES[entry.status]}
      onPress={onPress}
    />
  );
}
