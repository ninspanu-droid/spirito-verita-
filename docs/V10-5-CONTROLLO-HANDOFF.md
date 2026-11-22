# V10.5 — Controllo handoff e affidabilità workflow

Versione applicativa: **1.0.41**.

## Correzioni

- Corretto il controllo della presenza di token `EXPO_TOKEN` hardcoded: ora la regex riconosce correttamente assegnazioni come `EXPO_TOKEN="valore"` e non confonde il riferimento sicuro `${{ secrets.EXPO_TOKEN }}` con un token incorporato.
- Esteso il controllo a entrambi i workflow Android e iOS.
- Aggiunto `set -o pipefail` alle fasi Expo Doctor e Expo prebuild nel workflow Android. Senza questa opzione, una pipeline con `tee` può restituire il codice di uscita di `tee` invece di quello del comando verificato.
- Aggiunti test di regressione per questi casi.

## Comandi

```bash
npm run test:all
npm run check:handoff
```

Il secondo comando è un controllo di prerequisiti e può terminare con codice non-zero finché mancano `package-lock.json` o il Project ID EAS. È intenzionale: non vengono creati dati fittizi.

## Stato non verificato in questa sessione

Non è stato eseguito un push a GitHub, un workflow remoto, `npm ci`, Expo Doctor reale, `expo prebuild` o EAS Build. Per questi passaggi servono il repository remoto e le credenziali dell'utente. Non inserire mai `EXPO_TOKEN` nel codice, nei commit o nella chat.
