# V7.9 — Lockfile validato tramite CI

## Obiettivo

La V7.8 generava `package-lock.json` su GitHub Actions e lo caricava come artifact dopo il solo controllo strutturale. La V7.9 rafforza il workflow: l'artifact viene pubblicato soltanto dopo che il lockfile è stato usato da `npm ci`, i test automatici sono terminati, TypeScript è stato controllato ed Expo Doctor è terminato correttamente.

## Procedura

1. Pubblicare il progetto su GitHub.
2. Aprire **Actions → Generate and validate npm lockfile → Run workflow**.
3. Attendere il completamento di tutti i passaggi: generazione, verifica, `npm ci`, test, TypeScript ed Expo Doctor.
4. Scaricare l'artifact `spirito-verita-package-lock-validated` soltanto se il workflow è verde.
5. Inserire `package-lock.json` nella radice del progetto, revisionarlo e committarlo manualmente.
6. Dopo il commit, eseguire localmente `npm ci --no-audit --no-fund`, `npm run test:all` e `npm run typecheck`.
7. Solo successivamente riprovare la pipeline nativa e le build EAS.

## Cosa prova e cosa non prova

- Se il workflow termina con successo, dimostra che il lockfile generato è stato accettato da `npm ci` nel runner GitHub e che i controlli software elencati sono passati in quell'ambiente.
- Il workflow non modifica né committa automaticamente il repository.
- Il workflow non produce APK/IPA e non esegue una build nativa.
- Expo Doctor e il prebuild non certificano il comportamento runtime di SQLCipher.
- La cifratura del database, la migrazione dei dati e il ripristino devono ancora essere verificati su dispositivi Android e iOS reali.
- `projectId` EAS e `EXPO_TOKEN` restano prerequisiti separati per le build EAS.

## Versione

Versione applicazione e package: `1.0.15`.
