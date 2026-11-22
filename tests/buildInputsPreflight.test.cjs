const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const root = path.resolve(__dirname, '..');
const script = path.join(root, 'scripts/check-build-inputs.cjs');

test('build inputs rifiuta EXPO_TOKEN assente senza stampare credenziali', () => {
  const result = spawnSync(process.execPath, [script], { cwd: root, env: { ...process.env, EXPO_TOKEN: '' }, encoding: 'utf8' });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /EXPO_TOKEN assente/);
  assert.doesNotMatch(result.stdout + result.stderr, /[A-Za-z0-9_-]{30,}/);
});

test('build inputs non espone il valore del token quando i prerequisiti successivi falliscono', () => {
  const secret = 'TEST_TOKEN_NON_REALE_1234567890_SECRET';
  const result = spawnSync(process.execPath, [script], { cwd: root, env: { ...process.env, EXPO_TOKEN: secret }, encoding: 'utf8' });
  assert.notEqual(result.status, 0);
  assert.doesNotMatch(result.stdout + result.stderr, new RegExp(secret));
  assert.match(result.stderr, /controllo lockfile non superato|package-lock\.json assente|controllo progetto Expo non superato|controllo progetto Expo non superato|controllo progetto Expo non superato|controllo progetto Expo non superato|controllo progetto Expo non superato|controllo progetto Expo non superato|controllo progetto Expo non superato|controllo progetto Expo non superato|controllo progetto Expo non superato|controllo progetto Expo non superato|controllo progetto Expo non superato|controllo progetto Expo non superato/);
});

test('package espone il preflight unico per le build', () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
  assert.equal(pkg.scripts['check:build-inputs'], 'node scripts/check-build-inputs.cjs');
});

test('workflow Android e iOS usano il preflight unico e non stampano EXPO_TOKEN', () => {
  for (const file of ['android-preview-build.yml', 'ios-preview-build.yml']) {
    const text = fs.readFileSync(path.join(root, '.github/workflows', file), 'utf8');
    assert.match(text, /npm run check:build-inputs/);
    assert.match(text, /EXPO_TOKEN: \$\{\{ secrets\.EXPO_TOKEN \}\}/);
    assert.doesNotMatch(text, /echo\s+.*EXPO_TOKEN/);
  }
});
