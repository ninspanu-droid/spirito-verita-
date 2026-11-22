# V6.0 — Attivazione SQLCipher e migrazione verso un nuovo database

## Modifiche nei sorgenti

- Attivato il config plugin `expo-sqlite` con `useSQLCipher: true` in `app.json`.
- `SQLiteProvider` ora apre `spirito-verita-secure.db` e usa `initializeSecureDatabase`.
- Prima di qualunque query applicativa il bootstrap controlla `PRAGMA cipher_version`, recupera/genera una chiave casuale di 32 byte, la conserva in `expo-secure-store`, applica `PRAGMA key` e forza una lettura dello schema.
- Il nuovo database viene inizializzato senza seed, importa in transazione moduli, preferiti, progressi e annotazioni dal vecchio `spirito-verita.db`, verifica i record e solo dopo aggiunge gli elementi seed mancanti.
- Il vecchio database non viene cancellato né modificato. La migrazione è ripetibile con `INSERT OR IGNORE` e controlli di contenuto; conflitti bloccano l'avvio invece di sovrascrivere i dati.

## Limiti e blocchi prima del rilascio

1. Questa modifica abilita SQLCipher nella configurazione del progetto, ma **non dimostra che la libreria nativa sia stata compilata**. Occorre `npx expo prebuild` e una build development/production nativa; Expo Go non supporta SQLCipher.
2. Al primo avvio, se `cipher_version` non è disponibile, il bootstrap si interrompe intenzionalmente. Non usare il database come se fosse cifrato.
3. La chiave è legata al dispositivo tramite SecureStore. Non esiste ancora recupero multi-dispositivo: perdita della chiave significa perdita di accesso al database cifrato. Prima del lancio va progettato un recovery consapevole e verificato.
4. Il database precedente resta in chiaro. Non cancellarlo manualmente. La sua rimozione richiede backup verificato, test restore, controllo record e approvazione esplicita, non inclusi in questo bootstrap.
5. Verificare API e comportamento di `expo-sqlite` 15.2.14 su build native iOS/Android, in particolare `PRAGMA cipher_version`, formato della chiave, migrazione di WAL e riapertura dopo force-quit.
6. La cifratura SQLCipher protegge il file del database a riposo, ma non sostituisce la cifratura end-to-end dei dati sincronizzati né la protezione dei backup esportati.
7. La migrazione copia `journal_entries` nel database cifrato; la vecchia tabella rimane in chiaro fino a una procedura di rimozione separata.

## Verifiche da eseguire su dispositivi

- Build nativa con plugin SQLCipher attivo (non Expo Go).
- Verificare che `PRAGMA cipher_version` restituisca una versione.
- Scrivere dati, chiudere forzatamente l'app e riaprirla con la stessa chiave.
- Provare chiave errata/mancante: l'app deve fallire chiusa senza creare un database vuoto sostitutivo.
- Migrare database legacy con tutte le tabelle e confrontare contenuti e conteggi.
- Interrompere e ripetere la migrazione; verificare idempotenza.
- Provare conflitti ID con contenuti diversi; il bootstrap deve bloccarsi e preservare entrambe le copie.
- Ripristinare da backup cifrato e verificare che la chiave consenta la riapertura.
- Controllare file principale, `-wal`, `-shm`, journal e backup; non assumere che cancellare una riga rimuova fisicamente i byte.

## Stato

Modifiche sorgente preparate. Non sono stati eseguiti installazione dipendenze, typecheck, prebuild, build native o test su dispositivi in questa revisione. Non è una release pronta per gli store.
