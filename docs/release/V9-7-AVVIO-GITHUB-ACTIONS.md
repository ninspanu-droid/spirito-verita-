# V9.7 — Avvio della validazione del lockfile su GitHub

Questa procedura serve quando `npm install --package-lock-only` va in timeout nell'ambiente locale.

## Prima di iniziare

- Il progetto deve essere in un repository GitHub.
- Il workflow `.github/workflows/generate-lockfile.yml` deve essere presente nel branch selezionato.
- GitHub Actions deve essere abilitato.
- Per la sola generazione del lockfile non occorre `EXPO_TOKEN`.

## Avvio

1. Aprire la scheda **Actions** del repository.
2. Selezionare **Generate and validate npm lockfile**.
3. Premere **Run workflow**, scegliere il branch che contiene il progetto e confermare.
4. Aprire l'esecuzione e controllare i passaggi in ordine: generazione, verifica struttura, preflight, `npm ci`, test, TypeScript, Expo Doctor.

## Esito positivo

Il workflow carica l'artifact `spirito-verita-package-lock-validated` e crea o aggiorna una pull request sul branch `automation/validated-npm-lockfile`. Esaminare il file e il riepilogo CI prima del merge. Non unire il lockfile se i controlli sono falliti o se il diff contiene modifiche inattese.

## Esito negativo

Aprire il passaggio rosso e leggere il log. Se fallisce la generazione, controllare registry npm e timeout del runner. Se fallisce `npm ci`, verificare compatibilità tra `package.json` e lockfile. Se falliscono TypeScript o Expo Doctor, correggere gli errori prima di avviare una build.

## Passo successivo: Android preview

Dopo il merge del lockfile:

1. In **Settings → Secrets and variables → Actions**, aggiungere `EXPO_TOKEN` come repository secret.
2. Verificare il progetto EAS e il `projectId` configurato, senza inventarne uno.
3. Avviare **Android preview build** da Actions.
4. Considerare riuscita la build solo quando EAS termina con stato completato e rende disponibile l'artefatto.

Il workflow non è stato eseguito in questa sessione: la procedura è documentata e coperta da test statici, non costituisce prova di una build remota.
