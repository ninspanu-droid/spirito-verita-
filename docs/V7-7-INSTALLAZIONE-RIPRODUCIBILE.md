# V7.7 — Installazione riproducibile e gate CI

## Obiettivo

Le pipeline Android, iOS e di validazione non devono risolvere dipendenze diverse a ogni esecuzione. V7.7 richiede un `package-lock.json` npm v3 allineato a `package.json` e usa `npm ci`.

## Stato di questo archivio

In questa preparazione non è stato possibile generare il lockfile: il tentativo `npm install --package-lock-only --ignore-scripts --no-audit --no-fund` è terminato per timeout durante l'accesso al registro npm. **Non è stato creato né incluso un lockfile inventato.** Di conseguenza il nuovo gate blocca correttamente le pipeline finché il lockfile non viene generato e committato.

## Passi da eseguire in un ambiente con accesso al registro npm

```bash
npm install --package-lock-only --ignore-scripts --no-audit --no-fund
npm run verify:lockfile
npm run check:reproducible-install
git add package-lock.json
git commit -m "chore: add reproducible npm lockfile"
npm ci
npm run test:all
npm run typecheck
```

Dopo il commit, le pipeline GitHub useranno `npm ci`. Le build EAS continueranno a richiedere un `projectId` reale e il secret `EXPO_TOKEN`.

## Limiti

Questa versione non contiene un APK/AAB o un IPA. Non è stata eseguita una build nativa e non certifica SQLCipher runtime. La cifratura va verificata con una build custom e test su dispositivo, inclusi migrazione, riapertura e ripristino.
