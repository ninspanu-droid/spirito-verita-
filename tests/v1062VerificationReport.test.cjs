const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

test('il report V10.6.2 riporta i 198 test rieseguiti e i blocchi esterni', () => {
  const report = fs.readFileSync(path.join(__dirname, '..', 'README-V10.6.2.md'), 'utf8');
  assert.match(report, /198 test superati, 0 falliti/);
  assert.match(report, /2\/7 controlli soddisfatti/);
  assert.match(report, /package-lock\.json/);
  assert.match(report, /EXPO_TOKEN/);
  assert.match(report, /non certifica SQLCipher su dispositivo fisico/);
});
