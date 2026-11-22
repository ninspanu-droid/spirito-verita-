const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
const screen = fs.readFileSync(path.join(root, 'src/diary/DiaryScreen.tsx'), 'utf8');
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const app = JSON.parse(fs.readFileSync(path.join(root, 'app.json'), 'utf8'));

test('la schermata espone export cifrato con passphrase e condivisione file', () => {
  assert.match(screen, /createEncryptedDiaryBackup/);
  assert.match(screen, /Sharing\.shareAsync/);
  assert.match(screen, /Esporta backup cifrato/);
  assert.match(screen, /exportPassphraseConfirm/);
  assert.match(screen, /passphrase non coincidono/);
});

test('la schermata importa file JSON e autentica il backup prima del ripristino', () => {
  assert.match(screen, /DocumentPicker\.getDocumentAsync/);
  assert.match(screen, /openEncryptedDiaryBackup/);
  assert.match(screen, /Conferma ripristino/);
  assert.match(screen, /restoreFromBackup/);
});

test('il ripristino UI è disabilitato con annotazioni presenti', () => {
  assert.match(screen, /entries\.length > 0/);
  assert.match(screen, /solo in un Diario vuoto/);
});

test('le dipendenze Expo per selezione, file e condivisione sono dichiarate', () => {
  assert.ok(pkg.dependencies['expo-document-picker']);
  assert.ok(pkg.dependencies['expo-file-system']);
  assert.ok(pkg.dependencies['expo-sharing']);
  assert.equal(pkg.version, app.expo.version);
  assert.equal(pkg.version, '1.0.42');
});


test('la UI controlla dimensione e tipo del file prima di leggerlo', () => {
  assert.match(screen, /FileSystem\.getInfoAsync\(selectedFile\.uri\)/);
  assert.match(screen, /maximumBackupFileBytes = 20 \* 1024 \* 1024/);
  assert.match(screen, /fileInfo\.isDirectory/);
});

test('la UI pulisce la passphrase dopo autenticazione o annullamento del picker', () => {
  assert.match(screen, /if \(picked\.canceled \|\| !picked\.assets\?\.\[0\]\) \{\s*setImportPassphrase\(""\)/);
  assert.match(screen, /const restoredEntries = await openEncryptedDiaryBackup\(serialized, importPassphrase\);\s*setImportPassphrase\(""\)/);
});


test('la conferma del ripristino mantiene bloccati export e import fino alla scelta', () => {
  assert.match(screen, /restoreConfirmationPending/);
  assert.match(screen, /onDismiss: \(\) => \{ if \(!restoreStarted\) setRestoreConfirmationPending\(false\); \}/);
  assert.match(screen, /disabled=\{!keyAvailable \|\| backupBusy \|\| restoreConfirmationPending/);
});
