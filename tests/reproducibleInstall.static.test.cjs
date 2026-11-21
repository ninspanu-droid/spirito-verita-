const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const script = fs.readFileSync(path.join(root, 'scripts', 'check-reproducible-install.cjs'), 'utf8');
const workflows = ['native-validation.yml', 'android-preview-build.yml', 'ios-preview-build.yml'].map((f) => fs.readFileSync(path.join(root, '.github', 'workflows', f), 'utf8'));
test('il preflight richiede lockfile npm v3 allineato e installazione npm ci', () => {
  assert.match(script, /package-lock\.json assente/);
  assert.match(script, /lockfileVersion !== 3/);
  assert.match(script, /rootPackage\[section\]\?\.\[name\] !== version/);
  assert.match(script, /usare npm ci/);
});
test('tutte le pipeline native bloccano lockfile assente e usano npm ci', () => {
  for (const workflow of workflows) {
    assert.match(workflow, /npm run check:reproducible-install/);
    assert.match(workflow, /npm ci --no-audit --no-fund/);
    assert.doesNotMatch(workflow, /run: npm install --no-audit --no-fund/);
  }
});
test('versione app e package è allineata alla V9.0', () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
  const app = JSON.parse(fs.readFileSync(path.join(root, 'app.json'), 'utf8'));
  assert.equal(app.expo.version, pkg.version);
  assert.equal(pkg.version, '1.0.42');
});
