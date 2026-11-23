const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

test('Riveduta 1927 Bible is generated from the public-domain eBible USFM source', () => {
  const importer = fs.readFileSync('scripts/build-bible.cjs', 'utf8');
  const screen = fs.readFileSync('app/(tabs)/parola.tsx', 'utf8');
  const workflow = fs.readFileSync('.github/workflows/android-apk-one-click.yml', 'utf8');
  assert.match(importer, /books\.length !== 66/);
  assert.match(importer, /chapterCount !== 1189/);
  assert.match(importer, /verseCount !== 31102/);
  assert.match(screen, /Riveduta Bibbia 1927/);
  assert.match(screen, /bible\.generated/);
  assert.match(screen, /Cerca una parola o una frase/);
  assert.match(workflow, /https:\/\/ebible\.org\/Scriptures\/ita1927_usfm\.zip/);
  assert.match(workflow, /node scripts\/build-bible\.cjs/);
});
