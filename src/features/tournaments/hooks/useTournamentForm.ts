/**
 * =====================================================
 * FILE: useTournamentForm.ts
 * PURPOSE: The logic behind the add and edit tournament
 *          screen.
 * USED BY: TournamentFormScreen.tsx
 * =====================================================
 */
import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useRef, useState } from 'react';

import { getSavedSeasonYear } from '@/features/settings';

import { createTournament, getTournament, updateTournament } from '../db/tournamentQueries';
import { formatDisplayDate, toDisplayDate } from '../tournamentDate';
import type { TournamentFormValues } from '../types';
import { validateTournamentForm, type TournamentFormErrors } from '../validateTournamentForm';

type FormStatus = 'loading' | 'ready' | 'notFound' | 'loadError';

/** A new tournament starts today, which is usually close enough to edit quickly. */
function createEmptyValues(): TournamentFormValues {
  const today = new Date();

  return {
    name: '',
    date: toDisplayDate(today),
    place: '',
    seasonYear: String(today.getFullYear()),
  };
}

/**
 * Loads, validates and saves one tournament.
 * @param tournamentId the tournament to edit, or null to create a new one
 * @param onSaved called after saving, with the tournament's id
 */
export function useTournamentForm(tournamentId: string | null, onSaved: (id: string) => void) {
  const db = useSQLiteContext();
  const [status, setStatus] = useState<FormStatus>(tournamentId === null ? 'ready' : 'loading');
  const [values, setValues] = useState(createEmptyValues);
  const [errors, setErrors] = useState<TournamentFormErrors>({});
  const [hasSaveFailed, setHasSaveFailed] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  // Two fast taps can both run before isBusy disables the button, because state only
  // changes on the next render. A ref changes at once, so the second tap is ignored.
  const isActionRunning = useRef(false);

  useEffect(() => {
    if (tournamentId === null) {
      // A new tournament starts with the season chosen in the settings.
      // A slow read must not replace a year just typed, and if it fails, this year stays.
      const untouchedYear = createEmptyValues().seasonYear;
      getSavedSeasonYear(db)
        .then((year) =>
          setValues((current) =>
            current.seasonYear === untouchedYear
              ? { ...current, seasonYear: String(year) }
              : current,
          ),
        )
        .catch(() => undefined);
      return;
    }

    getTournament(db, tournamentId)
      .then((tournament) => {
        if (tournament === null) {
          setStatus('notFound');
          return;
        }
        setValues({
          name: tournament.name,
          date: formatDisplayDate(tournament.date),
          place: tournament.place ?? '',
          seasonYear: String(tournament.seasonYear),
        });
        setStatus('ready');
      })
      .catch(() => setStatus('loadError'));
  }, [db, tournamentId]);

  /** Changes one field, and clears that field's error because it's being fixed. */
  function setField(field: keyof TournamentFormValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  async function save() {
    if (isActionRunning.current) {
      return;
    }

    setHasSaveFailed(false);
    const result = validateTournamentForm(values);

    if (result.type === 'invalid') {
      setErrors(result.errors);
      return;
    }

    isActionRunning.current = true;
    setIsBusy(true);
    try {
      if (tournamentId === null) {
        onSaved(await createTournament(db, result.data));
      } else {
        await updateTournament(db, tournamentId, result.data);
        onSaved(tournamentId);
      }
    } catch {
      setHasSaveFailed(true);
    } finally {
      isActionRunning.current = false;
      setIsBusy(false);
    }
  }

  return { status, values, setField, errors, hasSaveFailed, isBusy, save };
}
