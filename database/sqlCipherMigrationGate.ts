/**
 * Safety gate for the future plaintext-SQLite -> SQLCipher migration.
 * This module does NOT encrypt a database. It prevents destructive removal of
 * the legacy source until every independent verification has been recorded.
 */
export type SqlCipherMigrationEvidence = {
  encryptedCopyCreated: boolean;
  encryptedCopyReopenedWithKey: boolean;
  rowCountsMatch: boolean;
  restoreTestPassed: boolean;
  userApprovedRemoval: boolean;
  legacyPlaintextRows: number;
};

export type SqlCipherMigrationDecision = {
  canRemoveLegacyPlaintext: boolean;
  blockers: string[];
};

export function evaluateSqlCipherMigration(
  evidence: SqlCipherMigrationEvidence
): SqlCipherMigrationDecision {
  const blockers: string[] = [];
  if (!Number.isSafeInteger(evidence.legacyPlaintextRows) || evidence.legacyPlaintextRows < 0) {
    blockers.push('Il conteggio delle righe storiche non è valido.');
  }
  if (evidence.legacyPlaintextRows > 0 && !evidence.encryptedCopyCreated) {
    blockers.push('La copia cifrata non è stata creata.');
  }
  if (evidence.legacyPlaintextRows > 0 && !evidence.encryptedCopyReopenedWithKey) {
    blockers.push('La copia cifrata non è stata riaperta con la chiave prevista.');
  }
  if (evidence.legacyPlaintextRows > 0 && !evidence.rowCountsMatch) {
    blockers.push('Il confronto dei record tra origine e destinazione non è superato.');
  }
  if (evidence.legacyPlaintextRows > 0 && !evidence.restoreTestPassed) {
    blockers.push('Il ripristino da backup non è stato verificato.');
  }
  if (evidence.legacyPlaintextRows > 0 && !evidence.userApprovedRemoval) {
    blockers.push('Manca l’approvazione esplicita alla rimozione della copia in chiaro.');
  }

  return { canRemoveLegacyPlaintext: blockers.length === 0, blockers };
}

export function assertCanRemoveLegacyPlaintext(
  evidence: SqlCipherMigrationEvidence
): void {
  const decision = evaluateSqlCipherMigration(evidence);
  if (!decision.canRemoveLegacyPlaintext) {
    throw new Error(`Rimozione della copia in chiaro bloccata: ${decision.blockers.join(' ')}`);
  }
}
