# SPIRITO & VERITÀ V6.9 — Lockfile e dipendenze

## Obiettivo

Preparare un percorso verificabile per ottenere un `package-lock.json` autentico. Non viene incluso un lockfile inventato o ricostruito senza risolvere le dipendenze dal registro npm.

## Procedura

1. In un ambiente con accesso al registro npm, eseguire `npm install --no-audit --no-fund`.
2. Eseguire `npm run verify:lockfile` per verificare versione lockfile, nome/versione progetto e allineamento delle dipendenze dirette.
3. Eseguire `npm ci` per verificare che l'installazione sia riproducibile.
4. Eseguire `npm run test:all`, `npm run typecheck` ed `npx expo-doctor`.
5. La GitHub Action carica `package-lock.json` come artefatto scaricabile della run, in modo da poterlo integrare nel repository e usare poi `npm ci`.

## Limiti di questa consegna

In questa sessione la risoluzione npm è andata in timeout. Perciò il lockfile non è stato generato e non viene dichiarata riuscita l'installazione delle dipendenze. La CI dovrà essere eseguita in GitHub con accesso al registro npm.

La pipeline genera il progetto Android con `expo prebuild`; questo non equivale a una build APK/AAB e non certifica SQLCipher su dispositivo. Il test SQLCipher reale richiede una build nativa installata e prove su dispositivo.
