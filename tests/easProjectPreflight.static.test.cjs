const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const script = fs.readFileSync(path.join(root, 'scripts/check-eas-project.cjs'), 'utf8');
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));

test('EAS project preflight validates a real UUID and never fabricates one', () => {
  assert.match(script, /extra\?\.eas\?\.projectId/);
  assert.match(script, /uuidPattern/);
  assert.match(script, /eas-cli@latest init/);
  assert.doesNotMatch(script, /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);
});

test('EAS project preflight checks preview and production profiles', () => {
  assert.match(script, /build\?\.preview/);
  assert.match(script, /build\?\.production/);
});

test('package exposes EAS project preflight command', () => {
  assert.equal(pkg.scripts['check:eas-project'], 'node scripts/check-eas-project.cjs');
});

for (const file of ['android-preview-build.yml', 'ios-preview-build.yml']) {
  test(`${file} blocks build until EAS project is linked`, () => {
    const workflow = fs.readFileSync(path.join(root, '.github/workflows', file), 'utf8');
    assert.match(workflow, /Verify EAS project linkage[\s\S]*?npm run check:eas-project/);
    assert.ok(workflow.indexOf('npm run check:eas-project') < workflow.indexOf('eas build --platform'));
  });
}
