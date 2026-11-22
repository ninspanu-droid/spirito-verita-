# SPIRITO & VERITÀ V6.6 — Audit dell'ambiente nativo

## Scopo

La V6.6 aggiunge una diagnosi ripetibile dell'ambiente di sviluppo per preparare le build native Android/iOS. Non modifica il comportamento di cifratura e non dichiara una build completata.

## Comandi

```bash
npm install
npm run test:all
npm run check:native-build
npm run diagnose:native
```

Per una build cloud, dopo aver installato e autenticato EAS:

```bash
npx eas-cli@latest login
npx eas-cli@latest build --platform android --profile development
```

La build iOS può essere avviata da EAS anche da altri sistemi, ma per test e diagnostica locale Xcode richiede macOS:

```bash
npx eas-cli@latest build --platform ios --profile development
```

## Cosa controlla la diagnosi

- Node.js e npm;
- presenza di `node_modules` e `package-lock.json`;
- Java;
- variabili Android SDK e `adb`;
- `xcodebuild` su macOS;
- EAS CLI e autenticazione EAS.

I controlli descrivono l'ambiente locale. Un esito positivo non equivale a compilazione riuscita.

## Stato riscontrato durante la preparazione V6.6

- Archivio V6.5 integro.
- Test automatici del progetto: 33 superati, 0 falliti.
- Gate di rilascio: 2 superati, 0 falliti.
- Gate build: 4 prerequisiti su 7 presenti; mancano dipendenze installate, lockfile ed EAS CLI.
- In questo ambiente è disponibile Java; non sono stati rilevati Android SDK/adb, Xcode o EAS CLI.
- L'installazione delle dipendenze non è stata completata in questa sessione.
- Nessuna build Android/iOS è stata eseguita; nessun test SQLCipher su dispositivo è stato effettuato.

## Criteri per dichiarare superata la fase nativa

1. Installazione dipendenze completata e lockfile versionato.
2. Build EAS completata con artefatto installabile.
3. Diagnostica in app conferma `cipher_version` non vuota e test di integrità riusciti.
4. Inserimento di dati di prova, chiusura forzata e riavvio: dati ancora leggibili con la stessa chiave.
5. Verifica che il database non sia leggibile senza chiave e che la chiave non venga rigenerata in caso di perdita.
6. Test separato di backup/ripristino e migrazione; la copia legacy in chiaro non va eliminata prima del superamento e dell'approvazione esplicita.

I test Node e i controlli statici non sostituiscono questi test nativi.
