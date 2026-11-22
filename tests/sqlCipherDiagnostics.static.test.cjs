const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');

test('il profilo espone un controllo locale SQLCipher e integrità senza esporre la chiave', () => {
  const screen = fs.readFileSync(path.join(root, 'app/(tabs)/profilo.tsx'), 'utf8');
  assert.match(screen, /PRAGMA cipher_version/);
  assert.match(screen, /PRAGMA cipher_integrity_check/);
  assert.match(screen, /PRAGMA integrity_check/);
  assert.match(screen, /PRAGMA foreign_key_check/);
  assert.match(screen, /Verifica database protetto/);
  assert.doesNotMatch(screen, /DATABASE_KEY_NAME|keyHex|SecureStore\.getItemAsync/);
});
