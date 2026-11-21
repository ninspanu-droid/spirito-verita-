# V8.3 — Lockfile validato con pull request automatica

## Obiettivo

Ridurre il passaggio manuale tra la generazione di `package-lock.json` e le build native. Il workflow GitHub genera il lockfile, ne verifica l'allineamento, esegue `npm ci`, i test, TypeScript ed Expo Doctor. Solo se tutti i passaggi riescono, apre una pull request dedicata.

## Avvio

1. Pubblicare questo progetto su GitHub.
2. Aprire **Actions → Generate and validate npm lockfile**.
3. Selezionare **Run workflow**.
4. Attendere il completamento di tutti i controlli.
5. Aprire la pull request `chore: add validated npm lockfile`.
6. Revisionare `package-lock.json` e i controlli CI; eseguire il merge solo dopo la revisione.

## Permessi

Il workflow usa `GITHUB_TOKEN` con i soli permessi necessari `contents: write` e `pull-requests: write`, limitati al workflow che crea la proposta. Non modifica direttamente `main`/`master`: apre una branch `automation/validated-npm-lockfile` e una pull request. Le policy dell'organizzazione GitHub possono comunque impedire la creazione automatica della PR; in quel caso resta disponibile l'artifact `spirito-verita-package-lock-validated` da scaricare e revisionare manualmente.

## Limiti

- Il workflow non è stato eseguito su un repository GitHub in questa sessione.
- La pull request viene creata solo quando il workflow remoto termina con successo.
- La build EAS Android/iOS non viene avviata da questo workflow.
- Il `projectId` Expo e il secret `EXPO_TOKEN` restano prerequisiti separati per le build.
- SQLCipher richiede ancora una build nativa e prove su dispositivo; la presenza del plugin in `app.json` non dimostra da sola la cifratura runtime.

## Versione

Applicazione e package: `1.0.19`.
