# Rapporto revisione V5.7 — validazione timestamp

## Intervento

La funzione `normalizeLegacySqliteDate()` ora valida rigorosamente data, ora e fuso prima della normalizzazione. I formati supportati sono timestamp SQLite/ISO completi; le date prive di fuso vengono considerate UTC, mentre `Z` e offset espliciti vengono rispettati.

## Test eseguiti

Comando: `npm run test:date-migration`

Esito nel runtime Node disponibile durante la preparazione dell'archivio:

- 2 gruppi di test superati;
- 6 esempi validi verificati, inclusi timestamp SQLite, ISO, offset positivi/negativi, anno bisestile e frazioni di secondo;
- 7 input non validi rifiutati, inclusi date impossibili, orari fuori intervallo, timestamp incompleti, formati ambigui e offset non ammessi.

I test estraggono e compilano la funzione effettiva dal file TypeScript del progetto usando TypeScript e `node:test`; non simulano l'intero database né il processo Expo.

## Non verificato

- Typecheck completo dell'app: non eseguito, perché le dipendenze Expo/React Native non sono installate nell'ambiente di revisione.
- Test d'integrazione della migrazione su SQLite reale: non eseguito.
- Build Android/iOS e prove su dispositivo: non eseguite.
- Cifratura del database SQLite completo: non implementata/verificata in questa fase.

La tabella storica `journal_entries` resta inalterata e in chiaro. La cancellazione delle copie non cifrate non fa parte di questa revisione.
