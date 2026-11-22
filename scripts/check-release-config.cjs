const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = (name) => JSON.parse(fs.readFileSync(path.join(root, name), 'utf8'));
const pkg = read('package.json');
const app = read('app.json').expo;
const eas = read('eas.json');
const errors = [];
const androidId = app.android?.package;
const iosId = app.ios?.bundleIdentifier;
const idPattern = /^[a-zA-Z][a-zA-Z0-9]*(\.[a-zA-Z][a-zA-Z0-9_-]*)+$/;
if (!androidId || !idPattern.test(androidId)) errors.push('Identificatore Android assente o sintatticamente non valido.');
if (!iosId || !idPattern.test(iosId)) errors.push('Bundle identifier iOS assente o sintatticamente non valido.');
if (androidId && iosId && androidId !== iosId) errors.push('Gli identificatori Android e iOS non coincidono.');
if (app.version !== pkg.version) errors.push('La versione in app.json e package.json non coincide.');
const sqlitePlugin = app.plugins?.find((p) => Array.isArray(p) && p[0] === 'expo-sqlite');
if (sqlitePlugin?.[1]?.useSQLCipher !== true) errors.push('expo-sqlite deve avere useSQLCipher=true.');
for (const profile of ['development', 'preview', 'production']) {
  if (!eas.build?.[profile]) errors.push(`Profilo EAS ${profile} mancante.`);
}
if (eas.build?.preview?.android?.buildType !== 'apk') {
  errors.push('Il profilo preview Android deve produrre un APK installabile (android.buildType=apk).');
}
if (errors.length) {
  console.error('Preflight rilascio non superato:');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}
console.log('Preflight configurazione superato.');
console.log(`Versione: ${app.version}`);
console.log(`Identificatore Android/iOS: ${androidId}`);
console.log('Preview Android: APK interno configurato.');
console.log('SQLCipher plugin: configurato (non equivale a verifica runtime nativa).');
console.log('Nota: la validità sintattica non verifica la disponibilità degli identificatori negli store.');
