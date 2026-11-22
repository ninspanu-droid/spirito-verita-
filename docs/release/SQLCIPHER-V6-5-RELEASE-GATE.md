# SPIRITO & VERITÀ V6.5 — Gate di rilascio e piano di prova nativa

## Scopo

Questa versione organizza i controlli prima della prima build installabile. Non modifica la chiave, non apre o migra database e non dichiara SQLCipher verificato su dispositivo.

## Gate locale

Dalla cartella del progetto:

```bash
npm install
npm run test:all
npm run typecheck
npm run check:native-build
npx expo-doctor
```

`check:native-build` controlla configurazione SQLCipher, profili EAS, dipendenze, lockfile e disponibilità della CLI EAS. Un esito negativo indica prerequisiti mancanti, non un difetto della cifratura.

## Preparazione build

Dopo che il gate locale è verde e l'account EAS è configurato:

```bash
npx eas-cli login
npx expo prebuild --clean
npx eas-cli build --platform android --profile development
```

Per iOS, avviare la build da un account EAS con credenziali Apple valide:

```bash
npx eas-cli build --platform ios --profile development
```

Non eseguire `prebuild --clean` su una cartella con modifiche native manuali non salvate. Conservare prima eventuali modifiche `android/` e `ios/`.

## Collaudo obbligatorio su dispositivo

1. Installare la development build, non Expo Go.
2. Aprire l'app e controllare che il bootstrap trovi una versione `cipher_version` non vuota.
3. Creare un dato di prova non sensibile, chiudere completamente l'app e riaprirla.
4. Eseguire la diagnostica dalla scheda Profilo; salvare l'esito senza includere dati personali o chiavi nei log.
5. Verificare che `cipher_integrity_check`, `integrity_check` e `foreign_key_check` non segnalino errori.
6. Verificare che l'app rifiuti una chiave assente/errata senza generare una chiave sostitutiva per un database già esistente.
7. Provare un backup e un ripristino in un ambiente di test separato.
8. Ripetere i punti su Android e iOS.

## Criteri di accettazione

- SQLCipher è presente nel binario nativo effettivamente installato.
- I dati di prova persistono dopo riavvio e sono leggibili solo con la chiave corretta.
- Diagnostica e integrità superate su entrambi i sistemi.
- Backup/ripristino verificati.
- La migrazione storica è confrontata e ripristinabile.

La copia SQLite storica in chiaro non deve essere cancellata fino al completamento di tutte le verifiche e all'approvazione esplicita. La chiave conservata in SecureStore/Keychain/Keystore non è di per sé un piano di recupero: occorre definire e testare una procedura di recovery prima della pubblicazione.

## Stato al rilascio di V6.5

I test Node del progetto sono stati eseguiti in questo ambiente. Installazione dipendenze, typecheck, Expo Doctor, EAS prebuild, build native e test su telefono non sono attestati da questo archivio. Non distribuire come release pubblica sulla base dei soli test Node.
