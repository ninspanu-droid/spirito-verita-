# Prossimo passo tecnico — revisione V5

## Correzioni aggiuntive applicate

- Inizializzazione della chiave del Diario serializzata nel processo JS per evitare due inizializzazioni concorrenti causate da tocchi ravvicinati.
- Verifica di rilettura da SecureStore dopo la creazione della chiave.
- Controllo della lunghezza del nonce GCM (12 byte) e della lunghezza minima del ciphertext/tag prima della decifratura.
- Pulsante di attivazione della protezione disabilitato durante l'operazione.

## Limiti che restano

Queste modifiche riducono alcuni errori applicativi, ma non costituiscono una revisione crittografica indipendente. La serializzazione protegge soltanto le chiamate nello stesso processo; non sostituisce un protocollo di recupero della chiave né la cifratura integrale del database.

## Verifiche da eseguire in ambiente Node/Expo con dipendenze installate

1. `npm ci` (dopo aver aggiunto e verificato un lockfile nel repository).
2. `npm run typecheck`.
3. `npx expo-doctor`.
4. Test unitari AES-GCM: round-trip, nonce alterato, ciphertext alterato, chiave assente, chiave corrotta.
5. Test concorrenza: invocare `initializeDiaryKey()` contemporaneamente e verificare che una sola chiave resti memorizzata.
6. Test migrazione: vuoto, già migrato, ID duplicato, conflitto e errore a metà importazione.
7. Build EAS preview e test su dispositivi iOS/Android.

Non sono stati eseguiti typecheck, bundling, build native o test su dispositivi in questa sessione: il tentativo `npm install` è terminato per timeout.


## Revisione V5.6 — date legacy

- Corretto il parsing di `created_at`: i timestamp SQLite senza fuso vengono trattati come UTC, non come ora locale del dispositivo.
- Le date non valide interrompono la migrazione; non vengono sostituite con la data corrente.
- La tabella storica resta invariata.
- La migrazione rimane idempotente tramite ID deterministici, ma non è una transazione unica: testare l'interruzione a metà e la ripetizione su una copia del database.

Non sono stati eseguiti test Expo/TypeScript o test runtime della migrazione in questa revisione.
