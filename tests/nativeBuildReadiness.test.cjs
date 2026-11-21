const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');

test('la verifica prerequisiti build nativa controlla SQLCipher e profili EAS', () => {
  const script = fs.readFileSync(path.join(root, 'scripts/check-native-build.cjs'), 'utf8');
  assert.match(script, /useSQLCipher === true/);
  assert.match(script, /eas\.build\?\.development/);
  assert.match(script, /node_modules/);
  assert.match(script, /lockfile/);
});

test('i comandi per build Android e iOS sono dichiarati', () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
  assert.match(pkg.scripts['build:android:eas'], /--platform android/);
  assert.match(pkg.scripts['build:ios:eas'], /--platform ios/);
});
