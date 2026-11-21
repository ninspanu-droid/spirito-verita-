#!/usr/bin/env node
/** Generate package-lock.json with bounded retries; never installs node_modules. */
const { spawnSync } = require('node:child_process');
const attempts = Number(process.env.LOCKFILE_GENERATION_ATTEMPTS || 3);
const timeoutMs = Number(process.env.LOCKFILE_GENERATION_TIMEOUT_MS || 360000);
if (!Number.isInteger(attempts) || attempts < 1 || attempts > 5) {
  console.error('LOCKFILE: LOCKFILE_GENERATION_ATTEMPTS deve essere un intero tra 1 e 5.');
  process.exit(2);
}
if (!Number.isInteger(timeoutMs) || timeoutMs < 1000 || timeoutMs > 600000) {
  console.error('LOCKFILE: LOCKFILE_GENERATION_TIMEOUT_MS deve essere tra 1000 e 600000.');
  process.exit(2);
}
for (let attempt = 1; attempt <= attempts; attempt += 1) {
  console.log(`LOCKFILE: tentativo ${attempt}/${attempts}`);
  const result = spawnSync('npm', [
    'install', '--package-lock-only', '--ignore-scripts', '--no-audit', '--no-fund',
    '--fetch-retries=2', '--fetch-timeout=30000'
  ], { encoding: 'utf8', timeout: timeoutMs, windowsHide: true });
  const output = `${result.stdout || ''}${result.stderr || ''}`.trim();
  if (output) console.log(output.split(/\r?\n/).slice(-30).join('\n'));
  if (result.status === 0) {
    console.log('LOCKFILE: generazione completata. Eseguire verify:lockfile e npm ci prima di usare la build.');
    process.exit(0);
  }
  const reason = result.error?.code || (result.signal ? `signal ${result.signal}` : `exit ${result.status}`);
  console.error(`LOCKFILE: tentativo non riuscito (${reason}).`);
  if (attempt < attempts) {
    const delay = attempt * 3000;
    console.log(`LOCKFILE: nuovo tentativo tra ${delay / 1000}s.`);
    const wait = spawnSync(process.execPath, ['-e', `setTimeout(() => process.exit(0), ${delay})`], { timeout: delay + 2000 });
    if (wait.status !== 0) process.exit(2);
  }
}
console.error('LOCKFILE: generazione fallita dopo tutti i tentativi; nessun lockfile è considerato valido.');
process.exit(1);
