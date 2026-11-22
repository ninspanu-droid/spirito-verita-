const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const workflow = fs.readFileSync(path.join(root, '.github/workflows/android-preview-build.yml'), 'utf8');

test('workflow Android applica un limite e impedisce build concorrenti', () => {
  assert.match(workflow, /timeout-minutes: 90/);
  assert.match(workflow, /group: android-preview-\$\{\{ github\.ref \}\}/);
  assert.match(workflow, /cancel-in-progress: false/);
});

test('workflow esegue i gate prima del prebuild e della build EAS', () => {
  const ordered = [
    'npm ci --no-audit --no-fund',
    'npx expo install --check',
    'npx expo-doctor',
    'npm run test:all',
    'npm run check:release-readiness',
    'npx expo prebuild --platform android',
    'eas build --platform android --profile preview'
  ];
  let previous = -1;
  for (const token of ordered) {
    const current = workflow.indexOf(token);
    assert.ok(current > previous, `ordine non valido o comando assente: ${token}`);
    previous = current;
  }
});

test('workflow conserva log e progetto Android anche in caso di errore', () => {
  assert.match(workflow, /tee expo-doctor\.log/);
  assert.match(workflow, /tee prebuild-android\.log/);
  assert.match(workflow, /expo config --type public/);
  assert.match(workflow, /if: always\(\)[\s\S]*?uses: actions\/upload-artifact@v4/);
  assert.match(workflow, /android\//);
  assert.match(workflow, /retention-days: 14/);
});

test('il token EAS è passato solo tramite secret e non viene stampato', () => {
  assert.match(workflow, /EXPO_TOKEN: \$\{\{ secrets\.EXPO_TOKEN \}\}/);
  assert.doesNotMatch(workflow, /echo\s+\$EXPO_TOKEN|printenv\s+EXPO_TOKEN/);
});
