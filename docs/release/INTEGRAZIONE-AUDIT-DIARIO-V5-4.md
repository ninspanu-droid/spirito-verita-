# V5.4 — Integrazione audit Diario

## Modifica

La schermata `app/diario.tsx` usa `DiaryScreen`. La schermata ora richiama `auditDiaryStorage()` dopo l'inizializzazione del repository e mostra un riepilogo non distruttivo dei dati locali: presenza della tabella storica `journal_entries`, numero di righe presenti e presenza della tabella cifrata `diary_entries`.

## Garanzie e limiti

- L'audit usa solo `sqlite_master` e `COUNT(*)`: non legge il contenuto delle annotazioni.
- Non modifica, migra o cancella dati.
- Se vengono rilevate righe nella tabella storica, la schermata mostra un avviso e invita a non eliminarle prima di una migrazione verificata.
- La presenza della tabella `diary_entries` non dimostra da sola che tutte le righe siano decifrabili o che la chiave sia recuperabile.
- La cifratura riguarda i campi titolo e testo del Diario; il database SQLite completo non risulta cifrato da SQLCipher in questa versione.

## Verifiche eseguite in questa revisione

- Controllo del contenuto dell'archivio sorgente e lettura dei file coinvolti.
- Modifica della schermata per rendere visibile l'esito dell'audit.
- Controllo di integrità dell'archivio ZIP prodotto.

## Verifiche non eseguite

Non è stata eseguita una build Expo, un typecheck completo, test su dispositivo o test con un database reale. Non dichiarare questa revisione pronta per la pubblicazione.
