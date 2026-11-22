#!/usr/bin/env node
/**
 * Verifica che il progetto Expo sia collegato a un progetto EAS reale.
 * Non genera né inventa un projectId: deve essere assegnato da `eas init`.
 */
const fs = require('node:fs');
const path = require('node:path');

const root = process.cwd();
const appPath = path.join(root, 'app.json');
const easPath = path.join(root, 'eas.json');

function fail(message) {
  console.error(`EAS PREFLIGHT: ${message}`);
  process.exit(1);
}

let app;
let eas;
try {
  app = JSON.parse(fs.readFileSync(appPath, 'utf8'));
  eas = JSON.parse(fs.readFileSync(easPath, 'utf8'));
} catch (error) {
  fail(`Impossibile leggere app.json/eas.json: ${error.message}`);
}

const projectId = app?.expo?.extra?.eas?.projectId;
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
if (typeof projectId !== 'string' || !uuidPattern.test(projectId)) {
  fail('projectId EAS assente o non valido. Esegui `npx eas-cli@latest init` e inserisci il projectId reale in expo.extra.eas.projectId di app.json.');
}
if (!eas?.build?.preview || !eas?.build?.production) {
  fail('Profili EAS preview e production richiesti.');
}
if (!app?.expo?.android?.package || !app?.expo?.ios?.bundleIdentifier) {
  fail('Identificatori Android e iOS obbligatori.');
}
console.log(`EAS PREFLIGHT OK — progetto collegato (${projectId}).`);
