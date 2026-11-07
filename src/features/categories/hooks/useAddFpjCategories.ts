/**
 * =====================================================
 * FILE: useAddFpjCategories.ts
 * PURPOSE: The logic behind choosing FPJ age classes to add
 *          to a tournament.
 * USED BY: AddFpjCategoriesScreen.tsx
 * =====================================================
 */
import { useSQLiteContext } from 'expo-sqlite';
import { useRef, useState } from 'react';

import { useT } from '@/lib/i18n/useT';

import { addFpjCategories } from '../db/categoryQueries';
import type { CategorySex } from '../types';

export type SexChoice = 'male' | 'female' | 'both';

type AddStatus =
  | { type: 'idle' }
  | { type: 'nothingChosen' }
  | { type: 'nothingNew' }
  | { type: 'failed' };

function sexesFor(choice: SexChoice): CategorySex[] {
  return choice === 'both' ? ['male', 'female'] : [choice];
}

/**
 * Holds the choices, and adds the matching categories.
 * @param tournamentId the tournament to add them to
 * @param onDone called after categories were added
 */
export function useAddFpjCategories(tournamentId: string, onDone: () => void) {
  const db = useSQLiteContext();
  const t = useT();
  const [chosenIds, setChosenIds] = useState<readonly string[]>([]);
  const [sexChoice, setSexChoice] = useState<SexChoice>('both');
  const [status, setStatus] = useState<AddStatus>({ type: 'idle' });
  const [isBusy, setIsBusy] = useState(false);
  // A ref changes at once, so a fast second tap can't add everything twice.
  const isActionRunning = useRef(false);

  function toggleAgeClass(id: string) {
    setStatus({ type: 'idle' });
    setChosenIds((current) =>
      current.includes(id) ? current.filter((chosenId) => chosenId !== id) : [...current, id],
    );
  }

  async function add() {
    if (isActionRunning.current) {
      return;
    }
    if (chosenIds.length === 0) {
      setStatus({ type: 'nothingChosen' });
      return;
    }

    isActionRunning.current = true;
    setIsBusy(true);
    try {
      const result = await addFpjCategories(
        db,
        tournamentId,
        chosenIds,
        sexesFor(sexChoice),
        t('categories.freeGroupLabel'),
      );
      if (result.addedCount === 0) {
        setStatus({ type: 'nothingNew' });
      } else {
        onDone();
      }
    } catch {
      setStatus({ type: 'failed' });
    } finally {
      isActionRunning.current = false;
      setIsBusy(false);
    }
  }

  return { chosenIds, toggleAgeClass, sexChoice, setSexChoice, status, isBusy, add };
}
