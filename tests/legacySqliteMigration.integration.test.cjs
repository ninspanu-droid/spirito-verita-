const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

const sourcePath = path.join(__dirname, '..', 'src', 'diary', 'legacySqliteMigration.ts');
const source = fs.readFileSync(sourcePath, 'utf8');
const js = ts.transpileModule(source, {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS },
}).outputText;
const exportsObject = {};
const sandbox = {
  exports: exportsObject,
  require: (name) => {
    if (name === './diaryRepository') return { DiaryRepository: class DiaryRepository {} };
    throw new Error(`Dipendenza inattesa nel test: ${name}`);
  },
  Date, Number, Error, Map, Promise,
};
vm.runInNewContext(js, sandbox, { filename: sourcePath });
const migrate = exportsObject.migrateLegacySqliteJournal;

class FakeDb {
  constructor(rows) { this.rows = rows; }
  async getFirstAsync() { return this.rows === null ? null : { name: 'journal_entries' }; }
  async getAllAsync() { return this.rows ?? []; }
}
class FakeRepository {
  constructor({ failAt = 0 } = {}) { this.entries = new Map(); this.failAt = failAt; this.calls = 0; }
  async getAll() { return [...this.entries.values()].map((x) => ({ ...x })); }
  async save(entry) {
    this.calls += 1;
    if (this.failAt && this.calls === this.failAt) throw new Error('Interruzione simulata');
    if (this.entries.has(entry.id)) throw new Error('ID duplicato');
    this.entries.set(entry.id, { ...entry });
  }
}

const rows = [
  { id: 1, body: 'Preghiera del mattino', created_at: '2025-03-08 08:00:00' },
  { id: 2, body: 'Ringraziamento', created_at: '2025-03-08T10:30:00+01:00' },
];

test('migra, verifica e conserva l archivio sorgente', async () => {
  const db = new FakeDb(rows);
  const repo = new FakeRepository();
  const result = await migrate(db, repo);
  assert.equal(result.inserted, 2);
  assert.equal(result.verified, 2);
  assert.equal(result.legacyPlaintextRetained, true);
  assert.equal((await repo.getAll()).length, 2);
  assert.equal(rows[0].body, 'Preghiera del mattino');
});

test('una seconda esecuzione non duplica le annotazioni', async () => {
  const db = new FakeDb(rows);
  const repo = new FakeRepository();
  await migrate(db, repo);
  const second = await migrate(db, repo);
  assert.equal(second.inserted, 0);
  assert.equal(second.alreadyPresent, 2);
  assert.equal((await repo.getAll()).length, 2);
});

test('riprende dopo un interruzione senza duplicare le righe già copiate', async () => {
  const db = new FakeDb(rows);
  const repo = new FakeRepository({ failAt: 2 });
  await assert.rejects(() => migrate(db, repo), /Interruzione simulata/);
  assert.equal((await repo.getAll()).length, 1);
  repo.failAt = 0;
  const resumed = await migrate(db, repo);
  assert.equal(resumed.inserted, 1);
  assert.equal(resumed.alreadyPresent, 1);
  assert.equal(resumed.verified, 2);
});

test('rifiuta conflitti senza modificare la copia preesistente', async () => {
  const db = new FakeDb(rows);
  const repo = new FakeRepository();
  await repo.save({ id: 'legacy-sqlite-journal-1', type: 'reflection', title: 'Modificata', body: 'Testo diverso', createdAt: '2025-03-08T08:00:00.000Z', updatedAt: '2025-03-08T08:00:00.000Z' });
  await assert.rejects(() => migrate(db, repo), /Conflitto/);
  const saved = (await repo.getAll())[0];
  assert.equal(saved.title, 'Modificata');
  assert.equal(rows[0].body, 'Preghiera del mattino');
});

test('non importa alcuna riga se una data sorgente non è valida', async () => {
  const db = new FakeDb([{ id: 9, body: 'Testo', created_at: '2025-02-30 12:00:00' }]);
  const repo = new FakeRepository();
  await assert.rejects(() => migrate(db, repo), /data non valida/);
  assert.equal((await repo.getAll()).length, 0);
});

test('se la tabella non esiste restituisce esito vuoto', async () => {
  const result = await migrate(new FakeDb(null), new FakeRepository());
  assert.equal(result.tableFound, false);
  assert.equal(result.sourceEntries, 0);
});
