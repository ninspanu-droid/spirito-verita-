# V8.1 — Collegamento esplicito del progetto Expo EAS

Versione app: `1.0.17`.

## Perché

La configurazione non contiene un `projectId` EAS. Il valore appartiene al progetto Expo dell'utente e non deve essere inventato o condiviso tra installazioni.

## Procedura consigliata

1. Aprire il progetto corretto nella dashboard Expo e copiare il suo Project ID, oppure eseguire `npx eas-cli@latest login` e `npx eas-cli@latest init` dalla cartella del progetto.
2. Se si dispone già dell'UUID, impostarlo senza modificare manualmente `app.json`:

   ```bash
   npm run set:eas-project -- <PROJECT_ID_UUID>
   ```

3. Verificare:

   ```bash
   npm run check:eas-project
   npm run check:release-readiness
   ```

4. Committare `app.json` dopo aver controllato che il Project ID corrisponda al progetto corretto.
5. Configurare `EXPO_TOKEN` nei GitHub Actions Secrets. Non inserirlo in `app.json`, nel repository o nei log.
6. Prima delle build, generare e revisionare `package-lock.json`, poi committarlo.
7. Avviare manualmente il workflow Android preview.

## Comportamento dello script

- Accetta solo un UUID nel formato previsto.
- Non crea ID casuali e non chiama servizi remoti.
- Rifiuta input non valido senza modificare `app.json`.
- Preserva gli altri campi `expo.extra`.
- Scrive il file tramite un temporaneo e rinomina al termine.

## Limiti

Questa versione prepara il collegamento locale ma non autentica l'utente, non verifica online la proprietà del progetto e non avvia una build. L'ID va confrontato con la dashboard Expo. Nessuna build nativa o prova SQLCipher su dispositivo è stata eseguita in questa consegna.
