const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

const sourcePath = path.join(__dirname, '..', 'src', 'diary', 'legacySqliteMigration.ts');
const source = fs.readFileSync(sourcePath, 'utf8');
const start = source.indexOf('export function normalizeLegacySqliteDate');
const end = source.indexOf('\n}\n', start) + 2;
if (start < 0 || end < 2) throw new Error('normalizeLegacySqliteDate non trovata');
const functionSource = source.slice(start, end).replace('export function ', 'function ');
const javascript = ts.transpileModule(functionSource, {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.None },
}).outputText;
const context = { Date, Number, Error };
vm.createContext(context);
vm.runInContext(`${javascript}\nthis.normalizeLegacySqliteDate = normalizeLegacySqliteDate;`, context);
const normalize = context.normalizeLegacySqliteDate;

test('normalizza timestamp SQLite e ISO in UTC', () => {
  const cases = [
    ['2025-03-08 14:30:00', '2025-03-08T14:30:00.000Z'],
    ['2025-03-08T14:30:00', '2025-03-08T14:30:00.000Z'],
    ['2025-03-08T15:30:00+01:00', '2025-03-08T14:30:00.000Z'],
    ['2025-03-08T09:30:00-05:00', '2025-03-08T14:30:00.000Z'],
    ['2024-02-29 12:00:00', '2024-02-29T12:00:00.000Z'],
    ['2025-03-08 14:30:00.125', '2025-03-08T14:30:00.125Z'],
  ];
  for (const [input, expected] of cases) assert.equal(normalize(input), expected, input);
});

test('rifiuta date impossibili e formati ambigui', () => {
  const invalid = [
    '2025-02-29 12:00:00',
    '2025-02-30 12:00:00',
    '2025-03-08 25:00:00',
    '2025-03-08',
    '08/03/2025 14:30',
    '2025-03-08T14:30:00+14:30',
    '',
  ];
  for (const input of invalid) assert.throws(() => normalize(input), undefined, input);
});
