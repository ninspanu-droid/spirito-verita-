# V7.0 — Preparazione build Android EAS

Questa versione aggiunge un workflow GitHub Actions manuale per richiedere una build Android di anteprima tramite EAS Build.

## Prerequisiti esterni

1. Pubblicare il repository su GitHub.
2. Inizializzare il progetto Expo/EAS una sola volta in locale con `eas init` e committare la configurazione generata (`extra.eas.projectId` in app config, se richiesta dalla CLI).
3. Creare un token da Expo e salvarlo nei GitHub Actions Secrets con il nome `EXPO_TOKEN`.
4. Verificare che il profilo `preview` in `eas.json` sia quello desiderato.

## Avvio

Da GitHub: Actions → Android preview build → Run workflow.

Il workflow installa le dipendenze, esegue i test e richiede a EAS una build Android `preview`. L'esito e il link alla build sono riportati da EAS/GitHub Actions.

## Limiti

- Il workflow non è stato eseguito in questa consegna: richiede repository GitHub, progetto EAS inizializzato e secret `EXPO_TOKEN`.
- L'avvio della build non equivale al collaudo SQLCipher su dispositivo.
- Prima di distribuire l'app, verificare installazione, riavvio, `PRAGMA cipher_version`, integrità, persistenza della chiave e recupero dati su dispositivo reale.
- Il database legacy in chiaro non deve essere cancellato senza copia cifrata verificata, confronto dei record, prova di ripristino e approvazione esplicita.
