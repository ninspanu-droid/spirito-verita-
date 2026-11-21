const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const workflow = fs.readFileSync(path.join(root, '.github/workflows/generate-lockfile.yml'), 'utf8');

test('workflow lockfile limita le scritture al contenuto e alle pull request', () => {
  assert.match(workflow, /permissions:\s*\n\s*contents: write\s*\n\s*pull-requests: write/);
  assert.match(workflow, /token: \$\{\{ secrets\.GITHUB_TOKEN \}\}/);
});

test('workflow apre la pull request solo dopo i controlli e senza push sul branch principale', () => {
  const doctor = workflow.indexOf('npx expo-doctor');
  const pr = workflow.indexOf('peter-evans/create-pull-request@v7');
  assert.ok(doctor >= 0 && pr > doctor);
  assert.match(workflow.slice(workflow.lastIndexOf('      - name: Open pull request')), /if: success\(\)/);
  assert.match(workflow.slice(pr), /branch: automation\/validated-npm-lockfile/);
  assert.match(workflow.slice(pr), /add-paths: package-lock\.json/);
  assert.match(workflow.slice(pr), /Revisionare il diff prima del merge/);
});

test('workflow conserva il caricamento dell’artifact come copia verificabile', () => {
  assert.match(workflow, /actions\/upload-artifact@v4/);
  assert.match(workflow, /name: spirito-verita-package-lock-validated/);
  assert.match(workflow, /path: package-lock\.json/);
});

test('versione app e package sono allineate a 1.0.42', () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
  const app = JSON.parse(fs.readFileSync(path.join(root, 'app.json'), 'utf8'));
  assert.equal(pkg.version, '1.0.42');
  assert.equal(app.expo.version, pkg.version);
});


test('workflow serializza le generazioni per evitare conflitti sulla branch PR', () => {
  assert.match(workflow, /concurrency:\s*\n\s*group: validated-lockfile-\$\{\{ github\.repository \}\}/);
  assert.match(workflow, /cancel-in-progress: false/);
});

test('workflow pubblica nel riepilogo il risultato e il link della pull request', () => {
  assert.match(workflow, /id: lockfile_pr/);
  assert.match(workflow, /steps\.lockfile_pr\.outputs\.pull-request-url/);
  assert.match(workflow, /GITHUB_STEP_SUMMARY/);
  assert.match(workflow, /Nessuna pull request nuova/);
});
