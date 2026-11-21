# V5.5 — Migrazione delle annotazioni SQLite storiche

## Cosa fa

`migrateLegacySqliteJournal()` legge le righe della tabella `journal_entries` (colonne `id`, `body`, `created_at`), le copia nel repository del Diario e cifra titolo/testo tramite il servizio crittografico già usato dal repository.

Gli ID di destinazione sono deterministici (`legacy-sqlite-journal-<id>`), quindi una seconda esecuzione riconosce le righe già importate. Se un ID esiste ma il contenuto decifrato è diverso, la migrazione si interrompe senza sovrascrivere.

Dopo la copia, la funzione rilegge e decifra i record e confronta contenuti e date. La schermata Diario espone un'azione esplicita per avviare questa procedura.

## Importante: conservazione della sorgente

La funzione non elimina e non modifica `journal_entries`. Dopo la migrazione riuscita, la vecchia tabella contiene ancora i testi in chiaro. Questa scelta evita cancellazioni premature, ma significa che la privacy non è ancora completa: prima del rilascio occorre pianificare una pulizia controllata, dopo backup verificato e consenso/avviso appropriato, oppure migrare a un archivio SQLCipher e verificare l'intero ciclo di vita del dato.

## Limiti

- Il formato supportato è quello effettivamente definito in `database/database.ts`: `id INTEGER`, `body TEXT`, `created_at TEXT`.
- Le date SQLite `CURRENT_TIMESTAMP` (formato `YYYY-MM-DD HH:MM:SS`) vengono interpretate esplicitamente come UTC, coerentemente con SQLite. Le stringhe ISO con `Z` o offset mantengono il proprio fuso; le date non interpretabili causano un errore e interrompono la migrazione senza cancellare la sorgente.
- La funzione importa anche righe con `body` vuoto, se presenti.
- Non è una prova di cifratura dell'intero database SQLite.
- Non sono stati eseguiti test runtime, typecheck o build Expo in questa revisione.


## Revisione V5.6 — normalizzazione temporale

La funzione `normalizeLegacySqliteDate()` evita che le date generate da `CURRENT_TIMESTAMP` vengano interpretate nel fuso locale del dispositivo. Il risultato viene normalizzato in ISO UTC. Questa correzione non modifica le righe sorgenti.

### Casi da provare prima del rilascio

- `2025-03-08 14:30:00` → `2025-03-08T14:30:00.000Z`
- `2025-03-08T14:30:00` → `2025-03-08T14:30:00.000Z`
- `2025-03-08T14:30:00+01:00` → `2025-03-08T13:30:00.000Z`
- stringa vuota o data impossibile → errore; la tabella legacy resta intatta.

La migrazione non è transazionale nel suo complesso: in caso di interruzione può restare una parte dei record già copiati. Gli ID deterministici consentono di ripetere la procedura e saltare le righe già verificate, ma il comportamento va comunque testato su una copia del database prima di migrare dati reali.
