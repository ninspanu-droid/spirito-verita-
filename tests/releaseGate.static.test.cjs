const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');

test('la guida V6.5 distingue i test locali dal collaudo nativo', () => {
  const doc = fs.readFileSync(path.join(root, 'docs/release/SQLCIPHER-V6-5-RELEASE-GATE.md'), 'utf8');
  assert.match(doc, /non dichiara SQLCipher verificato su dispositivo/i);
  assert.match(doc, /Expo Go/);
  assert.match(doc, /Android e iOS/);
  assert.match(doc, /non deve essere cancellata/);
  assert.match(doc, /backup e un ripristino/);
});

test('la guida documenta i comandi effettivi dei gate e delle build', () => {
  const doc = fs.readFileSync(path.join(root, 'docs/release/SQLCIPHER-V6-5-RELEASE-GATE.md'), 'utf8');
  for (const command of ['npm run test:all', 'npm run typecheck', 'npm run check:native-build', 'expo prebuild --clean', 'eas-cli build --platform android', 'eas-cli build --platform ios']) {
    assert.ok(doc.includes(command), `comando mancante: ${command}`);
  }
});
