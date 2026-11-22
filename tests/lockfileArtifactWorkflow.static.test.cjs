const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const workflowPath = path.join(root, '.github/workflows/generate-lockfile.yml');

test('workflow lockfile è manuale e genera lockfile senza script di installazione', () => {
  const workflow = fs.readFileSync(workflowPath, 'utf8');
  assert.match(workflow, /workflow_dispatch/);
  assert.match(workflow, /npm run generate:lockfile/);
  assert.match(workflow, /LOCKFILE_GENERATION_ATTEMPTS: 3/);
  assert.match(workflow, /npm run verify:lockfile/);
});

test('workflow installa davvero dal lockfile appena generato prima di pubblicare artifact', () => {
  const workflow = fs.readFileSync(workflowPath, 'utf8');
  const verify = workflow.indexOf('npm run verify:lockfile');
  const ci = workflow.indexOf('npm ci --no-audit --no-fund');
  const tests = workflow.indexOf('npm run test:all');
  const typecheck = workflow.indexOf('npm run typecheck');
  const doctor = workflow.indexOf('npx expo-doctor');
  const upload = workflow.indexOf('actions/upload-artifact@v4');
  assert.ok(verify >= 0 && ci > verify && tests > ci && typecheck > tests && doctor > typecheck && upload > doctor);
  assert.match(workflow, /if: success\(\)/);
});

test('workflow carica solo il lockfile validato e non modifica automaticamente il repository', () => {
  const workflow = fs.readFileSync(workflowPath, 'utf8');
  assert.match(workflow, /name: spirito-verita-package-lock-validated/);
  assert.match(workflow, /path: package-lock\.json/);
  assert.doesNotMatch(workflow, /git push|git commit/);
});

test('guida documenta download, revisione e commit manuale del lockfile', () => {
  const guide = fs.readFileSync(path.join(root, 'docs/V7-9-LOCKFILE-VALIDATO-CI.md'), 'utf8');
  for (const phrase of ['Run workflow', 'npm ci', 'Expo Doctor', 'artifact', 'committarlo', 'non esegue una build nativa']) assert.ok(guide.includes(phrase));
});
