import type { SQLiteDatabase } from "expo-sqlite";
import * as Crypto from "expo-crypto";
import type { DiaryEntry, DiaryEntryType, EncryptedDiaryRecord } from "./types";
import { decryptDiaryText, encryptDiaryText } from "./crypto";

const MAX_RESTORE_ENTRIES = 100_000;
const MAX_DIARY_TITLE_LENGTH = 120;
const MAX_DIARY_BODY_LENGTH = 20_000;
const ALLOWED_TYPES: DiaryEntryType[] = [
  "prayer",
  "intention",
  "gratitude",
  "reflection",
];

export class DiaryRepository {
  constructor(private readonly db: SQLiteDatabase) {}

  async initialize(): Promise<void> {
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS diary_entries (
        id TEXT PRIMARY KEY NOT NULL,
        type TEXT NOT NULL CHECK(type IN ('prayer','intention','gratitude','reflection')),
        nonce TEXT NOT NULL,
        ciphertext TEXT NOT NULL,
        encryption_version INTEGER NOT NULL DEFAULT 1,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_diary_entries_updated
      ON diary_entries(updated_at);
    `);
  }

  async save(input: Omit<DiaryEntry, "id" | "createdAt" | "updatedAt"> & {
    id?: string;
    createdAt?: string;
    updatedAt?: string;
  }): Promise<DiaryEntry> {
    if (!ALLOWED_TYPES.includes(input.type)) {
      throw new Error("Tipo di annotazione non valido.");
    }

    const now = new Date().toISOString();
    const id = input.id ?? Crypto.randomUUID();
    const createdAt = input.createdAt ?? now;
    const updatedAt = input.updatedAt ?? now;
    const encrypted = await encryptDiaryText(
      JSON.stringify({ title: input.title, body: input.body })
    );

    await this.db.runAsync(
      `INSERT INTO diary_entries
        (id, type, nonce, ciphertext, encryption_version, created_at, updated_at)
       VALUES (?, ?, ?, ?, 1, ?, ?)`,
      id,
      input.type,
      encrypted.nonce,
      encrypted.ciphertext,
      createdAt,
      updatedAt
    );

    return { id, type: input.type, title: input.title, body: input.body, createdAt, updatedAt };
  }

  async getAll(): Promise<DiaryEntry[]> {
    const rows = await this.db.getAllAsync<EncryptedDiaryRecord>(
      `SELECT id, type, nonce, ciphertext, encryption_version,
              created_at, updated_at
       FROM diary_entries ORDER BY updated_at DESC`
    );

    const result: DiaryEntry[] = [];
    for (const row of rows) {
      if (row.encryption_version !== 1) {
        throw new Error(`Versione di cifratura non supportata: ${row.encryption_version}`);
      }
      const json = await decryptDiaryText(row);
      const content: unknown = JSON.parse(json);
      if (
        typeof content !== "object" ||
        content === null ||
        !("title" in content) ||
        !("body" in content) ||
        typeof content.title !== "string" ||
        typeof content.body !== "string"
      ) {
        throw new Error(`Contenuto diario non valido per la registrazione ${row.id}.`);
      }
      result.push({
        id: row.id,
        type: row.type,
        title: content.title,
        body: content.body,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      });
    }
    return result;
  }

  /** Restores into an empty diary only; never merges or overwrites existing entries. */
  async restoreFromBackup(entries: DiaryEntry[]): Promise<number> {
    if (!Array.isArray(entries) || entries.length > MAX_RESTORE_ENTRIES) {
      throw new Error("Il backup contiene un numero di annotazioni non valido.");
    }
    const existing = await this.hasRecords();
    if (existing) {
      throw new Error("Il Diario contiene già annotazioni. Il ripristino è consentito solo in un archivio vuoto per evitare sovrascritture.");
    }
    // Validate the complete payload before encrypting or writing any row.
    const prepared: Array<{
      entry: DiaryEntry;
      encrypted: { nonce: string; ciphertext: string };
    }> = [];
    const seen = new Set<string>();
    for (const candidate of entries) {
      if (!candidate || typeof candidate !== "object") {
        throw new Error("Il backup contiene annotazioni non valide.");
      }
      const entry = candidate as DiaryEntry;
      if (
        typeof entry.id !== "string" || entry.id.length < 1 || entry.id.length > 128 ||
        seen.has(entry.id) || !ALLOWED_TYPES.includes(entry.type) ||
        typeof entry.title !== "string" || entry.title.length > MAX_DIARY_TITLE_LENGTH ||
        typeof entry.body !== "string" || entry.body.length > MAX_DIARY_BODY_LENGTH ||
        typeof entry.createdAt !== "string" || !Number.isFinite(Date.parse(entry.createdAt)) ||
        typeof entry.updatedAt !== "string" || !Number.isFinite(Date.parse(entry.updatedAt))
      ) {
        throw new Error("Il backup contiene annotazioni duplicate, incomplete o non valide.");
      }
      seen.add(entry.id);
      const encrypted = await encryptDiaryText(JSON.stringify({ title: entry.title, body: entry.body }));
      prepared.push({ entry, encrypted });
    }
    await this.db.withTransactionAsync(async () => {
      const count = await this.db.getFirstAsync<{ total: number }>("SELECT COUNT(*) AS total FROM diary_entries");
      if ((count?.total ?? 0) !== 0) {
        throw new Error("Il Diario non è vuoto: ripristino annullato senza modificare le annotazioni.");
      }
      for (const item of prepared) {
        await this.db.runAsync(
          `INSERT INTO diary_entries (id, type, nonce, ciphertext, encryption_version, created_at, updated_at)
           VALUES (?, ?, ?, ?, 1, ?, ?)`,
          item.entry.id, item.entry.type, item.encrypted.nonce, item.encrypted.ciphertext,
          item.entry.createdAt, item.entry.updatedAt
        );
      }
    });
    return prepared.length;
  }

  async hasRecords(): Promise<boolean> {
    const row = await this.db.getFirstAsync<{ total: number }>(
      "SELECT COUNT(*) AS total FROM diary_entries"
    );
    return (row?.total ?? 0) > 0;
  }

  async delete(id: string): Promise<void> {
    await this.db.runAsync("DELETE FROM diary_entries WHERE id = ?", id);
  }
}
