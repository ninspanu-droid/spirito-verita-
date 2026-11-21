# SPIRITO & VERITÀ — V9.0

V9.0 rafforza il ciclo di vita delle operazioni di backup del Diario.

## Novità

- Azzeramento best-effort dei buffer mutabili della chiave derivata e del testo in chiaro.
- Pulizia dei campi passphrase dopo operazioni di esportazione/importazione, anche in caso di errore.
- Stato UI mantenuto occupato durante il ripristino confermato.
- Versione app `1.0.26`.

## Verifica

Eseguire `npm run test:all`. I test Node sono in parte statici e non certificano la crittografia nativa o il ripristino su dispositivi reali.

## Stato

Il backup è implementato nel codice, ma deve ancora essere collaudato con build native Android/iOS e trasferimento effettivo tra due dispositivi. Il `package-lock.json`, il typecheck e la build non sono dichiarati verificati in questa consegna.
