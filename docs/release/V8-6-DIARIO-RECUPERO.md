# V8.6 — Trasparenza sul recupero del Diario

## Obiettivo

Rendere esplicito nell'app lo stato reale del recupero dei dati personali, evitando che l'utente interpreti la cifratura locale come un backup.

## Modifica visibile

La schermata Diario ora avvisa che:

- non è ancora disponibile un backup cifrato;
- non è ancora disponibile un flusso di recupero/esportazione della chiave;
- la perdita della chiave può rendere irrecuperabili le annotazioni cifrate;
- disinstallazione, cancellazione dei dati o cambio dispositivo non devono essere considerati operazioni ripristinabili automaticamente.

## Stato tecnico verificato dal codice

- La chiave del Diario è conservata in `expo-secure-store` con accessibilità `WHEN_UNLOCKED_THIS_DEVICE_ONLY`.
- Il testo di titolo e corpo viene cifrato con AES-256-GCM prima dell'inserimento nella tabella `diary_entries`.
- Se la chiave manca, la funzione di lettura non ne genera una sostitutiva.
- La tabella storica `journal_entries` può contenere testo in chiaro; la schermata effettua un audit del numero di record e avvisa di non cancellarli prima della migrazione verificata.
- Il database SQLCipher e la chiave SQLCipher sono un livello separato dalla cifratura applicativa del Diario.

## Cosa NON è stato implementato

- Nessun backup cifrato esportabile.
- Nessun ripristino su un nuovo dispositivo.
- Nessuna recovery phrase o derivazione chiave da password.
- Nessuna sincronizzazione end-to-end.
- Nessuna cancellazione automatica delle copie legacy in chiaro.

Non esportare la chiave in log, analytics, clipboard o storage non protetto. Non aggiungere un backup finché non esistono formato versionato, KDF documentata, autenticazione crittografica, test di restore e procedura di rotazione/revoca.

## Collaudo richiesto su dispositivi reali

1. Creare un'annotazione di test e verificare che titolo e corpo non siano leggibili direttamente nella tabella cifrata.
2. Chiudere e riaprire l'app e verificare la decifratura.
3. Simulare l'assenza della chiave su una copia di test del database: l'app deve fallire in modo chiuso e non generare una chiave sostitutiva.
4. Verificare separatamente backup e restore Android/iOS, senza usare dati reali.
5. Verificare che nessuna schermata, notifica o log esponga il contenuto delle annotazioni.
6. Non eliminare il database storico in chiaro prima di backup, confronto record e prova di ripristino approvati.

## Esito della V8.6

Questa versione migliora la trasparenza dell'interfaccia e la documentazione. Non certifica la cifratura nativa SQLCipher, non crea backup e non dimostra un restore su dispositivo.
