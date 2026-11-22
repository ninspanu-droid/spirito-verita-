const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

const sourcePath = path.join(__dirname, '..', 'database', 'sqlCipherKey.ts');
const source = fs.readFileSync(sourcePath, 'utf8');
const js = ts.transpileModule(source, {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS },
}).outputText;
const exportsObject = {};
vm.runInNewContext(js, { exports: exportsObject, Error }, { filename: sourcePath });
const { getOrCreateSqlCipherKey } = exportsObject;
const validKey = 'a'.repeat(64);

function storage(overrides = {}) {
  let stored = overrides.initialKey ?? null;
  let writes = 0;
  return {
    api: {
      readStoredKey: async () => stored,
      writeStoredKey: async (key) => { writes++; stored = overrides.persistAs ?? key; },
      generateKey: async () => validKey,
      isDatabaseEmptyBeforeKey: async () => overrides.probe(),
    },
    get writes() { return writes; },
  };
}

test('genera una chiave solo per un database realmente vuoto', async () => {
  const s = storage({ probe: async () => true });
  assert.equal(await getOrCreateSqlCipherKey(s.api), validKey);
  assert.equal(s.writes, 1);
});

test('riutilizza la chiave esistente senza interrogare il database', async () => {
  const s = storage({ initialKey: validKey, probe: async () => { throw new Error('non deve essere chiamato'); } });
  assert.equal(await getOrCreateSqlCipherKey(s.api), validKey);
  assert.equal(s.writes, 0);
});

test('non genera una nuova chiave se il database cifrato non è leggibile senza chiave', async () => {
  const s = storage({ probe: async () => { throw new Error('file is not a database'); } });
  await assert.rejects(() => getOrCreateSqlCipherKey(s.api), /Chiave SQLCipher assente/);
  assert.equal(s.writes, 0);
});

test('non genera una chiave se trova tabelle in un database non vuoto', async () => {
  const s = storage({ probe: async () => false });
  await assert.rejects(() => getOrCreateSqlCipherKey(s.api), /contiene già tabelle/);
  assert.equal(s.writes, 0);
});

test('rifiuta una chiave memorizzata con formato errato', async () => {
  const s = storage({ initialKey: '1234', probe: async () => true });
  await assert.rejects(() => getOrCreateSqlCipherKey(s.api), /formato valido/);
  assert.equal(s.writes, 0);
});

test('rifiuta una chiave generata che non abbia 32 byte in esadecimale', async () => {
  const s = storage({ probe: async () => true });
  s.api.generateKey = async () => 'abcd';
  await assert.rejects(() => getOrCreateSqlCipherKey(s.api), /formato valido/);
  assert.equal(s.writes, 0);
});

test('verifica la persistenza della chiave prima di proseguire', async () => {
  const s = storage({ probe: async () => true, persistAs: 'b'.repeat(64) });
  await assert.rejects(() => getOrCreateSqlCipherKey(s.api), /verificare il salvataggio/);
});
