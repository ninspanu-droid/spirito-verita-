const fs = require('node:fs');
const path = require('node:path');
const { createRequire } = require('node:module');

const root = path.resolve(__dirname, '..');
const projectRequire = createRequire(path.join(root, 'package.json'));
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const required = [
  ['@noble/ciphers/aes', 'gcm'],
  ['@noble/hashes/pbkdf2', 'pbkdf2Async'],
  ['@noble/hashes/sha2', 'sha256'],
  ['@noble/ciphers/utils', 'utf8ToBytes'],
  ['@noble/ciphers/utils', 'bytesToUtf8'],
  ['base64-js', 'fromByteArray'],
  ['base64-js', 'toByteArray'],
  ['expo-crypto', 'getRandomBytesAsync'],
];
const packageNames = [...new Set(required.map(([name]) => name.startsWith('@noble/') ? name.split('/').slice(0, 2).join('/') : name))];
const missingDeclarations = packageNames.filter((name) => !manifest.dependencies?.[name]);
const results = [];
for (const [moduleName, exportName] of required) {
  try {
    const resolved = projectRequire.resolve(moduleName);
    const loaded = projectRequire(moduleName);
    const ok = typeof loaded[exportName] === 'function';
    results.push({ moduleName, exportName, ok, detail: ok ? resolved : `export ${exportName} non disponibile` });
  } catch (error) {
    results.push({ moduleName, exportName, ok: false, detail: error.code || error.message });
  }
}
const appConfig = JSON.parse(fs.readFileSync(path.join(root, 'app.json'), 'utf8'));
const sqlCipherPlugin = appConfig.expo.plugins?.some((plugin) => Array.isArray(plugin) && plugin[0] === 'expo-sqlite' && plugin[1]?.useSQLCipher === true);
console.log(`SPIRITO & VERITÀ ${manifest.version} — preflight crittografia`);
for (const item of results) console.log(`${item.ok ? 'OK' : 'NON PRONTO'} ${item.moduleName} → ${item.exportName}: ${item.detail}`);
console.log(`${missingDeclarations.length ? 'NON PRONTO' : 'OK'} Dichiarazioni package.json: ${missingDeclarations.length ? missingDeclarations.join(', ') : 'tutte presenti'}`);
console.log(`${sqlCipherPlugin ? 'OK' : 'NON PRONTO'} Configurazione Expo SQLite/SQLCipher`);
const lockfile = fs.existsSync(path.join(root, 'package-lock.json'));
console.log(`${lockfile ? 'OK' : 'NON PRONTO'} package-lock.json ${lockfile ? 'presente' : 'assente: installazione non riproducibile'}`);
const failed = results.some((item) => !item.ok) || missingDeclarations.length > 0 || !sqlCipherPlugin || !lockfile;
console.log(failed ? '\nESITO: ambiente non ancora verificato; non avviare una build di rilascio.' : '\nESITO: dipendenze e configurazione crittografica disponibili. Eseguire comunque test nativi su dispositivo.');
if (failed) process.exitCode = 1;
