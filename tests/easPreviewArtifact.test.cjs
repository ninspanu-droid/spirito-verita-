const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');

test('profilo EAS preview Android produce APK installabile', () => {
  const eas = JSON.parse(fs.readFileSync(path.join(root, 'eas.json'), 'utf8'));
  assert.equal(eas.build.preview.distribution, 'internal');
  assert.equal(eas.build.preview.android.buildType, 'apk');
});

test('preflight rifiuta preview Android senza APK', () => {
  const script = fs.readFileSync(path.join(root, 'scripts/check-release-config.cjs'), 'utf8');
  assert.match(script, /preview\?\.android\?\.buildType !== 'apk'/);
  assert.match(script, /APK installabile/);
});
