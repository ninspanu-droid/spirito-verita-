# SPIRITO & VERITÀ V6.8 — Robustezza della pipeline CI

## Modifiche

- Rimossa la cache npm da `setup-node`: il repository non contiene ancora un lockfile e la cache npm di GitHub Actions richiede un lockfile.
- Aggiunti permessi minimi `contents: read` al workflow.
- Sostituito il grep diagnostico permissivo con un controllo bloccante della configurazione `expo-sqlite` e `useSQLCipher: true` in `app.json`.
- Mantenuti test, TypeScript, Expo Doctor e generazione del progetto Android tramite Expo Prebuild.

## Verifiche eseguite in questa consegna

La suite Node `npm run test:all` viene eseguita localmente. Questo controllo copre test unitari e statici del repository.

## Limiti

- La pipeline GitHub non è stata eseguita da questa consegna.
- `expo prebuild` genera il progetto nativo ma non esegue Gradle e non produce APK/AAB.
- Il controllo `app.json` verifica la configurazione dichiarata, non prova la presenza o l'efficacia di SQLCipher nel binario installato.
- La verifica definitiva richiede build nativa, installazione su dispositivo/emulatore, lettura runtime di `PRAGMA cipher_version`, test con chiave corretta/errata, riavvio e controllo dei dati persistenti.
- Il lockfile è ancora assente: generarlo con un'installazione riuscita e versionarlo prima di passare a `npm ci`.
