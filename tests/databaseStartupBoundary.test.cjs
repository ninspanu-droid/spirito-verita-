const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const layout = fs.readFileSync(path.join(root, 'app/_layout.tsx'), 'utf8');
const boundary = fs.readFileSync(path.join(root, 'components/DatabaseStartupBoundary.tsx'), 'utf8');

test('root layout protects database initialization with a startup error boundary', () => {
  assert.match(layout, /<DatabaseStartupBoundary>/);
  assert.match(layout, /<SQLiteProvider[\s\S]*onInit=\{initializeSecureDatabase\}/);
  assert.match(layout, /<\/DatabaseStartupBoundary>/);
});

test('database startup failure has a safe user-facing recovery screen', () => {
  assert.match(boundary, /getDerivedStateFromError/);
  assert.match(boundary, /componentDidCatch/);
  assert.match(boundary, /Impossibile avviare l'app/);
  assert.match(boundary, /I tuoi dati non sono stati cancellati/);
  assert.match(boundary, /onPress=\{this\.retry\}/);
  assert.doesNotMatch(boundary, /\{this\.state\.error\.message\}/);
});
