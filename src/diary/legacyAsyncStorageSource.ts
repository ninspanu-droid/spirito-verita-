import AsyncStorage from '@react-native-async-storage/async-storage';
import type { DiaryEntry } from './types';
import type { LegacyDiarySource } from './legacyMigration';

const LEGACY_NOTE_KEY = 'spirito-verita:local-notes:v1';
const LEGACY_DATE_KEY = 'spirito-verita:local-notes:migration-date:v1';
const LEGACY_ENTRY_ID = 'legacy-local-note-v1';

/**
 * Adattatore per l'unica nota testuale gestita da hooks/useLocalNotes.ts.
 * La vecchia nota viene conservata finché la migrazione non è stata verificata.
 */
export class LegacyAsyncStorageDiarySource implements LegacyDiarySource {
  async readEntries(): Promise<DiaryEntry[]> {
    const body = await AsyncStorage.getItem(LEGACY_NOTE_KEY);
    if (!body || !body.trim()) return [];

    let timestamp = await AsyncStorage.getItem(LEGACY_DATE_KEY);
    if (!timestamp) {
      timestamp = new Date().toISOString();
      await AsyncStorage.setItem(LEGACY_DATE_KEY, timestamp);
    }

    return [{
      id: LEGACY_ENTRY_ID,
      type: 'reflection',
      title: 'Nota precedente',
      body,
      createdAt: timestamp,
      updatedAt: timestamp,
    }];
  }

  async clearAfterSuccessfulMigration(): Promise<void> {
    await AsyncStorage.multiRemove([LEGACY_NOTE_KEY, LEGACY_DATE_KEY]);
  }
}
