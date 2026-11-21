const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const root = path.resolve(__dirname, '..');
const readJson = (file) => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
const pkg = readJson('package.json');
const app = readJson('app.json').expo;
const eas = readJson('eas.json');
const checks = [];
const add = (label, ok, detail) => checks.push({ label, ok: Boolean(ok), detail });

add('Plugin Expo SQLite con SQLCipher', app.plugins?.some((p) => Array.isArray(p) && p[0] === 'expo-sqlite' && p[1]?.useSQLCipher === true), 'app.json');
add('Profilo EAS development', Boolean(eas.build?.development), 'eas.json');
add('Profilo EAS preview', Boolean(eas.build?.preview), 'eas.json');
add('Profilo EAS production', Boolean(eas.build?.production), 'eas.json');
add('Dipendenze installate', fs.existsSync(path.join(root, 'node_modules')), 'eseguire npm install');
add('Lockfile presente', ['package-lock.json', 'yarn.lock', 'pnpm-lock.yaml'].some((f) => fs.existsSync(path.join(root, f))), 'versionare un lockfile riproducibile');
const easCli = spawnSync('eas', ['--version'], { encoding: 'utf8' });
add('EAS CLI disponibile', easCli.status === 0, easCli.status === 0 ? (easCli.stdout || '').trim() : 'installare/configurare EAS CLI');

for (const c of checks) console.log(`${c.ok ? 'OK' : 'NON PRONTO'}  ${c.label} — ${c.detail}`);
const missing = checks.filter((c) => !c.ok);
console.log(`\nEsito: ${checks.length - missing.length}/${checks.length} prerequisiti soddisfatti.`);
if (missing.length) process.exitCode = 1;
