const os = require('node:os');
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const root = path.resolve(__dirname, '..');
const isWin = process.platform === 'win32';
const isMac = process.platform === 'darwin';
const command = (name, args = ['--version']) => {
  const result = spawnSync(name, args, { encoding: 'utf8', timeout: 10000 });
  return result.status === 0 ? (result.stdout || result.stderr || '').trim().split(/\r?\n/)[0] : null;
};
const checks = [];
const add = (label, ok, detail) => checks.push({ label, ok: Boolean(ok), detail });

add('Node.js', Boolean(command('node')), command('node') || 'non disponibile');
add('npm', Boolean(command('npm')), command('npm') || 'non disponibile');
add('Dipendenze del progetto', fs.existsSync(path.join(root, 'node_modules')), 'node_modules');
add('Lockfile npm', fs.existsSync(path.join(root, 'package-lock.json')), 'package-lock.json');
add('Java', Boolean(command('java')), command('java') || 'non disponibile');
add('Android SDK', Boolean(process.env.ANDROID_HOME || process.env.ANDROID_SDK_ROOT), process.env.ANDROID_HOME || process.env.ANDROID_SDK_ROOT || 'ANDROID_HOME / ANDROID_SDK_ROOT non impostata');
add('Android platform-tools (adb)', Boolean(command(isWin ? 'where' : 'which', ['adb'])) || Boolean(command('adb')), command('adb') || 'adb non disponibile nel PATH');
add('Xcode command line tools', isMac && Boolean(command('xcodebuild', ['-version'])), isMac ? (command('xcodebuild', ['-version']) || 'xcodebuild non disponibile') : 'richiede macOS');
add('EAS CLI', Boolean(command('eas')), command('eas') || 'installare EAS CLI');
add('Autenticazione EAS', Boolean(command('eas', ['whoami'])), command('eas', ['whoami']) || 'eseguire eas login');

console.log(`Sistema: ${os.platform()} ${os.release()} (${os.arch()})`);
for (const item of checks) console.log(`${item.ok ? 'OK' : 'NON PRONTO'}  ${item.label} — ${item.detail}`);
const missing = checks.filter((item) => !item.ok);
console.log(`\nEsito ambiente: ${checks.length - missing.length}/${checks.length} controlli disponibili.`);
console.log('Nota: questi controlli non eseguono una build e non certificano SQLCipher su dispositivo.');
if (missing.length) process.exitCode = 1;
