const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const workflow = fs.readFileSync('.github/workflows/native-validation.yml', 'utf8');
const script = fs.readFileSync('scripts/verify-lockfile.cjs', 'utf8');
test('il progetto espone un controllo esplicito del lockfile', () => {
  assert.equal(pkg.scripts['verify:lockfile'], 'node scripts/verify-lockfile.cjs');
  assert.match(script, /lockfileVersion !== 3/);
  assert.match(script, /package-lock\.json assente/);
});
test('la CI richiede un lockfile versionato prima di installare', () => {
  assert.match(workflow, /npm run check:reproducible-install/);
  assert.match(workflow, /npm ci --no-audit --no-fund/);
});
