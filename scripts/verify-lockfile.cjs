const fs = require('node:fs');
const path = require('node:path');
const packagePath = path.resolve('package.json');
const lockPath = path.resolve('package-lock.json');
if (!fs.existsSync(packagePath)) throw new Error('package.json non trovato.');
if (!fs.existsSync(lockPath)) {
  console.error('package-lock.json assente. Eseguire npm install in un ambiente con accesso al registro npm.');
  process.exit(1);
}
const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
const lock = JSON.parse(fs.readFileSync(lockPath, 'utf8'));
if (lock.lockfileVersion !== 3) throw new Error('È richiesto package-lock.json lockfileVersion 3.');
if (lock.name !== pkg.name || lock.version !== pkg.version) throw new Error('Il lockfile non corrisponde a package.json.');
const root = lock.packages?.[''];
if (!root) throw new Error('Il lockfile non contiene il pacchetto radice.');
for (const section of ['dependencies', 'devDependencies']) {
  for (const [name, version] of Object.entries(pkg[section] || {})) {
    if (root[section]?.[name] !== version) throw new Error(`Dipendenza non allineata nel lockfile: ${name}`);
  }
}
console.log('Lockfile npm v3 presente e allineato a package.json.');
