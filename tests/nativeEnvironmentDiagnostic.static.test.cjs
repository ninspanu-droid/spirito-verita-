const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');

test('la diagnosi copre prerequisiti Android, iOS ed EAS', () => {
  const source = fs.readFileSync(path.join(root, 'scripts/diagnose-native-environment.cjs'), 'utf8');
  for (const token of ['ANDROID_HOME', 'ANDROID_SDK_ROOT', 'adb', 'xcodebuild', 'eas', 'whoami', 'node_modules', 'package-lock.json']) {
    assert.ok(source.includes(token), `manca controllo ${token}`);
  }
});

test('la documentazione distingue diagnosi ambiente da build nativa', () => {
  const doc = fs.readFileSync(path.join(root, 'docs/release/V6-6-AUDIT-AMBIENTE-NATIVO.md'), 'utf8');
  assert.match(doc, /non equivale a compilazione riuscita/i);
  assert.match(doc, /nessun test SQLCipher su dispositivo/i);
});
