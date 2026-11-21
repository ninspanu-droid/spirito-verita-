# Integrazione Diario — riepilogo

## Modifiche applicate

- Aggiunti `src/diary/` con schermata, tipi, repository SQLite, cifratura, migrazione e adapter AsyncStorage.
- Aggiunta la route `app/diario.tsx` e registrata nello Stack Expo Router.
- Aggiornato Profilo per aprire il nuovo Diario invece di scrivere nuove note nel vecchio campo singolo.
- Aggiunte le dipendenze `expo-secure-store`, `expo-crypto`, `@noble/ciphers` e `base64-js` a `package.json`.

## Vecchia nota

L'adapter corrisponde esattamente a `hooks/useLocalNotes.ts`: legge `spirito-verita:local-notes:v1`. La nota viene importata come riflessione con ID stabile `legacy-local-note-v1`. Il timestamp della migrazione viene memorizzato separatamente per rendere ripetibile il confronto. Nessuna cancellazione automatica della nota legacy.

## Verifiche eseguite

- Archivio ZIP sorgente dell'utente aperto ed elencato; integrità del file originale verificata con `unzip -t`.
- Integrazione dei file e aggiornamento delle route effettuati.
- Il tentativo `npm install --ignore-scripts --no-audit --no-fund` è terminato per timeout.
- `npm run typecheck` non è considerato valido: le dipendenze non erano installate e TypeScript non ha trovato `expo/tsconfig.base`.

## Da fare prima di considerare il Diario pronto

1. Installare dipendenze e controllare compatibilità Expo SDK 53.
2. Eseguire typecheck e build Android/iOS.
3. Testare importazione con nota assente, nota valorizzata, ripetizione e conflitto.
4. Testare perdita/assenza della chiave senza rigenerarla sopra dati cifrati.
5. Testare backup, ripristino e comportamento dopo reinstallazione.
6. Sottoporre la gestione delle chiavi e la cifratura a revisione indipendente.
