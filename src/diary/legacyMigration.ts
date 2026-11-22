import type { DiaryEntry, DiaryEntryType } from "./types";
import { DiaryRepository } from "./diaryRepository";

const VALID_TYPES: DiaryEntryType[] = [
  "prayer",
  "intention",
  "gratitude",
  "reflection",
];

/**
 * Adapter da implementare in base alla forma reale del vecchio useLocalNotes.
 * Non presume chiavi AsyncStorage né il formato storico delle note.
 */
export interface LegacyDiarySource {
  readEntries(): Promise<DiaryEntry[]>;
  clearAfterSuccessfulMigration(): Promise<void>;
}

export interface MigrationOptions {
  /**
   * Disattivato per impostazione predefinita.
   * Attivarlo solo dopo aver verificato le note importate e aver concordato
   * la rimozione delle vecchie copie locali.
   */
  clearLegacyAfterVerification?: boolean;
}

export interface MigrationResult {
  sourceEntries: number;
  inserted: number;
  alreadyPresent: number;
  legacyCleared: boolean;
}

function validateEntry(entry: DiaryEntry, index: number): void {
  if (!entry || typeof entry !== "object") {
    throw new Error(`Annotazione legacy non valida all'indice ${index}.`);
  }
  if (typeof entry.id !== "string" || entry.id.trim().length === 0) {
    throw new Error(
      `L'annotazione legacy ${index + 1} non ha un ID stabile. Adeguare l'adapter prima della migrazione.`
    );
  }
  if (!VALID_TYPES.includes(entry.type)) {
    throw new Error(`Tipo non supportato nell'annotazione ${entry.id}.`);
  }
  if (typeof entry.title !== "string" || typeof entry.body !== "string") {
    throw new Error(`Titolo o testo non valido nell'annotazione ${entry.id}.`);
  }
  if (
    typeof entry.createdAt !== "string" ||
    Number.isNaN(Date.parse(entry.createdAt)) ||
    typeof entry.updatedAt !== "string" ||
    Number.isNaN(Date.parse(entry.updatedAt))
  ) {
    throw new Error(`Date non valide nell'annotazione ${entry.id}.`);
  }
}

function sameEntry(a: DiaryEntry, b: DiaryEntry): boolean {
  return (
    a.id === b.id &&
    a.type === b.type &&
    a.title === b.title &&
    a.body === b.body &&
    a.createdAt === b.createdAt &&
    a.updatedAt === b.updatedAt
  );
}

/**
 * Migrazione idempotente del diario legacy verso il repository cifrato.
 *
 * - Non indovina il formato AsyncStorage: lo fornisce l'adapter.
 * - Non sovrascrive una registrazione esistente con lo stesso ID ma contenuto diverso.
 * - Verifica rileggendo e decifrando i record prima di consentire la pulizia legacy.
 * - Non cancella il vecchio archivio, salvo opt-in esplicito.
 */
export async function migrateLegacyDiary(
  repository: DiaryRepository,
  source: LegacyDiarySource,
  options: MigrationOptions = {}
): Promise<MigrationResult> {
  const legacyEntries = await source.readEntries();
  const ids = new Set<string>();

  legacyEntries.forEach((entry, index) => {
    validateEntry(entry, index);
    if (ids.has(entry.id)) {
      throw new Error(`ID duplicato nel diario legacy: ${entry.id}.`);
    }
    ids.add(entry.id);
  });

  const currentEntries = await repository.getAll();
  const currentById = new Map(currentEntries.map((entry) => [entry.id, entry]));
  let inserted = 0;
  let alreadyPresent = 0;

  for (const entry of legacyEntries) {
    const existing = currentById.get(entry.id);
    if (existing) {
      if (!sameEntry(existing, entry)) {
        throw new Error(
          `Conflitto per l'ID ${entry.id}: il record cifrato esistente è diverso dal record legacy. Nessun dato è stato sovrascritto.`
        );
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

  // Verifica effettiva: legge e decifra i record appena scritti.
  const verifiedEntries = await repository.getAll();
  const verifiedById = new Map(verifiedEntries.map((entry) => [entry.id, entry]));

  for (const expected of legacyEntries) {
    const actual = verifiedById.get(expected.id);
    if (!actual || !sameEntry(actual, expected)) {
      throw new Error(
        `Verifica fallita per l'annotazione ${expected.id}. Le vecchie note non sono state cancellate.`
      );
    }
  }

  let legacyCleared = false;
  if (options.clearLegacyAfterVerification === true) {
    await source.clearAfterSuccessfulMigration();
    legacyCleared = true;
  }

  return {
    sourceEntries: legacyEntries.length,
    inserted,
    alreadyPresent,
    legacyCleared,
  };
}
