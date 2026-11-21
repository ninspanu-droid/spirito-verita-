const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const handoff = fs.readFileSync(path.join(root, 'scripts/check-github-eas-handoff.cjs'), 'utf8');
const android = fs.readFileSync(path.join(root, '.github/workflows/android-preview-build.yml'), 'utf8');

test('il controllo handoff usa una regex funzionante per token hardcoded', () => {
  assert.match(handoff, /EXPO_TOKEN\\s\*\[:=\]\\s\*/);
  const pattern = /EXPO_TOKEN\s*[:=]\s*["'][^"'$][^"']*["']/;
  assert.equal(pattern.test('EXPO_TOKEN="token-finto"'), true);
  assert.equal(pattern.test('EXPO_TOKEN: ${{ secrets.EXPO_TOKEN }}'), false);
});

test('Expo Doctor propaga il codice di errore attraverso tee', () => {
  assert.match(android, /name: Expo Doctor\n        run: \|\n          set -o pipefail\n          npx expo-doctor 2>&1 \| tee expo-doctor\.log/);
});

test('Expo prebuild propaga il codice di errore attraverso tee', () => {
  assert.match(android, /name: Generate Android native project without compiling\n        run: \|\n          set -o pipefail\n          npx expo prebuild --platform android --no-install --clean 2>&1 \| tee prebuild-android\.log/);
});

test('il controllo handoff esamina anche il workflow iOS per token letterali', () => {
  assert.match(handoff, /android-preview-build\.yml','\.github\/workflows\/ios-preview-build\.yml/);
});
