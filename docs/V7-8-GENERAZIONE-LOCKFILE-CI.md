# V7.8 — Generazione lockfile tramite CI

## Obiettivo

La generazione locale di `package-lock.json` nella V7.7 è terminata per timeout durante l'accesso al registro npm. Questa versione non inserisce un lockfile ricostruito o fittizio: aggiunge un workflow GitHub manuale che usa il registro npm da un runner GitHub e pubblica il lockfile come artifact.

## Procedura

1. Pubblicare il repository su GitHub con questa versione.
2. Aprire **Actions → Generate npm lockfile artifact → Run workflow**.
3. Attendere il completamento del job.
4. Scaricare l'artifact `spirito-verita-package-lock` dalla pagina della run.
5. Inserire `package-lock.json` nella radice del progetto e committarlo.
6. Eseguire `npm ci --no-audit --no-fund`, `npm run verify:lockfile` e `npm run test:all`.
7. Solo dopo il commit del lockfile, riprovare le pipeline di validazione e build.

## Garanzie e limiti

- Il workflow genera un lockfile con npm su GitHub Actions; non modifica automaticamente il repository.
- Il lockfile va revisionato e committato prima di usare `npm ci` nelle pipeline native.
- Le build Android/iOS e il test SQLCipher su dispositivo non vengono eseguiti da questo workflow.
- Il `projectId` EAS e `EXPO_TOKEN` restano prerequisiti distinti.

## Versione

Versione applicazione e package: `1.0.14`.
