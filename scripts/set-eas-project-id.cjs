#!/usr/bin/env node
/** Imposta un projectId EAS fornito dall'utente; non genera né indovina identificatori. */
const fs = require('node:fs');
const path = require('node:path');
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const projectId = process.argv[2];
if (!projectId || !uuid.test(projectId)) {
  console.error('Uso: npm run set:eas-project -- <PROJECT_ID_UUID>');
  console.error('Copia il projectId reale dalla dashboard Expo o esegui `npx eas-cli@latest init`.');
  process.exit(1);
}
const file = path.join(process.cwd(), 'app.json');
let config;
try { config = JSON.parse(fs.readFileSync(file, 'utf8')); }
catch (error) { console.error(`Impossibile leggere app.json: ${error.message}`); process.exit(1); }
if (!config.expo || typeof config.expo !== 'object') {
  console.error('app.json non contiene una configurazione expo valida.');
  process.exit(1);
}
config.expo.extra = config.expo.extra && typeof config.expo.extra === 'object' ? config.expo.extra : {};
config.expo.extra.eas = config.expo.extra.eas && typeof config.expo.extra.eas === 'object' ? config.expo.extra.eas : {};
config.expo.extra.eas.projectId = projectId;
const temporary = `${file}.tmp`;
fs.writeFileSync(temporary, `${JSON.stringify(config, null, 2)}\n`, { mode: 0o600 });
fs.renameSync(temporary, file);
console.log(`Project ID EAS impostato: ${projectId}`);
console.log('Verifica con: npm run check:eas-project');
