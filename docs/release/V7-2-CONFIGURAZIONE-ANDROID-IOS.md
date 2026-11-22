# V7.2 — Configurazione release Android/iOS

## Decisione identificatore

Si mantiene `it.spiritoeverita.app` come identificatore tecnico scelto per Android e iOS. La conferma dell'utente vale come scelta progettuale, ma non prova che l'identificatore sia libero o registrato negli account Google Play Console e App Store Connect. Prima della pubblicazione verificare la disponibilità e il controllo dell'identificatore negli account dell'editore.

## Modifiche V7.2

- Versione applicazione allineata a `1.0.12` in `package.json` e `app.json`.
- Aggiunto `npm run check:release-config`: verifica sintassi e corrispondenza degli identificatori, versione, profili EAS e plugin SQLCipher.
- Il preflight è richiamato dalla validazione CI e dalla pipeline Android.
- Aggiunta pipeline manuale iOS Preview tramite EAS.
- Le pipeline richiedono il secret GitHub `EXPO_TOKEN`.

## Avvio

1. Pubblicare il repository su GitHub.
2. Inizializzare/collegare il progetto EAS con `npx eas-cli@latest init` e completare la configurazione interattiva.
3. Aggiungere `EXPO_TOKEN` nei GitHub Actions Secrets.
4. Eseguire manualmente `Android preview build` o `iOS preview build` dalla scheda Actions.
5. Scaricare e installare il build di anteprima sul dispositivo compatibile.

## Verifiche locali

```bash
npm run check:release-config
npm run check:app-identifiers
npm run test:all
```

## Limiti e sicurezza

- Il preflight conferma solo la configurazione del progetto, non l'esistenza di una build nativa.
- Il plugin `useSQLCipher: true` non dimostra che il binario distribuito contenga SQLCipher operativo.
- Eseguire la diagnostica sul dispositivo e provare chiave corretta/errata, riavvio, integrità e ripristino.
- Non cancellare il database storico in chiaro finché copia cifrata, conteggi, lettura con chiave e restore non siano verificati e l'editore non abbia approvato la rimozione.
- L'identificatore scelto non è stato verificato presso gli store.
