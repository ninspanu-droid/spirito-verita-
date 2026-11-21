#!/usr/bin/env node
/** Fail-closed check: native CI/builds must use a committed npm lockfile. */
const fs = require('node:fs');
const path = require('node:path');
const root = process.cwd();
const pkgPath = path.join(root, 'package.json');
const lockPath = path.join(root, 'package-lock.json');
function fail(message) { console.error(`INSTALL PREFLIGHT: ${message}`); process.exit(1); }
if (!fs.existsSync(pkgPath)) fail('package.json non trovato.');
if (!fs.existsSync(lockPath)) fail('package-lock.json assente. Generarlo con `npm install --package-lock-only`, verificarlo con `npm run verify:lockfile` e committarlo prima delle build.');
let pkg, lock;
try { pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8')); lock = JSON.parse(fs.readFileSync(lockPath, 'utf8')); }
catch (error) { fail(`Manifesto o lockfile JSON non valido: ${error.message}`); }
if (lock.lockfileVersion !== 3) fail('È richiesto package-lock.json lockfileVersion 3.');
if (lock.name !== pkg.name || lock.version !== pkg.version) fail('package-lock.json non corrisponde a package.json.');
const rootPackage = lock.packages?.[''];
if (!rootPackage) fail('Il lockfile non contiene packages[""] .');
for (const section of ['dependencies', 'devDependencies']) {
  for (const [name, version] of Object.entries(pkg[section] || {})) {
    if (rootPackage[section]?.[name] !== version) fail(`Dipendenza non allineata: ${name}`);
  }
}
console.log('INSTALL PREFLIGHT OK — lockfile npm v3 allineato; usare npm ci.');
