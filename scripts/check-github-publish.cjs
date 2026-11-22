#!/usr/bin/env node
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const root = path.resolve(__dirname, '..');
function run(command, args) {
  return spawnSync(command, args, { cwd: root, encoding: 'utf8', stdio: 'ignore' });
}
function exists(command) {
  const r = spawnSync(process.platform === 'win32' ? 'where' : 'which', [command], { encoding: 'utf8', stdio: 'ignore' });
  return r.status === 0;
}
const checks = [];
function add(label, ok, detail) { checks.push({ label, ok: Boolean(ok), detail }); }
const gitAvailable = exists('git');
const ghAvailable = exists('gh');
add('Git installato', gitAvailable, gitAvailable ? 'Comando git disponibile.' : 'Installare Git oppure usare GitHub Desktop.');
add('GitHub CLI installata', ghAvailable, ghAvailable ? 'Comando gh disponibile.' : 'Opzionale: installare GitHub CLI oppure usare GitHub Desktop.');
const isRepo = gitAvailable && run('git', ['rev-parse', '--is-inside-work-tree']).status === 0;
add('Cartella già inizializzata come repository Git', isRepo, isRepo ? 'Repository Git locale rilevato.' : 'Creare un repository Git oppure caricare i file con GitHub Desktop/web.');
const authenticated = ghAvailable && run('gh', ['auth', 'status']).status === 0;
add('Autenticazione GitHub CLI', authenticated, ghAvailable ? (authenticated ? 'Autenticazione disponibile.' : 'Eseguire gh auth login; nessun token viene richiesto o stampato da questo script.') : 'Non verificabile senza gh; usare GitHub Desktop/web.');
const hasOrigin = isRepo && run('git', ['remote', 'get-url', 'origin']).status === 0;
add('Remote origin configurato', hasOrigin, hasOrigin ? 'Remote origin presente.' : 'Dopo aver creato il repository remoto, aggiungere origin.');
const hasLock = fs.existsSync(path.join(root, 'package-lock.json'));
add('package-lock.json presente', hasLock, hasLock ? 'Lockfile presente; validarlo con npm run verify:lockfile.' : 'Manca: usare Actions → Generate and validate npm lockfile.');
const sensitive = ['.env', '.env.local', '.env.production', 'credentials.json', 'service-account.json'];
const presentSensitive = sensitive.filter((f) => fs.existsSync(path.join(root, f)));
const keyFiles = [];
function walk(dir) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ent.name === '.git' || ent.name === 'node_modules' || ent.name === '.expo') continue;
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(full);
    else if (/\.(jks|keystore)$/i.test(ent.name)) keyFiles.push(path.relative(root, full));
  }
}
walk(root);
add('Nessun file sensibile comune nella cartella', presentSensitive.length === 0 && keyFiles.length === 0,
  [...presentSensitive, ...keyFiles].length ? `Verificare e NON caricare: ${[...presentSensitive, ...keyFiles].join(', ')}` : 'Nessun file sensibile comune rilevato; controllare comunque manualmente i file prima del caricamento.');
const failed = checks.filter((c) => !c.ok);
console.log('SPIRITO & VERITÀ — PREPARAZIONE PUBBLICAZIONE GITHUB');
for (const c of checks) console.log(`${c.ok ? 'OK' : 'DA FARE'}  ${c.label} — ${c.detail}`);
console.log(`\n${checks.length - failed.length}/${checks.length} controlli soddisfatti.`);
console.log('Questo controllo è locale e informativo: non crea repository, non carica file e non legge o stampa credenziali.');
if (failed.length) process.exitCode = 1;
