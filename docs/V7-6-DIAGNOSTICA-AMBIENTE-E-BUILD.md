# V7.6 — Diagnostica ambiente per la prima build

## Obiettivo

Questa versione rende disponibile un comando unico per fotografare i prerequisiti presenti sulla macchina prima di tentare una build EAS. Non effettua login, non legge né stampa token, non genera un `projectId` e non avvia build remote.

## Comando

Dalla cartella del progetto:

```bash
npm run check:environment
```

Il controllo segnala Node/npm, dipendenze installate, lockfile, Java, Android SDK e `adb`, strumenti Xcode (solo macOS), EAS CLI e autenticazione EAS. Un controllo non disponibile viene mostrato come `NON PRONTO`.

## Stato dell'ambiente usato per preparare V7.6

- Node.js: disponibile (v22.16.0).
- npm: disponibile (v10.9.2).
- `node_modules`: assente.
- `package-lock.json`: assente.
- EAS CLI nel PATH: non rilevata.
- `EXPO_TOKEN`: non presente nell'ambiente.

Questi dati descrivono solo l'ambiente di preparazione di questo archivio; non descrivono il computer o l'account Expo dell'utente.

## Passi per l'utente

1. Installare le dipendenze nella propria copia di lavoro con `npm install`.
2. Generare e versionare un lockfile (`package-lock.json`) per rendere riproducibili le installazioni CI.
3. Collegare il progetto al proprio account con `npx eas-cli@latest login` e `npx eas-cli@latest init`.
4. Verificare `expo.extra.eas.projectId` con `npm run check:eas-project`.
5. Eseguire `npm run test:all`, `npm run check:environment` e `npm run check:release-readiness`.
6. Avviare la build Android preview con `npx eas-cli@latest build --platform android --profile preview`.

Per GitHub Actions configurare `EXPO_TOKEN` come secret del repository. Non inserirlo in `app.json`, nel codice o nei commit.

## Limiti

I test automatici di questa versione sono test Node e verifiche statiche. Non è stata eseguita una build Android/iOS, non è stato eseguito `expo prebuild`, non è stato provato SQLCipher su dispositivo e non è stato effettuato un test di ripristino reale. La cifratura nativa resta da verificare in una build personalizzata installata su un dispositivo di prova.
