# SPIRITO & VERITÀ V6.3 — Preparazione build nativa SQLCipher

## Stato reale

Questa versione prepara i comandi e una verifica dei prerequisiti. Non contiene una build Android/iOS e non certifica la cifratura su dispositivo. Il controllo automatico verifica la configurazione del progetto, non la presenza effettiva di SQLCipher nel binario installato.

## Controlli eseguiti sul pacchetto

- Suite Node: `npm run test:all`.
- Configurazione `expo-sqlite` con `useSQLCipher: true`.
- `SQLiteProvider` collegato al database protetto e al bootstrap `initializeSecureDatabase`.
- Conservazione della copia SQLite legacy: non viene cancellata automaticamente.

## Preparazione ambiente

1. Installare una versione LTS di Node compatibile con Expo SDK 53.
2. Eseguire `npm install` e conservare il lockfile generato nel repository.
3. Eseguire `npm run check:native-build`.
4. Eseguire `npx expo install --check`, `npx expo-doctor` e `npm run typecheck`.
5. Configurare EAS e le credenziali di firma Apple/Google.
6. Eseguire `npx expo prebuild --clean` solo su una copia di lavoro pulita e controllare le modifiche native.
7. Generare una development build con `npm run build:android:eas` e, su macOS con account Apple configurato, `npm run build:ios:eas`.

## Verifica obbligatoria sul dispositivo

- Confermare che `PRAGMA cipher_version` restituisca una versione non vuota.
- Creare dati di prova, chiudere forzatamente e riaprire l'app; verificare che i dati siano leggibili.
- Verificare che un database cifrato non si apra con una chiave errata e che l'app non generi una nuova chiave sostitutiva.
- Verificare integrità, conteggi e ripristino da backup.
- Ispezionare il file del database esportato in un ambiente di test per confermare che non sia leggibile come SQLite in chiaro.
- Ripetere su Android e iOS.

Non inserire mai chiavi, dati personali o contenuti del diario nei log. Non cancellare la copia legacy in chiaro finché copia cifrata, riapertura, confronto dei record, ripristino e approvazione esplicita non sono stati verificati.
