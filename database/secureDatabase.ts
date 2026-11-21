import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';
import * as SQLite from 'expo-sqlite';
import type { SQLiteDatabase } from 'expo-sqlite';
import { initializeDatabase } from './database';
import { getOrCreateSqlCipherKey } from './sqlCipherKey';

const DATABASE_KEY_NAME = 'spirito-verita:sqlcipher:key:v1';
const LEGACY_DATABASE_NAME = 'spirito-verita.db';
const SECURE_DATABASE_NAME = 'spirito-verita-secure.db';

type CipherVersionRow = { cipher_version: string };
type TableRow = { name: string };
type LegacyModule = { id: number; title: string; category: string; status: 'ready' | 'draft' };
type LegacyFavorite = { module_id: number; created_at: string };
type LegacyProgress = { module_id: number; completed: number; updated_at: string };
type LegacyJournalEntry = { id: number; body: string; created_at: string };

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

async function getOrCreateDatabaseKey(db: SQLiteDatabase): Promise<string> {
  return getOrCreateSqlCipherKey({
    readStoredKey: () => SecureStore.getItemAsync(DATABASE_KEY_NAME),
    writeStoredKey: (key) => SecureStore.setItemAsync(DATABASE_KEY_NAME, key),
    generateKey: async () => bytesToHex(await Crypto.getRandomBytesAsync(32)),
    // A missing key is only recoverable on a genuinely new, empty database.
    // Querying an existing SQLCipher database without its key must fail closed.
    isDatabaseEmptyBeforeKey: async () => {
      const existingTable = await db.getFirstAsync<TableRow>(
        "SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' LIMIT 1"
      );
      return existingTable == null;
    },
  });
}

async function tableExists(db: SQLiteDatabase, tableName: string): Promise<boolean> {
  const row = await db.getFirstAsync<TableRow>(
    "SELECT name FROM sqlite_master WHERE type = 'table' AND name = ? LIMIT 1",
    tableName
  );
  return row != null;
}

/**
 * Copia in modo ripetibile i dati non sensibili e le vecchie annotazioni
 * dal database SQLite in chiaro al nuovo database SQLCipher.
 * La sorgente non viene mai cancellata da questa funzione.
 */
async function migrateLegacyDatabase(target: SQLiteDatabase): Promise<void> {
  const legacy = await SQLite.openDatabaseAsync(LEGACY_DATABASE_NAME);
  try {
    const hasModules = await tableExists(legacy, 'modules');
    const hasFavorites = await tableExists(legacy, 'favorites');
    const hasProgress = await tableExists(legacy, 'module_progress');
    const hasJournal = await tableExists(legacy, 'journal_entries');

    if (!hasModules && !hasFavorites && !hasProgress && !hasJournal) return;

    const modules = hasModules
      ? await legacy.getAllAsync<LegacyModule>('SELECT id, title, category, status FROM modules ORDER BY id')
      : [];
    const favorites = hasFavorites
      ? await legacy.getAllAsync<LegacyFavorite>('SELECT module_id, created_at FROM favorites ORDER BY module_id')
      : [];
    const progress = hasProgress
      ? await legacy.getAllAsync<LegacyProgress>('SELECT module_id, completed, updated_at FROM module_progress ORDER BY module_id')
      : [];
    const journal = hasJournal
      ? await legacy.getAllAsync<LegacyJournalEntry>('SELECT id, body, created_at FROM journal_entries ORDER BY id')
      : [];

    await target.withTransactionAsync(async () => {
      for (const row of modules) {
        await target.runAsync(
          'INSERT OR IGNORE INTO modules (id, title, category, status) VALUES (?, ?, ?, ?)',
          row.id, row.title, row.category, row.status
        );
      }
      for (const row of favorites) {
        await target.runAsync(
          'INSERT OR IGNORE INTO favorites (module_id, created_at) VALUES (?, ?)',
          row.module_id, row.created_at
        );
      }
      for (const row of progress) {
        await target.runAsync(
          'INSERT OR IGNORE INTO module_progress (module_id, completed, updated_at) VALUES (?, ?, ?)',
          row.module_id, row.completed, row.updated_at
        );
      }
      for (const row of journal) {
        await target.runAsync(
          'INSERT OR IGNORE INTO journal_entries (id, body, created_at) VALUES (?, ?, ?)',
          row.id, row.body, row.created_at
        );
      }
    });

    // Verify every copied source row. Any ID collision with different content
    // stops startup rather than silently replacing either copy.
    for (const row of modules) {
      const copied = await target.getFirstAsync<LegacyModule>(
        'SELECT id, title, category, status FROM modules WHERE id = ?', row.id
      );
      if (!copied || copied.title !== row.title || copied.category !== row.category || copied.status !== row.status) {
        throw new Error(`Conflitto durante la migrazione del modulo ${row.id}.`);
      }
    }
    for (const row of favorites) {
      const copied = await target.getFirstAsync<LegacyFavorite>(
        'SELECT module_id, created_at FROM favorites WHERE module_id = ?', row.module_id
      );
      if (!copied || copied.created_at !== row.created_at) {
        throw new Error(`Conflitto durante la migrazione del preferito ${row.module_id}.`);
      }
    }
    for (const row of progress) {
      const copied = await target.getFirstAsync<LegacyProgress>(
        'SELECT module_id, completed, updated_at FROM module_progress WHERE module_id = ?', row.module_id
      );
      if (!copied || copied.completed !== row.completed || copied.updated_at !== row.updated_at) {
        throw new Error(`Conflitto durante la migrazione del progresso ${row.module_id}.`);
      }
    }
    for (const row of journal) {
      const copied = await target.getFirstAsync<LegacyJournalEntry>(
        'SELECT id, body, created_at FROM journal_entries WHERE id = ?', row.id
      );
      if (!copied || copied.body !== row.body || copied.created_at !== row.created_at) {
        throw new Error(`Conflitto durante la migrazione dell’annotazione ${row.id}.`);
      }
    }
  } finally {
    await legacy.closeAsync();
  }
}

/** Called by SQLiteProvider before any app query is allowed. */
export async function initializeSecureDatabase(db: SQLiteDatabase): Promise<void> {
  const cipher = await db.getFirstAsync<CipherVersionRow>('PRAGMA cipher_version');
  if (!cipher?.cipher_version) {
    throw new Error(
      'SQLCipher non è presente in questa build. Non è sicuro proseguire: crea una build nativa con useSQLCipher attivo.'
    );
  }

  const keyHex = await getOrCreateDatabaseKey(db);
  // The key is generated locally as exactly 32 random bytes represented by hex.
  // It is never logged or sent to a server.
  await db.execAsync(`PRAGMA key = "x'${keyHex}'"`);

  // Force an authenticated read before schema creation or app queries.
  await db.getFirstAsync<{ name: string }>('SELECT name FROM sqlite_master LIMIT 1');
  // Create the schema without seeding first, so legacy rows win on ID collisions.
  await initializeDatabase(db, false);
  await migrateLegacyDatabase(db);
  // Add only seed rows that were not present in the legacy database.
  await initializeDatabase(db, true);
}

export const secureDatabaseNames = {
  encrypted: SECURE_DATABASE_NAME,
  legacyPlaintext: LEGACY_DATABASE_NAME,
} as const;
