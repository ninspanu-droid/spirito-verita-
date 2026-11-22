# V8.7 — Motore di backup cifrato del Diario

## Implementato nel codice

- Formato portabile `spirito-verita-diary-backup`, versione 1.
- Cifratura autenticata AES-256-GCM; nonce casuale da 12 byte e AAD vincolata a formato/versione/KDF.
- Derivazione della chiave da passphrase con PBKDF2-HMAC-SHA256, salt casuale da 16 byte e 600.000 iterazioni.
- Passphrase obbligatoria di almeno 12 caratteri; la chiave SQLCipher e la chiave locale del Diario non vengono esportate.
- Validazione di versione, parametri, dimensioni, tipi, date e ID duplicati.
- Ripristino repository consentito solo in un Diario vuoto; gli elementi vengono cifrati nuovamente con la chiave locale del dispositivo e inseriti in una transazione. Nessuna sovrascrittura o fusione automatica.

## Limiti espliciti

Questa versione aggiunge il motore crittografico e l'API di repository, non ancora l'interfaccia per scegliere/salvare file o inserire la passphrase. Non dichiarare disponibile un backup nell'app finché non sono integrati file system, condivisione/importazione, gestione sicura della passphrase e test end-to-end su dispositivi reali.

Il backup cifrato con passphrase è distinto dalla cifratura SQLCipher del database locale. La passphrase non deve essere registrata, inviata al backend o mostrata nei log. L'utente deve conservarla separatamente: se viene persa, non è possibile decifrare il backup.

## Verifiche richieste prima del rilascio

1. Installare le dipendenze e generare/committare il lockfile reale.
2. Eseguire typecheck, test e Expo Doctor con le dipendenze effettive.
3. Testare round-trip su Android e iOS: crea backup, ripristina su installazione pulita, confronta ID/tipo/titolo/testo/date.
4. Verificare passphrase errata, file alterato, troncato, versione sconosciuta, file eccessivo, archivio vuoto e archivio con ID duplicati.
5. Verificare che un errore durante il ripristino faccia rollback completo.
6. Non eliminare il database originale né le copie legacy dopo l'esportazione; la cancellazione richiede una procedura separata e consenso esplicito.

## Stato

Motore implementato a livello sorgente. Test statici Node non equivalgono a test crittografici runtime, typecheck o collaudo nativo. Nessuna build Android/iOS è dichiarata eseguita.
