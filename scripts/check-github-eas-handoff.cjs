#!/usr/bin/env node
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = (name) => fs.readFileSync(path.join(root, name), 'utf8');
const pkg = JSON.parse(read('package.json'));
const app = JSON.parse(read('app.json'));
const eas = JSON.parse(read('eas.json'));
const checks = [];
function check(name, ok, detail) { checks.push({ name, ok: Boolean(ok), detail }); }
const ignore = read('.gitignore');
check('.gitignore protegge .env', ignore.split(/\r?\n/).includes('.env'), 'Il file .env deve restare escluso da Git.');
check('.gitignore protegge node_modules', ignore.split(/\r?\n/).includes('node_modules/'), 'Le dipendenze installate non vanno committate.');
check('nessun EXPO_TOKEN letterale nei file di configurazione', !/EXPO_TOKEN\s*[:=]\s*["'][^"'$][^"']*["']/.test(['app.json','eas.json','package.json','.github/workflows/android-preview-build.yml','.github/workflows/ios-preview-build.yml'].map(read).join('\n')), 'Il token deve essere configurato esclusivamente nei GitHub Secrets.');
check('versioni package ed Expo allineate', pkg.version === app.expo.version, `${pkg.version} / ${app.expo.version}`);
check('identificatore Android presente', typeof app.expo.android?.package === 'string' && app.expo.android.package.includes('.'), app.expo.android?.package || 'assente');
check('identificatore iOS presente', typeof app.expo.ios?.bundleIdentifier === 'string' && app.expo.ios.bundleIdentifier.includes('.'), app.expo.ios?.bundleIdentifier || 'assente');
check('profilo EAS preview genera APK', eas.build?.preview?.android?.buildType === 'apk', eas.build?.preview?.android?.buildType || 'non impostato');
check('workflow lockfile presente', fs.existsSync(path.join(root,'.github/workflows/generate-lockfile.yml')), '.github/workflows/generate-lockfile.yml');
check('workflow Android preview presente', fs.existsSync(path.join(root,'.github/workflows/android-preview-build.yml')), '.github/workflows/android-preview-build.yml');
check('Project ID EAS valorizzato', typeof app.expo.extra?.eas?.projectId === 'string' && /^[0-9a-f-]{36}$/i.test(app.expo.extra.eas.projectId), 'Inserire il vero Project ID tramite eas init / script set:eas-project.');
check('package-lock.json presente', fs.existsSync(path.join(root,'package-lock.json')), 'Generarlo con il workflow GitHub e integrare la PR validata.');
const failed = checks.filter(x => !x.ok);
console.log(`SPIRITO & VERITÀ — GitHub/EAS handoff ${failed.length ? 'INCOMPLETO' : 'PRONTO'}`);
for (const item of checks) console.log(`${item.ok ? 'OK' : 'BLOCCO'}  ${item.name}${item.detail ? ` — ${item.detail}` : ''}`);
console.log(`\n${checks.length-failed.length}/${checks.length} controlli superati.`);
if (failed.length) process.exitCode = 1;
