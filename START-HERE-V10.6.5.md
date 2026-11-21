# Inizia da qui — V10.6.5

1. Estrai lo ZIP.
2. Crea un repository GitHub privato (ad esempio `spirito-verita`).
3. Carica **tutti i contenuti** estratti direttamente nella radice del repository.
4. In GitHub apri **Actions**.
5. Seleziona **Generate and validate npm lockfile** e premi **Run workflow**.
6. Se il workflow termina correttamente, revisiona e integra la pull request `automation/validated-npm-lockfile`.
7. Solo dopo, configura il vero Project ID EAS e il secret `EXPO_TOKEN` in GitHub Actions.
8. Avvia il workflow Android preview per richiedere la build APK.

Non inviare password o token in chat. Non considerare completata la build finché EAS non restituisce un artefatto scaricabile.

**Stato verificato al 18/11/2026:** 199 test automatici superati; lockfile non generato localmente per timeout; repository e Project ID EAS ancora da collegare.
