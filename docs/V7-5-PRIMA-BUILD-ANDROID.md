# V7.5 — Procedura per la prima build EAS

Questa versione prepara e documenta il primo tentativo di build. Non contiene credenziali e non crea un `projectId` fittizio.

## 1. Prerequisiti

- Account Expo attivo e accesso al progetto locale.
- Repository GitHub collegato.
- Node.js compatibile con il progetto e dipendenze installabili.
- Per le build lanciate da GitHub: secret `EXPO_TOKEN` configurato nelle Actions.

## 2. Collegare il progetto Expo (una sola volta)

Dalla cartella che contiene `app.json`:

```bash
npx eas-cli@latest login
npx eas-cli@latest init
```

Seguire le istruzioni della CLI e verificare che `app.json` contenga il `projectId` assegnato da Expo in `expo.extra.eas.projectId`. Non copiare ID di esempio o di altri progetti.

Verificare il collegamento:

```bash
npx eas-cli@latest project:info
npm run check:eas-project
npm run check:release-readiness
```

I due controlli Node verificano la configurazione locale; `project:info` interroga il progetto Expo autenticato.

## 3. Prima build Android preview

```bash
npm install
npm run test:all
npm run check:release-readiness
npx eas-cli@latest build --platform android --profile preview
```

Per avviare la stessa procedura da GitHub: repository → Actions → **Android preview build** → **Run workflow**. Il secret `EXPO_TOKEN` deve essere disponibile.

## 4. Installazione e collaudo

Quando EAS completa la build, scaricare l'APK dal link fornito da Expo e installarlo su un dispositivo Android di prova. Verificare almeno:

- avvio, navigazione e chiusura/riapertura;
- creazione e rilettura di una nota di diario di prova;
- diagnostica SQLCipher nel profilo;
- riavvio dell'app e persistenza dei dati;
- comportamento in assenza della chiave SecureStore e gestione degli errori;
- migrazione dei dati legacy su una copia di prova, senza cancellare l'originale;
- backup, esportazione e ripristino secondo le procedure previste.

Non usare dati personali reali durante il collaudo iniziale. Non cancellare il database legacy finché migrazione, conteggi e ripristino non sono stati verificati e approvati.

## 5. Build iOS

Dopo aver completato il collegamento EAS e aver verificato la build Android, avviare la workflow **iOS preview build** oppure:

```bash
npx eas-cli@latest build --platform ios --profile preview
```

La distribuzione su dispositivi iOS può richiedere la configurazione delle credenziali Apple Developer in EAS.

## Limiti e stato

- Questa guida non dimostra che una build sia stata eseguita.
- I test Node non eseguono SQLCipher nativo né sostituiscono un test su dispositivo.
- L'identificatore `it.spiritoeverita.app` è configurato nel progetto ma la disponibilità presso gli store non è verificata.
- Prima della pubblicazione servono revisione privacy, licenze dei contenuti, test nativi, test di migrazione/ripristino e configurazione degli account store.
