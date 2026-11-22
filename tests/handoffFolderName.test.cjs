const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

test('guida di avvio indica il nome reale della cartella del progetto nello ZIP', () => {
  const guide = fs.readFileSync(path.join(__dirname, '..', 'START-HERE-V10.6.md'), 'utf8');
  assert.match(guide, /contenuto della cartella `spirito_verita_v10_6`/);
  assert.doesNotMatch(guide, /sv_v105_build/);
});
