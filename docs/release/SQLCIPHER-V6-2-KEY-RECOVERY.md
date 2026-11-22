# V6.2 — Protezione dalla perdita della chiave SQLCipher

## Problema corretto

Nella V6.1, se SecureStore non restituiva la chiave, il bootstrap generava una nuova chiave prima di verificare se il database cifrato esistente fosse già popolato. Su un dispositivo con chiave persa ciò poteva memorizzare una chiave sostitutiva non valida, complicando il recupero.

## Comportamento V6.2

1. Se SecureStore contiene una chiave, ne controlla il formato e la riutilizza.
2. Se la chiave manca, tenta una lettura dello schema SQL senza applicare una chiave.
3. Genera una nuova chiave solo se la destinazione risulta vuota.
4. Se la lettura fallisce o sono presenti tabelle, interrompe l'avvio senza scrivere una nuova chiave.
5. Dopo la scrittura in SecureStore, rilegge il valore e ne confronta esattamente il contenuto.

## Test eseguiti

I test unitari simulano SecureStore e la risposta del probe SQLite. Verificano database nuovo, chiave già presente, chiave assente su database non leggibile, schema non vuoto, formato errato e fallimento di persistenza. Non dimostrano l'integrazione SQLCipher nativa né il comportamento del Keychain/Keystore su dispositivi.

## Limiti aperti

- Nessuna build Android/iOS è stata eseguita in questa revisione.
- Non esiste ancora un flusso di recupero della chiave perso: il comportamento corretto è bloccare l'accesso e non sovrascrivere la chiave.
- La query senza chiave deve essere verificata su build SQLCipher reali per i casi database vuoto e database cifrato già scritto.
- Il database legacy in chiaro resta conservato; non cancellarlo prima di test di backup e ripristino.
