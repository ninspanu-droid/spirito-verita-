const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

const android = fs.readFileSync('.github/workflows/android-preview-build.yml', 'utf8');
const ios = fs.readFileSync('.github/workflows/ios-preview-build.yml', 'utf8');
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const app = JSON.parse(fs.readFileSync('app.json', 'utf8')).expo;

test('build Android attende il completamento remoto EAS', () => {
  assert.match(android, /eas build --platform android --profile preview --non-interactive --wait/);
});

test('build iOS attende il completamento remoto EAS', () => {
  assert.match(ios, /eas build --platform ios --profile preview --non-interactive --wait/);
});

test('le build preview restano avviabili soltanto manualmente', () => {
  assert.match(android, /workflow_dispatch/);
  assert.match(ios, /workflow_dispatch/);
  assert.doesNotMatch(android, /\npush:/);
  assert.doesNotMatch(ios, /\npush:/);
});

test('versione V9.0 allineata tra package e configurazione Expo', () => {
  assert.equal(pkg.version, '1.0.42');
  assert.equal(app.version, '1.0.42');
});
