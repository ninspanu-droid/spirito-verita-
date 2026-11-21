# V9.6 — Generazione lockfile con retry controllati

## Modifica

Il workflow manuale `.github/workflows/generate-lockfile.yml` ora richiama `npm run generate:lockfile`. Lo script `scripts/generate-lockfile-retry.cjs` tenta la generazione fino a tre volte, applica un timeout per tentativo e interrompe il processo con un errore esplicito se tutti i tentativi falliscono.

Variabili configurabili:

- `LOCKFILE_GENERATION_ATTEMPTS`: da 1 a 5, default 3.
- `LOCKFILE_GENERATION_TIMEOUT_MS`: da 1.000 a 600.000 ms, default 360.000.

La generazione usa `npm install --package-lock-only --ignore-scripts --no-audit --no-fund`. Il workflow continua poi con `verify:lockfile`, `check:reproducible-install`, `npm ci`, test automatici, TypeScript e upload dell'artifact; la pull request viene aperta solo se tutti i passaggi riescono.

## Verifiche locali

La suite Node verifica i retry, il fallimento dopo il limite, i parametri e l'ordine dei passaggi del workflow. Questi test non eseguono npm contro il registry e non sostituiscono l'esecuzione GitHub Actions.

## Stato e limiti

Nella sessione V9.6 il tentativo locale di generazione del lockfile è stato interrotto dall'ambiente dopo circa 60 secondi. Non è presente un lockfile validato. Non dichiarare completati `npm ci`, `tsc`, Expo Doctor, prebuild o build EAS. Per completare il passaggio, caricare il progetto nel repository GitHub e avviare manualmente **Generate and validate npm lockfile**; scaricare/revisionare la PR generata prima del merge.
