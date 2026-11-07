/**
 * =====================================================
 * FILE: AthleteFilters.tsx
 * PURPOSE: The search box and club filter above the list.
 * USED BY: AthletesScreen.tsx
 * =====================================================
 */
import { View } from 'react-native';

import { SelectField, type SelectOption } from '@/components/SelectField';
import { SearchField } from '@/components/SearchField';
import { useT } from '@/lib/i18n/useT';

import { ALL_CLUBS, NO_CLUB } from '../filterAthletes';

type AthleteFiltersProps = {
  search: string;
  clubFilter: string;
  clubOptions: readonly SelectOption[];
  onSearchChange: (search: string) => void;
  onClubFilterChange: (clubFilter: string) => void;
};

export function AthleteFilters({
  search,
  clubFilter,
  clubOptions,
  onSearchChange,
  onClubFilterChange,
}: AthleteFiltersProps) {
  const t = useT();
  const options = [
    { value: ALL_CLUBS, label: t('athletes.allClubs') },
    { value: NO_CLUB, label: t('athletes.noClub') },
    ...clubOptions,
  ];

  return (
    <View className="flex-row flex-wrap items-end gap-3">
      <SearchField label={t('common.search')} value={search} onChangeText={onSearchChange} />
      <View className="min-w-64 flex-1">
        <SelectField
          label={t('athletes.filterByClub')}
          value={clubFilter}
          options={options}
          searchLabel={t('common.search')}
          closeLabel={t('common.close')}
          onChange={onClubFilterChange}
        />
      </View>
    </View>
  );
}
