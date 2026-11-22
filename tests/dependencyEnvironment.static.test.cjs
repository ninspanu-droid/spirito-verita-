const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const app = JSON.parse(fs.readFileSync(path.join(root, 'app.json'), 'utf8'));
const script = fs.readFileSync(path.join(root, 'scripts/diagnose-dependency-environment.cjs'), 'utf8');

test('versione V9.8 sincronizzata tra package e Expo', () => {
  assert.equal(pkg.version, '1.0.42');
  assert.equal(app.expo.version, '1.0.42');
});

test('la diagnosi ambiente è dichiarata nel package', () => {
  assert.equal(pkg.scripts['diagnose:dependencies'], 'node scripts/diagnose-dependency-environment.cjs');
});

test('la diagnosi controlla lockfile, node_modules e librerie crittografiche reali', () => {
  for (const fragment of ['package-lock.json', 'node_modules', '@noble/ciphers/aes', '@noble/hashes/pbkdf2', 'base64-js', 'expo-crypto', 'expo-sqlite']) {
    assert.ok(script.includes(fragment), `manca controllo: ${fragment}`);
  }
});

test('la diagnosi è dichiarata read-only e non avvia installazioni o build', () => {
  assert.match(script, /di sola lettura/);
  assert.doesNotMatch(script, /npm\s+(install|ci)|expo\s+prebuild|eas\s+build/);
});

test('il preflight crittografico descrive correttamente il lockfile assente come blocco', () => {
  const cryptoPreflight = fs.readFileSync(path.join(root, 'scripts/check-crypto-runtime.cjs'), 'utf8');
  assert.match(cryptoPreflight, /assente: installazione non riproducibile/);
  assert.doesNotMatch(cryptoPreflight, /assente: installazione non riproducibile verificata/);
});
