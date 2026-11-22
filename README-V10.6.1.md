# SPIRITO & VERITÀ V10.6.1 — Correzione pacchetto e verifica

Questa revisione corregge il nome della cartella indicata nella guida di pubblicazione.
La versione applicativa resta **1.0.42**: non sono state modificate funzionalità dell'app.

## Cartella corretta

Dopo aver estratto lo ZIP, la cartella del progetto è `spirito_verita_v10_6`.
Carica su GitHub **il contenuto** di questa cartella, non la cartella contenitore.

## Verifiche ripetute

- Integrità archivio ZIP: superata.
- Suite `npm run test:all`: 196 test superati, 0 falliti.
- `npm run check:github-publish`: 2/7 controlli soddisfatti.

## Prerequisiti ancora esterni

- Repository GitHub creato e collegato.
- `package-lock.json` generato e validato dal workflow dedicato.
- Progetto Expo/EAS inizializzato con il Project ID reale.
- Secret `EXPO_TOKEN` configurato su GitHub Actions.

Questa revisione non è un APK e non certifica il funzionamento nativo di SQLCipher su dispositivo.
