# V9.8 — Controllo compatibilità Expo e prebuild Android

Versione applicativa: **1.0.34**.

## Modifiche

- La pipeline Android preview esegue `npx expo install --check` per rilevare versioni di dipendenze non compatibili con l'SDK Expo dichiarato.
- Esegue `npx expo-doctor` prima di richiedere una build remota.
- Esegue `npx expo prebuild --platform android --no-install --clean` per verificare la generazione del progetto Android e l'applicazione dei config plugin, incluso quello SQLCipher.
- La CI nativa esegue lo stesso controllo di compatibilità SDK.
- I controlli sono ordinati prima della build EAS: un errore interrompe la pipeline.

## Limiti della verifica

Il prebuild genera il progetto nativo ma **non compila** l'applicazione e non dimostra che SQLCipher funzioni a runtime sul dispositivo. La build Android EAS richiede ancora un `package-lock.json` versionato, `npm ci` riuscito, un `projectId` EAS reale e il secret `EXPO_TOKEN` configurato nel repository GitHub.

Questa release non contiene un lockfile inventato e non dichiara eseguiti workflow GitHub o build remote.

## Comandi equivalenti in locale

```bash
npm ci
npx expo install --check
npx expo-doctor
npm run test:all
npm run typecheck
npx expo prebuild --platform android --no-install --clean
```
