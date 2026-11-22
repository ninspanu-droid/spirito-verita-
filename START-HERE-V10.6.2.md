# SPIRITO & VERITÀ — Avvio rapido V10.6.2

Versione applicativa: **1.0.42**.

1. Estrai lo ZIP.
2. Carica in un repository GitHub privato il contenuto della cartella `spirito_verita_v10_6`.
3. In GitHub → Actions, esegui **Generate and validate npm lockfile**. Controlla la pull request generata e integrala solo se tutti i controlli sono verdi.
4. In Expo, inizializza il progetto EAS con `npx eas-cli init` e conserva il Project ID assegnato da Expo.
5. Aggiungi `EXPO_TOKEN` nei Secrets del repository GitHub. Non inserirlo nel codice e non condividerlo in chat.
6. Avvia **Android preview build** da GitHub Actions.

Prima della build, il progetto richiede il repository remoto e il lockfile. Dopo la build, installa l'APK su un dispositivo Android e verifica SQLCipher, migrazione, backup e ripristino.

Report di controllo: `README-V10.6.2.md`.
