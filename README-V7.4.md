# SPIRITO & VERITÀ — V7.4

## Obiettivo
Rafforzare i controlli prima di richiedere una build EAS, senza simulare una build o dichiarare collaudato SQLCipher su dispositivo.

## Novità
- `scripts/check-release-readiness.cjs`: controllo statico di versioni, identificatori Android/iOS, backup Android disabilitato, plugin SQLCipher, profili EAS e projectId EAS UUID reale.
- `npm run check:release-readiness`: comando ripetibile in locale e CI.
- Workflow Android/iOS: nuovo gate di release prima della build.
- Test statici per i requisiti del gate.

## Passi necessari per la build reale
1. Collegare il progetto al proprio account Expo: `npx eas-cli@latest init`.
2. Inserire il `projectId` effettivamente assegnato in `expo.extra.eas.projectId` dentro `app.json`.
3. Configurare `EXPO_TOKEN` nei GitHub Actions Secrets.
4. Eseguire `npm run check:eas-project` e `npm run check:release-readiness`.
5. Avviare il workflow Android Preview da GitHub Actions.
6. Installare l'APK/AAB generato secondo il formato EAS e verificare avvio, migrazione, riapertura del database e persistenza della chiave su un dispositivo reale.

## Limiti dichiarati
- In questo ambiente non sono disponibili credenziali Expo/GitHub né un `projectId` reale: la build non è stata avviata.
- I test Node verificano logica di migrazione e configurazione sorgente; non provano la cifratura del file SQLite in un'app nativa.
- Prima di eliminare qualsiasi database legacy occorrono backup verificato, ripristino provato, conteggi coerenti e approvazione esplicita.
