const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const root = path.resolve(__dirname, '..');
const script = path.join(root, 'scripts/check-repository-readiness.cjs');
const workflow = fs.readFileSync(path.join(root, '.github/workflows/repository-readiness.yml'), 'utf8');
const pkg = require(path.join(root, 'package.json'));
const app = require(path.join(root, 'app.json'));

test('report prerequisiti è dichiarato in package.json', () => {
  assert.equal(pkg.scripts['check:repository-readiness'], 'node scripts/check-repository-readiness.cjs');
  assert.ok(fs.existsSync(script));
});
test('versione app e package allineate a 1.0.42', () => {
  assert.equal(pkg.version, '1.0.42');
  assert.equal(app.expo.version, '1.0.42');
});
test('workflow manuale e push produce report e artifact anche senza segreti esposti', () => {
  assert.match(workflow, /workflow_dispatch/);
  assert.match(workflow, /repository-readiness\.json/);
  assert.match(workflow, /actions\/upload-artifact@v4/);
  assert.match(workflow, /EXPO_TOKEN:\s*\$\{\{\s*secrets\.EXPO_TOKEN\s*\}\}/);
});
test('diagnostica non stampa il valore del token', () => {
  const secret = 'do-not-print-this-token';
  const result = spawnSync(process.execPath, [script], { cwd: root, encoding: 'utf8', env: { ...process.env, EXPO_TOKEN: secret } });
  assert.equal(result.status, 0);
  assert.ok(!`${result.stdout}${result.stderr}`.includes(secret));
  assert.match(result.stdout, /EXPO_TOKEN disponibile/);
});
test('modalità strict fallisce se restano prerequisiti mancanti', () => {
  const result = spawnSync(process.execPath, [script, '--strict'], { cwd: root, encoding: 'utf8', env: { ...process.env, EXPO_TOKEN: '' } });
  assert.equal(result.status, 1);
  assert.match(result.stdout, /PREREQUISITI MANCANTI/);
});
test('report JSON distingue esito complessivo e singoli controlli', () => {
  const out = path.join(root, `repository-readiness.test-output-report-${process.pid}.json`);
  try {
    const result = spawnSync(process.execPath, [script], { cwd: root, encoding: 'utf8', env: { ...process.env, EXPO_TOKEN: '', READINESS_REPORT_PATH: out } });
    assert.equal(result.status, 0);
    const report = JSON.parse(fs.readFileSync(out, 'utf8'));
    assert.equal(typeof report.ready, 'boolean');
    assert.ok(Array.isArray(report.checks));
    assert.ok(report.checks.some((c) => c.id === 'lockfile'));
    assert.ok(report.checks.some((c) => c.id === 'eas_project'));
  } finally { fs.rmSync(out, { force: true }); }
});


test('report controlla i moduli runtime reali e non la sola cartella node_modules', () => {
  const result = spawnSync(process.execPath, [script], { cwd: root, encoding: 'utf8', env: { ...process.env, EXPO_TOKEN: '' } });
  assert.equal(result.status, 0);
  assert.match(result.stdout, /Dipendenze runtime richieste risolte/);
  assert.match(result.stdout, /Expo CLI locale/);
  assert.match(result.stdout, /EAS CLI locale/);
});
test('report elenca i moduli mancanti senza fallire la modalità informativa', () => {
  const out = path.join(root, `repository-readiness.test-output-modules-${process.pid}.json`);
  try {
    const result = spawnSync(process.execPath, [script], { cwd: root, encoding: 'utf8', env: { ...process.env, EXPO_TOKEN: '', READINESS_REPORT_PATH: out } });
    assert.equal(result.status, 0);
    const report = JSON.parse(fs.readFileSync(out, 'utf8'));
    assert.equal(report.schemaVersion, 2);
    const modules = report.checks.find((c) => c.id === 'node_modules');
    assert.ok(modules);
    assert.match(modules.detail, /moduli risolti/);
    assert.ok(report.checks.some((c) => c.id === 'expo_cli'));
    assert.ok(report.checks.some((c) => c.id === 'eas_cli'));
  } finally { fs.rmSync(out, { force: true }); }
});
