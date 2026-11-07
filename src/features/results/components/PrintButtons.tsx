/**
 * =====================================================
 * FILE: PrintButtons.tsx
 * PURPOSE: The buttons that print a tournament, or save it
 *          as a PDF from the system's print screen.
 * USED BY: ResultsScreen.tsx
 * =====================================================
 */
import { View } from 'react-native';

import { Banner } from '@/components/Banner';
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
      {printing.hasFailed && <Banner tone="error" message={t('results.print.failed')} />}
      <View className="flex-row gap-2">
        <View className="flex-1">
          <Button
            label={t('results.print.results')}
            icon="print-outline"
            variant="secondary"
            isDisabled={printing.isBusy}
            onPress={() => void printing.printResults()}
          />
        </View>
        <View className="flex-1">
          <Button
            label={t('results.print.contests')}
            icon="print-outline"
            variant="secondary"
            isDisabled={printing.isBusy}
            onPress={() => void printing.printContests()}
          />
        </View>
      </View>
    </View>
  );
}
