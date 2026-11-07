/**
 * =====================================================
 * FILE: EligibilityWarnings.tsx
 * PURPOSE: Lists why an athlete may not fit a category.
 * USED BY: AthleteOptionRow.tsx, RegisteredAthleteRow.tsx
 * =====================================================
 */
import { Text } from 'react-native';

import { useWarningText } from '../hooks/useWarningText';
import type { EligibilityWarning } from '../types';

type EligibilityWarningsProps = {
  warnings: readonly EligibilityWarning[];
};

export function EligibilityWarnings({ warnings }: EligibilityWarningsProps) {
  const warningText = useWarningText();

  return (
    <>
      {warnings.map((warning) => (
        // The warning sign means the problem isn't shown by color alone.
        <Text
          key={warning.type}
          className="text-base font-semibold text-amber-800 dark:text-amber-300"
        >
          {`⚠ ${warningText(warning)}`}
        </Text>
      ))}
    </>
  );
}
