

---

## Aggiornamento audit e build — 22 novembre 2026

Questo stato sostituisce le precedenti note storiche che indicavano assenza di qualsiasi build verificata.

- Correzione SecureStore SQLCipher integrata in main con commit `9891d59b36f924fcb47f6662887a4affa7ea14f4`.
- GitHub Actions Run 59: esito `success`; test applicativi selezionati, test SQLCipher dedicati, TypeScript, Expo Doctor, build APK autonoma e smoke test su emulatore Android API 35.
- Artifact: `spirito-verita-android-apk-59-VERIFIED`. La firma è di debug, quindi l'APK è per test e non per pubblicazione Google Play.
- Il test su emulatore non certifica il Samsung A16 Android 17 né dispositivi fisici.
- Il workflow esclude alcuni test statici legacy/fixture; non descrivere Run 59 come esecuzione integrale indistinta di `npm run test:all`.
- Il catalogo contiene 301 record: 8 `ready`, 293 `draft`. I moduli in bozza non sono contenuti editoriali finiti.
- Il database applicativo attivo è configurato per SQLCipher; la migrazione copia dal vecchio `spirito-verita.db` senza cancellare la sorgente. Non eliminare la sorgente finché backup, confronto e approvazione non sono completati.
- Il progetto è ancora su Expo SDK 53; il workflow usa Android platform/build-tools 35 ed emulatore API 35. Verificare e aggiornare toolchain e target SDK prima del rilascio pubblico.

Per il quadro completo, le evidenze, i limiti e la sequenza di lavoro consultare `docs/AUDIT-TECNICO-COMPLETO-2026-11-22.md`.
