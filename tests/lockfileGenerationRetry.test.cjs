const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const script = path.join(__dirname, '..', 'scripts', 'generate-lockfile-retry.cjs');
const workflow = fs.readFileSync(path.join(__dirname, '..', '.github/workflows/generate-lockfile.yml'), 'utf8');
function runFakeNpm(shellBody, env = {}) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'sv-lock-'));
  const countFile = path.join(dir, 'count');
  const fake = path.join(dir, 'npm');
  fs.writeFileSync(fake, `#!/bin/sh\n${shellBody}\n`, { mode: 0o755 });
  const result = spawnSync(process.execPath, [script], {
    encoding: 'utf8',
    env: { ...process.env, PATH: `${dir}${path.delimiter}${process.env.PATH}`, LOCKFILE_GENERATION_TIMEOUT_MS: '3000', LOCKFILE_GENERATION_ATTEMPTS: '3', COUNT_FILE: countFile, ...env }
  });
  const calls = fs.existsSync(countFile) ? Number(fs.readFileSync(countFile, 'utf8')) : 0;
  fs.rmSync(dir, { recursive: true, force: true });
  return { ...result, calls };
}
test('la generazione lockfile riprova e termina al primo successo', () => {
  const r = runFakeNpm('n=$(cat "$COUNT_FILE" 2>/dev/null || echo 0); n=$((n+1)); echo "$n" > "$COUNT_FILE"; [ "$n" -ge 2 ]');
  assert.equal(r.status, 0, r.stderr);
  assert.equal(r.calls, 2);
  assert.match(r.stdout, /generazione completata/);
});
test('dopo il numero massimo di tentativi il generatore fallisce in modo esplicito', () => {
  const r = runFakeNpm('n=$(cat "$COUNT_FILE" 2>/dev/null || echo 0); n=$((n+1)); echo "$n" > "$COUNT_FILE"; exit 1');
  assert.equal(r.status, 1);
  assert.equal(r.calls, 3);
  assert.match(r.stderr, /dopo tutti i tentativi/);
});
test('il generatore usa tentativi e timeout limitati e non esegue npm ci', () => {
  const source = fs.readFileSync(script, 'utf8');
  assert.match(source, /attempts > 5/);
  assert.match(source, /timeoutMs > 600000/);
  assert.match(source, /package-lock-only/);
  assert.doesNotMatch(source, /\['ci'/);
});
test('workflow GitHub usa il generatore con timeout e retry espliciti', () => {
  assert.match(workflow, /npm run generate:lockfile/);
  assert.match(workflow, /LOCKFILE_GENERATION_ATTEMPTS: 3/);
  assert.match(workflow, /LOCKFILE_GENERATION_TIMEOUT_MS: 360000/);
  assert.match(workflow, /npm ci --no-audit --no-fund/);
});
test('workflow valida e carica solo dopo npm ci, test e typecheck', () => {
  const install = workflow.indexOf('npm ci --no-audit --no-fund');
  const tests = workflow.indexOf('npm run test:all');
  const types = workflow.indexOf('npm run typecheck');
  const upload = workflow.indexOf('actions/upload-artifact@v4');
  assert.ok(install >= 0 && tests > install && types > tests && upload > types);
});
