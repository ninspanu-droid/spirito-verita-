# Verifica privacy e criteri di rilascio — SPIRITO & VERITÀ

## Modifiche incluse in questa revisione

- Android: `allowBackup` è impostato a `false` per evitare che un backup automatico trasferisca il database locale senza la chiave SecureStore, configurata come `WHEN_UNLOCKED_THIS_DEVICE_ONLY`.
- La chiave del Diario non viene rigenerata automaticamente quando manca: le annotazioni cifrate esistenti restano bloccate e richiedono una procedura di recupero, non la creazione di una nuova chiave.
- L'importazione della vecchia nota AsyncStorage è esplicita, ripetibile e non cancella la copia originale per impostazione predefinita.

## Limiti di sicurezza ancora aperti

1. Il database SQLite non è cifrato integralmente. Solo titolo e corpo delle nuove annotazioni nel repository `diary_entries` sono cifrati con AES-256-GCM. Metadati (ID, tipo e date) restano leggibili.
2. La tabella storica `journal_entries` contiene un campo `body` in chiaro nello schema iniziale. Prima del rilascio occorre verificare che non contenga dati reali; se li contiene, pianificare una migrazione specifica e verificata, senza cancellarli automaticamente.
3. La chiave è locale e device-only: non esiste ancora un sistema di recupero, trasferimento sicuro o sincronizzazione cifrata. La perdita della chiave può rendere irrecuperabili le annotazioni.
4. `allowBackup: false` riduce il rischio di trasferimento del database Android, ma non sostituisce un'analisi completa di backup, cache, log, screenshot, crash report e dispositivi compromessi.
5. La vecchia nota AsyncStorage resta in chiaro finché l'utente non autorizza una pulizia successiva alla verifica. La UI non deve promettere cifratura della copia legacy.
6. Non è stata verificata la protezione del database su iOS né il comportamento di backup/restore sui dispositivi reali.

## Test obbligatori prima della beta

- [ ] Installazione pulita Android e iOS.
- [ ] Prima attivazione della chiave e verifica di rilettura SecureStore.
- [ ] Due attivazioni ravvicinate: deve essere persistita una sola chiave valida.
- [ ] Salvataggio, chiusura forzata e riapertura: titolo e corpo devono essere leggibili.
- [ ] Modifica di un byte del ciphertext: la decifratura deve fallire senza mostrare testo parziale.
- [ ] Chiave assente con record presenti: nessuna nuova chiave deve essere creata.
- [ ] Migrazione legacy vuota, migrazione con nota, ripetizione della migrazione e conflitto ID.
- [ ] Interruzione durante la migrazione: le note legacy devono rimanere disponibili e il nuovo stato deve poter essere verificato.
- [ ] Verifica che titoli e corpi non compaiano in log, analytics, notifiche o report di crash.
- [ ] Verifica della tabella storica `journal_entries` e di ogni altro archivio in chiaro.
- [ ] Test di backup/restore Android e iOS.
- [ ] Verifica accessibilità, Dynamic Type, VoiceOver e TalkBack.

## Criteri per autorizzare la pubblicazione

La pubblicazione è bloccata finché non sono disponibili: installazione riproducibile delle dipendenze, controllo TypeScript, build Android e iOS, test su dispositivi reali, revisione della privacy policy da parte del titolare, licenze documentate per testi/audio/immagini e schede store corrette.

## Nota sulla configurazione Android

`android.allowBackup: false` è una scelta conservativa per questa fase, perché il Diario usa una chiave locale non trasferibile. Prima del rilascio il titolare deve approvare l'impatto sulla possibilità di ripristinare i dati dell'app da backup Android.
