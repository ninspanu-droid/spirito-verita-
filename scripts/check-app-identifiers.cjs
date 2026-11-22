const fs = require('node:fs');
const path = require('node:path');

const configPath = path.join(process.cwd(), 'app.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
const expo = config.expo || {};
const androidPackage = expo.android?.package;
const iosBundleIdentifier = expo.ios?.bundleIdentifier;
const identifierPattern = /^[a-zA-Z][a-zA-Z0-9]*(\.[a-zA-Z][a-zA-Z0-9_-]*)+$/;

const errors = [];
if (!androidPackage || !identifierPattern.test(androidPackage)) {
  errors.push('expo.android.package mancante o non valido.');
}
if (!iosBundleIdentifier || !identifierPattern.test(iosBundleIdentifier)) {
  errors.push('expo.ios.bundleIdentifier mancante o non valido.');
}
if (androidPackage && iosBundleIdentifier && androidPackage !== iosBundleIdentifier) {
  errors.push('Android package e iOS bundleIdentifier non coincidono: verificare che la differenza sia intenzionale.');
}
if (errors.length) {
  console.error('Controllo identificatori app fallito:');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}
console.log(`Identificatori app validi: ${androidPackage}`);
console.log('Nota: la validità sintattica non garantisce la disponibilità negli store.');
