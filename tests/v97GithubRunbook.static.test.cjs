const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const pkg = require('../package.json');
const app = require('../app.json');
const workflow = fs.readFileSync(path.join(__dirname, '../.github/workflows/generate-lockfile.yml'), 'utf8');
const guide = fs.readFileSync(path.join(__dirname, '../docs/release/V9-7-AVVIO-GITHUB-ACTIONS.md'), 'utf8');

test('versione V9.8 sincronizzata tra package ed Expo', () => {
  assert.equal(pkg.version, '1.0.42');
  assert.equal(app.expo.version, '1.0.42');
});

test('guida descrive il workflow manuale corretto', () => {
  assert.match(guide, /Actions/);
  assert.match(guide, /Generate and validate npm lockfile/);
  assert.match(guide, /Run workflow/);
});

test('guida distingue lockfile da build EAS e token', () => {
  assert.match(guide, /non occorre `EXPO_TOKEN`/);
  assert.match(guide, /repository secret/);
  assert.match(guide, /non costituisce prova di una build remota/);
});

test('workflow richiede tutti i controlli prima della pull request', () => {
  for (const item of ['npm ci --no-audit --no-fund', 'npm run test:all', 'npm run typecheck', 'npx expo-doctor']) {
    assert.ok(workflow.includes(item), `manca ${item}`);
  }
  assert.match(workflow, /if: success\(\)/);
  assert.match(workflow, /create-pull-request@v7/);
});

test('workflow lockfile non invia modifiche direttamente al branch principale', () => {
  assert.match(workflow, /branch: automation\/validated-npm-lockfile/);
  assert.match(workflow, /add-paths: package-lock\.json/);
});
