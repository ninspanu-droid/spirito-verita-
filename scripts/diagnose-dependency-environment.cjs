#!/usr/bin/env node
/** Read-only diagnostic for the local dependency and native-build prerequisites. */
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { createRequire } = require('node:module');
const root = path.resolve(__dirname, '..');
const req = createRequire(path.join(root, 'package.json'));
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));

function commandVersion(command, args = ['--version']) {
  const result = spawnSync(command, args, { encoding: 'utf8', timeout: 8000, windowsHide: true });
  if (result.error) return `non disponibile (${result.error.code || result.error.message})`;
  if (result.status !== 0) return `presente ma non operativo (exit ${result.status})`;
  return (result.stdout || result.stderr || 'disponibile').trim().split(/\r?\n/)[0];
}
function moduleStatus(name) {
  try { return `disponibile (${req.resolve(name)})`; }
  catch (error) { return `assente (${error.code || 'non risolto'})`; }
}
const lockPath = path.join(root, 'package-lock.json');
const nodeModules = path.join(root, 'node_modules');
console.log(`SPIRITO & VERITÀ ${pkg.version} — diagnosi ambiente`);
console.log(`Node: ${process.version}`);
console.log(`npm: ${commandVersion('npm')}`);
console.log(`package-lock.json: ${fs.existsSync(lockPath) ? 'presente' : 'ASSENTE'}`);
console.log(`node_modules: ${fs.existsSync(nodeModules) ? 'presente' : 'ASSENTE'}`);
for (const name of ['@noble/ciphers/aes', '@noble/hashes/pbkdf2', '@noble/hashes/sha2', 'base64-js', 'expo-crypto', 'expo-sqlite']) {
  console.log(`${name}: ${moduleStatus(name)}`);
}
for (const [name, args] of [['java', ['-version']], ['adb', ['version']], ['eas', ['--version']], ['expo', ['--version']]]) {
  console.log(`${name}: ${commandVersion(name, args)}`);
}
console.log('Nota: questa diagnosi è di sola lettura; non installa dipendenze, non genera credenziali e non avvia build.');
