# SPIRITO & VERITÀ — V10.6.4

## Caricamento corretto su GitHub

Questo archivio è distribuito con i file del progetto direttamente nella radice dello ZIP. Per creare il repository:

1. Crea su GitHub un repository **privato e vuoto** chiamato `spirito-verita`.
2. Estrai tutto il contenuto di questo ZIP.
3. Carica su GitHub **il contenuto di questa cartella**, non una cartella annidata chiamata `spirito_verita_v10_6`.
4. Non caricare `.env`, token, credenziali, `node_modules` o file locali di segreti. Mantieni `.gitignore`.
5. Nel repository apri **Actions → Generate and validate npm lockfile** e avvia il workflow manuale. Il workflow deve creare una Pull Request; verifica e integra la PR solo se i controlli sono verdi.
6. Dopo che `package-lock.json` è stato integrato, configura `EXPO_TOKEN` nei GitHub Actions Secrets e imposta il vero EAS Project ID seguendo `docs/V10-4-CONSEGNA-GITHUB-EAS.md` e `docs/V10-5-CONTROLLO-HANDOFF.md`.
7. Avvia il workflow Android Preview solo dopo che tutti i prerequisiti risultano configurati.

## Verifiche eseguite su questo pacchetto

- `npm run test:all`: **199 test superati, 0 falliti**.
- `npm run check:github-publish`: 2/7 controlli soddisfatti nell'ambiente di preparazione; repository remoto e lockfile non sono presenti.
- `npm run check:handoff`: 9/11 controlli superati; mancano il vero EAS Project ID e `package-lock.json`.
- Archivio sorgente V10.6.3: controllo ZIP senza errori.

I test sono test automatici locali. Non equivalgono a TypeScript, installazione riproducibile, Expo Doctor, prebuild nativo, build EAS, test su dispositivo o certificazione SQLCipher. Queste verifiche non sono state eseguite in questa sessione.

**Versione app:** 1.0.42. Questa revisione migliora la distribuzione del pacchetto e la guida; non dichiara nuove funzionalità dell'app.
