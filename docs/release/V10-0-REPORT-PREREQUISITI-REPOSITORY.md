# V10.0 — Report dei prerequisiti repository

Versione applicativa: **1.0.36**.

## Obiettivo

Questa versione aggiunge una diagnosi leggibile dei prerequisiti necessari prima di tentare una build nativa. Il controllo è in sola lettura: non installa dipendenze, non crea un progetto EAS e non avvia build.

## Controlli

- allineamento versione `package.json` / `app.json`;
- presenza e coerenza di `package-lock.json` npm v3;
- presenza di `node_modules` nell'ambiente che esegue il controllo;
- formato UUID del project ID EAS;
- presenza di `EXPO_TOKEN` senza stamparne il contenuto;
- identificatori Android e iOS;
- opzione SQLCipher nel config plugin Expo;
- profili EAS `preview` e `production`.

## Uso locale

```bash
npm run check:repository-readiness
```

Per far terminare il comando con errore quando manca almeno un prerequisito:

```bash
node scripts/check-repository-readiness.cjs --strict
```

Per salvare anche il report JSON:

```bash
READINESS_REPORT_PATH=repository-readiness.json npm run check:repository-readiness
```

## GitHub Actions

Dopo aver caricato il repository, aprire **Actions → Repository readiness report → Run workflow**. Il job produce un riepilogo e un artifact JSON; il token, se configurato come secret `EXPO_TOKEN`, viene controllato solo come presenza e non viene scritto nel report.

## Limiti

Il report non può verificare che il token sia autorizzato su EAS, che il project ID appartenga all'account corretto, né che la build remota riesca. Non sostituisce `npm ci`, Expo Doctor, `expo prebuild`, la build EAS o il collaudo SQLCipher su dispositivo. Se il lockfile manca, il passaggio successivo resta il workflow **Generate and validate npm lockfile**.
