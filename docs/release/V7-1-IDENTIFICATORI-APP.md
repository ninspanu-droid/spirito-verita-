# V7.1 — Identificatori applicazione e preflight store

## Modifiche

- Configurato `it.spiritoeverita.app` come identificatore Android e iOS provvisorio.
- Aggiunto `npm run check:app-identifiers` per validare la sintassi degli identificatori e verificare che coincidano.
- Il workflow Android esegue il controllo prima di richiedere la build EAS.
- Aggiornata la versione applicazione a `1.0.11`.

## Attenzione prima della pubblicazione

`it.spiritoeverita.app` è una proposta tecnica provvisoria. La validazione locale controlla soltanto la sintassi: non verifica che l'identificatore sia libero su Google Play o App Store Connect, né che appartenga all'editore. Prima della pubblicazione l'editore deve confermare o sostituire l'identificatore e verificare la disponibilità nei rispettivi account store. Dopo la prima pubblicazione, cambiarlo comporta la creazione di una nuova identità applicativa.

## Verifiche

Eseguire:

```bash
npm run test:all
npm run check:app-identifiers
```

Il controllo degli identificatori non è una build e non prova SQLCipher. La build Android richiede repository GitHub, progetto EAS inizializzato e secret `EXPO_TOKEN`. La cifratura va poi collaudata su un dispositivo reale.
