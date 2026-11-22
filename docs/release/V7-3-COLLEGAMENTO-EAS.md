# V7.3 — Collegamento verificabile a Expo EAS

## Cosa cambia

- Aggiunto `npm run check:eas-project`, un preflight che verifica il `projectId` EAS.
- Il controllo accetta solo un UUID nel campo `expo.extra.eas.projectId` di `app.json`.
- Le pipeline GitHub Android Preview e iOS Preview eseguono il controllo prima di invocare `eas build`.
- Il progetto non contiene un ID fittizio: il collegamento deve essere creato dall'account Expo dell'editore.

## Collegamento richiesto all'editore

1. Aprire il progetto in locale e autenticarsi: `npx eas-cli@latest login`.
2. Dalla cartella del progetto eseguire: `npx eas-cli@latest init`.
3. Completare il collegamento al progetto Expo dell'editore. Il comando assegna un UUID reale.
4. Verificare che `app.json` contenga il campo `expo.extra.eas.projectId` valorizzato con l'UUID restituito da EAS.
5. Eseguire `npm run check:eas-project`.
6. Nel repository GitHub configurare `EXPO_TOKEN` in Settings → Secrets and variables → Actions.
7. Avviare manualmente la pipeline Android Preview o iOS Preview.

## Verifiche

```bash
npm run check:release-config
npm run check:app-identifiers
npm run check:eas-project
npm run test:all
```

Il controllo statico non autentica l'account Expo e non prova che le credenziali abbiano permessi sufficienti. La prima build resta subordinata al collegamento EAS reale, al secret `EXPO_TOKEN` e all'esecuzione delle pipeline.

## Stato

- Identificatore tecnico scelto: `it.spiritoeverita.app` (disponibilità sugli store ancora da verificare).
- EAS projectId: non ancora assegnato in questo archivio.
- Build Android/iOS: non eseguite.
- SQLCipher: configurazione presente, runtime nativo ancora da verificare su dispositivi.
