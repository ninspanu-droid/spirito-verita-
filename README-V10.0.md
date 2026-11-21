# SPIRITO & VERITÀ — V10.0

Versione applicativa: **1.0.36**.

Questa versione aggiunge il report automatico dei prerequisiti repository per le build native.

## Diagnostica

```bash
npm run check:repository-readiness
```

Il report controlla versione, lockfile, dipendenze installate, project ID EAS, presenza del secret EXPO_TOKEN, identificatori app, configurazione SQLCipher e profili EAS. Non stampa mai il valore del token.

## Test

```bash
npm run test:all
```

I test automatici verificano anche lo script di readiness e il workflow GitHub. Non equivalgono a un build nativo o a un test su dispositivo.

Per la procedura completa: `docs/release/V10-0-REPORT-PREREQUISITI-REPOSITORY.md`.
