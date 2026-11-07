/**
 * =====================================================
 * FILE: useClubForm.ts
 * PURPOSE: The logic behind the add and edit club screen.
 * USED BY: ClubFormScreen.tsx
 * =====================================================
 */
import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useRef, useState } from 'react';

import type { TranslationKey } from '@/lib/i18n/pt';

import {
  createClub,
  deleteClub,
  getClub,
  isClubNameTaken,
  updateClub,
} from '../db/clubQueries';

type FormStatus = 'loading' | 'ready' | 'notFound' | 'loadError';

export type ClubFormError =
  | { key: TranslationKey; values?: Record<string, number> }
  | null;

/**
 * Loads, validates, saves and deletes one club.
 * @param clubId the club to edit, or null to create a new one
 * @param onDone called after a successful save or delete
 */
export function useClubForm(clubId: string | null, onDone: () => void) {
  const db = useSQLiteContext();
  const [status, setStatus] = useState<FormStatus>(clubId === null ? 'ready' : 'loading');
  const [name, setName] = useState('');
  const [nameError, setNameError] = useState<TranslationKey | null>(null);
  const [actionError, setActionError] = useState<ClubFormError>(null);
  const [isBusy, setIsBusy] = useState(false);
  // Two fast taps can both run before isBusy disables the button, because state only
  // changes on the next render. A ref changes at once, so the second tap is ignored.
  const isActionRunning = useRef(false);

  useEffect(() => {
    if (clubId === null) {
      return;
    }

    getClub(db, clubId)
      .then((club) => {
        setName(club?.name ?? '');
        setStatus(club === null ? 'notFound' : 'ready');
      })
      .catch(() => setStatus('loadError'));
  }, [db, clubId]);

  async function save() {
    if (isActionRunning.current) {
      return;
    }

    const trimmedName = name.trim();
    setActionError(null);

    if (trimmedName === '') {
      setNameError('clubs.nameRequired');
      return;
    }

    isActionRunning.current = true;
    setIsBusy(true);
    try {
      if (await isClubNameTaken(db, trimmedName, clubId)) {
        setNameError('clubs.nameTaken');
        return;
      }

      setNameError(null);
      if (clubId === null) {
        await createClub(db, trimmedName);
      } else {
        await updateClub(db, clubId, trimmedName);
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
    if (clubId === null || isActionRunning.current) {
      return;
    }

    isActionRunning.current = true;
    setActionError(null);
    setIsBusy(true);
    try {
      const result = await deleteClub(db, clubId);
      if (result.type === 'deleted') {
        onDone();
      } else {
        setActionError({ key: 'clubs.deleteBlocked', values: { count: result.athleteCount } });
      }
    } catch {
      setActionError({ key: 'common.deleteError' });
    } finally {
      isActionRunning.current = false;
      setIsBusy(false);
    }
  }

  return { status, name, setName, nameError, actionError, isBusy, save, remove };
}
