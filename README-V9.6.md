# SPIRITO & VERITÀ — V9.6

Versione applicativa: **1.0.32**.

La V9.6 rende più robusta la generazione del lockfile npm nel workflow GitHub Actions:

- tre tentativi massimi, con attesa progressiva;
- timeout configurabile per ogni tentativo;
- `npm install --package-lock-only` senza script di installazione;
- verifica del lockfile, installazione `npm ci`, test e TypeScript prima di caricare l'artifact o aprire la pull request;
- nessuna modifica automatica al branch principale.

Comando locale: `npm run generate:lockfile`. Il comando non sostituisce `npm ci` né i controlli successivi.

**Stato del collaudo in questa sessione:** la generazione locale del lockfile è stata nuovamente interrotta dall'ambiente dopo circa un minuto. Non è stato creato né convalidato un `package-lock.json`; non sono stati eseguiti `npm ci`, TypeScript, Expo Doctor o build Android. Il workflow GitHub aggiornato è predisposto ma deve essere avviato nel repository remoto.
