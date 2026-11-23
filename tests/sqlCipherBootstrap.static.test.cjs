const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

const appConfig = JSON.parse(read('app.json'));
const layout = read('app/_layout.tsx');
const bootstrap = read('database/secureDatabase.ts');
const keyResolver = read('database/sqlCipherKey.ts');

test('Expo SQLite abilita SQLCipher tramite config plugin', () => {
  const plugin = appConfig.expo.plugins.find((item) => Array.isArray(item) && item[0] === 'expo-sqlite');
  assert.ok(plugin, 'config plugin expo-sqlite assente');
  assert.equal(plugin[1]?.useSQLCipher, true);
});

test('SQLiteProvider usa il database cifrato e il bootstrap dedicato', () => {
  assert.match(layout, /databaseName=\{secureDatabaseNames\.encrypted\}/);
  assert.match(layout, /onInit=\{initializeSecureDatabase\}/);
});

test('il bootstrap controlla SQLCipher prima di applicare la chiave', () => {
  const cipherCheck = bootstrap.indexOf("PRAGMA cipher_version");
  const keyApplication = bootstrap.indexOf('PRAGMA key');
  const schemaRead = bootstrap.indexOf('SELECT name FROM sqlite_master LIMIT 1');
  assert.ok(cipherCheck >= 0 && keyApplication > cipherCheck && schemaRead > keyApplication);
});

test('la migrazione non elimina il database legacy', () => {
  assert.match(bootstrap, /LEGACY_DATABASE_NAME\s*=\s*'spirito-verita\.db'/);
  assert.doesNotMatch(bootstrap, /deleteDatabaseAsync\s*\(\s*LEGACY_DATABASE_NAME/);
  assert.doesNotMatch(bootstrap, /removeItemAsync\s*\(\s*DATABASE_KEY_NAME/);
});

test('la chiave SecureStore usa solo caratteri Android ammessi', () => {
  const match = bootstrap.match(/DATABASE_KEY_NAME\s*=\s*'([^']+)'/);
  assert.ok(match, 'nome chiave SecureStore assente');
  assert.match(match[1], /^[A-Za-z0-9._-]+$/);
  assert.doesNotMatch(match[1], /:/);
});

test('la chiave ha 32 byte casuali e viene verificata in SecureStore', () => {
  assert.match(bootstrap, /getOrCreateSqlCipherKey\(/);
  assert.match(bootstrap, /getRandomBytesAsync\(32\)/);
  assert.match(bootstrap, /writeStoredKey: \(key\) => SecureStore\.setItemAsync\(DATABASE_KEY_NAME, key\)/);
  assert.match(keyResolver, /confirmed !== generated/);
  assert.match(keyResolver, /isDatabaseEmptyBeforeKey\(\)/);
});

test('chiude la connessione nativa se il bootstrap asincrono fallisce', () => {
  assert.match(bootstrap, /catch \(error\)[\s\S]*?await db\.closeAsync\(\)[\s\S]*?throw error/);
});
