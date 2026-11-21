#!/usr/bin/env node
/** Gate conservativo prima di una build EAS: verifica configurazione, non certifica il binario nativo. */
const fs = require('node:fs');
const path = require('node:path');
const root = process.cwd();
const read = (name) => JSON.parse(fs.readFileSync(path.join(root, name), 'utf8'));
function fail(message) { console.error(`RELEASE READINESS: ${message}`); process.exit(1); }
let app, pkg, eas;
try { app = read('app.json').expo; pkg = read('package.json'); eas = read('eas.json'); }
catch (error) { fail(`Configurazione non leggibile: ${error.message}`); }
if (!app || app.version !== pkg.version) fail('Versione app.json e package.json non allineata.');
if (app.android?.package !== 'it.spiritoeverita.app' || app.ios?.bundleIdentifier !== 'it.spiritoeverita.app') fail('Gli identificatori Android/iOS non corrispondono a quelli approvati nel progetto.');
if (app.android?.allowBackup !== false) fail('Android allowBackup deve essere false per evitare backup di dati locali non verificati.');
const sqlCipher = app.plugins?.find((p) => Array.isArray(p) && p[0] === 'expo-sqlite');
if (sqlCipher?.[1]?.useSQLCipher !== true) fail('Plugin expo-sqlite con useSQLCipher=true non trovato.');
if (!eas.build?.preview || !eas.build?.production) fail('Profili EAS preview e production obbligatori.');
const projectId = app.extra?.eas?.projectId;
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
if (typeof projectId !== 'string' || !uuid.test(projectId)) fail('projectId EAS mancante/non valido: collega il progetto con npx eas-cli@latest init.');
console.log(`RELEASE READINESS OK — ${pkg.name} ${pkg.version}; EAS ${projectId}; SQLCipher configurato.`);
console.log('NOTA: questo controllo statico non sostituisce build nativa, test su dispositivo o verifica del database cifrato.');
