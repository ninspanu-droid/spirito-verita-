# V5.9 — Gate di sicurezza per la futura migrazione SQLCipher

## Esito di questa revisione

È stato aggiunto `database/sqlCipherMigrationGate.ts`, un controllo puramente decisionale che impedisce di autorizzare la rimozione delle vecchie righe SQLite in chiaro finché non risultano vere tutte le condizioni richieste:

1. copia cifrata creata;
2. copia cifrata riaperta con la chiave prevista;
3. conteggi dei record confrontati e coincidenti;
4. prova di ripristino da backup superata;
5. approvazione esplicita alla rimozione della copia in chiaro.

Il gate controlla anche che il conteggio delle righe sia un intero sicuro non negativo.

## Limite essenziale

**Questa revisione NON abilita SQLCipher e NON cifra il file SQLite esistente.** Non è stato modificato `SQLiteProvider`, non è stato attivato `useSQLCipher` e non è stata eseguita alcuna conversione del database. È intenzionale: attivare SQLCipher su un database preesistente in chiaro senza una migrazione controllata potrebbe renderlo illeggibile o causare perdita di dati.

## Procedura richiesta prima di abilitare SQLCipher

- Creare un backup verificabile del database corrente.
- Definire il ciclo di vita della chiave SQLCipher in SecureStore e il comportamento in caso di chiave mancante/perdita del dispositivo.
- In una build nativa con SQLCipher, creare un nuovo database cifrato e trasferire lo schema e i dati con una procedura supportata dalla versione Expo/SQLite effettivamente installata.
- Chiudere e riaprire il database cifrato usando la chiave conservata in SecureStore.
- Confrontare tabelle, conteggi e campioni verificati; testare anche migrazioni, indici, foreign key e WAL.
- Eseguire un ripristino completo da backup su un'installazione pulita.
- Solo dopo tutte le prove, ottenere approvazione esplicita e valutare la rimozione della copia in chiaro e dei relativi file temporanei/backup secondo una strategia documentata.
- Testare su dispositivi Android e iOS reali e con reinstallazione/aggiornamento.

La cancellazione di righe o tabelle SQLite non garantisce da sola la cancellazione fisica di pagine, WAL, journal o backup.

## Test eseguiti in questa revisione

`node --test tests/sqlCipherMigrationGate.test.cjs`: 8 casi. I test esercitano il gate logico in Node; non sono test crittografici, non usano SQLCipher e non sostituiscono test d'integrazione su SQLite/Expo o dispositivi.
