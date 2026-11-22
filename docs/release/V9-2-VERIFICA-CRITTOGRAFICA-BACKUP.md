# V9.2 — Verifica crittografica del backup e stato UI

Versione app: `1.0.28`.

## Interventi

- Aggiunti test runtime del flusso di backup: round-trip, passphrase errata, ciphertext alterato, parametri non supportati, dimensioni errate e payload autenticato ma semanticamente invalido.
- I test runtime eseguono AES-256-GCM e PBKDF2-HMAC-SHA256 tramite `node:crypto` come adapter compatibile con le API usate dal modulo. **Non** caricano né collaudano direttamente i pacchetti `@noble/*` nell'ambiente Expo.
- Corretto il ciclo di conferma del ripristino: export/import restano disabilitati finché il dialogo è aperto; annullamento o chiusura rilasciano il blocco; la conferma avvia la transazione di ripristino.
- Versione applicazione aggiornata a `1.0.28`.

## Verifiche eseguite

- `npm run test:all` — esito riportato nel collaudo allegato.
- Test crittografici con Node crypto: adapter di riferimento, non sostitutivo del test su dispositivo delle librerie Noble.
- Test UI: controlli statici sul codice e sui callback; non è un test end-to-end React Native.

## Limiti ancora aperti

- Nessuna installazione npm completa / lockfile verificato in questa consegna.
- Nessun typecheck Expo/TypeScript, prebuild nativo, build EAS o collaudo su Android/iOS.
- Il trasferimento reale tra dispositivi e la compatibilità dei pacchetti Noble devono essere provati su build nativa.
- I test con Node crypto verificano il formato e la logica crittografica con un adapter, non l'integrazione runtime del bundle Expo.
