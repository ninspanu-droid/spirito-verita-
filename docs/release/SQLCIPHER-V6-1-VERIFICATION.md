# V6.1 — Verifica statica e gate per la build nativa

## Scopo
Questa revisione aggiunge controlli automatici statici per impedire regressioni nella configurazione SQLCipher. I controlli leggono i sorgenti e verificano la presenza/ordine delle istruzioni critiche; **non** dimostrano che la libreria nativa sia compilata né che il file su disco sia cifrato.

## Controlli automatizzati

Eseguire:

```bash
npm run test:all
```

I test verificano:
- `expo-sqlite` configurato con `useSQLCipher: true`;
- `SQLiteProvider` collegato al database cifrato e alla funzione di bootstrap;
- verifica di `PRAGMA cipher_version` prima dell'applicazione della chiave;
- assenza di cancellazione automatica del database legacy;
- generazione di una chiave casuale da 32 byte e verifica del salvataggio in SecureStore.

## Gate obbligatorio per Android e iOS

Questi passaggi devono essere eseguiti su macOS/Xcode per iOS e su ambiente Android con toolchain compatibile:

1. Installare le dipendenze del progetto e verificare la compatibilità Expo:
   ```bash
   npm install
   npx expo install --check
   npx expo-doctor
   npx tsc --noEmit
   ```
2. Generare i progetti nativi senza cancellare manualmente dati o sorgenti:
   ```bash
   npx expo prebuild
   ```
3. Creare una development build nativa (Expo Go non è idoneo):
   ```bash
   eas build --profile development --platform android
   eas build --profile development --platform ios
   ```
4. Su ciascun dispositivo, verificare che `PRAGMA cipher_version` restituisca una versione non vuota.
5. Inserire dati di prova, chiudere forzatamente l'app, riavviare e verificare la riapertura con la stessa chiave.
6. Provare database esistente con chiave mancante/errata: l'app deve fermarsi senza sovrascrivere o ricreare silenziosamente il database.
7. Verificare migrazione, conflitti, WAL/SHM, backup e ripristino su copie di prova.

## Limiti ancora aperti

- Non è stato eseguito `npm install`, `expo-doctor`, `tsc`, `expo prebuild` o EAS Build in questa revisione.
- I test automatici locali sono test Node e controlli statici; non sono test del motore SQLCipher nativo.
- Il database legacy `spirito-verita.db` resta in chiaro e non viene cancellato.
- La chiave è locale al dispositivo; non esiste ancora una procedura di recupero multi-dispositivo.
- Prima del rilascio serve una strategia documentata per esportazione/backup cifrato, recupero chiave e perdita del dispositivo.

**Esito:** sorgenti preparati e test statici eseguibili; nessuna certificazione di cifratura nativa o prontezza per gli store.
