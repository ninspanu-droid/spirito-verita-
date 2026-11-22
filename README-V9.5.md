# SPIRITO & VERITÀ — V9.5

Versione applicativa: **1.0.31**.

La novità è il preflight Android locale aggregato:

```bash
npm run check:android-local
```

Il comando controlla lockfile, dipendenze crittografiche, prerequisiti nativi e identificatori. È read-only e blocca l'esito se manca un requisito.

Consultare `docs/V9-5-PREFLIGHT-ANDROID-LOCALE.md` per stato, limiti e procedura di build. Questa versione non include una build Android: il tentativo di generare il lockfile nell'ambiente di lavoro è terminato per timeout.
