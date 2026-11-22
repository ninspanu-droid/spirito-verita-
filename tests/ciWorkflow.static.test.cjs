const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const workflowPath = path.join(__dirname, '..', '.github', 'workflows', 'native-validation.yml');
const docsPath = path.join(__dirname, '..', 'docs', 'release', 'V6-7-CI-VALIDATION.md');

test('la pipeline CI installa, testa, controlla TypeScript e prepara Android', () => {
  const workflow = fs.readFileSync(workflowPath, 'utf8');
  for (const token of ['npm ci', 'npm run test:all', 'npm run typecheck', 'npx expo-doctor', 'expo prebuild --platform android']) {
    assert.ok(workflow.includes(token), `Manca nel workflow: ${token}`);
  }
});

test('la pipeline non usa cache npm senza lockfile e verifica la configurazione SQLCipher', () => {
  const workflow = fs.readFileSync(workflowPath, 'utf8');
  assert.doesNotMatch(workflow, /cache:\s*npm/);
  assert.match(workflow, /useSQLCipher !== true/);
  assert.match(workflow, /permissions:\s*\n\s*contents: read/);
});

test('la documentazione chiarisce che CI e prebuild non certificano SQLCipher nativo', () => {
  const docs = fs.readFileSync(docsPath, 'utf8');
  assert.match(docs, /non certifica da solo che il database sia cifrato/i);
  assert.match(docs, /non produce un APK\/AAB/i);
});
