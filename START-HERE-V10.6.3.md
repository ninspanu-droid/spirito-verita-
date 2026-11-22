# SPIRITO & VERITÀ — Avvio rapido V10.6.3

Versione applicativa: **1.0.42**.

1. Estrai lo ZIP.
2. Carica in un repository GitHub privato il contenuto della cartella `spirito_verita_v10_6` (non la cartella contenitore).
3. In GitHub → Actions, esegui **Generate and validate npm lockfile**. Esamina la pull request e integrala solo se tutti i controlli sono verdi.
4. In Expo, inizializza il progetto EAS con `npx eas-cli init` e usa il Project ID assegnato da Expo.
5. Aggiungi `EXPO_TOKEN` nei Secrets del repository GitHub. Non inserirlo nel codice e non condividerlo in chat.
6. Avvia **Android preview build** da GitHub Actions.

L'APK sarà disponibile solo se la build EAS termina con successo. Dopo la build, installalo su un dispositivo Android e collauda SQLCipher, migrazione, backup e ripristino.

Report: `README-V10.6.3.md`.
