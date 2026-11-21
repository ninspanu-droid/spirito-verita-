const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');

test('package e app hanno la stessa versione 1.0.42', () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
  const app = JSON.parse(fs.readFileSync(path.join(root, 'app.json'), 'utf8'));
  assert.equal(pkg.version, '1.0.42');
  assert.equal(app.expo.version, pkg.version);
});

test('preflight controlla identificatori, versioni, profili EAS e SQLCipher', () => {
  const script = fs.readFileSync(path.join(root, 'scripts/check-release-config.cjs'), 'utf8');
  for (const fragment of ['androidId', 'iosId', 'app.version !== pkg.version', 'useSQLCipher !== true', 'development', 'preview', 'production']) {
    assert.ok(script.includes(fragment), `manca controllo ${fragment}`);
  }
  assert.match(script, /non verifica la disponibilità degli identificatori/);
});

test('workflow iOS è manuale, richiede token e avvia EAS preview', () => {
  const workflow = fs.readFileSync(path.join(root, '.github/workflows/ios-preview-build.yml'), 'utf8');
  assert.match(workflow, /workflow_dispatch/);
  assert.match(workflow, /secrets\.EXPO_TOKEN/);
  assert.match(workflow, /eas build --platform ios --profile preview --non-interactive/);
  assert.match(workflow, /npm run check:release-config/);
});

test('workflow Android esegue il preflight prima della build', () => {
  const workflow = fs.readFileSync(path.join(root, '.github/workflows/android-preview-build.yml'), 'utf8');
  assert.ok(workflow.indexOf('npm run check:release-config') < workflow.indexOf('eas build --platform android'));
});
