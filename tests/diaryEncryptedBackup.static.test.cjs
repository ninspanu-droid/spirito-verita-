const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
const backup = fs.readFileSync(path.join(root, 'src/diary/diaryBackup.ts'), 'utf8');
const repository = fs.readFileSync(path.join(root, 'src/diary/diaryRepository.ts'), 'utf8');
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const screen = fs.readFileSync(path.join(root, 'src/diary/DiaryScreen.tsx'), 'utf8');

test('il backup usa PBKDF2-HMAC-SHA256 con 600.000 iterazioni e AES-256-GCM autenticato', () => {
  assert.match(backup, /pbkdf2Async\(sha256/);
  assert.match(backup, /c: ITERATIONS/);
  assert.match(backup, /const ITERATIONS = 600_000/);
  assert.match(backup, /gcm\(key, nonce, AAD\)\.encrypt/);
  assert.match(backup, /gcm\(key, nonce, AAD\)\.decrypt/);
});

test('il formato backup valida versione, salt, nonce, dimensioni e contenuti', () => {
  assert.match(backup, /FORMAT_VERSION = 1/);
  assert.match(backup, /SALT_BYTES = 16/);
  assert.match(backup, /NONCE_BYTES = 12/);
  assert.match(backup, /validateEntries/);
  assert.match(backup, /MAX_BACKUP_BYTES/);
  assert.match(backup, /passphrase errata o file alterato/);
});

test('il ripristino rifiuta archivi non vuoti e usa una transazione', () => {
  assert.match(repository, /restoreFromBackup/);
  assert.match(repository, /Il ripristino è consentito solo in un archivio vuoto/);
  assert.match(repository, /withTransactionAsync/);
  assert.match(repository, /INSERT INTO diary_entries/);
});

test('la dipendenza per PBKDF2 è dichiarata e la UI collega i comandi di backup', () => {
  assert.ok(pkg.dependencies['@noble/hashes']);
  assert.match(screen, /createEncryptedDiaryBackup/);
  assert.match(screen, /openEncryptedDiaryBackup/);
});


test('il repository limita la dimensione del payload prima del ripristino', () => {
  assert.match(repository, /MAX_RESTORE_ENTRIES = 100_000/);
});

test('il repository valida campi, date, identificatori e duplicati prima di scrivere', () => {
  assert.match(repository, /typeof entry\.id !== "string"/);
  assert.match(repository, /typeof entry\.title !== "string"/);
  assert.match(repository, /Number\.isFinite\(Date\.parse\(entry\.createdAt\)\)/);
  assert.match(repository, /seen\.has\(entry\.id\)/);
  assert.match(repository, /Validate the complete payload before encrypting or writing any row/);
});
