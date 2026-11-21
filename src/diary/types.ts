export type DiaryEntryType =
  | "prayer"
  | "intention"
  | "gratitude"
  | "reflection";

export interface DiaryEntry {
  id: string;
  type: DiaryEntryType;
  title: string;
  body: string;
  createdAt: string;
  updatedAt: string;
}

export interface EncryptedDiaryRecord {
  id: string;
  type: DiaryEntryType;
  nonce: string;
  ciphertext: string;
  encryption_version: number;
  created_at: string;
  updated_at: string;
}
