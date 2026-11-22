#!/usr/bin/env node
/** Aggregates local Android build prerequisites without installing or changing anything. */
const { spawnSync } = require('node:child_process');
const checks = [
  ['lockfile riproducibile', 'npm', ['run', '--silent', 'check:reproducible-install']],
  ['dipendenze crittografiche reali', 'npm', ['run', '--silent', 'check:crypto-runtime']],
  ['prerequisiti nativi Android', 'npm', ['run', '--silent', 'check:native-build']],
  ['identificatori app', 'npm', ['run', '--silent', 'check:app-identifiers']],
];
let failed = 0;
console.log('SPIRITO & VERITÀ — preflight Android locale (sola lettura)');
for (const [label, command, args] of checks) {
  const result = spawnSync(command, args, { encoding: 'utf8', timeout: 30000, windowsHide: true });
  const ok = result.status === 0;
  if (!ok) failed++;
  console.log(`\n${ok ? 'OK' : 'BLOCCATO'} — ${label}`);
  const output = `${result.stdout || ''}${result.stderr || ''}`.trim();
  if (output) console.log(output.split(/\r?\n/).slice(-12).join('\n'));
  if (result.error) console.log(`Dettaglio: ${result.error.code || result.error.message}`);
}
console.log(`\nEsito: ${checks.length - failed}/${checks.length} controlli superati.`);
if (failed) {
  console.log('Build non autorizzata dal preflight. Risolvere i blocchi e ripetere il controllo.');
  process.exitCode = 1;
} else {
  console.log('Prerequisiti locali presenti. Eseguire comunque prebuild, build custom e test su dispositivo.');
}
