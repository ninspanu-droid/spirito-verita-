# V8.4 — Affidabilità del workflow lockfile

## Modifiche

- Aggiunto un gruppo `concurrency` per evitare esecuzioni simultanee che competono sulla branch `automation/validated-npm-lockfile`.
- Il workflow pubblica un riepilogo GitHub Actions con esito, URL della pull request e operazione eseguita.
- Se il lockfile non richiede modifiche, il riepilogo lo segnala senza presentare una pull request come creata.
- La generazione continua a richiedere il superamento di `npm ci`, test, TypeScript ed Expo Doctor prima di proporre il lockfile.
- Versione app/package: `1.0.20`.

## Verifiche locali

Eseguire `node --test tests/*.test.cjs`. I test controllano il contenuto dei workflow e il comportamento dei gate statici; non eseguono GitHub Actions né creano una pull request remota.

## Limiti

Il workflow deve ancora essere eseguito nel repository GitHub reale. La build EAS e il collaudo SQLCipher su dispositivo restano separati e non sono certificati da questi test.
