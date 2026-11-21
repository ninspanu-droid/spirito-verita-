# V8.2 — Preflight degli input per le build

Questa versione aggiunge un controllo unico prima delle build di anteprima Android e iOS.

## Cosa controlla

- presenza di `EXPO_TOKEN` nell'ambiente GitHub Actions; il valore non viene mai stampato;
- presenza e coerenza del `package-lock.json` tramite il controllo già esistente;
- presenza e validità del `projectId` Expo tramite il controllo già esistente.

Le pipeline Android e iOS invocano `npm run check:build-inputs` prima dell'installazione e della build. Il controllo non crea token, project ID o lockfile e non sostituisce la revisione umana dei secret.

## Verifica locale

Su una macchina configurata, con `EXPO_TOKEN` disponibile nell'ambiente:

```bash
npm run check:build-inputs
```

Se il token, il lockfile o il collegamento Expo mancano, il comando termina con errore senza mostrare il valore del token.

## Limiti

Questa modifica prepara il preflight ma non collega da sola un account Expo, non genera un `package-lock.json`, non esegue build EAS e non certifica SQLCipher su un dispositivo. La versione dell'app è stata allineata a `1.0.18`.
