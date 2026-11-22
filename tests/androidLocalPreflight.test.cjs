const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');

test('preflight Android aggrega lockfile, crypto, tool nativi e identificatori', () => {
  const script = fs.readFileSync(path.join(root, 'scripts/check-android-local.cjs'), 'utf8');
  for (const token of ['check:reproducible-install', 'check:crypto-runtime', 'check:native-build', 'check:app-identifiers']) {
    assert.ok(script.includes(token), `controllo mancante: ${token}`);
  }
});

test('preflight Android è read-only e blocca la build se un controllo fallisce', () => {
  const script = fs.readFileSync(path.join(root, 'scripts/check-android-local.cjs'), 'utf8');
  assert.match(script, /sola lettura/);
  assert.match(script, /if \(failed\)/);
  assert.match(script, /process\.exitCode = 1/);
  assert.doesNotMatch(script, /npm install|npm ci|expo prebuild|eas build/);
});

test('comando preflight e versioni package/Expo sono sincronizzati', () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
  const app = JSON.parse(fs.readFileSync(path.join(root, 'app.json'), 'utf8'));
  assert.equal(pkg.scripts['check:android-local'], 'node scripts/check-android-local.cjs');
  assert.equal(pkg.version, '1.0.42');
  assert.equal(app.expo.version, pkg.version);
});
