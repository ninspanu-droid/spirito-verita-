# SPIRITO & VERITÀ — V9.2

Questa revisione porta la versione app a `1.0.28`.

## Novità

- Verifiche runtime di riferimento per il backup cifrato: round-trip, password errata, file alterato, metadati non supportati, dimensioni non valide e payload non valido.
- Blocco dell'interfaccia durante la conferma del ripristino per evitare avvii concorrenti di import/export.

## Test e limiti

I test crittografici usano `node:crypto` come adapter di riferimento per AES-256-GCM e PBKDF2-HMAC-SHA256. Non equivalgono a una prova dei pacchetti `@noble/*` dentro Expo. Restano da eseguire installazione riproducibile, typecheck, prebuild, build EAS e test su dispositivi Android/iOS.

Per i dettagli consultare `docs/release/V9-2-VERIFICA-CRITTOGRAFICA-BACKUP.md`.
