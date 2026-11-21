const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');

test('app.json contiene identificatori Android e iOS validi', () => {
  const config = JSON.parse(fs.readFileSync(path.join(root, 'app.json'), 'utf8')).expo;
  assert.match(config.android.package, /^[a-zA-Z][a-zA-Z0-9]*(\.[a-zA-Z][a-zA-Z0-9_-]*)+$/);
  assert.match(config.ios.bundleIdentifier, /^[a-zA-Z][a-zA-Z0-9]*(\.[a-zA-Z][a-zA-Z0-9_-]*)+$/);
  assert.equal(config.android.package, config.ios.bundleIdentifier);
});

test('workflow Android esegue il controllo degli identificatori prima della build', () => {
  const workflow = fs.readFileSync(path.join(root, '.github/workflows/android-preview-build.yml'), 'utf8');
  assert.match(workflow, /npm run check:app-identifiers/);
  assert.ok(workflow.indexOf('npm run check:app-identifiers') < workflow.indexOf('eas build --platform android'));
});

test('script controllo identificatori non dichiara la disponibilità negli store', () => {
  const script = fs.readFileSync(path.join(root, 'scripts/check-app-identifiers.cjs'), 'utf8');
  assert.match(script, /validità sintattica non garantisce la disponibilità/);
});
