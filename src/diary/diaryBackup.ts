import { gcm } from "@noble/ciphers/aes";
import { pbkdf2Async } from "@noble/hashes/pbkdf2";
import { sha256 } from "@noble/hashes/sha2";
import { utf8ToBytes, bytesToUtf8 } from "@noble/ciphers/utils";
import { fromByteArray, toByteArray } from "base64-js";
import { getRandomBytesAsync } from "expo-crypto";
import type { DiaryEntry, DiaryEntryType } from "./types";

const FORMAT = "spirito-verita-diary-backup";
const FORMAT_VERSION = 1;
const KDF = "PBKDF2-HMAC-SHA256";
const ITERATIONS = 600_000;
const SALT_BYTES = 16;
const NONCE_BYTES = 12;
const KEY_BYTES = 32;
const MAX_BACKUP_BYTES = 10 * 1024 * 1024;
const ALLOWED_TYPES: DiaryEntryType[] = ["prayer", "intention", "gratitude", "reflection"];
const AAD = utf8ToBytes(`${FORMAT}:v${FORMAT_VERSION}:${KDF}:${ITERATIONS}`);

type BackupEnvelope = {
  format: typeof FORMAT;
  version: number;
  kdf: typeof KDF;
  iterations: number;
  salt: string;
  nonce: string;
  ciphertext: string;
};

function assertPassphrase(passphrase: string): void {
  if (typeof passphrase !== "string" || passphrase.length < 12 || passphrase.length > 256) {
    throw new Error("La passphrase del backup deve contenere da 12 a 256 caratteri.");
  }
}

function validateEntries(value: unknown): DiaryEntry[] {
  if (!Array.isArray(value) || value.length > 100_000) {
    throw new Error("Il backup non contiene un elenco di annotazioni valido.");
  }
  const seen = new Set<string>();
  return value.map((candidate) => {
    if (!candidate || typeof candidate !== "object") throw new Error("Annotazione del backup non valida.");
    const entry = candidate as Record<string, unknown>;
    if (
      typeof entry.id !== "string" || entry.id.length < 1 || entry.id.length > 128 ||
      seen.has(entry.id) || !ALLOWED_TYPES.includes(entry.type as DiaryEntryType) ||
      typeof entry.title !== "string" || typeof entry.body !== "string" ||
      typeof entry.createdAt !== "string" || !Number.isFinite(Date.parse(entry.createdAt)) ||
      typeof entry.updatedAt !== "string" || !Number.isFinite(Date.parse(entry.updatedAt))
    ) throw new Error("Annotazione del backup incompleta, duplicata o non valida.");
    seen.add(entry.id);
    return {
      id: entry.id,
      type: entry.type as DiaryEntryType,
      title: entry.title,
      body: entry.body,
      createdAt: entry.createdAt,
      updatedAt: entry.updatedAt,
    };
  });
}

async function deriveKey(passphrase: string, salt: Uint8Array): Promise<Uint8Array> {
  return pbkdf2Async(sha256, utf8ToBytes(passphrase), salt, {
    c: ITERATIONS,
    dkLen: KEY_BYTES,
  });
}

/** Produces a portable, authenticated encrypted backup. The device SQLCipher key is never exported. */
export async function createEncryptedDiaryBackup(
  entries: DiaryEntry[],
  passphrase: string
): Promise<string> {
  assertPassphrase(passphrase);
  const safeEntries = validateEntries(entries);
  const plaintext = utf8ToBytes(JSON.stringify({ format: FORMAT, version: FORMAT_VERSION, entries: safeEntries }));
  if (plaintext.length > MAX_BACKUP_BYTES) throw new Error("Il diario supera la dimensione massima prevista per il backup.");

  const salt = await getRandomBytesAsync(SALT_BYTES);
  const nonce = await getRandomBytesAsync(NONCE_BYTES);
  const key = await deriveKey(passphrase, salt);
  try {
    const ciphertext = gcm(key, nonce, AAD).encrypt(plaintext);
    const envelope: BackupEnvelope = {
      format: FORMAT,
      version: FORMAT_VERSION,
      kdf: KDF,
      iterations: ITERATIONS,
      salt: fromByteArray(salt),
      nonce: fromByteArray(nonce),
      ciphertext: fromByteArray(ciphertext),
    };
    return JSON.stringify(envelope);
  } finally {
    // Best-effort zeroization of mutable key/plaintext buffers; JS strings cannot be reliably erased.
    key.fill(0);
    plaintext.fill(0);
  }
}

/** Authenticates and decrypts a backup; a wrong passphrase or modified file fails closed. */
export async function openEncryptedDiaryBackup(
  serialized: string,
  passphrase: string
): Promise<DiaryEntry[]> {
  assertPassphrase(passphrase);
  if (typeof serialized !== "string" || serialized.length > MAX_BACKUP_BYTES * 2) {
    throw new Error("File di backup troppo grande o non valido.");
  }
  let envelope: BackupEnvelope;
  try { envelope = JSON.parse(serialized) as BackupEnvelope; }
  catch { throw new Error("Il file non è un backup SPIRITO & VERITÀ valido."); }

  if (
    envelope?.format !== FORMAT || envelope.version !== FORMAT_VERSION ||
    envelope.kdf !== KDF || envelope.iterations !== ITERATIONS ||
    typeof envelope.salt !== "string" || typeof envelope.nonce !== "string" ||
    typeof envelope.ciphertext !== "string"
  ) throw new Error("Formato o parametri crittografici del backup non supportati.");

  let salt: Uint8Array; let nonce: Uint8Array; let ciphertext: Uint8Array;
  try {
    salt = toByteArray(envelope.salt);
    nonce = toByteArray(envelope.nonce);
    ciphertext = toByteArray(envelope.ciphertext);
  } catch { throw new Error("Dati binari del backup non validi."); }
  if (salt.length !== SALT_BYTES || nonce.length !== NONCE_BYTES || ciphertext.length < 16 || ciphertext.length > MAX_BACKUP_BYTES + 16) {
    throw new Error("Dimensioni dei dati crittografici del backup non valide.");
  }

  const key = await deriveKey(passphrase, salt);
  let plaintext: Uint8Array | null = null;
  try {
    try { plaintext = gcm(key, nonce, AAD).decrypt(ciphertext); }
    catch { throw new Error("Impossibile autenticare il backup: passphrase errata o file alterato."); }

    let payload: unknown;
    try { payload = JSON.parse(bytesToUtf8(plaintext)); }
    catch { throw new Error("Contenuto del backup non leggibile."); }
    if (!payload || typeof payload !== "object" || (payload as Record<string, unknown>).format !== FORMAT || (payload as Record<string, unknown>).version !== FORMAT_VERSION) {
      throw new Error("Contenuto o versione del backup non validi.");
    }
    return validateEntries((payload as Record<string, unknown>).entries);
  } finally {
    key.fill(0);
    plaintext?.fill(0);
  }
}

export const diaryBackupPolicy = {
  format: FORMAT,
  version: FORMAT_VERSION,
  kdf: KDF,
  iterations: ITERATIONS,
  minimumPassphraseLength: 12,
  maximumPlaintextBytes: MAX_BACKUP_BYTES,
} as const;
