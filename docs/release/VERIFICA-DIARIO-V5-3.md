# Revisione Diario V5.3 — audit non distruttivo

## Modifiche

- `hasDiaryKey()` ora verifica che la chiave in SecureStore sia Base64 leggibile e abbia esattamente 32 byte. Una chiave presente ma malformata produce un errore esplicito, non viene trattata come chiave valida.
- Aggiunto `database/privacyAudit.ts` con `auditDiaryStorage(db)`: controlla la presenza delle tabelle `journal_entries` e `diary_entries` e conta le righe della tabella storica senza leggere il contenuto testuale.
- L'audit è intenzionalmente non distruttivo: non migra, non modifica e non cancella dati.

## Procedura prima di un eventuale intervento sui dati storici

1. Eseguire l'audit su una copia di database di prova e su un dispositivo di test.
2. Se `legacyPlaintextEntryCount` è maggiore di zero, predisporre una migrazione dedicata che legga le righe una per una, le cifri nel nuovo repository e verifichi la rilettura/decifratura.
3. Conservare la tabella originale fino a verifica documentata e backup concordato.
4. Solo dopo una release separata e testata valutare la rimozione della tabella storica.

## Verifiche non eseguite

Questa revisione statica non ha eseguito `npm install`, `npm run typecheck`, test automatici, Expo Doctor, bundling, build native o prove su dispositivi. L'audit non è ancora collegato a una schermata o a un comando dell'app: è una funzione pronta per essere invocata dal flusso di manutenzione/test.

Il database SQLite nel suo complesso non è cifrato. L'audit non risolve questo limite e non costituisce una certificazione di sicurezza.
