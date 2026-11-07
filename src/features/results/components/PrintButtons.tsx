/**
 * =====================================================
 * FILE: PrintButtons.tsx
 * PURPOSE: The buttons that print a tournament, or save it
 *          as a PDF from the system's print screen.
 * USED BY: ResultsScreen.tsx
 * =====================================================
 */
import { Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { useT } from '@/lib/i18n/useT';

import { usePrintResults } from '../hooks/usePrintResults';

type PrintButtonsProps = {
  tournamentId: string;
};

export function PrintButtons({ tournamentId }: PrintButtonsProps) {
  const t = useT();
  const printing = usePrintResults(tournamentId);

  return (
    <View className="gap-2">
      {printing.hasFailed && (
        <Text
          accessibilityLiveRegion="polite"
          className="text-lg font-semibold text-red-700 dark:text-red-300"
        >
          {t('results.print.failed')}
        </Text>
      )}
      <View className="flex-row gap-2">
        <View className="flex-1">
          <Button
            label={t('results.print.results')}
            variant="secondary"
            isDisabled={printing.isBusy}
            onPress={() => void printing.printResults()}
          />
        </View>
        <View className="flex-1">
          <Button
            label={t('results.print.contests')}
            variant="secondary"
            isDisabled={printing.isBusy}
            onPress={() => void printing.printContests()}
          />
        </View>
      </View>
    </View>
  );
}
