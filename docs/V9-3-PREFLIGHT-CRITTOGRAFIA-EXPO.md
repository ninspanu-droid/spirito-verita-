# V9.3 — Preflight crittografia Expo

## Obiettivo
Aggiungere un controllo eseguibile che distingua le dipendenze crittografiche dichiarate in `package.json` dalle librerie realmente installate e caricabili nell'ambiente Node/Metro locale.

## Controlli introdotti
- Risoluzione e caricamento dei moduli `@noble/ciphers/aes`, `@noble/hashes/pbkdf2`, `@noble/hashes/sha2`, `@noble/ciphers/utils`, `base64-js` ed `expo-crypto`.
- Verifica degli export effettivamente usati da `src/diary/diaryBackup.ts`.
- Verifica che `expo-sqlite` sia configurato con `useSQLCipher: true`.
- Verifica della presenza del lockfile npm.
- Nuovo comando: `npm run check:crypto-runtime`.

## Esito in questo ambiente di sviluppo
L'installazione `npm install --ignore-scripts --no-audit --no-fund` non è terminata entro il limite di esecuzione disponibile. Di conseguenza `node_modules` e `package-lock.json` non sono stati prodotti e il preflight delle librerie reali resta intenzionalmente in stato NON PRONTO. Non è stato possibile confermare il caricamento runtime delle librerie Noble in Expo.

## Test
La suite `npm run test:all` controlla il comportamento del nuovo preflight e i test di backup esistenti. I test crittografici runtime già presenti usano un adapter Node.js basato su `node:crypto`: non equivalgono a un test delle implementazioni Noble installate.

## Fuori ambito / ancora da eseguire
- Installazione riuscita e lockfile verificato.
- `npm run typecheck` con dipendenze installate.
- `npx expo-doctor` e `npx expo prebuild`.
- Build custom Android/iOS con SQLCipher.
- Test su dispositivi reali: creazione, trasferimento, ripristino, passphrase errata, file alterato e perdita/recupero della chiave locale.

La build di rilascio non è autorizzata finché i controlli sopra non sono completati.
