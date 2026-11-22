const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const pkg = require('../package.json');
const guide = fs.readFileSync('docs/V7-5-PRIMA-BUILD-ANDROID.md', 'utf8');

test('package espone i comandi EAS preview Android e iOS', () => {
  assert.equal(pkg.scripts['build:android:preview'], 'eas build --platform android --profile preview');
  assert.equal(pkg.scripts['build:ios:preview'], 'eas build --platform ios --profile preview');
});

test('package espone un controllo pre-build composto da test e release gate', () => {
  assert.equal(pkg.scripts['check:first-build'], 'npm run test:all && npm run check:release-readiness');
});

test('guida richiede un projectId Expo reale e non inventato', () => {
  assert.match(guide, /npx eas-cli@latest init/);
  assert.match(guide, /projectId/);
  assert.match(guide, /Non copiare ID di esempio o di altri progetti/);
});

test('guida distingue build preparata da build e collaudo realmente eseguiti', () => {
  assert.match(guide, /non dimostra che una build sia stata eseguita/);
  assert.match(guide, /test su dispositivo/);
  assert.match(guide, /Non cancellare il database legacy/);
});
