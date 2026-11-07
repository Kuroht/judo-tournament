/**
 * =====================================================
 * FILE: useAthleteForm.ts
 * PURPOSE: The logic behind the add and edit athlete screen.
 * USED BY: AthleteFormScreen.tsx
 * =====================================================
 */
import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useRef, useState } from 'react';

import type { TranslationKey } from '@/lib/i18n/pt';

import {
  createAthlete,
  deleteAthlete,
  getAthlete,
  updateAthlete,
} from '../db/athleteQueries';
import type { AthleteFormValues } from '../types';
import { validateAthleteForm, type AthleteFormErrors } from '../validateAthleteForm';

type FormStatus = 'loading' | 'ready' | 'notFound' | 'loadError';

type ActionError = { key: TranslationKey; values?: Record<string, number> } | null;

const EMPTY_VALUES: AthleteFormValues = {
  name: '',
  birthYear: '',
  sex: null,
  clubId: null,
  belt: '',
  notes: '',
};

/**
 * Loads, validates, saves and deletes one athlete.
 * @param athleteId the athlete to edit, or null to create a new one
 * @param onDone called after a successful save or delete
 */
export function useAthleteForm(athleteId: string | null, onDone: () => void) {
  const db = useSQLiteContext();
  const [status, setStatus] = useState<FormStatus>(athleteId === null ? 'ready' : 'loading');
  const [values, setValues] = useState(EMPTY_VALUES);
  const [errors, setErrors] = useState<AthleteFormErrors>({});
  const [actionError, setActionError] = useState<ActionError>(null);
  const [isBusy, setIsBusy] = useState(false);
  // Two fast taps can both run before isBusy disables the button, because state only
  // changes on the next render. A ref changes at once, so the second tap is ignored.
  const isActionRunning = useRef(false);

  useEffect(() => {
    if (athleteId === null) {
      return;
    }

    getAthlete(db, athleteId)
      .then((athlete) => {
        if (athlete === null) {
          setStatus('notFound');
          return;
        }
        setValues({
          name: athlete.name,
          birthYear: String(athlete.birthYear),
          sex: athlete.sex,
          clubId: athlete.clubId,
          belt: athlete.belt ?? '',
          notes: athlete.notes ?? '',
        });
        setStatus('ready');
      })
      .catch(() => setStatus('loadError'));
  }, [db, athleteId]);

  /** Changes one field, and clears that field's error because it's being fixed. */
  function setField<K extends keyof AthleteFormValues>(field: K, value: AthleteFormValues[K]) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  async function save() {
    if (isActionRunning.current) {
      return;
    }

    setActionError(null);
    const result = validateAthleteForm(values, new Date().getFullYear());

    if (result.type === 'invalid') {
      setErrors(result.errors);
      return;
    }

    isActionRunning.current = true;
    setIsBusy(true);
    try {
      if (athleteId === null) {
        await createAthlete(db, result.data);
      } else {
        await updateAthlete(db, athleteId, result.data);
      }
      onDone();
    } catch {
      setActionError({ key: 'common.saveError' });
    } finally {
      isActionRunning.current = false;
      setIsBusy(false);
    }
  }

  async function remove() {
    if (athleteId === null || isActionRunning.current) {
      return;
    }

    isActionRunning.current = true;
    setActionError(null);
    setIsBusy(true);
    try {
      const result = await deleteAthlete(db, athleteId);
      if (result.type === 'deleted') {
        onDone();
      } else {
        setActionError({ key: 'athletes.deleteBlocked', values: { count: result.entryCount } });
      }
    } catch {
      setActionError({ key: 'common.deleteError' });
    } finally {
      isActionRunning.current = false;
      setIsBusy(false);
    }
  }

  return { status, values, setField, errors, actionError, isBusy, save, remove };
}
