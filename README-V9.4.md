# SPIRITO & VERITÀ — V9.4

Versione applicativa: **1.0.30**.

La V9.4 aggiunge `npm run diagnose:dependencies`, una diagnosi locale di sola lettura per Node/npm, lockfile, `node_modules`, moduli crittografici richiesti e strumenti Android/EAS. Non installa pacchetti e non avvia build.

## Verifiche effettuate in questa sessione

- `npm run test:all`: **143 test superati**.
- Archivio ZIP: controllo integrità completato senza errori.
- `npm install --ignore-scripts --no-audit --no-fund`: terminato per timeout; nessuna installazione completa confermata.
- `node_modules` e `package-lock.json`: assenti al termine della verifica.
- Le librerie Noble, Expo Crypto e Expo SQLite non sono state quindi verificate caricandole dall'installazione reale.
- Non è stata eseguita una build Android/iOS. L'ambiente non dispone dei comandi `adb`, `eas` ed `expo` globali; la presenza di Java da sola non basta.

## Comandi per il prossimo ambiente

```bash
npm run diagnose:dependencies
npm ci --no-audit --no-fund
npm run verify:lockfile
npm run check:crypto-runtime
npm run test:all
npm run typecheck
npx expo-doctor
npx expo prebuild --platform android --no-install
```

La build nativa e il test SQLCipher su dispositivo restano obbligatori prima di dichiarare il diario protetto in produzione.
