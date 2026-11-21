const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

const workflow = fs.readFileSync('.github/workflows/android-preview-build.yml', 'utf8');
const app = JSON.parse(fs.readFileSync('app.json', 'utf8'));
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const eas = JSON.parse(fs.readFileSync('eas.json', 'utf8'));

test('workflow Android è manuale e richiede EXPO_TOKEN', () => {
  assert.match(workflow, /workflow_dispatch/);
  assert.match(workflow, /secrets\.EXPO_TOKEN/);
  assert.match(workflow, /Build Android preview/);
});

test('workflow usa il profilo EAS preview e non-interactive', () => {
  assert.ok(eas.build.preview);
  assert.match(workflow, /eas build --platform android --profile preview --non-interactive/);
});

test('versione app e package sono allineate', () => {
  assert.equal(app.expo.version, pkg.version);
});

