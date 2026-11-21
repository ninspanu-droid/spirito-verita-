import type { SQLiteDatabase } from 'expo-sqlite';
import type { DiaryEntry } from './types';
import { DiaryRepository } from './diaryRepository';

 type LegacyJournalRow = { id: number; body: string; created_at: string };

export type LegacySqliteMigrationResult = {
  tableFound: boolean;
  sourceEntries: number;
  inserted: number;
  alreadyPresent: number;
  verified: number;
  legacyPlaintextRetained: boolean;
};

/**
 * Normalizza timestamp storici in ISO UTC. SQLite CURRENT_TIMESTAMP è UTC
 * senza suffisso (YYYY-MM-DD HH:mm:ss); gli ISO con Z/offset mantengono
 * il loro istante. Rifiuta date impossibili e formati ambigui.
 */
export function normalizeLegacySqliteDate(value: string): string {
  const invalid = () => new Error(
    'La tabella storica contiene una data non valida o ambigua. Nessuna annotazione legacy è stata cancellata.',
  );
  if (typeof value !== 'string' || !value.trim()) throw invalid();

  const trimmed = value.trim();
  const match = trimmed.match(
    /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2}):(\d{2})(\.\d{1,9})?(Z|[+-]\d{2}:\d{2})?$/i,
  );
  if (!match) throw invalid();

  const [, yearText, monthText, dayText, hourText, minuteText, secondText, fraction = '', zone = ''] = match;
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const hour = Number(hourText);
  const minute = Number(minuteText);
  const second = Number(secondText);

  const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const daysInMonth = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  if (
    month < 1 || month > 12 || day < 1 || day > daysInMonth[month - 1] ||
    hour > 23 || minute > 59 || second > 59
  ) throw invalid();

  if (zone && zone.toUpperCase() !== 'Z') {
    const offset = zone.match(/^([+-])(\d{2}):(\d{2})$/);
    if (!offset) throw invalid();
    const offsetHours = Number(offset[2]);
    const offsetMinutes = Number(offset[3]);
    if (offsetHours > 14 || offsetMinutes > 59 || (offsetHours === 14 && offsetMinutes !== 0)) {
      throw invalid();
    }
  }

  const iso = `${yearText}-${monthText}-${dayText}T${hourText}:${minuteText}:${secondText}${fraction}${zone || 'Z'}`;
  const parsed = Date.parse(iso);
  if (!Number.isFinite(parsed)) throw invalid();
  return new Date(parsed).toISOString();
}

/**
 * Migra journal_entries (testo in chiaro) nel repository cifrato.
 * La tabella sorgente NON viene mai modificata o cancellata da questa funzione.
 */
export async function migrateLegacySqliteJournal(
  db: SQLiteDatabase,
  repository: DiaryRepository,
): Promise<LegacySqliteMigrationResult> {
  const table = await db.getFirstAsync<{ name: string }>(
    "SELECT name FROM sqlite_master WHERE type = 'table' AND name = ?",
    'journal_entries',
  );
  if (!table) {
    return {
      tableFound: false,
      sourceEntries: 0,
      inserted: 0,
      alreadyPresent: 0,
      verified: 0,
      legacyPlaintextRetained: false,
    };
  }

  const rows = await db.getAllAsync<LegacyJournalRow>(
    'SELECT id, body, created_at FROM journal_entries ORDER BY id ASC',
  );
  for (const row of rows) {
    if (!Number.isInteger(row.id) || typeof row.body !== 'string' || typeof row.created_at !== 'string') {
      throw new Error('La tabella storica contiene una riga con formato non riconosciuto. Nessun dato legacy è stato cancellato.');
    }
  }

  const source: DiaryEntry[] = rows.map((row) => {
    const date = normalizeLegacySqliteDate(row.created_at);
    return {
      id: `legacy-sqlite-journal-${row.id}`,
      type: 'reflection',
      title: 'Annotazione precedente',
      body: row.body,
      createdAt: date,
      updatedAt: date,
    };
  });

  const current = await repository.getAll();
  const byId = new Map(current.map((entry) => [entry.id, entry]));
  let inserted = 0;
  let alreadyPresent = 0;

  for (const entry of source) {
    const existing = byId.get(entry.id);
    if (existing) {
      const same = existing.type === entry.type && existing.title === entry.title &&
        existing.body === entry.body && existing.createdAt === entry.createdAt &&
        existing.updatedAt === entry.updatedAt;
      if (!same) {
        throw new Error(`Conflitto durante la migrazione della vecchia annotazione ${entry.id}. La copia storica è stata conservata.`);
      }
      alreadyPresent += 1;
      continue;
    }
    await repository.save({
      id: entry.id,
      type: entry.type,
      title: entry.title,
      body: entry.body,
      createdAt: entry.createdAt,
      updatedAt: entry.updatedAt,
    });
    inserted += 1;
  }

  const verified = await repository.getAll();
  const verifiedById = new Map(verified.map((entry) => [entry.id, entry]));
  for (const expected of source) {
    const actual = verifiedById.get(expected.id);
    if (!actual || actual.type !== expected.type || actual.title !== expected.title ||
      actual.body !== expected.body || actual.createdAt !== expected.createdAt ||
      actual.updatedAt !== expected.updatedAt) {
      throw new Error(`Verifica della copia cifrata fallita per ${expected.id}. La tabella storica in chiaro è stata conservata.`);
    }
  }

  return {
    tableFound: true,
    sourceEntries: source.length,
    inserted,
    alreadyPresent,
    verified: source.length,
    legacyPlaintextRetained: true,
  };
}
