const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
const script = fs.readFileSync(path.join(root, 'scripts', 'check-crypto-runtime.cjs'), 'utf8');
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const app = JSON.parse(fs.readFileSync(path.join(root, 'app.json'), 'utf8'));

test('preflight controlla gli export Noble richiesti dal backup', () => {
  for (const name of ['gcm', 'pbkdf2Async', 'sha256', 'utf8ToBytes', 'bytesToUtf8']) assert.ok(script.includes(name));
});
test('preflight controlla base64-js ed Expo Crypto', () => {
  assert.ok(script.includes('fromByteArray'));
  assert.ok(script.includes('toByteArray'));
  assert.ok(script.includes('getRandomBytesAsync'));
});
test('preflight non confonde le dipendenze dichiarate con quelle installate', () => {
  assert.ok(script.includes('projectRequire.resolve'));
  assert.ok(script.includes('package-lock.json'));
});
test('preflight verifica anche la configurazione SQLCipher nativa', () => {
  assert.ok(script.includes('useSQLCipher === true'));
  assert.ok(app.expo.plugins.some((p) => Array.isArray(p) && p[0] === 'expo-sqlite' && p[1]?.useSQLCipher === true));
});
test('versione app e pacchetto allineate alla V9.8', () => {
  assert.equal(pkg.version, '1.0.42');
  assert.equal(app.expo.version, '1.0.42');
  assert.equal(pkg.scripts['check:crypto-runtime'], 'node scripts/check-crypto-runtime.cjs');
});
