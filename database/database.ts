import type { SQLiteDatabase } from 'expo-sqlite';
import { moduleSeed } from '../data/moduleSeed';

export async function initializeDatabase(db: SQLiteDatabase, seedModules = true) {
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS modules (
      id INTEGER PRIMARY KEY NOT NULL,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      status TEXT NOT NULL CHECK(status IN ('ready', 'draft'))
    );

    CREATE TABLE IF NOT EXISTS favorites (
      module_id INTEGER PRIMARY KEY NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS module_progress (
      module_id INTEGER PRIMARY KEY NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
      completed INTEGER NOT NULL DEFAULT 0 CHECK(completed IN (0,1)),
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS journal_entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      body TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  if (seedModules) {
    const insert = await db.prepareAsync(
      'INSERT OR IGNORE INTO modules (id, title, category, status) VALUES ($id, $title, $category, $status)'
    );
    try {
      for (const item of moduleSeed) {
        await insert.executeAsync({
          $id: item.id,
          $title: item.title,
          $category: item.category,
          $status: item.status,
        });
      }
    } finally {
      await insert.finalizeAsync();
    }

    // Aggiorna soltanto le voci segnaposto dei primi dieci moduli.
    // Non modifica preferiti, progressi o annotazioni già presenti.
    for (const item of moduleSeed) {
      await db.runAsync(
        "UPDATE modules SET title = ?, category = ?, status = ? WHERE id = ? AND title LIKE 'Modulo % — contenuto da integrare'",
        item.title, item.category, item.status, item.id
      );
    }
  }
}

export type CatalogRow = {
  id: number;
  title: string;
  category: string;
  status: 'ready' | 'draft';
  favorite: number;
  completed: number;
};

export async function getCatalog(
  db: SQLiteDatabase,
  search = '',
  category = 'Tutti',
  favoritesOnly = false
): Promise<CatalogRow[]> {
  const clauses: string[] = [];
  const params: Record<string, string | number> = {};
  if (search.trim()) {
    clauses.push('(m.title LIKE $search OR m.category LIKE $search)');
    params.$search = `%${search.trim()}%`;
  }
  if (category !== 'Tutti') {
    clauses.push('m.category = $category');
    params.$category = category;
  }
  if (favoritesOnly) clauses.push('f.module_id IS NOT NULL');
  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
  return db.getAllAsync<CatalogRow>(
    `SELECT m.id, m.title, m.category, m.status,
      CASE WHEN f.module_id IS NULL THEN 0 ELSE 1 END AS favorite,
      COALESCE(p.completed, 0) AS completed
     FROM modules m
     LEFT JOIN favorites f ON f.module_id = m.id
     LEFT JOIN module_progress p ON p.module_id = m.id
     ${where}
     ORDER BY m.id ASC`,
    params
  );
}

export async function toggleFavorite(db: SQLiteDatabase, moduleId: number, isFavorite: boolean) {
  if (isFavorite) {
    await db.runAsync('DELETE FROM favorites WHERE module_id = ?', moduleId);
  } else {
    await db.runAsync('INSERT OR IGNORE INTO favorites (module_id) VALUES (?)', moduleId);
  }
}

export async function setModuleCompleted(db: SQLiteDatabase, moduleId: number, completed: boolean) {
  await db.runAsync(
    `INSERT INTO module_progress (module_id, completed, updated_at)
     VALUES (?, ?, CURRENT_TIMESTAMP)
     ON CONFLICT(module_id) DO UPDATE SET
       completed = excluded.completed,
       updated_at = CURRENT_TIMESTAMP`,
    moduleId,
    completed ? 1 : 0
  );
}
