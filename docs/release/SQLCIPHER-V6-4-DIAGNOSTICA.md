# SPIRITO & VERITÀ V6.4 — Diagnostica locale SQLCipher

## Novità

La schermata Profilo include ora un controllo manuale che interroga:

- `PRAGMA cipher_version` per verificare che il binario esponga SQLCipher;
- `PRAGMA cipher_integrity_check` per la verifica specifica SQLCipher;
- `PRAGMA integrity_check` per l'integrità SQLite;
- `PRAGMA foreign_key_check` per le relazioni dichiarate.

Il controllo non stampa né esporta la chiave. I risultati restano nella schermata locale.

## Limiti e interpretazione

Questo è un controllo diagnostico eseguibile nell'app, non una prova già eseguita su dispositivo. Va lanciato dopo aver installato una development build nativa configurata con `useSQLCipher: true`. Un esito positivo non dimostra da solo la sicurezza di backup, keychain/keystore, migrazione dei dati o protezione contro un dispositivo compromesso.

Il risultato `cipher_integrity_check` viene interpretato come privo di errori se non restituisce righe oppure se tutti i valori restituiti sono `ok`; confermare il comportamento sulla versione SQLCipher effettivamente inclusa nel binario. In caso di anomalia, conservare il database e non cancellare la copia legacy.

## Test

- `npm run test:all` include il controllo statico che la schermata richiami i quattro PRAGMA e non legga né mostri la chiave.
- Eseguire inoltre `npm run typecheck` e `npm run check:native-build` nell'ambiente con dipendenze installate.
- Su Android e iOS, lanciare il controllo dalla scheda Profilo e conservare l'esito senza includere dati personali nei log.
