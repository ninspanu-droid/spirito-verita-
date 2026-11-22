/**
 * Resolves a SQLCipher key without silently replacing a lost key.
 * A new key may only be created when the target database is demonstrably empty
 * before a key is applied. Existing encrypted or non-empty databases fail closed.
 */
export type SqlCipherKeyStorage = {
  readStoredKey: () => Promise<string | null>;
  writeStoredKey: (key: string) => Promise<void>;
  generateKey: () => Promise<string>;
  isDatabaseEmptyBeforeKey: () => Promise<boolean>;
};

function assertKeyFormat(key: string): void {
  if (!/^[0-9a-f]{64}$/i.test(key)) {
    throw new Error('La chiave SQLCipher salvata non ha un formato valido. Database non aperto.');
  }
}

export async function getOrCreateSqlCipherKey(storage: SqlCipherKeyStorage): Promise<string> {
  const existing = await storage.readStoredKey();
  if (existing !== null) {
    assertKeyFormat(existing);
    return existing;
  }

  let isEmpty: boolean;
  try {
    isEmpty = await storage.isDatabaseEmptyBeforeKey();
  } catch {
    throw new Error(
      'Chiave SQLCipher assente e database non leggibile senza chiave. Per sicurezza non viene generata una nuova chiave: avviare la procedura di recupero.'
    );
  }
  if (!isEmpty) {
    throw new Error(
      'Chiave SQLCipher assente ma il database contiene già tabelle. Nessuna nuova chiave è stata generata.'
    );
  }

  const generated = await storage.generateKey();
  assertKeyFormat(generated);
  await storage.writeStoredKey(generated);
  const confirmed = await storage.readStoredKey();
  if (confirmed !== generated) {
    throw new Error('Impossibile verificare il salvataggio della chiave SQLCipher.');
  }
  return generated;
}
