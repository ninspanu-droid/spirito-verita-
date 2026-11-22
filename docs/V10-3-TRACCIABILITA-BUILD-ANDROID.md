# SPIRITO & VERITÀ V10.3 — Tracciabilità build Android

Versione applicativa: **1.0.39**.

## Cosa cambia

Il workflow GitHub `Android preview build` ora conserva l'output di `eas build` in `eas-build.log`, usa `set -o pipefail` per non nascondere gli errori, pubblica un riepilogo anche in caso di errore e conserva i log diagnostici per 14 giorni. Prova inoltre a riportare il collegamento alla build EAS nel riepilogo.

Il workflow non scarica né allega automaticamente l'APK: il file installabile resta disponibile nella pagina della build EAS.

## Procedura

1. Caricare il progetto V10.3 nel repository GitHub.
2. Eseguire `Generate and validate npm lockfile` e verificare che completi con successo.
3. Revisionare e integrare la pull request del lockfile.
4. Configurare `EXPO_TOKEN` nei Secrets GitHub. Non inserirlo mai nei file o nei commit.
5. Collegare il progetto al vero progetto Expo e impostare il relativo Project ID con `eas init` o lo script guidato incluso.
6. Avviare manualmente `Android preview build`.
7. Consultare il riepilogo GitHub e la pagina EAS; scaricare l'APK da EAS quando la build è completata.

## Limiti e stato

I test locali verificano struttura e contenuto dei workflow, non eseguono GitHub Actions, EAS o una build nativa. Repository, Project ID EAS e `EXPO_TOKEN` non sono collegati in questo ambiente. SQLCipher deve ancora essere collaudato su un dispositivo Android reale.

## Verifiche locali

```bash
npm run test:all
npm run check:repository-readiness
```
