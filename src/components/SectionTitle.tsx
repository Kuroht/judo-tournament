/**
 * =====================================================
 * FILE: SectionTitle.tsx
 * PURPOSE: The heading above a group of things on a page.
 * USED BY: screens with more than one group
 * =====================================================
 */
import { Text } from 'react-native';

type SectionTitleProps = {
  title: string;
};

export function SectionTitle({ title }: SectionTitleProps) {
  return (
    <Text
      accessibilityRole="header"
      className="pt-2 text-base font-bold text-stone-600 dark:text-stone-300"
    >
      {title}
    </Text>
  );
}
