const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

const sourcePath = path.join(__dirname, '..', 'database', 'sqlCipherMigrationGate.ts');
const source = fs.readFileSync(sourcePath, 'utf8');
const js = ts.transpileModule(source, {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS },
}).outputText;
const exportsObject = {};
vm.runInNewContext(js, { exports: exportsObject, Error, Number }, { filename: sourcePath });
const { evaluateSqlCipherMigration, assertCanRemoveLegacyPlaintext } = exportsObject;

const safe = {
  encryptedCopyCreated: true,
  encryptedCopyReopenedWithKey: true,
  rowCountsMatch: true,
  restoreTestPassed: true,
  userApprovedRemoval: true,
  legacyPlaintextRows: 3,
};

test('blocca la rimozione se non esiste una copia cifrata', () => {
  const result = evaluateSqlCipherMigration({ ...safe, encryptedCopyCreated: false });
  assert.equal(result.canRemoveLegacyPlaintext, false);
  assert.match(result.blockers.join(' '), /copia cifrata non è stata creata/);
});

test('blocca la rimozione se la copia cifrata non si riapre con la chiave', () => {
  const result = evaluateSqlCipherMigration({ ...safe, encryptedCopyReopenedWithKey: false });
  assert.equal(result.canRemoveLegacyPlaintext, false);
});

test('blocca la rimozione se i conteggi non coincidono', () => {
  assert.equal(evaluateSqlCipherMigration({ ...safe, rowCountsMatch: false }).canRemoveLegacyPlaintext, false);
});

test('blocca la rimozione senza test di ripristino', () => {
  assert.equal(evaluateSqlCipherMigration({ ...safe, restoreTestPassed: false }).canRemoveLegacyPlaintext, false);
});

test('blocca la rimozione senza approvazione esplicita', () => {
  assert.equal(evaluateSqlCipherMigration({ ...safe, userApprovedRemoval: false }).canRemoveLegacyPlaintext, false);
});

test('consente il passaggio solo con tutte le prove e approvazione', () => {
  assert.equal(evaluateSqlCipherMigration(safe).canRemoveLegacyPlaintext, true);
  assert.doesNotThrow(() => assertCanRemoveLegacyPlaintext(safe));
});

test('rifiuta conteggi negativi o non interi', () => {
  assert.equal(evaluateSqlCipherMigration({ ...safe, legacyPlaintextRows: -1 }).canRemoveLegacyPlaintext, false);
  assert.equal(evaluateSqlCipherMigration({ ...safe, legacyPlaintextRows: 1.5 }).canRemoveLegacyPlaintext, false);
});

test('non richiede la rimozione quando non ci sono righe storiche', () => {
  const empty = { ...safe, legacyPlaintextRows: 0, encryptedCopyCreated: false, encryptedCopyReopenedWithKey: false, rowCountsMatch: false, restoreTestPassed: false, userApprovedRemoval: false };
  assert.equal(evaluateSqlCipherMigration(empty).canRemoveLegacyPlaintext, true);
});
