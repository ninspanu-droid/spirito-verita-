import * as SecureStore from "expo-secure-store";
import { getRandomBytesAsync } from "expo-crypto";
import { gcm } from "@noble/ciphers/aes";
import { fromByteArray, toByteArray } from "base64-js";
import { utf8ToBytes, bytesToUtf8 } from "@noble/ciphers/utils";

const KEY_NAME = "sv_diary_key_v1";
const KEY_LENGTH = 32;
const NONCE_LENGTH = 12;
let keyInitialization: Promise<void> | null = null;

function encodeBase64(bytes: Uint8Array): string {
  return fromByteArray(bytes);
}

function decodeBase64(value: string): Uint8Array {
  return toByteArray(value);
}

/**
 * Creates the diary key once. Call during an explicit first-time setup,
 * not as a fallback during decryption: silently replacing a missing key
 * would make existing diary entries permanently unreadable.
 */
export async function initializeDiaryKey(): Promise<void> {
  // Evita che due tocchi ravvicinati generino e salvino chiavi differenti.
  if (keyInitialization) return keyInitialization;

  keyInitialization = (async () => {
    const existing = await SecureStore.getItemAsync(KEY_NAME);
    if (existing) {
      const decoded = decodeBase64(existing);
      if (decoded.length !== KEY_LENGTH) {
        throw new Error("La chiave del diario esistente non è valida.");
      }
      return;
    }

    const key = await getRandomBytesAsync(KEY_LENGTH);
    await SecureStore.setItemAsync(KEY_NAME, encodeBase64(key), {
      keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    });

    // Verifica di rilettura: non segnala attiva una chiave non persistita.
    const persisted = await SecureStore.getItemAsync(KEY_NAME);
    if (!persisted || decodeBase64(persisted).length !== KEY_LENGTH) {
      throw new Error("Impossibile verificare il salvataggio della chiave protetta.");
    }
  })();

  try {
    await keyInitialization;
  } finally {
    keyInitialization = null;
  }
}

export async function hasDiaryKey(): Promise<boolean> {
  const stored = await SecureStore.getItemAsync(KEY_NAME);
  if (stored === null) return false;

  let decoded: Uint8Array;
  try {
    decoded = decodeBase64(stored);
  } catch {
    throw new Error("La chiave protetta del diario è danneggiata e non può essere letta.");
  }
  if (decoded.length !== KEY_LENGTH) {
    throw new Error("La chiave protetta del diario ha una lunghezza non valida.");
  }
  return true;
}

async function readDiaryKey(): Promise<Uint8Array> {
  const stored = await SecureStore.getItemAsync(KEY_NAME);
  if (!stored) {
    throw new Error(
      "Chiave del diario assente. Non è stata generata una nuova chiave per evitare la perdita di accesso ai dati esistenti."
    );
  }

  const key = decodeBase64(stored);
  if (key.length !== KEY_LENGTH) {
    throw new Error("Chiave del diario non valida.");
  }
  return key;
}

export async function encryptDiaryText(
  plaintext: string
): Promise<{ nonce: string; ciphertext: string }> {
  const key = await readDiaryKey();
  const nonce = await getRandomBytesAsync(NONCE_LENGTH);
  const ciphertext = gcm(key, nonce).encrypt(utf8ToBytes(plaintext));

  return {
    nonce: encodeBase64(nonce),
    ciphertext: encodeBase64(ciphertext),
  };
}

export async function decryptDiaryText(record: {
  nonce: string;
  ciphertext: string;
}): Promise<string> {
  const key = await readDiaryKey();
  const nonce = decodeBase64(record.nonce);
  const ciphertext = decodeBase64(record.ciphertext);
  if (nonce.length !== NONCE_LENGTH || ciphertext.length < 16) {
    throw new Error("Dati cifrati del diario non validi o incompleti.");
  }
  const plaintext = gcm(key, nonce).decrypt(ciphertext);

  return bytesToUtf8(plaintext);
}
