const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

test('il report V10.6.3 riporta il conteggio verificato e i blocchi reali', () => {
  const report = fs.readFileSync(path.join(__dirname, '..', 'README-V10.6.3.md'), 'utf8');
  assert.match(report, /199 test superati, 0 falliti/);
  assert.match(report, /2\/7 controlli soddisfatti/);
  assert.match(report, /Non certifica quindi un APK installabile né SQLCipher nativo/);
});
