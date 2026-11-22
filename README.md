# SPIRITO & VERITÀ

Base applicativa mobile di **SPIRITO & VERITÀ — Adorare con tutto il cuore**.

## Stack
- React Native
- Expo SDK 53 / Expo Router
- TypeScript
- SQLite (`expo-sqlite`) per catalogo e archivio locale
- AsyncStorage per la vecchia nota legacy e preferenze non sensibili
- SecureStore + AES-256-GCM (`@noble/ciphers`) per cifrare titolo e testo del nuovo Diario

## Requisiti e avvio

- Node.js LTS e npm
- Expo Go compatibile oppure simulatore Android/iOS

```bash
npm install
npx expo start
```

Comandi disponibili: `npm run android`, `npm run ios` (macOS/Xcode), `npm run web`, `npm run typecheck`.

## Funzioni incluse

- Schede: Oggi, Parola, Preghiera, Adorazione, Profilo
- Catalogo locale di 301 moduli, con ricerca, categorie, preferiti e avanzamento
- Diario spirituale separato, raggiungibile da Profilo
- Tipi di annotazione: preghiera, intenzione, gratitudine, riflessione
- Cifratura AES-256-GCM di titolo e testo; chiave generata su azione esplicita e custodita in SecureStore
- Importazione della vecchia nota testuale AsyncStorage nel nuovo Diario, con verifica tramite rilettura/decifratura

## Importante: migrazione del vecchio diario

La vecchia nota usa la chiave `spirito-verita:local-notes:v1` ed è una singola stringa. La schermata Diario offre **Importa la vecchia nota locale**. Prima occorre attivare la chiave protetta. La migrazione conserva la vecchia copia in AsyncStorage e non la cancella automaticamente. Se la nota è stata modificata dopo un'importazione precedente, il sistema segnala il conflitto invece di sovrascrivere silenziosamente il record importato.

Non disinstallare l'app né cancellare i dati prima di aver verificato l'importazione e predisposto un piano di backup. La chiave è locale al dispositivo: non è implementato recupero multi-dispositivo.

## Limiti e stato

Questa è una base di sviluppo, non una versione pronta per la pubblicazione. Il codice del Diario è stato integrato nei file sorgente e nel routing, ma in questa sessione non è stato possibile completare `npm install`: il tentativo è andato in timeout. Di conseguenza `npm run typecheck`, build Expo e prove su dispositivi non sono ancora validati.

Altri limiti:
- il database SQLite non è cifrato integralmente; titolo e testo del nuovo Diario sono cifrati a livello applicativo, mentre ID, tipo e date restano metadati leggibili;
- la tabella storica `journal_entries` resta nello schema iniziale e non è parte del nuovo repository Diario;
- cancellare una riga SQLite non garantisce la cancellazione fisica immediata da WAL, journal o backup;
- la chiave non ha ancora un flusso di recupero o sincronizzazione;
- servono revisione crittografica, test di migrazione, backup/restore e test su iOS/Android;
- contenuti biblici e audio richiedono verifica delle licenze.

Prima del rilascio eseguire almeno `npm install`, `npm run typecheck`, `npx expo-doctor`, test di migrazione su dati di prova e prove su dispositivi reali.


## Versione 4: interfaccia Oggi e modalità Silenzio
Questa revisione aggiorna la schermata Oggi con accessi rapidi a Percorsi, Silenzio, Diario e Adorazione e aggiunge la schermata `app/silenzio.tsx`. Il timer offre preset da 5, 10, 15, 20 e 30 minuti, avvio/pausa e azzeramento; il conteggio è gestito localmente mentre la schermata è attiva. La schermata include anche tre brevi passaggi guidati.

**Limiti da verificare:** il timer non è una notifica in background e non garantisce il conteggio se l'app viene sospesa o chiusa. La schermata aggiornata è stata integrata nei sorgenti, ma non è stata compilata o testata su dispositivi in questa sessione.

## Preparazione release — V5

- Il timer Silenzio usa una scadenza assoluta e riallinea il residuo quando l'app torna in primo piano; non garantisce notifiche a app chiusa.
- Aggiunto `eas.json` con profili development, preview e production.
- Aggiunti piano di lancio, mappa dati/privacy, piano test e bozza scheda store in `docs/release/`.
- **Blocco pubblicazione:** il progetto ricevuto è ancora Expo SDK 53. Prima dell'invio è necessaria una migrazione controllata a una versione Expo stabile compatibile con i requisiti attuali degli store, poi build/test su dispositivi reali. Consultare `docs/release/PIANO-LANCIO.md`.


## Revisione tecnica del 17 novembre 2026

È stata eseguita una revisione statica dei sorgenti V5 e applicata una correzione al repository Diario: il salvataggio non sostituisce più silenziosamente record che abbiano lo stesso ID. Il pulsante di salvataggio resta disabilitato finché non è stata attivata la chiave protetta. Il tentativo di installazione dipendenze è terminato per timeout; non sono quindi disponibili risultati di typecheck, Expo Doctor, bundling, build native o test su dispositivi. Vedi `docs/release/VERIFICA-TECNICA-V5.md`.

## Revisione aggiuntiva — protezione inizializzazione chiave

La creazione della chiave del Diario è serializzata nel processo JS, verificata rileggendola da SecureStore e il pulsante UI viene disabilitato durante l'attivazione. La decifratura controlla anche dimensione del nonce e del ciphertext. Queste sono difese applicative aggiuntive, non una certificazione crittografica.


## Revisione Diario V5.3 — audit dati storici

`database/privacyAudit.ts` aggiunge `auditDiaryStorage(db)`, una funzione non distruttiva che verifica la presenza della tabella storica `journal_entries` e conta le righe senza leggere il testo. `hasDiaryKey()` verifica anche formato Base64 e lunghezza della chiave SecureStore. Vedi `docs/release/VERIFICA-DIARIO-V5-3.md`. La funzione di audit non è ancora collegata a una schermata o a un comando automatico.

## Revisione V5.9 — gate prima della migrazione SQLCipher

Aggiunto `database/sqlCipherMigrationGate.ts`: un controllo non distruttivo che blocca la rimozione delle copie SQLite in chiaro finché copia cifrata, riapertura con chiave, confronto dei record, ripristino backup e approvazione esplicita non risultano verificati. **Non abilita SQLCipher e non cifra il database corrente.** La conversione del file SQLite richiede ancora una migrazione nativa controllata e test su dispositivi; vedere `docs/release/SQLCIPHER-GATE-V5-9.md`.

## V6.0 — bootstrap SQLCipher (preparazione nativa)

La configurazione `expo-sqlite` abilita `useSQLCipher` e il provider apre un nuovo database `spirito-verita-secure.db`. Il bootstrap verifica `PRAGMA cipher_version`, usa una chiave casuale a 256 bit conservata in SecureStore e migra i dati dal vecchio `spirito-verita.db` senza cancellare la sorgente. È obbligatoria una build nativa personalizzata: SQLCipher non funziona in Expo Go. Questa revisione non è stata ancora compilata o testata su dispositivi; il vecchio database in chiaro resta intenzionalmente presente. Leggere `docs/release/SQLCIPHER-V6-0.md` prima di qualsiasi prova o rilascio.


## V6.2 — comportamento fail-closed della chiave SQLCipher

La risoluzione della chiave è stata separata in `database/sqlCipherKey.ts`. Se SecureStore non contiene la chiave, il bootstrap prova prima a leggere lo schema del database senza chiave: crea una nuova chiave soltanto se il database risulta vuoto. Se la lettura fallisce (caso atteso per un database cifrato esistente senza chiave) oppure sono già presenti tabelle, l'avvio si interrompe senza sovrascrivere la chiave e senza creare una chiave sostitutiva. Sono inclusi test automatici per database nuovo, chiave presente, chiave mancante, schema non vuoto, formato errato e verifica di persistenza. Questi test sono unit test con storage simulato; non sostituiscono una prova SQLCipher nativa su dispositivo.


## V7.7 — installazione riproducibile

Le pipeline richiedono un `package-lock.json` npm v3 allineato e installano con `npm ci`. Il lockfile non è incluso perché la sua generazione è terminata per timeout durante l'accesso al registro npm; consultare `docs/V7-7-INSTALLAZIONE-RIPRODUCIBILE.md`.

## V7.9 — Lockfile validato in CI

Il workflow manuale `Generate and validate npm lockfile` genera il lockfile, esegue `npm ci`, i test Node, il typecheck e Expo Doctor; carica l'artifact solo se tutti questi passaggi hanno esito positivo. Il repository non viene modificato automaticamente: il lockfile scaricato va revisionato e committato manualmente. Questo controllo CI non equivale a una build nativa né a un test SQLCipher su dispositivo. Dettagli in `docs/V7-9-LOCKFILE-VALIDATO-CI.md`.

## V8.0 — Attesa del completamento delle build EAS

I workflow di anteprima Android e iOS restano manuali e ora usano `eas build --wait`, così GitHub Actions attende l'esito della build remota. Per avviarli servono un `projectId` Expo reale, `EXPO_TOKEN` e un `package-lock.json` revisionato e committato. Questa modifica prepara il flusso ma non significa che una build sia già stata eseguita. Vedi `docs/V8-0-PRIMA-BUILD-EAS.md`.

## V8.2 — Preflight build Android/iOS

Prima di avviare una build preview, configura `EXPO_TOKEN` come secret GitHub, collega il progetto Expo con il suo `projectId` reale e committa un `package-lock.json` validato. Le pipeline usano `npm run check:build-inputs` per verificare token presente (senza stamparlo), lockfile e collegamento EAS. Consulta `docs/V8-2-PREFLIGHT-BUILD-INPUTS.md`.


## V8.4 — Affidabilità del workflow lockfile

Il workflow manuale per generare e proporre `package-lock.json` ora serializza le esecuzioni concorrenti e pubblica un riepilogo con l'esito e l'eventuale URL della pull request. Dettagli: `docs/release/V8-4-RIEPILOGO-LOCKFILE-CI.md`.

## V8.6 — Trasparenza sul recupero del Diario

La schermata Diario avvisa che backup cifrato e recupero della chiave non sono ancora disponibili. La perdita della chiave può rendere inaccessibili le annotazioni cifrate. Consultare `docs/release/V8-6-DIARIO-RECUPERO.md` prima di disinstallare, migrare o cancellare dati.

## V8.8 — Backup cifrato del Diario

La schermata Diario ora permette di creare un file di backup cifrato con passphrase e di selezionare un backup da ripristinare su un Diario vuoto. Vedi `docs/release/V8-8-BACKUP-UI.md` per limiti e verifiche richieste.

## V9.3 — preflight crittografia Expo

La V9.3 aggiunge `npm run check:crypto-runtime` per verificare gli export delle dipendenze crittografiche realmente installate, la configurazione SQLCipher e il lockfile. Consultare `README-V9.3.md` e `docs/V9-3-PREFLIGHT-CRITTOGRAFIA-EXPO.md` per lo stato e i limiti del collaudo.


## V9.6

Generazione del lockfile npm con retry e timeout controllati: `npm run generate:lockfile`. Dettagli e limiti in `docs/V9-6-GENERAZIONE-LOCKFILE-ROBUSTA.md`. Il lockfile resta da generare e validare nel workflow GitHub Actions.
