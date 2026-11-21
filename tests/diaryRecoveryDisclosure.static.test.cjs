const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
const screen = fs.readFileSync(path.join(root, 'src/diary/DiaryScreen.tsx'), 'utf8');
const crypto = fs.readFileSync(path.join(root, 'src/diary/crypto.ts'), 'utf8');
const docs = fs.readFileSync(path.join(root, 'docs/release/V8-8-BACKUP-UI.md'), 'utf8');

test('la schermata Diario avverte che la passphrase è indispensabile e il restore non sovrascrive', () => {
  assert.match(screen, /se la perdi, il file non può essere recuperato/);
  assert.match(screen, /solo in un Diario vuoto/);
});

test('la lettura del Diario non genera una nuova chiave in assenza di quella esistente', () => {
  assert.match(crypto, /Chiave del diario assente/);
  assert.match(crypto, /Non è stata generata una nuova chiave/);
  assert.match(crypto, /async function readDiaryKey/);
});

test('la documentazione distingue backup portabile, chiave locale e test nativi ancora richiesti', () => {
  assert.match(docs, /non include impostazioni, progressi, database completo o chiave SQLCipher/);
  assert.match(docs, /Se viene persa, il backup non è recuperabile/);
  assert.match(docs, /non sostituiscono typecheck, test runtime della crittografia/i);
});
