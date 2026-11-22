# Piano test manuale e di accettazione

| Area | Scenario | Esito richiesto |
|---|---|---|
| Avvio | Installazione pulita e primo avvio | Nessun crash, database inizializzato |
| Catalogo | Cerca, filtra, preferiti, completa modulo | Risultati coerenti e persistenti dopo riavvio |
| Diario | Attiva chiave e salva testo | Dati recuperabili e testo non in chiaro nella tabella |
| Diario | Chiave assente con record esistenti | Nessuna rigenerazione automatica; messaggio non distruttivo |
| Diario | Migrazione nota legacy | Importazione verificata, copia legacy conservata |
| Diario | Ripeti migrazione | Nessun duplicato né sovrascrittura silenziosa |
| Diario | Conflitto stesso ID con contenuto diverso | Errore esplicito; nessuna perdita dati |
| Silenzio | Avvia, pausa, riprendi, reset | Residuo corretto |
| Silenzio | App in background e ritorno | Residuo ricalcolato dall'orologio assoluto |
| Accessibilità | VoiceOver/TalkBack e font grandi | Controlli leggibili e raggiungibili |
| Privacy | Log, notifiche, backup, analytics | Nessun contenuto sensibile esposto senza scelta informata |
| Aggiornamento | Aggiorna da versione precedente | Dati mantenuti e migrazione idempotente |

Registrare per ogni test: versione build, dispositivo, OS, passaggi, risultato, screenshot/log senza dati personali e issue associata.
