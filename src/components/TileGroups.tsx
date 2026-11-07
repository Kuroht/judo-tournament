/**
 * =====================================================
 * FILE: TileGroups.tsx
 * PURPOSE: Short items, such as weight categories, as a
 *          grid of tiles under headings. Far more fit on
 *          screen than in a long list, with less scrolling.
 * USED BY: CategoriesScreen, RegistrationScreen, DrawScreen
 * =====================================================
 */
import type { ReactElement } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';

import { SectionTitle } from './SectionTitle';
import { StatusBadge, type BadgeTone } from './StatusBadge';

export type Tile = {
  id: string;
  // The heading it goes under, such as "Cadetes · Masculino".
  group: string;
  title: string;
  detail?: string;
  badge?: string;
  badgeTone?: BadgeTone;
  onPress: () => void;
};

type TileGroupsProps = {
  tiles: readonly Tile[];
  emptyComponent: ReactElement;
};

/**
 * Sorts tiles into their groups, keeping the order they came in.
 * @example
 * groupTiles([{ group: 'A' }, { group: 'B' }, { group: 'A' }]);
 * // [{ title: 'A', tiles: [two tiles] }, { title: 'B', tiles: [one tile] }]
 */
export function groupTiles<T extends { group: string }>(
  tiles: readonly T[],
): { title: string; tiles: T[] }[] {
  const titles = [...new Set(tiles.map((tile) => tile.group))];

  return titles.map((title) => ({
    title,
    tiles: tiles.filter((tile) => tile.group === title),
  }));
}

export function TileGroups({ tiles, emptyComponent }: TileGroupsProps) {
  return (
    <FlatList
      className="flex-1"
      data={groupTiles(tiles)}
      keyExtractor={(group) => group.title}
      keyboardShouldPersistTaps="handled"
      contentContainerClassName="gap-3 flex-grow pb-2"
      ListEmptyComponent={emptyComponent}
      renderItem={({ item: group }) => (
        <View className="gap-2">
          <SectionTitle title={group.title} />
          {/* A plain loop here is fine, because one age class only has a few weights. */}
          <View className="flex-row flex-wrap gap-2">
            {group.tiles.map((tile) => (
              <Pressable
                key={tile.id}
                accessibilityRole="button"
                onPress={tile.onPress}
                className="min-h-20 w-44 gap-1 rounded-xl border border-stone-200 bg-white p-3 dark:border-stone-700 dark:bg-stone-800"
              >
                <Text className="text-xl font-bold text-stone-900 dark:text-stone-100">
                  {tile.title}
                </Text>
                {tile.detail !== undefined && (
                  <Text className="text-base text-stone-600 dark:text-stone-300">
                    {tile.detail}
                  </Text>
                )}
                {tile.badge !== undefined && (
                  <StatusBadge label={tile.badge} tone={tile.badgeTone} />
                )}
              </Pressable>
            ))}
          </View>
        </View>
      )}
    />
  );
}
