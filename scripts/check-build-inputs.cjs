#!/usr/bin/env node
/** Preflight unico per build preview: verifica credenziali senza stamparle, EAS e installazione riproducibile. */
const { spawnSync } = require('node:child_process');
const path = require('node:path');
function fail(message) { console.error(`BUILD INPUTS: ${message}`); process.exit(1); }
if (!process.env.EXPO_TOKEN || !process.env.EXPO_TOKEN.trim()) {
  fail('EXPO_TOKEN assente. Configura il secret nei GitHub Actions; il valore non viene mai stampato.');
}
for (const [label, script] of [
  ['lockfile', 'check-reproducible-install.cjs'],
  ['progetto Expo', 'check-eas-project.cjs'],
]) {
  const result = spawnSync(process.execPath, [path.join(__dirname, script)], {
    cwd: process.cwd(), env: process.env, encoding: 'utf8'
  });
  if (result.stdout) process.stdout.write(result.stdout);
  if (result.status !== 0) {
    if (result.stderr) process.stderr.write(result.stderr);
    fail(`controllo ${label} non superato.`);
  }
}
console.log('BUILD INPUTS OK — token presente (valore nascosto), lockfile e progetto EAS verificati.');
