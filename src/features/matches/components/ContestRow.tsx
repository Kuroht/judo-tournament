/**
 * =====================================================
 * FILE: ContestRow.tsx
 * PURPOSE: One contest in a list. A contest whose athletes
 *          aren't known yet can't be opened.
 * USED BY: CategoryContestsScreen.tsx, MatchListScreen.tsx
 * =====================================================
 */
import { Pressable, Text, View } from 'react-native';

import { AppIcon, type IconName, type IconTone } from '@/components/AppIcon';
import { useT } from '@/lib/i18n/useT';

import type { ContestStatus } from '../matchList';
import type { Contest } from '../types';

type ContestRowProps = {
  contest: Contest;
  status: ContestStatus;
  isNext?: boolean;
  onOpen: () => void;
};

type RowIcon = { name: IconName; tone: IconTone };

const NEXT_ICON: RowIcon = { name: 'arrow-forward-circle', tone: 'accent' };

const STATUS_ICONS: Record<ContestStatus, RowIcon> = {
  waiting: { name: 'hourglass-outline', tone: 'soft' },
  pending: { name: 'ellipse-outline', tone: 'soft' },
  running: { name: 'play-circle', tone: 'accent' },
  finished: { name: 'checkmark-circle', tone: 'done' },
};

export function ContestRow({ contest, status, isNext = false, onOpen }: ContestRowProps) {
  const t = useT();
  const { white, blue } = contest;
  const isWaiting = status === 'waiting';
  const icon = isNext ? NEXT_ICON : STATUS_ICONS[status];
  const borderClass = isNext
    ? 'border-2 border-accent dark:border-accent-light'
    : 'border border-stone-200 dark:border-stone-700';

  let partLabel = t(`matches.part.${contest.part}`);
  if (contest.pouleName !== null) {
    partLabel = t('draw.poule', { poule: contest.pouleName });
  }

  // Each part is written out, so that the status doesn't depend on the icon or color.
  const details = [
    partLabel,
    contest.isPlayoff ? t('matches.playoff') : undefined,
    t(`matches.status.${status}`),
    isNext ? t('matches.next') : undefined,
  ];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isWaiting }}
      disabled={isWaiting}
      onPress={onOpen}
      className={`min-h-16 flex-row items-center gap-3 rounded-xl bg-white px-4 py-3 dark:bg-stone-800 ${borderClass} ${isWaiting ? 'opacity-60' : ''}`}
    >
      <AppIcon name={icon.name} tone={icon.tone} size={26} />
      <View className="flex-1 gap-1">
        <Text className="text-base text-stone-600 dark:text-stone-300">
          {details.filter((part) => part !== undefined).join(' · ')}
        </Text>
        <Text className="text-lg font-semibold text-stone-900 dark:text-stone-100">
          {`${white?.name ?? '—'} x ${blue?.name ?? '—'}`}
        </Text>
      </View>
      {!isWaiting && <AppIcon name="chevron-forward" tone="soft" size={20} />}
    </Pressable>
  );
}
