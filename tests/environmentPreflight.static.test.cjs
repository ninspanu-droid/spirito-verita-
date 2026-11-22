const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const script = fs.readFileSync(path.join(root, 'scripts/diagnose-native-environment.cjs'), 'utf8');

test('package espone un comando unico per diagnosticare l ambiente nativo', () => {
  assert.equal(pkg.scripts['check:environment'], 'node scripts/diagnose-native-environment.cjs');
});
test('diagnostica verifica dipendenze, lockfile, Android, iOS ed EAS', () => {
  for (const token of ['node_modules', 'package-lock.json', 'ANDROID_HOME', 'adb', 'xcodebuild', "['whoami']"]) {
    assert.ok(script.includes(token), `manca controllo: ${token}`);
  }
});
test('diagnostica chiarisce che non certifica build né SQLCipher nativo', () => {
  assert.match(script, /non eseguono una build e non certificano SQLCipher su dispositivo/);
});
