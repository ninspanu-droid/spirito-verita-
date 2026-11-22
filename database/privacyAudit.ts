import type { SQLiteDatabase } from 'expo-sqlite';

export type PrivacyAuditResult = {
  legacyJournalTableExists: boolean;
  legacyPlaintextEntryCount: number;
  encryptedDiaryTableExists: boolean;
};

/**
 * Ispezione non distruttiva delle tabelle Diario.
 * Non legge né restituisce il testo delle annotazioni legacy.
 * Non elimina e non modifica alcun dato.
 */
export async function auditDiaryStorage(
  db: SQLiteDatabase
): Promise<PrivacyAuditResult> {
  const tables = await db.getAllAsync<{ name: string }>(
    `SELECT name FROM sqlite_master WHERE type = 'table' AND name IN (?, ?)`,
    'journal_entries',
    'diary_entries'
  );
  const names = new Set(tables.map((table) => table.name));
  let legacyPlaintextEntryCount = 0;

  if (names.has('journal_entries')) {
    const result = await db.getFirstAsync<{ total: number }>(
      'SELECT COUNT(*) AS total FROM journal_entries'
    );
    legacyPlaintextEntryCount = result?.total ?? 0;
  }

  return {
    legacyJournalTableExists: names.has('journal_entries'),
    legacyPlaintextEntryCount,
    encryptedDiaryTableExists: names.has('diary_entries'),
  };
}
