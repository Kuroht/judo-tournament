/**
 * =====================================================
 * FILE: DatabaseProvider.tsx
 * PURPOSE: Opens the database and only shows the app once
 *          it is ready, or a clear message if it failed.
 * USED BY: src/app/_layout.tsx
 * =====================================================
 */
import { SQLiteProvider, type SQLiteDatabase } from 'expo-sqlite';
import { useCallback, useState, type ReactNode } from 'react';

import { FullScreenMessage } from '@/components/FullScreenMessage';

import { initDatabase } from './initDatabase';

const DATABASE_NAME = 'judo-tournament.db';

type DatabaseStatus =
  | { type: 'opening' }
  | { type: 'ready' }
  | { type: 'failed'; message: string };

type DatabaseProviderProps = {
  children: ReactNode;
};

export function DatabaseProvider({ children }: DatabaseProviderProps) {
  const [status, setStatus] = useState<DatabaseStatus>({ type: 'opening' });

  // useCallback keeps this the same function between renders. SQLiteProvider closes
  // and reopens the database whenever onInit changes, so a new function on every
  // render would loop forever, because this function itself causes a render.
  const handleInit = useCallback(async (db: SQLiteDatabase) => {
    try {
      await initDatabase(db);
      setStatus({ type: 'ready' });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      setStatus({ type: 'failed', message });
    }
  }, []);

  // These messages use both languages because the saved language is stored in
  // the database, so it can't be known until the database has opened.
  if (status.type === 'failed') {
    return (
      <FullScreenMessage
        title="Não foi possível abrir os dados / Could not open the data"
        details={status.message}
      />
    );
  }

  return (
    <>
      {status.type === 'opening' && <FullScreenMessage title="A abrir os dados… / Opening data…" />}
      <SQLiteProvider databaseName={DATABASE_NAME} onInit={handleInit}>
        {children}
      </SQLiteProvider>
    </>
  );
}
