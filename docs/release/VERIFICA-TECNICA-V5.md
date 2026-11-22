# Verifica tecnica del pacchetto V5 ricevuto

Data: 17 novembre 2026

## Controlli effettivamente eseguiti

- Archivio `spirito_verita_v5_preparazione_lancio.zip`: estrazione riuscita e test ZIP senza errori.
- Struttura sorgente: verificati `package.json`, `app.json`, `eas.json`, route Expo Router, database SQLite, timer Silenzio e modulo Diario.
- Dipendenze: tentativo `npm install --no-audit --no-fund` terminato per timeout nell'ambiente di lavoro. `node_modules` non è stato completato.
- Di conseguenza: nessun esito dichiarato per TypeScript, Metro bundler, Expo Doctor, build EAS o test su dispositivi.

## Correzioni applicate in questa revisione

- Repository Diario: rimosso l'upsert che poteva sostituire silenziosamente un record con lo stesso ID. Un ID già presente ora genera un conflitto SQLite, che la migrazione può trattare in modo non distruttivo.
- Schermata Diario: il salvataggio è disabilitato finché la chiave protetta non è stata attivata; la funzione di salvataggio ripete il controllo.

## Problemi ancora aperti

1. Il progetto resta su Expo SDK 53. SDK 58 è stabile al 17 novembre 2026, ma l'aggiornamento non è stato applicato perché l'installazione dipendenze non si è conclusa. La migrazione va eseguita seguendo la guida ufficiale e riallineando i pacchetti con `npx expo install --fix`.
2. `app.json` non contiene ancora `ios.bundleIdentifier` né `android.package`: devono essere scelti dal titolare usando un dominio che controlla.
3. Mancano icona e screenshot finali; gli screenshot devono provenire dalla build reale.
4. Diario: cifratura applicativa di titolo/testo; SQLite e metadati restano non cifrati. Non c'è recupero multi-dispositivo della chiave.
5. La cancellazione SQLite non prova la rimozione fisica da WAL, journal o backup.
6. Nessun backend/account/sync/community è implementato nella base verificata.
7. Contenuti biblici e audio: diritti e licenze ancora da acquisire/verificare.

## Prossimi comandi in ambiente con rete e toolchain configurati

```bash
# aggiornare la piattaforma una versione supportata alla volta e seguire le release notes
npm install
npx expo install --fix
npx expo-doctor
npm run typecheck
npx expo export --platform android
npx expo export --platform ios
```

Le due esportazioni verificano il bundling JS, non sostituiscono le build native EAS né i test su dispositivi.

Fonti ufficiali consultate il 17 novembre 2026:
- https://expo.dev/changelog/sdk-58
- https://docs.expo.dev/workflow/upgrading-expo-sdk-walkthrough/
