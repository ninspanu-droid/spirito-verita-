const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const script = path.resolve(__dirname, '../scripts/set-eas-project-id.cjs');
const valid = '123e4567-e89b-42d3-a456-426614174000';
function fixture() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'sv-eas-'));
  fs.writeFileSync(path.join(dir, 'app.json'), JSON.stringify({ expo: { name: 'Test', extra: { keep: true } } }));
  return dir;
}
test('rifiuta projectId mancante o non UUID senza modificare app.json', () => {
  const dir = fixture();
  const before = fs.readFileSync(path.join(dir, 'app.json'), 'utf8');
  const result = spawnSync(process.execPath, [script, 'not-a-uuid'], { cwd: dir, encoding: 'utf8' });
  assert.notEqual(result.status, 0);
  assert.equal(fs.readFileSync(path.join(dir, 'app.json'), 'utf8'), before);
});
test('imposta il projectId valido preservando gli altri campi extra', () => {
  const dir = fixture();
  const result = spawnSync(process.execPath, [script, valid], { cwd: dir, encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
  const app = JSON.parse(fs.readFileSync(path.join(dir, 'app.json'), 'utf8'));
  assert.equal(app.expo.extra.keep, true);
  assert.equal(app.expo.extra.eas.projectId, valid);
});
test('non crea un projectId casuale o predefinito', () => {
  const source = fs.readFileSync(script, 'utf8');
  assert.match(source, /const projectId = process\.argv\[2\]/);
  assert.match(source, /non genera né indovina identificatori/);
});
test('package espone il comando documentato', () => {
  const pkg = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../package.json'), 'utf8'));
  assert.equal(pkg.scripts['set:eas-project'], 'node scripts/set-eas-project-id.cjs');
});
