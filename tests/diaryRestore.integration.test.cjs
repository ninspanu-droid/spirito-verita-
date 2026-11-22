const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

const root = path.join(__dirname, '..');
const sourcePath = path.join(root, 'src', 'diary', 'diaryRepository.ts');
const source = fs.readFileSync(sourcePath, 'utf8');
const js = ts.transpileModule(source, {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS },
}).outputText;
const exportsObject = {};
let encryptionCounter = 0;
const sandbox = {
  exports: exportsObject,
  require: (name) => {
    if (name === 'expo-crypto') return { randomUUID: () => `generated-${++encryptionCounter}` };
    if (name === './crypto') return {
      encryptDiaryText: async (text) => ({ nonce: 'nonce', ciphertext: `cipher:${text}` }),
      decryptDiaryText: async () => '{}',
    };
    throw new Error(`Dipendenza inattesa nel test: ${name}`);
  },
  Date, Number, Error, Map, Set, Array, JSON, Promise, String,
};
vm.runInNewContext(js, sandbox, { filename: sourcePath });
const DiaryRepository = exportsObject.DiaryRepository;

class FakeDb {
  constructor() { this.rows = new Map(); this.injectOnTransaction = null; this.failInsertAt = 0; this.insertCalls = 0; }
  async execAsync() {}
  async getFirstAsync(sql) {
    if (!sql.includes('COUNT(*)')) throw new Error(`Query inattesa: ${sql}`);
    return { total: this.rows.size };
  }
  async runAsync(sql, ...args) {
    if (!sql.startsWith('INSERT INTO diary_entries')) throw new Error(`Query inattesa: ${sql}`);
    this.insertCalls += 1;
    if (this.failInsertAt && this.insertCalls === this.failInsertAt) throw new Error('Interruzione simulata durante INSERT');
    const [id, type, nonce, ciphertext, createdAt, updatedAt] = args;
    if (this.rows.has(id)) throw new Error('ID duplicato');
    this.rows.set(id, { id, type, nonce, ciphertext, encryption_version: 1, created_at: createdAt, updated_at: updatedAt });
    return { changes: 1 };
  }
  async withTransactionAsync(callback) {
    if (this.injectOnTransaction) this.injectOnTransaction(this.rows);
    const snapshot = new Map(this.rows);
    try { await callback(); }
    catch (error) { this.rows = snapshot; throw error; }
  }
}

const valid = (id = 'entry-1') => ({
  id, type: 'prayer', title: 'Preghiera', body: 'Testo riservato',
  createdAt: '2026-11-18T10:00:00.000Z', updatedAt: '2026-11-18T10:05:00.000Z',
});

test('ripristina un backup valido cifrando ogni annotazione prima di salvarla', async () => {
  const db = new FakeDb(); const repo = new DiaryRepository(db);
  const count = await repo.restoreFromBackup([valid('a'), valid('b')]);
  assert.equal(count, 2);
  assert.equal(db.rows.size, 2);
  assert.match(db.rows.get('a').ciphertext, /^cipher:/);
  assert.equal(db.rows.get('a').encryption_version, 1);
});

test('rifiuta un diario già popolato senza alterare le righe esistenti', async () => {
  const db = new FakeDb(); const repo = new DiaryRepository(db);
  db.rows.set('existing', { id: 'existing', ciphertext: 'untouched' });
  await assert.rejects(() => repo.restoreFromBackup([valid()]), /archivio vuoto|Diario contiene già/i);
  assert.equal(db.rows.size, 1);
  assert.equal(db.rows.get('existing').ciphertext, 'untouched');
});

test('rifiuta ID duplicati prima di iniziare la transazione', async () => {
  const db = new FakeDb(); const repo = new DiaryRepository(db);
  await assert.rejects(() => repo.restoreFromBackup([valid('same'), valid('same')]), /duplicate|duplicat/i);
  assert.equal(db.rows.size, 0);
  assert.equal(db.insertCalls, 0);
});

test('rifiuta contenuti oltre i limiti dell interfaccia prima di scrivere', async () => {
  const db = new FakeDb(); const repo = new DiaryRepository(db);
  await assert.rejects(() => repo.restoreFromBackup([{ ...valid(), title: 'x'.repeat(121) }]), /non valide|incomplete/i);
  await assert.rejects(() => repo.restoreFromBackup([{ ...valid(), body: 'x'.repeat(20_001) }]), /non valide|incomplete/i);
  assert.equal(db.rows.size, 0);
});

test('rifiuta date non valide prima di scrivere', async () => {
  const db = new FakeDb(); const repo = new DiaryRepository(db);
  await assert.rejects(() => repo.restoreFromBackup([{ ...valid(), createdAt: 'not-a-date' }]), /non valide|incomplete/i);
  assert.equal(db.rows.size, 0);
});

test('una scrittura interrotta provoca rollback di tutte le righe del ripristino', async () => {
  const db = new FakeDb(); const repo = new DiaryRepository(db);
  db.failInsertAt = 2;
  await assert.rejects(() => repo.restoreFromBackup([valid('a'), valid('b'), valid('c')]), /Interruzione simulata/);
  assert.equal(db.rows.size, 0);
});

test('ricontrolla dentro la transazione se un altra operazione ha popolato il diario', async () => {
  const db = new FakeDb(); const repo = new DiaryRepository(db);
  db.injectOnTransaction = (rows) => rows.set('concurrent', { id: 'concurrent', ciphertext: 'existing' });
  await assert.rejects(() => repo.restoreFromBackup([valid()]), /Diario non è vuoto|non vuoto/i);
  assert.equal(db.rows.size, 1);
  assert.equal(db.rows.has('entry-1'), false);
});

test('un backup vuoto è ripristinato come zero annotazioni senza creare righe', async () => {
  const db = new FakeDb(); const repo = new DiaryRepository(db);
  assert.equal(await repo.restoreFromBackup([]), 0);
  assert.equal(db.rows.size, 0);
});
