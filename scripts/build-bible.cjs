#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');

const sourceDir = process.argv[2];
const outputFile = process.argv[3] || path.join(process.cwd(), 'data', 'bible.generated.ts');
if (!sourceDir || !fs.existsSync(sourceDir)) {
  throw new Error('Uso: node scripts/build-bible.cjs <cartella-usfm> [file-output]');
}
const files = fs.readdirSync(sourceDir).filter((name) => name.toLowerCase().endsWith('.usfm')).sort();
const clean = (value) => value
  .replace(/\\f\b[\s\S]*?\\f\*/g, ' ')
  .replace(/\\x\b[\s\S]*?\\x\*/g, ' ')
  .replace(/\\w\s+([^|\\]+)\|[^\\]*?\\w\*/g, '$1')
  .replace(/\\[+]?[\w-]+\*?\s*/g, ' ')
  .replace(/[{}]/g, '')
  .replace(/\s+/g, ' ')
  .trim();

const books = [];
for (const file of files) {
  const source = fs.readFileSync(path.join(sourceDir, file), 'utf8').replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n');
  const id = source.match(/^\\id\s+(\S+)/m)?.[1];
  const name = clean(source.match(/^\\toc1\s+(.+)$/m)?.[1] || source.match(/^\\h\s+(.+)$/m)?.[1] || id || file);
  if (!id) throw new Error('USFM senza identificatore \\id: ' + file);
  const chapterRe = /\\c\s+(\d+)\s*/g;
  const chapterMatches = [...source.matchAll(chapterRe)];
  const chapters = [];
  for (let i = 0; i < chapterMatches.length; i++) {
    const match = chapterMatches[i];
    const start = match.index + match[0].length;
    const end = i + 1 < chapterMatches.length ? chapterMatches[i + 1].index : source.length;
    const body = source.slice(start, end);
    const verseRe = /\\v\s+(\d+(?:-\d+)?[a-z]?)\s*/g;
    const verseMatches = [...body.matchAll(verseRe)];
    const verses = [];
    for (let j = 0; j < verseMatches.length; j++) {
      const verse = verseMatches[j];
      const verseStart = verse.index + verse[0].length;
      const verseEnd = j + 1 < verseMatches.length ? verseMatches[j + 1].index : body.length;
      const text = clean(body.slice(verseStart, verseEnd));
      if (text) verses.push({ number: verse[1], text });
    }
    chapters.push({ number: Number(match[1]), verses });
  }
  if (!chapters.length) throw new Error('Nessun capitolo trovato per ' + id);
  books.push({ id, name, chapters });
}
const chapterCount = books.reduce((n, b) => n + b.chapters.length, 0);
const verseCount = books.reduce((n, b) => n + b.chapters.reduce((m, c) => m + c.verses.length, 0), 0);
if (books.length !== 66 || chapterCount !== 1189 || verseCount !== 31102) {
  throw new Error('Conteggi Bibbia inattesi: ' + books.length + ' libri, ' + chapterCount + ' capitoli, ' + verseCount + ' versetti. Build interrotta.');
}
const payload = JSON.stringify(books);
fs.mkdirSync(path.dirname(outputFile), { recursive: true });
fs.writeFileSync(outputFile, '/* Riveduta Bibbia 1927 — Public Domain — source: eBible.org */\nexport default JSON.parse(' + JSON.stringify(payload) + ');\n', 'utf8');
console.log('Bibbia generata: ' + books.length + ' libri, ' + chapterCount + ' capitoli, ' + verseCount + ' versetti (' + fs.statSync(outputFile).size + ' byte).');
