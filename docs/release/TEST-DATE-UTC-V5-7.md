# Verifica timestamp storici — V5.7

## Modifica

`normalizeLegacySqliteDate()` accetta solo timestamp completi nel formato SQLite/ISO:

- `YYYY-MM-DD HH:mm:ss[.frazione]` (UTC implicito, formato SQLite)
- `YYYY-MM-DDTHH:mm:ss[.frazione]` (UTC implicito)
- gli stessi formati con `Z` oppure offset `±HH:MM`

Rifiuta date impossibili (ad esempio 30 febbraio), orari fuori intervallo, offset oltre ±14:00 e stringhe ambigue/non conformi. L'output è sempre ISO UTC. Le righe sorgenti non vengono modificate.

## Casi verificati sul codice della funzione

| Input | Esito atteso |
|---|---|
| `2025-03-08 14:30:00` | `2025-03-08T14:30:00.000Z` |
| `2025-03-08T14:30:00` | `2025-03-08T14:30:00.000Z` |
| `2025-03-08T15:30:00+01:00` | `2025-03-08T14:30:00.000Z` |
| `2025-03-08T09:30:00-05:00` | `2025-03-08T14:30:00.000Z` |
| `2024-02-29 12:00:00` | accettato (anno bisestile) |
| `2025-02-29 12:00:00` | rifiutato |
| `2025-02-30 12:00:00` | rifiutato |
| `2025-03-08 25:00:00` | rifiutato |
| `2025-03-08` | rifiutato (timestamp incompleto) |
| `08/03/2025 14:30` | rifiutato (formato ambiguo) |
| `2025-03-08T14:30:00+14:30` | rifiutato (offset non valido) |

## Limiti della verifica

I casi sopra verificano la funzione di normalizzazione isolata. Non sostituiscono test d'integrazione con SQLite/Expo, test di migrazione interrotta, verifica cifratura su dispositivo o typecheck dell'intero progetto. La migrazione conserva intenzionalmente la tabella storica in chiaro: la rimozione richiede una fase separata con backup verificato e consenso/controllo esplicito.
