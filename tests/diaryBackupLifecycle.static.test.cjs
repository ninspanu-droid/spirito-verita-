const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
const backup = fs.readFileSync(path.join(root, 'src/diary/diaryBackup.ts'), 'utf8');
const screen = fs.readFileSync(path.join(root, 'src/diary/DiaryScreen.tsx'), 'utf8');
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const app = JSON.parse(fs.readFileSync(path.join(root, 'app.json'), 'utf8'));

test('la chiave derivata e il buffer in chiaro vengono azzerati in finally dopo la creazione', () => {
  assert.match(backup, /key\.fill\(0\)/);
  assert.match(backup, /plaintext\.fill\(0\)/);
  assert.match(backup, /finally\s*\{[\s\S]*?key\.fill\(0\);[\s\S]*?plaintext\.fill\(0\)/);
});

test('la chiave derivata e il buffer decifrato vengono azzerati anche se autenticazione o parsing falliscono', () => {
  assert.match(backup, /finally\s*\{\s*key\.fill\(0\);\s*plaintext\?\.fill\(0\);/);
});

test('la UI cancella sempre le passphrase dopo i tentativi di esportazione/importazione', () => {
  assert.match(screen, /finally\s*\{\s*setExportPassphrase\(""\);\s*setExportPassphraseConfirm\(""\);/);
  assert.match(screen, /finally\s*\{\s*setImportPassphrase\(""\);\s*setBackupBusy\(false\);/);
});

test('il ripristino mantiene lo stato occupato durante la scrittura differita confermata', () => {
  assert.match(screen, /onPress:\s*\(\)\s*=>\s*\{\s*restoreStarted\s*=\s*true;\s*setRestoreConfirmationPending\(false\);\s*void\s*\(async\s*\(\)\s*=>\s*\{\s*setBackupBusy\(true\);/);
  assert.match(screen, /repository\.restoreFromBackup\(restoredEntries\)/);
});

test('versione app e pacchetto sono allineate alla V9.2', () => {
  assert.equal(pkg.version, '1.0.42');
  assert.equal(app.expo.version, pkg.version);
});
