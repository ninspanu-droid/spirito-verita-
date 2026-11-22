#!/usr/bin/env node
/** Read-only report of prerequisites needed before GitHub/EAS native builds. */
const fs = require('node:fs');
const path = require('node:path');
const root = process.cwd();
const readJson = (name) => JSON.parse(fs.readFileSync(path.join(root, name), 'utf8'));
const pkg = readJson('package.json');
const app = readJson('app.json').expo;
const eas = readJson('eas.json');
const lockPath = path.join(root, 'package-lock.json');
const requiredModules = ['expo', 'expo-sqlite', 'expo-secure-store', 'expo-crypto', '@noble/ciphers/aes', '@noble/hashes/pbkdf2', 'base64-js'];
const resolvedModules = requiredModules.map((name) => { try { require.resolve(name, { paths: [root] }); return { name, ok: true }; } catch { return { name, ok: false }; } });
const easCliPath = path.join(root, 'node_modules', '.bin', process.platform === 'win32' ? 'eas.cmd' : 'eas');
const expoCliPath = path.join(root, 'node_modules', '.bin', process.platform === 'win32' ? 'expo.cmd' : 'expo');
const lockExists = fs.existsSync(lockPath);
let lockValid = false;
if (lockExists) {
  try {
    const lock = JSON.parse(fs.readFileSync(lockPath, 'utf8'));
    lockValid = lock.lockfileVersion === 3 && lock.name === pkg.name && lock.version === pkg.version && !!lock.packages?.[''];
    for (const section of ['dependencies', 'devDependencies']) {
      for (const [name, version] of Object.entries(pkg[section] || {})) {
        if (lock.packages?.['']?.[section]?.[name] !== version) lockValid = false;
      }
    }
  } catch { lockValid = false; }
}
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const projectId = app.extra?.eas?.projectId;
const sqlitePlugin = app.plugins?.find((item) => Array.isArray(item) && item[0] === 'expo-sqlite');
const checks = [
  { id: 'version_alignment', label: 'Versione package.json / app.json', ok: pkg.version === app.version, detail: `${pkg.version} / ${app.version}` },
  { id: 'lockfile', label: 'package-lock.json npm v3 allineato', ok: lockValid, detail: lockValid ? 'presente e allineato' : (lockExists ? 'presente ma non valido/allineato' : 'assente') },
  { id: 'node_modules', label: 'Dipendenze runtime richieste risolte', ok: resolvedModules.every((m) => m.ok), detail: resolvedModules.filter((m) => m.ok).length + '/' + resolvedModules.length + ' moduli risolti; mancanti: ' + (resolvedModules.filter((m) => !m.ok).map((m) => m.name).join(', ') || 'nessuno') },
  { id: 'expo_cli', label: 'Expo CLI locale', ok: fs.existsSync(expoCliPath), detail: fs.existsSync(expoCliPath) ? 'node_modules/.bin/expo presente' : 'Expo CLI locale assente' },
  { id: 'eas_cli', label: 'EAS CLI locale', ok: fs.existsSync(easCliPath), detail: fs.existsSync(easCliPath) ? 'node_modules/.bin/eas presente' : 'EAS CLI locale assente; installare/configurare EAS CLI' },
  { id: 'eas_project', label: 'Project ID EAS reale', ok: typeof projectId === 'string' && uuid.test(projectId), detail: typeof projectId === 'string' && uuid.test(projectId) ? 'formato UUID valido' : 'mancante/non valido; collegare con eas init' },
  { id: 'expo_token', label: 'EXPO_TOKEN disponibile', ok: !!process.env.EXPO_TOKEN?.trim(), detail: process.env.EXPO_TOKEN?.trim() ? 'presente (valore nascosto)' : 'assente; configurare GitHub Actions Secret' },
  { id: 'android_identifier', label: 'Identificatore Android', ok: typeof app.android?.package === 'string' && app.android.package.includes('.'), detail: app.android?.package || 'assente' },
  { id: 'ios_identifier', label: 'Identificatore iOS', ok: typeof app.ios?.bundleIdentifier === 'string' && app.ios.bundleIdentifier.includes('.'), detail: app.ios?.bundleIdentifier || 'assente' },
  { id: 'sqlcipher', label: 'SQLCipher abilitato nella config Expo', ok: sqlitePlugin?.[1]?.useSQLCipher === true, detail: sqlitePlugin?.[1]?.useSQLCipher === true ? 'useSQLCipher=true' : 'configurazione non trovata' },
  { id: 'eas_profiles', label: 'Profili EAS preview e production', ok: !!eas.build?.preview && !!eas.build?.production, detail: [eas.build?.preview ? 'preview' : null, eas.build?.production ? 'production' : null].filter(Boolean).join(', ') || 'assenti' },
];
const report = { schemaVersion: 2, appVersion: pkg.version, generatedAt: new Date().toISOString(), ready: checks.every((c) => c.ok), checks };
console.log('SPIRITO & VERITÀ — REPORT PREREQUISITI REPOSITORY');
for (const c of checks) console.log(`${c.ok ? 'OK' : 'BLOCCO'} | ${c.label} | ${c.detail}`);
console.log(`ESITO: ${report.ready ? 'PRONTO' : 'PREREQUISITI MANCANTI'}`);
if (process.env.READINESS_REPORT_PATH) fs.writeFileSync(path.resolve(process.env.READINESS_REPORT_PATH), JSON.stringify(report, null, 2) + '\n');
if (process.argv.includes('--strict') && !report.ready) process.exitCode = 1;
