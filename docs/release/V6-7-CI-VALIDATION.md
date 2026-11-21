# SPIRITO & VERITÀ V6.7 — Validazione automatica in CI

## Scopo

Questa versione aggiunge una pipeline GitHub Actions per eseguire controlli in un ambiente Linux pulito, senza dipendere dagli strumenti mancanti nella macchina di sviluppo locale.

## Pipeline

Ad ogni push su `main`/`master`, pull request e avvio manuale, il workflow:

1. installa Node.js 22;
2. installa le dipendenze npm;
3. esegue `npm run test:all`;
4. esegue `npm run typecheck`;
5. esegue `npx expo-doctor`;
6. genera il progetto Android con `expo prebuild --no-install --clean`.

## Limiti importanti

- Il workflow non esegue `eas build` e non produce un APK/AAB.
- Il prebuild non equivale a una compilazione Gradle né a un test su telefono.
- Un job verde non certifica da solo che il database sia cifrato a riposo.
- La verifica SQLCipher richiede una build nativa installata, controllo runtime di `PRAGMA cipher_version`, apertura con la chiave corretta, rifiuto della chiave errata, riavvio e controllo del database persistente.
- Il workflow usa `npm install` perché nel progetto non è presente un `package-lock.json`. Dopo una prima installazione riproducibile, generare e versionare il lockfile e passare a `npm ci`.
- Il grep finale è solo diagnostico: non viene considerato prova dell'effettiva cifratura.

## Come attivare

1. Caricare il progetto in un repository GitHub.
2. Assicurarsi che il workflow sia presente in `.github/workflows/native-validation.yml`.
3. Eseguire un push o avviare manualmente `Native validation` dalla scheda Actions.
4. Correggere eventuali errori reali riportati dai job.
5. Solo dopo una pipeline verde, configurare EAS e avviare una build Android development.

## Stato di questa consegna

Il file workflow è stato aggiunto al progetto e la suite Node locale è stata eseguita. La pipeline GitHub non è stata eseguita da questa consegna e non si dichiara una build nativa completata.
