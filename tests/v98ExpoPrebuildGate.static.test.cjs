const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const android = fs.readFileSync(path.join(root, '.github/workflows/android-preview-build.yml'), 'utf8');
const native = fs.readFileSync(path.join(root, '.github/workflows/native-validation.yml'), 'utf8');
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const app = JSON.parse(fs.readFileSync(path.join(root, 'app.json'), 'utf8'));

test('versione V9.8 sincronizzata tra package ed Expo', () => {
  assert.equal(pkg.version, '1.0.42');
  assert.equal(app.expo.version, '1.0.42');
});

test('Android preview verifica compatibilità SDK e Expo Doctor prima della build', () => {
  assert.match(android, /expo install --check/);
  assert.match(android, /npx expo-doctor/);
  assert.ok(android.indexOf('expo install --check') < android.indexOf('eas build --platform android'));
  assert.ok(android.indexOf('npx expo-doctor') < android.indexOf('eas build --platform android'));
});

test('Android preview genera il progetto nativo prima di inviare la build EAS', () => {
  assert.match(android, /expo prebuild --platform android --no-install --clean/);
  assert.ok(android.indexOf('expo prebuild --platform android') < android.indexOf('eas build --platform android'));
});

test('CI nativa controlla la compatibilità delle dipendenze Expo prima dei test', () => {
  assert.match(native, /expo install --check/);
  assert.ok(native.indexOf('expo install --check') < native.indexOf('npm run test:all'));
});
